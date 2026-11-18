
using Microsoft.EntityFrameworkCore;
using OISM.Application.DTOs.Inventory;
using OISM.Application.Interfaces.Repositories;
using OISM.Domain.Entities;
using OISM.Infrastructure.Persistence;

namespace OISM.Infrastructure.Repositories;

public class InventoryRepository : IInventoryRepository
{
    private readonly OismDbContext _db;

    public InventoryRepository(OismDbContext db)
    {
        _db = db;
    }

    public Task<Inventory?> GetByProductAndBranchAsync(
        Guid tenantId,
        Guid branchId,
        Guid productId,
        CancellationToken ct = default)
    {
        return _db.Inventories.FirstOrDefaultAsync(
            x => x.TenantId == tenantId
              && x.BranchId == branchId
              && x.ProductId == productId,
            ct);
    }

    public Task<Inventory?> GetForUpdateAsync(
        Guid tenantId,
        Guid branchId,
        Guid productId,
        CancellationToken ct = default)
    {
        return _db.Inventories
            .FromSqlInterpolated($@"
                SELECT * FROM ""Inventories""
                WHERE ""TenantId"" = {tenantId}
                AND ""BranchId"" = {branchId}
                AND ""ProductId"" = {productId}
                FOR UPDATE")
            .FirstOrDefaultAsync(ct);
    }

    // LEFT JOIN Inventories với Products để lấy SKU và Name
    public async Task<List<InventoryListResponse>> GetAllByBranchAsync(
        Guid tenantId,
        Guid branchId,
        CancellationToken ct = default)
    {
        var query =
            from inventory in _db.Inventories.AsNoTracking()
            join product in _db.Products.AsNoTracking()
                on new
                {
                    inventory.ProductId,
                    inventory.TenantId
                }
                equals new
                {
                    ProductId = product.Id,
                    product.TenantId
                }
                into productGroup

            from product in productGroup.DefaultIfEmpty()

            where inventory.TenantId == tenantId
               && inventory.BranchId == branchId

            select new InventoryListResponse
            {
                ProductId = inventory.ProductId,
                Sku = product == null ? "" : product.Sku,
                Name = product == null
                    ? "Sản phẩm không xác định"
                    : product.Name,
                OnHand = inventory.OnHand,
                Reserved = inventory.Reserved
            };

        return await query.ToListAsync(ct);
    }

    public Task AddAsync(
        Inventory inventory,
        CancellationToken ct = default)
    {
        return _db.Inventories.AddAsync(inventory, ct).AsTask();
    }
}
