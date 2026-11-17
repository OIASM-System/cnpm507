# 📒 Inventory Ledger Architecture (Sổ cái Tồn kho) - POS PWA Project

Tài liệu này quy định thiết kế kiến trúc **Sổ cái Tồn kho (Inventory Ledger)** cho hệ thống **POS PWA (Point of Sale Progressive Web App)**. Thay vì chỉ cập nhật đè lên một con số tồn kho duy nhất trên bảng `products` (dễ gây mất dấu vết khi sai lệch kiểm kê hoặc gian lận nội bộ), hệ thống lưu trữ **toàn bộ lịch sử biến động xuất - nhập - tồn** dưới dạng các bút toán bất biến trong bảng `inventory_transactions`, đồng thời duy trì cột `stock_quantity` trên bảng `products` như một **Materialized Balance (Số dư tức thì)** để tối ưu tốc độ bán hàng tại quầy ($< 10\text{ms}$).

---

## 🏛️ 1. Mô hình kết hợp: Sổ cái (Ledger) + Số dư tức thì (Balance)

| Thành phần lưu trữ | Vai trò trong kiến trúc POS PWA | Quy tắc thao tác |
| :--- | :--- | :--- |
| **`products.stock_quantity`** *(Current Balance)* | Phục vụ hiển thị nhanh số lượng còn lại trên lưới sản phẩm POS và khóa dòng (`FOR UPDATE`) khi chốt đơn. | Chỉ được cập nhật đồng bộ bên trong cùng một Database Transaction với bút toán sổ cái. |
| **`inventory_transactions`** *(Immutable Ledger)* | Lưu trữ chi tiết từng biến động tăng/giảm số lượng, lý do, người thực hiện, giá vốn và chứng từ gốc tham chiếu. | **Chỉ thêm mới (`INSERT` / Append-Only)** — Tuyệt đối cấm `UPDATE` hoặc `DELETE`. |

### Công thức đối soát tính toàn vẹn sổ cái (Ledger Invariant):
Tại bất kỳ thời điểm nào, tổng đại số của toàn bộ các bút toán trong sổ cái của một sản phẩm bắt buộc phải bằng đúng số lượng tồn kho hiện tại:

$$\text{StockQuantity}_{\text{current}} = \sum_{i=1}^{n} \Delta \text{Quantity}_i$$

---

## 📋 2. Phân loại bút toán biến động (`InventoryTransactionType`)

Mọi sự thay đổi tồn kho của một sản phẩm đều phải gắn với một trong 5 loại nghiệp vụ chuẩn sau:

| Mã loại (`Type`) | Chiều biến động ($\Delta Q$) | Chứng từ tham chiếu (`ReferenceId`) | Nghiệp vụ phát sinh thực tế |
| :--- | :---: | :--- | :--- |
| **`PurchaseReceipt`** (Nhập hàng) | **Dương (`+Q`)** | `PurchaseOrderId` / Phiếu nhập | Quản lý nhập lô hàng mới từ nhà cung cấp (cập nhật lại giá vốn bình quân). |
| **`PosSale`** (Bán hàng tại quầy) | **Âm (`-Q`)** | `OrderId` | Thu ngân chốt đơn thanh toán tại quầy POS hoặc đồng bộ đơn Offline. |
| **`CustomerReturn`** (Khách trả / Hoàn đơn) | **Dương (`+Q`)** | `OrderId` (Refunded) | Quản lý duyệt hoàn tiền hóa đơn và nhập lại sản phẩm nguyên vẹn vào kho. |
| **`StockAdjustment`** (Điều chỉnh kiểm kê) | **Âm hoặc Dương (`±Q`)** | `StocktakeId` / Ghi chú lý do | Quản lý cân bằng kho sau kiểm kê thực tế (hàng hư hỏng, hết hạn, thất thoát). |
| **`InitialStock`** (Khởi tạo tồn đầu kỳ) | **Dương (`+Q`)** | `ProductId` | Khai báo số lượng tồn kho ban đầu khi tạo mới sản phẩm trên hệ thống. |

---

## 🗄️ 3. Thiết kế bảng `inventory_transactions` (PostgreSQL 16)

```sql
CREATE TABLE inventory_transactions (
    id uuid PRIMARY KEY,
    tenant_id uuid NOT NULL REFERENCES tenants(id),
    product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    transaction_type varchar(30) NOT NULL,
    quantity_delta integer NOT NULL CHECK (quantity_delta <> 0),
    balance_before integer NOT NULL CHECK (balance_before >= 0),
    balance_after integer NOT NULL CHECK (balance_after >= 0),
    unit_cost numeric(18, 2) NOT NULL CHECK (unit_cost >= 0),
    reference_type varchar(30) NULL,
    reference_id uuid NULL,
    note varchar(500) NULL,
    created_by uuid NOT NULL REFERENCES users(id),
    created_at timestamptz NOT NULL
);

-- Tối ưu truy vấn thẻ kho (Stock Card) lịch sử xuất nhập của 1 sản phẩm theo thời gian
CREATE INDEX ix_inventory_transactions_tenant_product_created 
ON inventory_transactions (tenant_id, product_id, created_at DESC);

-- Tối ưu truy vết các bút toán thuộc về một hóa đơn cụ thể
CREATE INDEX ix_inventory_transactions_reference 
ON inventory_transactions (tenant_id, reference_id);
```

