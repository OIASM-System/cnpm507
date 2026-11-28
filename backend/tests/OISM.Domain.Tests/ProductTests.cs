using Xunit;
using OISM.Domain.Entities;

namespace OISM.Domain.Tests;

public class ProductTests
{
    [Fact]
    public void Constructor_WithValidValues_TrimsSkuAndName()
    {
        var product = new Product(Guid.NewGuid(), " SKU-001 ", " Product A ", 12500m);

        Assert.Equal("SKU-001", product.Sku);
        Assert.Equal("Product A", product.Name);
        Assert.True(product.IsActive);
    }

    [Fact]
    public void Constructor_WithBlankSku_ThrowsArgumentException()
    {
        Assert.Throws<ArgumentException>(() =>
            new Product(Guid.NewGuid(), "   ", "Product A", 100m));
    }

    [Fact]
    public void Constructor_WithSkuLongerThanDatabaseLimit_ThrowsArgumentException()
    {
        Assert.Throws<ArgumentException>(() =>
            new Product(Guid.NewGuid(), new string('S', 101), "Product A", 100m));
    }

    [Fact]
    public void Constructor_WithNameLongerThanDatabaseLimit_ThrowsArgumentException()
    {
        Assert.Throws<ArgumentException>(() =>
            new Product(Guid.NewGuid(), "SKU-001", new string('A', 251), 100m));
    }

    [Fact]
    public void Constructor_WithNegativePrice_ThrowsArgumentException()
    {
        Assert.Throws<ArgumentException>(() =>
            new Product(Guid.NewGuid(), "SKU-001", "Product A", -0.01m));
    }
}
