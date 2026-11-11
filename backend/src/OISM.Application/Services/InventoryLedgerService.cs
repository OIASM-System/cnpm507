using OISM.Application.DTOs.Inventory;
using OISM.Application.Interfaces.Repositories;
using OISM.Application.Interfaces.Services;

namespace OISM.Application.Services;

public class InventoryLedgerService : IInventoryLedgerService
{
    private readonly IInventoryLedgerRepository _ledger;

    public InventoryLedgerService(IInventoryLedgerRepository ledger)
    {
        _ledger = ledger;
    }

    public async Task<IReadOnlyList<InventoryLedgerResponse>> GetHistoryAsync(
        Guid tenantId,
        Guid branchId,
        Guid? productId = null,
        Guid? orderId = null,
        CancellationToken cancellationToken = default)
    {
        if (tenantId == Guid.Empty)
            throw new ArgumentException("TenantId không hợp lệ.");

        if (branchId == Guid.Empty)
            throw new ArgumentException("BranchId không hợp lệ.");

        if (productId == Guid.Empty)
            throw new ArgumentException("ProductId không hợp lệ.");

        if (orderId == Guid.Empty)
            throw new ArgumentException("OrderId không hợp lệ.");

        var entries = await _ledger.GetHistoryAsync(
            tenantId, branchId, productId, orderId, cancellationToken);

        return entries.Select(x => new InventoryLedgerResponse
        {
            Id = x.Id,
            BranchId = x.BranchId,
            ProductId = x.ProductId,
            OrderId = x.OrderId,
            MovementType = x.MovementType.ToString(),
            Quantity = x.Quantity,
            OnHandAfter = x.OnHandAfter,
            ReservedAfter = x.ReservedAfter,
            CreatedAt = x.CreatedAt
        }).ToList();
    }
}
