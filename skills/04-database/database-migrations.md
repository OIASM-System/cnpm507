# 🚀 Database Migrations & Data Seeding - POS PWA Project

Tài liệu này quy định quy trình quản lý phiên bản lược đồ cơ sở dữ liệu (**Schema Versioning**) thông qua **EF Core Migrations** và cơ chế khởi tạo dữ liệu mẫu (**Data Seeding**) trên **PostgreSQL 16** cho hệ thống **POS PWA (Point of Sale Progressive Web App)**. Quy trình này đảm bảo mọi thành viên trong nhóm và các môi trường triển khai (Development, Staging, Production Docker) luôn đồng bộ cấu trúc bảng, chỉ mục và dữ liệu danh mục gốc một cách nhất quán, an toàn và có thể hoàn tác (`Rollback`).

---

## 🛠️ 1. Bộ lệnh quản lý EF Core Migrations chuẩn

Toàn bộ các tệp Migration được lưu trữ tập trung tại `src/PosPwa.Infrastructure/Persistence/Migrations/`. Khi chạy lệnh từ thư mục gốc của Solution (`PosPwa.sln`), bắt buộc chỉ định rõ `--project` (nơi chứa `AppDbContext`) và `--startup-project` (nơi chứa cấu hình kết nối `Program.cs`):

| Tác vụ | Lệnh CLI chuẩn (.NET 8) | Ghi chú sử dụng |
| :--- | :--- | :--- |
| **Tạo Migration mới** | `dotnet ef migrations add <TenMigration> --project src/PosPwa.Infrastructure --startup-project src/PosPwa.Api --output-dir Persistence/Migrations` | Đặt tên theo hành động cụ thể, VD: `InitialCreate`, `AddProductTrigramIndex`. |
| **Cập nhật lên Database** | `dotnet ef database update --project src/PosPwa.Infrastructure --startup-project src/PosPwa.Api` | Áp dụng các Migration chưa chạy lên PostgreSQL cục bộ. |
| **Hoàn tác (Rollback)** | `dotnet ef database update <TenMigrationTruocDo> --project src/PosPwa.Infrastructure --startup-project src/PosPwa.Api` | Đưa cấu trúc Database lùi về đúng phiên bản ổn định trước đó. |
| **Xóa Migration cuối** | `dotnet ef migrations remove --project src/PosPwa.Infrastructure --startup-project src/PosPwa.Api` | Chỉ dùng khi Migration vừa tạo chưa được áp dụng (`update`) lên Database chung. |
| **Xuất Script SQL Idempotent** | `dotnet ef migrations script --idempotent --project src/PosPwa.Infrastructure --startup-project src/PosPwa.Api -o deploy.sql` | Tạo tệp SQL an toàn để kiểm duyệt trước khi triển khai lên Production. |

---

## 🔄 2. Quy trình phối hợp nhóm & Triển khai (Workflow)

1. **Kiểm tra mã nguồn Migration trước khi Commit:**
   Sau khi chạy `dotnet ef migrations add`, lập trình viên **bắt buộc** mở tệp `.cs` vừa sinh ra để kiểm tra hai phương thức `Up()` và `Down()`, đảm bảo không có lệnh `DropTable` hoặc `DropColumn` ngoài ý muốn làm mất dữ liệu tồn kho hoặc hóa đơn.
2. **Tự động chạy Migration khi khởi động môi trường Development/Demo:**
   Trong `Program.cs`, khi ứng dụng chạy ở môi trường `Development` (hoặc chạy demo Docker Compose), hệ thống tự động gọi `dbContext.Database.MigrateAsync()` và khởi tạo dữ liệu mẫu để bất kỳ thành viên nào mới pull code về đều có thể chạy ngay mà không cần thao tác thủ công:
   ```csharp
   if (app.Environment.IsDevelopment())
   {
       using var scope = app.Services.CreateScope();
       var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
       await dbContext.Database.MigrateAsync();
       await DatabaseSeeder.SeedAsync(dbContext);
   }
   ```