---

## 💻 4. Triển khai kỹ thuật trong Domain Layer (.NET 8)

### 4.1. Thực thể bất biến `InventoryTransaction`
Toàn bộ thuộc tính của thực thể chỉ có `private set` và không cung cấp bất kỳ phương thức cập nhật nào sau khi khởi tạo:

```csharp
public sealed class InventoryTransaction : Entity, IMustHaveTenant
{
    public Guid TenantId { get; private set; }
    public Guid ProductId { get; private set; }
    public InventoryTransactionType TransactionType { get; private set; }
    public int QuantityDelta { get; private set; }
    public int BalanceBefore { get; private set; }
    public int BalanceAfter { get; private set; }
    public decimal UnitCost { get; private set; }
    public string? ReferenceType { get; private set; }
    public Guid? ReferenceId { get; private set; }
    public string? Note { get; private set; }
    public Guid CreatedBy { get; private set; }
    public DateTime CreatedAt { get; private set; }

    private InventoryTransaction() { } // Dành cho EF Core

    public static InventoryTransaction Record(
        Guid tenantId,
        Guid productId,
        InventoryTransactionType type,
        int quantityDelta,
        int balanceBefore,
        decimal unitCost,
        Guid createdBy,
        string? referenceType = null,
        Guid? referenceId = null,
        string? note = null)
    {
        if (quantityDelta == 0)
            throw new DomainException("Số lượng biến động tồn kho phải khác 0.");

        var balanceAfter = balanceBefore + quantityDelta;
        if (balanceAfter < 0)
            throw new InsufficientStockException("Số dư tồn kho sau biến động không được âm.");

        return new InventoryTransaction
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            ProductId = productId,
            TransactionType = type,
            QuantityDelta = quantityDelta,
            BalanceBefore = balanceBefore,
            BalanceAfter = balanceAfter,
            UnitCost = unitCost,
            ReferenceType = referenceType,
            ReferenceId = referenceId,
            Note = note?.Trim(),
            CreatedBy = createdBy,
            CreatedAt = DateTime.UtcNow
        };
    }
}
```

### 4.2. Đồng bộ cập nhật số dư & ghi sổ cái trong `Product` Aggregate
Khi gọi `product.DeductStock(...)`, thực thể `Product` vừa cập nhật `StockQuantity`, vừa sinh ra đối tượng `InventoryTransaction` tương ứng để lưu chung trong một Transaction:

```csharp
public InventoryTransaction DeductStock(
    int quantity,
    Guid orderId,
    Guid cashierId)
{
    if (quantity <= 0)
        throw new DomainException("Số lượng xuất bán phải lớn hơn 0.");

    if (StockQuantity < quantity)
        throw new InsufficientStockException($"Sản phẩm '{Name}' chỉ còn {StockQuantity} trong kho.");

    var balanceBefore = StockQuantity;
    StockQuantity -= quantity;

    AddDomainEvent(new StockUpdatedDomainEvent(TenantId, Id, StockQuantity));

    return InventoryTransaction.Record(
        tenantId: TenantId,
        productId: Id,
        type: InventoryTransactionType.PosSale,
        quantityDelta: -quantity,
        balanceBefore: balanceBefore,
        unitCost: AverageCost,
        createdBy: cashierId,
        referenceType: "Order",
        referenceId: orderId,
        note: $"Xuất bán tại quầy POS"
    );
}
```

---

## 🔍 5. Giá trị thực tiễn cho Thẻ kho (Stock Card) & Kiểm toán

1. **Truy vết Thẻ kho tức thì:** Khi Quản lý mở chi tiết một sản phẩm, hệ thống truy vấn `inventory_transactions` theo `(tenant_id, product_id)` để hiển thị dòng thời gian minh bạch: *Tồn đầu `50` $\rightarrow$ Bán đơn `ORD#101` (`-2`, còn `48`) $\rightarrow$ Bán đơn `ORD#102` (`-1`, còn `47`) $\rightarrow$ Nhập hàng (`+20`, còn `67`)*.
2. **Phát hiện bất thường (Anomaly Detection):** Dễ dàng đối soát tự động bằng câu lệnh SQL kiểm tra xem có sản phẩm nào có `products.stock_quantity != SUM(inventory_transactions.quantity_delta)` hay không.

---
