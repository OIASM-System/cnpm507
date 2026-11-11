using Microsoft.EntityFrameworkCore;
using OISM.Domain.Entities;
namespace OISM.Infrastructure.Persistence;
public class OismDbContext : DbContext
{
    public OismDbContext(DbContextOptions<OismDbContext> options) : base(options) { }
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Inventory> Inventories => Set<Inventory>();
    public DbSet<InventoryLedger> InventoryLedgers => Set<InventoryLedger>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        base.OnModelCreating(b);
        b.Entity<Product>(e => {
            e.ToTable("Products"); e.HasKey(x=>x.Id);
            e.Property(x=>x.Sku).HasMaxLength(100).IsRequired();
            e.Property(x=>x.Name).HasMaxLength(250).IsRequired();
            e.Property(x=>x.UnitPrice).HasPrecision(18,2);
            e.HasIndex(x=>new {x.TenantId,x.Sku}).IsUnique();
        });
        b.Entity<Inventory>(e => {
            e.ToTable("Inventories", t=>t.HasCheckConstraint("CK_Inventories_Stock", "\"OnHand\" >= 0 AND \"Reserved\" >= 0 AND \"Reserved\" <= \"OnHand\""));
            e.HasKey(x=>x.Id); e.Ignore(x=>x.Available);
            e.HasIndex(x=>new {x.TenantId,x.BranchId,x.ProductId}).IsUnique();
        });
        b.Entity<InventoryLedger>(e => {
            e.ToTable("InventoryLedgers"); e.HasKey(x=>x.Id);
            e.Property(x=>x.MovementType).HasConversion<int>();
            e.HasIndex(x=>new {x.TenantId,x.BranchId,x.ProductId,x.CreatedAt});
        });
        b.Entity<Order>(e => {
            e.ToTable("Orders"); e.HasKey(x=>x.Id);
            e.Property(x=>x.OrderNumber).HasMaxLength(40).IsRequired();
            e.Property(x=>x.Source).HasMaxLength(40).IsRequired();
            e.Property(x=>x.Status).HasConversion<int>();
            e.Property(x=>x.TotalAmount).HasPrecision(18,2);
            e.HasIndex(x=>new {x.TenantId,x.OrderNumber}).IsUnique();
            e.HasMany(x=>x.Items).WithOne().OnDelete(DeleteBehavior.Cascade);
        });
        b.Entity<OrderItem>(e => {
            e.ToTable("OrderItems"); e.HasKey(x=>x.Id);
            e.Property(x=>x.Sku).HasMaxLength(100).IsRequired();
            e.Property(x=>x.ProductName).HasMaxLength(250).IsRequired();
            e.Property(x=>x.UnitPrice).HasPrecision(18,2);
            e.Ignore(x=>x.LineTotal);
        });
    }
}
