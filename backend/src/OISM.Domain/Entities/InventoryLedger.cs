
using OISM.Domain.Enums;

namespace OISM.Domain.Entities;

public class InventoryLedger
{
    public Guid Id { get; private set; }
    public Guid TenantId { get; private set; }
    public Guid BranchId { get; private set; }
    public Guid ProductId { get; private set; }

    public Guid? OrderId { get; private set; }

    public InventoryMovementType MovementType { get; private set; }

    public int Quantity { get; private set; }
    public int OnHandAfter { get; private set; }
    public int ReservedAfter { get; private set; }

    public DateTime CreatedAt { get; private set; }

    private InventoryLedger() { }

    public InventoryLedger(
        Guid tenantId,
        Guid branchId,
        Guid productId,
        Guid? orderId,
        InventoryMovementType movementType,
        int quantity,
        int onHandAfter,
        int reservedAfter)
    {
        if (quantity <= 0)
            throw new ArgumentException("Số lượng ghi nhận phải lớn hơn 0.");

        if (onHandAfter < 0 || reservedAfter < 0 ||
            reservedAfter > onHandAfter)
            throw new ArgumentException("Số liệu tồn kho không hợp lệ.");

        Id = Guid.NewGuid();
        TenantId = tenantId;
        BranchId = branchId;
        ProductId = productId;
        OrderId = orderId;
        MovementType = movementType;
        Quantity = quantity;
        OnHandAfter = onHandAfter;
        ReservedAfter = reservedAfter;
        CreatedAt = DateTime.UtcNow;
    }
}
