using OISM.Application.Interfaces.Repositories;
using OISM.Domain.Entities;
using OISM.Infrastructure.Persistence;
namespace OISM.Infrastructure.Repositories;
public class InventoryLedgerRepository : IInventoryLedgerRepository
{
    private readonly OismDbContext _db;
    public InventoryLedgerRepository(OismDbContext db) => _db=db;
    public Task AddAsync(InventoryLedger ledger, CancellationToken ct=default) => _db.InventoryLedgers.AddAsync(ledger,ct).AsTask();
}
