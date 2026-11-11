
namespace OISM.Domain.Entities;

public class OrderItem
{
    public Guid Id { get; private set; }
    public Guid ProductId { get; private set; }

    public string Sku { get; private set; } = string.Empty;
    public string ProductName { get; private set; } = string.Empty;

    public int Quantity { get; private set; }
    public decimal UnitPrice { get; private set; }

    public decimal LineTotal => Quantity * UnitPrice;

    private OrderItem() { }

    public OrderItem(
        Guid productId,
        string sku,
        string productName,
        int quantity,
        decimal unitPrice)
    {
        if (productId == Guid.Empty)
            throw new ArgumentException("ProductId không hợp lệ.");

        if (quantity <= 0)
            throw new ArgumentException("Số lượng phải lớn hơn 0.");

        if (unitPrice < 0)
            throw new ArgumentException("Đơn giá không hợp lệ.");

        Id = Guid.NewGuid();
        ProductId = productId;
        Sku = sku;
        ProductName = productName;
        Quantity = quantity;
        UnitPrice = unitPrice;
    }
}
