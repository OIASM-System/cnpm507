using OISM.Domain.Entities;

namespace OISM.Domain.Tests;

public class InventoryTests
{
    private static Inventory CreateInventory(int initialStock = 10) =>
        new(Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(), initialStock);

    [Fact]
    public void Constructor_WithValidValues_SetsInitialStock()
    {
        var inventory = CreateInventory(12);

        Assert.Equal(12, inventory.OnHand);
        Assert.Equal(0, inventory.Reserved);
        Assert.Equal(12, inventory.Available);
    }

    [Fact]
    public void Constructor_WithNegativeInitialStock_ThrowsArgumentException()
    {
        Assert.Throws<ArgumentException>(() =>
            new Inventory(Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(), -1));
    }

    [Fact]
    public void Reserve_WithAvailableStock_IncreasesReservedQuantity()
    {
        var inventory = CreateInventory(10);

        inventory.Reserve(4);

        Assert.Equal(10, inventory.OnHand);
        Assert.Equal(4, inventory.Reserved);
        Assert.Equal(6, inventory.Available);
    }

    [Fact]
    public void Reserve_WithInsufficientStock_ThrowsInvalidOperationException()
    {
        var inventory = CreateInventory(3);

        Assert.Throws<InvalidOperationException>(() => inventory.Reserve(4));
        Assert.Equal(0, inventory.Reserved);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void Reserve_WithNonPositiveQuantity_ThrowsArgumentException(int quantity)
    {
        var inventory = CreateInventory();

        Assert.Throws<ArgumentException>(() => inventory.Reserve(quantity));
    }

    [Fact]
    public void ConfirmReservation_ReducesOnHandAndReserved()
    {
        var inventory = CreateInventory(10);
        inventory.Reserve(3);

        inventory.ConfirmReservation(3);

        Assert.Equal(7, inventory.OnHand);
        Assert.Equal(0, inventory.Reserved);
        Assert.Equal(7, inventory.Available);
    }

    [Fact]
    public void ReleaseReservation_ReducesReservedButKeepsOnHand()
    {
        var inventory = CreateInventory(10);
        inventory.Reserve(3);

        inventory.ReleaseReservation(2);

        Assert.Equal(10, inventory.OnHand);
        Assert.Equal(1, inventory.Reserved);
        Assert.Equal(9, inventory.Available);
    }

    [Fact]
    public void AdjustStock_BelowReservedQuantity_ThrowsInvalidOperationException()
    {
        var inventory = CreateInventory(10);
        inventory.Reserve(5);

        Assert.Throws<InvalidOperationException>(() => inventory.AdjustStock(4));
        Assert.Equal(10, inventory.OnHand);
        Assert.Equal(5, inventory.Reserved);
    }

    [Fact]
    public void AdjustStock_WithValidQuantity_UpdatesOnHand()
    {
        var inventory = CreateInventory(10);

        inventory.AdjustStock(15);

        Assert.Equal(15, inventory.OnHand);
        Assert.Equal(15, inventory.Available);
    }
}
