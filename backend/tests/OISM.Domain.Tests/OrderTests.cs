using OISM.Domain.Entities;
using OISM.Domain.Enums;

namespace OISM.Domain.Tests;

public class OrderTests
{
    [Fact]
    public void Constructor_WithValidValues_CreatesPendingOrderAndNormalizesSource()
    {
        var order = new Order(Guid.NewGuid(), Guid.NewGuid(), " pos ");

        Assert.NotEqual(Guid.Empty, order.Id);
        Assert.StartsWith("OISM-", order.OrderNumber);
        Assert.Equal("POS", order.Source);
        Assert.Equal(OrderStatus.Pending, order.Status);
        Assert.Equal(0m, order.TotalAmount);
        Assert.Empty(order.Items);
    }

    [Fact]
    public void Constructor_WithEmptyTenantId_ThrowsArgumentException()
    {
        Assert.Throws<ArgumentException>(() =>
            new Order(Guid.Empty, Guid.NewGuid(), "POS"));
    }

    [Fact]
    public void Constructor_WithEmptyBranchId_ThrowsArgumentException()
    {
        Assert.Throws<ArgumentException>(() =>
            new Order(Guid.NewGuid(), Guid.Empty, "POS"));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Constructor_WithBlankSource_ThrowsArgumentException(string source)
    {
        Assert.Throws<ArgumentException>(() =>
            new Order(Guid.NewGuid(), Guid.NewGuid(), source));
    }

    [Fact]
    public void AddItem_UpdatesItemsAndTotalAmount()
    {
        var order = new Order(Guid.NewGuid(), Guid.NewGuid(), "POS");
        var item = new OrderItem(Guid.NewGuid(), "SKU-001", "Product A", 2, 12500m);

        order.AddItem(item);

        Assert.Single(order.Items);
        Assert.Equal(25000m, order.TotalAmount);
    }

    [Fact]
    public void Confirm_ChangesPendingOrderToConfirmed()
    {
        var order = new Order(Guid.NewGuid(), Guid.NewGuid(), "POS");

        order.Confirm();

        Assert.Equal(OrderStatus.Confirmed, order.Status);
    }

    [Fact]
    public void Cancel_ChangesPendingOrderToCancelled()
    {
        var order = new Order(Guid.NewGuid(), Guid.NewGuid(), "POS");

        order.Cancel();

        Assert.Equal(OrderStatus.Cancelled, order.Status);
    }

    [Fact]
    public void Confirm_WhenAlreadyCancelled_ThrowsInvalidOperationException()
    {
        var order = new Order(Guid.NewGuid(), Guid.NewGuid(), "POS");
        order.Cancel();

        Assert.Throws<InvalidOperationException>(() => order.Confirm());
    }

    [Fact]
    public void Cancel_WhenAlreadyConfirmed_ThrowsInvalidOperationException()
    {
        var order = new Order(Guid.NewGuid(), Guid.NewGuid(), "POS");
        order.Confirm();

        Assert.Throws<InvalidOperationException>(() => order.Cancel());
    }
}
