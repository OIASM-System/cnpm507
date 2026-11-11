
using OISM.Domain.Entities;

namespace OISM.Application.Interfaces.Repositories;

public interface IInventoryLedgerRepository
{
    Task AddAsync(
        InventoryLedger ledger,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<InventoryLedger>> GetHistoryAsync(
        Guid tenantId,
        Guid branchId,
        Guid? productId = null,
        Guid? orderId = null,
        CancellationToken cancellationToken = default);
}
