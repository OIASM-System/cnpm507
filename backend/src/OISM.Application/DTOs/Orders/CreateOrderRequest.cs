
namespace OISM.Application.DTOs.Orders;

public class CreateOrderRequest
{
    public Guid BranchId { get; set; }
    public string Source { get; set; } = "POS";

    public List<CreateOrderItemRequest> Items { get; set; } = new();
}

public class CreateOrderItemRequest
{
    public Guid ProductId { get; set; }
    public int Quantity { get; set; }
}
