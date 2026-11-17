# ⚙️ Entity Framework Core 8 & Persistence Patterns - POS PWA Project

Tài liệu này quy định các tiêu chuẩn cấu hình **Entity Framework Core 8 (EF Core 8)** với trình điều khiển **Npgsql (PostgreSQL 16)** tại tầng `PosPwa.Infrastructure` của hệ thống **POS PWA (Point of Sale Progressive Web App)**. Mục tiêu cốt lõi là đảm bảo ánh xạ đối tượng sạch sẽ thông qua **Fluent API** (giữ nguyên tính thuần khiết của Domain Entities), triển khai chuẩn mẫu **Repository & Unit of Work**, và phát sự kiện miền (**Domain Events**) an toàn ngay sau khi lưu dữ liệu.

---

## 🏗️ 1. Cấu hình `AppDbContext` & Quy tắc cốt lõi

### 1.1. Tách biệt cấu hình với `IEntityTypeConfiguration<T>`
* **Tuyệt đối không sử dụng Data Annotations** (`[Table]`, `[Column]`, `[Required]`, `[MaxLength]`) bên trong các lớp thuộc tầng `PosPwa.Domain` để giữ cho Domain Model hoàn toàn độc lập với ORM.
* Toàn bộ cấu hình ánh xạ bảng, độ dài chuỗi, kiểu tiền tệ `numeric(18,2)`, khóa ngoại, chỉ mục và ràng buộc `CHECK` được định nghĩa trong các lớp triển khai `IEntityTypeConfiguration<T>` đặt tại `PosPwa.Infrastructure/Persistence/Configurations/` và tự động nạp qua `ApplyConfigurationsFromAssembly()`.

### 1.2. Triển khai `AppDbContext`
`AppDbContext` đóng vai trò là **Unit of Work**, tích hợp tự động gán `TenantId`, kiểm soát đồng thời (`xmin`), và điều phối **Domain Events** qua `MediatR` ngay khi giao dịch được lưu thành công.

```csharp
using MediatR;
using Microsoft.EntityFrameworkCore;
using PosPwa.Application.Abstractions.Persistence;
using PosPwa.Application.Abstractions.Services;
using PosPwa.Domain.Common;
using PosPwa.Domain.Entities;

public sealed class AppDbContext : DbContext, IApplicationDbContext, IUnitOfWork
{
    private readonly ITenantContext _tenantContext;
    private readonly IPublisher _publisher;

    public AppDbContext(
        DbContextOptions<AppDbContext> options,
        ITenantContext tenantContext,
        IPublisher publisher) : base(options)
    {
        _tenantContext = tenantContext;
        _publisher = publisher;
    }

    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderDetail> OrderDetails => Set<OrderDetail>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Tự động nạp toàn bộ Entity Configurations trong Assembly Infrastructure
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        // Áp dụng Global Query Filter cô lập dữ liệu theo TenantId (Multi-Tenancy)
        modelBuilder.Entity<Category>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
        modelBuilder.Entity<Product>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
        modelBuilder.Entity<Order>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
        modelBuilder.Entity<User>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // 1. Tự động gán TenantId cho các bản ghi thêm mới
        foreach (var entry in ChangeTracker.Entries<IMustHaveTenant>())
        {
            if (entry.State == EntityState.Added && entry.Entity.TenantId == Guid.Empty)
            {
                if (!_tenantContext.IsResolved)
                    throw new UnauthorizedAccessException("Không xác định được TenantId hợp lệ khi lưu dữ liệu.");

                entry.Entity.SetTenant(_tenantContext.TenantId!.Value);
            }
        }

        // 2. Lưu thay đổi xuống PostgreSQL
        var result = await base.SaveChangesAsync(cancellationToken);

        // 3. Phát sóng các Domain Events (VD: StockDeductedDomainEvent -> SignalR)
        await DispatchDomainEventsAsync(cancellationToken);

        return result;
    }

    private async Task DispatchDomainEventsAsync(CancellationToken cancellationToken)
    {
        var domainEntities = ChangeTracker
            .Entries<AggregateRoot>()
            .Where(x => x.Entity.DomainEvents.Any())
            .Select(x => x.Entity)
            .ToList();

        var domainEvents = domainEntities
            .SelectMany(x => x.DomainEvents)
            .ToList();

        domainEntities.ForEach(entity => entity.ClearDomainEvents());

        foreach (var domainEvent in domainEvents)
        {
            await _publisher.Publish(domainEvent, cancellationToken);
        }
    }
}
```

---

## 🧩 2. Cấu hình Fluent API mẫu (`ProductConfiguration` & `OrderConfiguration`)

