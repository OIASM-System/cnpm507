
using Xunit;
using OISM.Domain.Entities;

namespace OISM.Domain.Tests;

public class ProductTests
{
    [Fact]
    public void Constructor_WithValidValues_TrimsSkuAndName()
    {
        var product = new Product(
            Guid.NewGuid(),
            " SKU-001 ",
            " Product A ",
            12500m);

        Assert.NotEqual(Guid.Empty, product.Id);
        Assert.NotEqual(Guid.Empty, product.TenantId);
        Assert.Equal("SKU-001", product.Sku);
        Assert.Equal("Product A", product.Name);
        Assert.Equal(12500m, product.UnitPrice);
        Assert.True(product.IsActive);
    }

    [Fact]
    public void Constructor_WithEmptyTenantId_ThrowsArgumentException()
    {
        Assert.Throws<ArgumentException>(() =>
            new Product(Guid.Empty, "SKU-001", "Product A", 100m));
    }

    [Fact]
    public void Constructor_WithBlankSku_ThrowsArgumentException()
    {
        Assert.Throws<ArgumentException>(() =>
            new Product(Guid.NewGuid(), "   ", "Product A", 100m));
    }

    [Fact]
    public void Constructor_WithNullSku_ThrowsArgumentException()
    {
        Assert.Throws<ArgumentException>(() =>
            new Product(Guid.NewGuid(), null!, "Product A", 100m));
    }

    [Fact]
    public void Constructor_WithBlankName_ThrowsArgumentException()
    {
        Assert.Throws<ArgumentException>(() =>
            new Product(Guid.NewGuid(), "SKU-001", "   ", 100m));
    }

    [Fact]
    public void Constructor_WithNullName_ThrowsArgumentException()
    {
        Assert.Throws<ArgumentException>(() =>
            new Product(Guid.NewGuid(), "SKU-001", null!, 100m));
    }

    [Fact]
    public void Constructor_WithSkuLongerThanDatabaseLimit_ThrowsArgumentException()
    {
        Assert.Throws<ArgumentException>(() =>
            new Product(
                Guid.NewGuid(),
                new string('S', 101),
                "Product A",
                100m));
    }

    [Fact]
    public void Constructor_WithNameLongerThanDatabaseLimit_ThrowsArgumentException()
    {
        Assert.Throws<ArgumentException>(() =>
            new Product(
                Guid.NewGuid(),
                "SKU-001",
                new string('A', 251),
                100m));
    }

    [Fact]
    public void Constructor_WithNegativePrice_ThrowsArgumentException()
    {
        Assert.Throws<ArgumentException>(() =>
            new Product(Guid.NewGuid(), "SKU-001", "Product A", -0.01m));
    }

    [Fact]
    public void Constructor_WithZeroPrice_Succeeds()
    {
        var product = new Product(
            Guid.NewGuid(),
            "SKU-001",
            "Free Product",
            0m);

        Assert.Equal(0m, product.UnitPrice);
        Assert.True(product.IsActive);
    }
}
