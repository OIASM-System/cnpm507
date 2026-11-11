
namespace OISM.Domain.Entities;

public class Product
{
    public Guid Id { get; private set; }
    public Guid TenantId { get; private set; }

    public string Sku { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;

    public decimal UnitPrice { get; private set; }
    public bool IsActive { get; private set; }

    private Product() { }

    public Product(
        Guid tenantId,
        string sku,
        string name,
        decimal unitPrice)
    {
        if (tenantId == Guid.Empty)
            throw new ArgumentException("TenantId không hợp lệ.");

        if (string.IsNullOrWhiteSpace(sku))
            throw new ArgumentException("SKU không được để trống.");

        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Tên sản phẩm không được để trống.");

        if (unitPrice < 0)
            throw new ArgumentException("Giá sản phẩm không hợp lệ.");

        Id = Guid.NewGuid();
        TenantId = tenantId;
        Sku = sku;
        Name = name;
        UnitPrice = unitPrice;
        IsActive = true;
    }
}
