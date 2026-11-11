using OISM.Domain.Entities;

namespace OISM.Domain.Tests;

public class OrderItemTests
{
    [Fact]
    public void Constructor_WithValidValues_CalculatesLineTotal()
    {
        var item = new OrderItem(Guid.NewGuid(), "SKU-01", "Product", 3, 15000m);

        Assert.Equal(45000m, item.LineTotal);
    }

    [Fact]
    public void Constructor_WithEmptyProductId_ThrowsArgumentException()
    {
        Assert.Throws<ArgumentException>(() =>
            new OrderItem(Guid.Empty, "SKU-01", "Product", 1, 100m));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-2)]
    public void Constructor_WithNonPositiveQuantity_ThrowsArgumentException(int quantity)
    {
        Assert.Throws<ArgumentException>(() =>
            new OrderItem(Guid.NewGuid(), "SKU-01", "Product", quantity, 100m));
    }

    [Fact]
    public void Constructor_WithNegativeUnitPrice_ThrowsArgumentException()
    {
        Assert.Throws<ArgumentException>(() =>
            new OrderItem(Guid.NewGuid(), "SKU-01", "Product", 1, -1m));
    }
}
