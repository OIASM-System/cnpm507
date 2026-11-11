
using Microsoft.EntityFrameworkCore;
using OISM.Application.Interfaces.Repositories;
using OISM.Domain.Entities;
using OISM.Infrastructure.Persistence;

namespace OISM.Infrastructure.Repositories;

public class InventoryLedgerRepository : IInventoryLedgerRepository
{
    private readonly OismDbContext _db;

    public InventoryLedgerRepository(OismDbContext db)
    {
        _db = db;
    }

    public Task AddAsync(
        InventoryLedger ledger,
        CancellationToken ct = default)
    {
        return _db.InventoryLedgers.AddAsync(ledger, ct).AsTask();
    }

    public async Task<IReadOnlyList<InventoryLedger>> GetHistoryAsync(
        Guid tenantId,
        Guid branchId,
        Guid? productId = null,
        Guid? orderId = null,
        CancellationToken cancellationToken = default)
    {
        var query = _db.InventoryLedgers
            .AsNoTracking()
            .Where(x =>
                x.TenantId == tenantId &&
                x.BranchId == branchId);

        if (productId.HasValue)
        {
            query = query.Where(x =>
                x.ProductId == productId.Value);
        }

        if (orderId.HasValue)
        {
            query = query.Where(x =>
                x.OrderId == orderId.Value);
        }

        return await query
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);
    }
}