### 2.1. Cấu hình bảng `products` (Tích hợp `xmin` & `CHECK` constraint)
```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PosPwa.Domain.Entities;

public sealed class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("products", t =>
        {
            // Ràng buộc chống âm kho ở mức Database
            t.HasCheckConstraint("ck_products_stock_quantity_non_negative", "stock_quantity >= 0");
            t.HasCheckConstraint("ck_products_price_non_negative", "price >= 0");
        });

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(p => p.Price)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(p => p.StockQuantity)
            .IsRequired();

        // Sử dụng cột hệ thống xmin của PostgreSQL làm Optimistic Concurrency Token
        builder.Property(p => p.RowVersion)
            .IsRowVersion();

        // Mã SKU duy nhất trong phạm vi từng cửa hàng (Tenant)
        builder.HasIndex(p => new { p.TenantId, p.Code })
            .IsUnique();

        builder.HasIndex(p => new { p.TenantId, p.CategoryId });
    }
}
```

### 2.2. Cấu hình bảng `orders` (Quan hệ Master-Detail & Backing Field)
```csharp
public sealed class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("orders", t =>
        {
            t.HasCheckConstraint("ck_orders_total_amount_non_negative", "total_amount >= 0");
        });

        builder.HasKey(o => o.Id);

        builder.Property(o => o.OrderNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(o => o.SubTotal).HasPrecision(18, 2);
        builder.Property(o => o.Discount).HasPrecision(18, 2);
        builder.Property(o => o.TotalAmount).HasPrecision(18, 2);

        // Lưu Enum dưới dạng chuỗi dễ đọc trong PostgreSQL
        builder.Property(o => o.Status)
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();

        // Ánh xạ private backing field '_items' của Aggregate Root
        builder.Metadata
            .FindNavigation(nameof(Order.Items))!
            .SetPropertyAccessMode(PropertyAccessMode.Field);

        builder.HasMany(o => o.Items)
            .WithOne()
            .HasForeignKey(d => d.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(o => o.Payment)
            .WithOne()
            .HasForeignKey<Payment>(p => p.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(o => new { o.TenantId, o.OrderNumber })
            .IsUnique();
    }
}
```

---

## 📦 3. Mẫu Repository & Tối ưu hóa truy vấn

### 3.1. Phân tách trách nhiệm Repository (Chỉ dùng cho luồng Ghi - Command)
* **Commands (Ghi):** Sử dụng `IOrderRepository` và `IProductRepository` để tải đầy đủ Aggregate (kèm dữ liệu con và Change Tracking) nhằm thực thi logic nghiệp vụ.
* **Queries (Đọc):** Inject trực tiếp `IApplicationDbContext` (chỉ phơi bày `IQueryable<T>`), kết hợp `.AsNoTracking()` và `.Select()` chiếu thẳng sang DTO để tránh tải thừa cột dữ liệu.

```csharp
public sealed class ProductRepository : IProductRepository
{
    private readonly AppDbContext _dbContext;

    public ProductRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<Product>> GetByIdsAsync(
        IEnumerable<Guid> ids, 
        CancellationToken cancellationToken = default)
    {
        var idList = ids.Distinct().ToList();
        return await _dbContext.Products
            .Where(p => idList.Contains(p.Id))
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Product product, CancellationToken cancellationToken = default)
    {
        await _dbContext.Products.AddAsync(product, cancellationToken);
    }
}
```

---

## ⚡ 4. Quy tắc tối ưu hiệu năng EF Core 8 trong POS PWA

1. **Đăng ký `DbContextPool` trong `Program.cs`:**
   Sử dụng `builder.Services.AddDbContextPool<AppDbContext>(...)` thay vì `AddDbContext` thông thường để tái sử dụng các thực thể `DbContext` đã khởi tạo, giảm cấp phát bộ nhớ Garbage Collection khi quầy thu ngân tạo hàng trăm đơn hàng liên tục.
2. **Kích hoạt `UseSnakeCaseNamingConvention()`:**
   ```csharp
   builder.Services.AddDbContextPool<AppDbContext>(options =>
       options.UseNpgsql(connectionString, npgsqlOptions =>
       {
           npgsqlOptions.MigrationsAssembly(typeof(AppDbContext).Assembly.FullName);
           npgsqlOptions.EnableRetryOnFailure(maxRetryCount: 3);
       })
       .UseSnakeCaseNamingConvention());
   ```
3. **Tránh Cartesian Explosion với `AsSplitQuery()`:**
   Khi truy xuất chi tiết hóa đơn kèm danh sách nhiều món (`OrderDetails`) và thông tin thanh toán (`Payments`), sử dụng `.AsSplitQuery()` nếu có nhiều quan hệ `1-N` song song để EF Core tách thành các câu lệnh SQL gọn nhẹ thay vì `LEFT JOIN` phình to dữ liệu.
4. **Cập nhật hàng loạt không cần tải lên RAM (`ExecuteUpdateAsync`):**
   Đối với các tác vụ quản trị như ngưng kinh doanh hàng loạt sản phẩm thuộc một danh mục, ưu tiên dùng `ExecuteUpdateAsync` của EF Core 8 để thực thi trực tiếp câu lệnh `UPDATE` dưới PostgreSQL.

---
