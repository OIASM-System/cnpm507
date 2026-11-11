using OISM.Application.DTOs.Inventory;

namespace OISM.Application.Interfaces.Services;

public interface IInventoryLedgerService
{
    Task<IReadOnlyList<InventoryLedgerResponse>> GetHistoryAsync(
        Guid tenantId,
        Guid branchId,
        Guid? productId = null,
        Guid? orderId = null,
        CancellationToken cancellationToken = default);
}
