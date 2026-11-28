
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
            throw new ArgumentException("SKU không được để trống.", nameof(sku));

        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Tên sản phẩm không được để trống.", nameof(name));

        sku = sku.Trim();
        name = name.Trim();

        // Keep domain validation consistent with the database column limits.
        if (sku.Length > 100)
            throw new ArgumentException("SKU không được vượt quá 100 ký tự.", nameof(sku));

        if (name.Length > 250)
            throw new ArgumentException("Tên sản phẩm không được vượt quá 250 ký tự.", nameof(name));

        if (unitPrice < 0)
            throw new ArgumentException("Giá sản phẩm không hợp lệ.", nameof(unitPrice));

        Id = Guid.NewGuid();
        TenantId = tenantId;
        Sku = sku;
        Name = name;
        UnitPrice = unitPrice;
        IsActive = true;
    }
}
