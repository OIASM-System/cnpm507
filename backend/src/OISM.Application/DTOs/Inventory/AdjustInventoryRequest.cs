
namespace OISM.Application.DTOs.Inventory;

public class AdjustInventoryRequest
{
    public Guid BranchId { get; set; }
    public Guid ProductId { get; set; }
    public int NewOnHand { get; set; }
}
