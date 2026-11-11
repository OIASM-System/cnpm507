
namespace OISM.Domain.Entities;

public class Inventory
{
    public Guid Id { get; private set; }
    public Guid TenantId { get; private set; }
    public Guid BranchId { get; private set; }
    public Guid ProductId { get; private set; }

    public int OnHand { get; private set; }
    public int Reserved { get; private set; }

    public int Available => OnHand - Reserved;

    private Inventory() { }

    public Inventory(
        Guid tenantId,
        Guid branchId,
        Guid productId,
        int initialStock = 0)
    {
        if (tenantId == Guid.Empty ||
            branchId == Guid.Empty ||
            productId == Guid.Empty)
            throw new ArgumentException("Thông tin định danh không hợp lệ.");

        if (initialStock < 0)
            throw new ArgumentException("Tồn kho không thể âm.");

        Id = Guid.NewGuid();
        TenantId = tenantId;
        BranchId = branchId;
        ProductId = productId;
        OnHand = initialStock;
        Reserved = 0;
    }

    public void Reserve(int quantity)
    {
        if (quantity <= 0)
            throw new ArgumentException("Số lượng phải lớn hơn 0.");

        if (Available < quantity)
            throw new InvalidOperationException("Không đủ hàng trong kho.");

        Reserved += quantity;
    }

    public void ConfirmReservation(int quantity)
    {
        if (quantity <= 0 || Reserved < quantity || OnHand < quantity)
            throw new InvalidOperationException("Không thể xác nhận giữ hàng.");

        Reserved -= quantity;
        OnHand -= quantity;
    }

    public void ReleaseReservation(int quantity)
    {
        if (quantity <= 0 || Reserved < quantity)
            throw new InvalidOperationException("Số lượng giải phóng không hợp lệ.");

        Reserved -= quantity;
    }

    public void AdjustStock(int newOnHand)
    {
        if (newOnHand < Reserved)
            throw new InvalidOperationException(
                "Tồn kho không thể thấp hơn số lượng đã giữ.");

        if (newOnHand < 0)
            throw new ArgumentException("Tồn kho không thể âm.");

        OnHand = newOnHand;
    }
}