3. **Triển khai an toàn trên Production (Zero-Downtime Strategy):**
   * Trên môi trường Production, **không** chạy `MigrateAsync()` tự động bên trong luồng khởi động API (tránh xung đột khi chạy nhiều bản sao Container cùng lúc). Thay vào đó, bước chạy Migration được tách thành một bước riêng trong **CI/CD Pipeline** (hoặc Init Container) trước khi bật phiên bản API mới.
   * Tuân thủ nguyên tắc **Expand and Contract**: Khi cần đổi tên cột hoặc xóa cột, tạo cột mới trước, chuyển đổi code sử dụng cột mới, sau đó mới xóa cột cũ ở đợt phát hành tiếp theo.

---

## 🌱 3. Khởi tạo dữ liệu mẫu chuẩn (Idempotent Data Seeding)

Lớp `DatabaseSeeder` được thiết kế theo tính chất **Idempotent** (chạy lặp lại nhiều lần không sinh dữ liệu trùng lặp), tự động nạp sẵn một cửa hàng mẫu (`Tenant`), tài khoản Quản lý/Thu ngân, danh mục và các sản phẩm phổ biến phục vụ kiểm thử luồng bán hàng POS và Offline Sync:

```csharp
using Microsoft.EntityFrameworkCore;
using PosPwa.Domain.Entities;
using PosPwa.Domain.Enums;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        // 1. Khởi tạo Tenant mẫu (Cửa hàng UTH Coffee & Tea) nếu chưa tồn tại
        var defaultTenantId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        if (!await context.Tenants.AnyAsync(t => t.Id == defaultTenantId))
        {
            var tenant = Tenant.Create(defaultTenantId, "UTH Smart Coffee POS", "uth-coffee");
            await context.Tenants.AddAsync(tenant);
        }

        // 2. Khởi tạo tài khoản Thu ngân & Quản lý mặc định
        if (!await context.Users.IgnoreQueryFilters().AnyAsync(u => u.TenantId == defaultTenantId))
        {
            var manager = User.Create(defaultTenantId, "admin", BCrypt.Net.BCrypt.HashPassword("Admin@123"), "Quản lý Cửa hàng", UserRole.Manager);
            var cashier = User.Create(defaultTenantId, "cashier01", BCrypt.Net.BCrypt.HashPassword("Pos@123"), "Thu ngân Quầy 1", UserRole.Cashier);
            await context.Users.AddRangeAsync(manager, cashier);
        }

        // 3. Khởi tạo Danh mục & Sản phẩm mẫu có tồn kho thực tế
        if (!await context.Categories.IgnoreQueryFilters().AnyAsync(c => c.TenantId == defaultTenantId))
        {
            var coffeeCat = Category.Create(defaultTenantId, "Cà phê", displayOrder: 1);
            var teaCat = Category.Create(defaultTenantId, "Trà trái cây", displayOrder: 2);
            await context.Categories.AddRangeAsync(coffeeCat, teaCat);

            var products = new List<Product>
            {
                Product.Create(defaultTenantId, coffeeCat.Id, "CF001", "Cà phê sữa đá", 29000m, stockQuantity: 50),
                Product.Create(defaultTenantId, coffeeCat.Id, "CF002", "Bạc xỉu đá", 32000m, stockQuantity: 40),
                Product.Create(defaultTenantId, teaCat.Id, "TR001", "Trà đào cam sả", 39000m, stockQuantity: 30),
                Product.Create(defaultTenantId, teaCat.Id, "TR002", "Trà vải hoa hồng", 42000m, stockQuantity: 5) // Tồn kho thấp để test Anti-oversell
            };

            await context.Products.AddRangeAsync(products);
        }

        await context.SaveChangesAsync();
    }
}
```

> **Lưu ý kỹ thuật:** Vì `DatabaseSeeder` chạy lúc khởi động ứng dụng (khi chưa có HTTP Request nên `ITenantContext.TenantId` đang `null`), các câu lệnh kiểm tra tồn tại dữ liệu mẫu bắt buộc gọi **`.IgnoreQueryFilters()`** để vượt qua bộ lọc Multi-Tenancy của `AppDbContext`.

---
