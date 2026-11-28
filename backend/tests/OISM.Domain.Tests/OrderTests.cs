
using Xunit;
using OISM.Domain.Entities;
using OISM.Domain.Enums;

namespace OISM.Domain.Tests;

public class OrderTests
{
    private static Order CreateOrder() =>
        new(Guid.NewGuid(), Guid.NewGuid(), "POS");

    private static OrderItem CreateItem(
        int quantity = 2,
        decimal unitPrice = 12500m) =>
        new(Guid.NewGuid(), "SKU-001", "Product A", quantity, unitPrice);

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
    public void Constructor_WithNullSource_ThrowsArgumentException()
    {
        Assert.Throws<ArgumentException>(() =>
            new Order(Guid.NewGuid(), Guid.NewGuid(), null!));
    }

    [Fact]
    public void Constructor_WithSourceLongerThanDatabaseLimit_ThrowsArgumentException()
    {
        Assert.Throws<ArgumentException>(() =>
            new Order(
                Guid.NewGuid(),
                Guid.NewGuid(),
                new string('S', 41)));
    }

    [Fact]
    public void AddItem_UpdatesItemsAndTotalAmount()
    {
        var order = CreateOrder();
        var item = CreateItem();

        order.AddItem(item);

        Assert.Single(order.Items);
        Assert.Equal(25000m, order.TotalAmount);
    }

    [Fact]
    public void AddItem_WithMultipleItems_UpdatesTotalAmountCorrectly()
    {
        var order = CreateOrder();

        var firstItem = CreateItem(2, 10000m);
        var secondItem = CreateItem(3, 5000m);

        order.AddItem(firstItem);
        order.AddItem(secondItem);

        Assert.Equal(2, order.Items.Count);
        Assert.Equal(35000m, order.TotalAmount);
    }

    [Fact]
    public void AddItem_WithNullItem_ThrowsArgumentNullException()
    {
        var order = CreateOrder();

        Assert.Throws<ArgumentNullException>(() =>
            order.AddItem(null!));

        Assert.Empty(order.Items);
        Assert.Equal(0m, order.TotalAmount);
    }

    [Fact]
    public void AddItem_WhenOrderIsConfirmed_ThrowsInvalidOperationException()
    {
        var order = CreateOrder();
        order.Confirm();

        Assert.Throws<InvalidOperationException>(() =>
            order.AddItem(CreateItem()));

        Assert.Empty(order.Items);
        Assert.Equal(0m, order.TotalAmount);
    }

    [Fact]
    public void AddItem_WhenOrderIsCancelled_ThrowsInvalidOperationException()
    {
        var order = CreateOrder();
        order.Cancel();

        Assert.Throws<InvalidOperationException>(() =>
            order.AddItem(CreateItem()));

        Assert.Empty(order.Items);
        Assert.Equal(0m, order.TotalAmount);
    }

    [Fact]
    public void Confirm_ChangesPendingOrderToConfirmed()
    {
        var order = CreateOrder();

        order.Confirm();

        Assert.Equal(OrderStatus.Confirmed, order.Status);
    }

    [Fact]
    public void Confirm_WhenAlreadyConfirmed_ThrowsInvalidOperationException()
    {
        var order = CreateOrder();
        order.Confirm();

        Assert.Throws<InvalidOperationException>(() =>
            order.Confirm());
    }

    [Fact]
    public void Cancel_ChangesPendingOrderToCancelled()
    {
        var order = CreateOrder();

        order.Cancel();

        Assert.Equal(OrderStatus.Cancelled, order.Status);
    }

    [Fact]
    public void Confirm_WhenAlreadyCancelled_ThrowsInvalidOperationException()
    {
        var order = CreateOrder();
        order.Cancel();

        Assert.Throws<InvalidOperationException>(() =>
            order.Confirm());
    }

    [Fact]
    public void Cancel_WhenAlreadyConfirmed_ThrowsInvalidOperationException()
    {
        var order = CreateOrder();
        order.Confirm();

        Assert.Throws<InvalidOperationException>(() =>
            order.Cancel());
    }

    [Fact]
    public void Cancel_WhenAlreadyCancelled_ThrowsInvalidOperationException()
    {
        var order = CreateOrder();
        order.Cancel();

        Assert.Throws<InvalidOperationException>(() =>
            order.Cancel());
    }

    [Fact]
    public void AddItem_WhenTotalWouldOverflow_DoesNotAddItem()
    {
        var order = CreateOrder();

        var largeItem = new OrderItem(
            Guid.NewGuid(),
            "SKU-01",
            "Large item",
            int.MaxValue,
            decimal.MaxValue / int.MaxValue);

        order.AddItem(largeItem);

        var overflowingItem = new OrderItem(
            Guid.NewGuid(),
            "SKU-02",
            "Overflow item",
            1,
            decimal.MaxValue);

        var originalCount = order.Items.Count;
        var originalTotal = order.TotalAmount;

        Assert.Throws<OverflowException>(() =>
            order.AddItem(overflowingItem));

        Assert.Equal(originalCount, order.Items.Count);
        Assert.Equal(originalTotal, order.TotalAmount);
    }
}
