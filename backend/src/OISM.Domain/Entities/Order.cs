using OISM.Domain.Enums;

namespace OISM.Domain.Entities;

public class Order
{
    public Guid Id { get; private set; }
    public Guid TenantId { get; private set; }
    public Guid BranchId { get; private set; }
    public string OrderNumber { get; private set; } = string.Empty;
    public string Source { get; private set; } = "POS";
    public OrderStatus Status { get; private set; }
    public decimal TotalAmount { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public ICollection<OrderItem> Items { get; private set; } = new List<OrderItem>();

    private Order() { }

    public Order(Guid tenantId, Guid branchId, string source)
    {
        if (tenantId == Guid.Empty) throw new ArgumentException("TenantId không hợp lệ.");
        if (branchId == Guid.Empty) throw new ArgumentException("BranchId không hợp lệ.");
        if (string.IsNullOrWhiteSpace(source)) throw new ArgumentException("Source không được để trống.");
        Id = Guid.NewGuid();
        TenantId = tenantId;
        BranchId = branchId;
        Source = source.Trim().ToUpperInvariant();
        OrderNumber = $"OISM-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid():N}"[..25].ToUpperInvariant();
        Status = OrderStatus.Pending;
        CreatedAt = DateTime.UtcNow;
    }

    public void AddItem(OrderItem item)
    {
        ArgumentNullException.ThrowIfNull(item);
        if (Status != OrderStatus.Pending) throw new InvalidOperationException("Không thể sửa đơn ở trạng thái hiện tại.");
        Items.Add(item);
        TotalAmount += item.LineTotal;
    }

    public void Confirm()
    {
        if (Status != OrderStatus.Pending) throw new InvalidOperationException("Chỉ đơn Pending mới được xác nhận.");
        Status = OrderStatus.Confirmed;
    }

    public void Cancel()
    {
        if (Status != OrderStatus.Pending) throw new InvalidOperationException("Chỉ đơn Pending mới được hủy.");
        Status = OrderStatus.Cancelled;
    }
}
