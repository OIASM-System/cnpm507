
namespace OISM.Application.DTOs.Inventory;

public class InventoryListResponse
{
    public Guid ProductId { get; set; }
    public string Sku { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int OnHand { get; set; }
    public int Reserved { get; set; }
    public int Available => OnHand - Reserved;
}
