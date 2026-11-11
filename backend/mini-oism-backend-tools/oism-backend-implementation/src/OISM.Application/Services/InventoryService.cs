using OISM.Application.DTOs.Inventory;
using OISM.Application.Interfaces.Repositories;
using OISM.Application.Interfaces.Services;
using OISM.Domain.Entities;
using OISM.Domain.Enums;

namespace OISM.Application.Services;

public class InventoryService : IInventoryService
{
    private readonly IInventoryRepository _inventories;
    private readonly IInventoryLedgerRepository _ledger;
    private readonly IUnitOfWork _uow;

    public InventoryService(IInventoryRepository inventories, IInventoryLedgerRepository ledger, IUnitOfWork uow)
    { _inventories = inventories; _ledger = ledger; _uow = uow; }

    public async Task<InventoryResponse?> GetInventoryAsync(Guid tenantId, Guid branchId, Guid productId, CancellationToken cancellationToken = default)
    {
        var x = await _inventories.GetByProductAndBranchAsync(tenantId, branchId, productId, cancellationToken);
        return x == null ? null : new InventoryResponse { Id=x.Id, BranchId=x.BranchId, ProductId=x.ProductId, OnHand=x.OnHand, Reserved=x.Reserved, Available=x.Available };
    }

    public async Task AdjustInventoryAsync(Guid tenantId, AdjustInventoryRequest request, CancellationToken cancellationToken = default)
    {
        if (tenantId == Guid.Empty || request.BranchId == Guid.Empty || request.ProductId == Guid.Empty) throw new ArgumentException("Thông tin định danh không hợp lệ.");
        if (request.NewOnHand < 0) throw new ArgumentException("OnHand không thể âm.");
        await _uow.ExecuteInTransactionAsync(async ct =>
        {
            var stock = await _inventories.GetForUpdateAsync(tenantId, request.BranchId, request.ProductId, ct)
                ?? throw new KeyNotFoundException("Không tìm thấy bản ghi tồn kho.");
            var old = stock.OnHand;
            stock.AdjustStock(request.NewOnHand);
            var changed = Math.Abs(request.NewOnHand - old);
            if (changed > 0)
                await _ledger.AddAsync(new InventoryLedger(tenantId, request.BranchId, request.ProductId, null,
                    InventoryMovementType.Adjustment, changed, stock.OnHand, stock.Reserved), ct);
        }, cancellationToken);
    }
}
