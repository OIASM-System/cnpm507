
using Microsoft.EntityFrameworkCore;
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

    // Lấy tồn kho của một sản phẩm tại một chi nhánh
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

    // Lấy tồn kho và khóa bản ghi khi điều chỉnh
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

    // Lấy toàn bộ tồn kho theo chi nhánh
    public async Task<List<Inventory>> GetAllByBranchAsync(
        Guid tenantId,
        Guid branchId,
        CancellationToken ct = default)
    {
        return await _db.Inventories
            .Where(x => x.TenantId == tenantId
                     && x.BranchId == branchId)
            .ToListAsync(ct);
    }

    // Thêm bản ghi tồn kho
    public Task AddAsync(
        Inventory inventory,
        CancellationToken ct = default)
    {
        return _db.Inventories.AddAsync(inventory, ct).AsTask();
    }
}
