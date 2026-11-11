using Microsoft.EntityFrameworkCore;
using OISM.Application.Interfaces.Repositories;
using OISM.Domain.Entities;
using OISM.Infrastructure.Persistence;
namespace OISM.Infrastructure.Repositories;
public class InventoryRepository : IInventoryRepository
{
    private readonly OismDbContext _db;
    public InventoryRepository(OismDbContext db) => _db=db;
    public Task<Inventory?> GetByProductAndBranchAsync(Guid tenantId, Guid branchId, Guid productId, CancellationToken ct=default) =>
        _db.Inventories.FirstOrDefaultAsync(x=>x.TenantId==tenantId && x.BranchId==branchId && x.ProductId==productId,ct);
    public Task<Inventory?> GetForUpdateAsync(Guid tenantId, Guid branchId, Guid productId, CancellationToken ct=default) =>
        _db.Inventories.FromSqlInterpolated($@"SELECT * FROM ""Inventories"" WHERE ""TenantId""={tenantId} AND ""BranchId""={branchId} AND ""ProductId""={productId} FOR UPDATE").FirstOrDefaultAsync(ct);
    public Task AddAsync(Inventory inventory, CancellationToken ct=default) => _db.Inventories.AddAsync(inventory,ct).AsTask();
}
