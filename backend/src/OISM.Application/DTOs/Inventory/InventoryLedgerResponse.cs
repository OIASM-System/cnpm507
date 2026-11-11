namespace OISM.Application.DTOs.Inventory;

public class InventoryLedgerResponse
{
    public Guid Id { get; set; }
    public Guid BranchId { get; set; }
    public Guid ProductId { get; set; }
    public Guid? OrderId { get; set; }
    public string MovementType { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public int OnHandAfter { get; set; }
    public int ReservedAfter { get; set; }
    public DateTime CreatedAt { get; set; }
}
