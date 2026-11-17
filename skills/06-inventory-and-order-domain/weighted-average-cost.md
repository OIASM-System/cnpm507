# 💰 Weighted Average Cost (WAC - Giá Vốn Bình Quân Gia Quyền) - POS PWA Project

Tài liệu này quy định phương pháp tính toán **Giá vốn hàng bán (COGS - Cost of Goods Sold)** và **Giá trị tồn kho** theo chuẩn **Bình quân gia quyền liên hoàn (Moving Weighted Average Cost - WAC)** cho hệ thống **POS PWA (Point of Sale Progressive Web App)**. Cơ chế này giúp cửa hàng xác định chính xác biên lợi nhuận gộp (**Gross Profit Margin**) trên từng hóa đơn bán hàng ngay cả khi giá nhập nguyên liệu hoặc hàng hóa biến động qua từng đợt nhập kho.

---

## 📐 1. Công thức toán học & Nguyên tắc kế toán kho

Hệ thống áp dụng phương pháp **Bình quân gia quyền sau mỗi lần nhập (Moving Average)** thay vì bình quân cuối kỳ, giúp thu ngân và quản lý theo dõi được lợi nhuận tức thì theo thời gian thực trên Dashboard:

### 1.1. Công thức cập nhật Giá vốn khi Nhập kho (`PurchaseReceipt`)
Mỗi khi Quản lý nhập thêm một lô hàng mới với số lượng $Q_{\text{nhập}}$ và đơn giá nhập $C_{\text{nhập}}$, giá vốn bình quân mới ($C_{\text{mới}}$) của sản phẩm được tính lại ngay lập tức:

$$C_{\text{mới}} = \frac{(Q_{\text{tồn}} \times C_{\text{hiện tại}}) + (Q_{\text{nhập}} \times C_{\text{nhập}})}{Q_{\text{tồn}} + Q_{\text{nhập}}}$$

* **Trong đó:**
  * $Q_{\text{tồn}}$: Số lượng tồn kho vật lý (`stock_quantity`) ngay trước thời điểm nhập.
  * $C_{\text{hiện tại}}$: Giá vốn bình quân hiện hành (`average_cost`) của sản phẩm.
  * $Q_{\text{nhập}}$: Số lượng hàng nhập thêm trong phiếu nhập.
  * $C_{\text{nhập}}$: Đơn giá nhập của lô hàng mới (đã bao gồm chi phí vận chuyển phân bổ nếu có).

### 1.2. Nguyên tắc khi Xuất bán (`PosSale`) & Hoàn trả (`CustomerReturn`)
* **Khi xuất bán tại quầy (`PosSale`):** Giá vốn bình quân $C_{\text{hiện tại}}$ **không thay đổi**. Hệ thống ghi nhận `unit_cost = C_hiện tại` vào cả dòng chi tiết hóa đơn (`order_details.unit_cost`) lẫn bút toán sổ cái (`inventory_transactions.unit_cost`) để cố định chi phí giá vốn của đơn hàng đó.
* **Khi khách trả hàng / Hoàn tiền (`CustomerReturn`):** Sản phẩm nhập lại kho theo đúng giá vốn tại thời điểm đã bán (`originalOrderDetail.UnitCost`), sau đó tính lại bình quân gia quyền nếu giá vốn hiện tại đã khác với giá vốn của đơn hoàn.

---

## 📊 2. Ví dụ minh họa tính toán thực tế

Giả sử sản phẩm **Cà phê hạt rang xay (Gói 1kg)** có biến động kho qua 3 nghiệp vụ liên tiếp:

| Bước | Nghiệp vụ phát sinh | Số lượng ($\Delta Q$) | Đơn giá giao dịch | Tồn kho sau ($Q$) | Giá vốn bình quân ($C_{\text{WAC}}$) | Giải thích tính toán |
| :---: | :--- | :---: | :---: | :---: | :---: | :--- |
| **1** | **Tồn đầu kỳ (`InitialStock`)** | `+10` | `200,000đ` | `10` | **`200,000đ`** | Khởi tạo giá vốn ban đầu là `200,000đ/gói`. |
| **2** | **Bán tại quầy (`PosSale`)** | `-4` | Giá bán: `320,000đ` | `6` | **`200,000đ`** | Xuất bán giữ nguyên giá vốn `200,000đ`. Lãi gộp: `(320k - 200k) * 4 = 480,000đ`. |
| **3** | **Nhập lô mới (`PurchaseReceipt`)** | `+14` | Giá nhập: `250,000đ` | `20` | **`235,000đ`** | $\frac{(6 \times 200,000) + (14 \times 250,000)}{6 + 14} = \frac{4,700,000}{20} = 235,000\text{đ}$. |

---

## 💻 3. Triển khai kỹ thuật trong Domain Layer (.NET 8)

### 3.1. Cập nhật thực thể `Product.cs`
Sử dụng kiểu dữ liệu `decimal` (`numeric(18,2)` trong PostgreSQL) và làm tròn chuẩn kế toán `MidpointRounding.AwayFromZero` để tránh sai số dấu phẩy động (`float`/`double`):

```csharp
public sealed class Product : AggregateRoot, IMustHaveTenant
{
    public Guid TenantId { get; private set; }
    public string Code { get; private set; }
    public string Name { get; private set; }
    public decimal Price { get; private set; }        // Đơn giá bán lẻ tại quầy
    public decimal AverageCost { get; private set; }  // Giá vốn bình quân gia quyền (WAC)
    public int StockQuantity { get; private set; }

    /// <summary>
    /// Nhập kho lô hàng mới và tính lại Giá vốn bình quân gia quyền (WAC)
    /// </summary>
    public InventoryTransaction ReceiveStock(
        int incomingQuantity,
        decimal incomingUnitCost,
        Guid managerId,
        Guid? purchaseOrderId = null)
    {
        if (incomingQuantity <= 0)
            throw new DomainException("Số lượng nhập kho phải lớn hơn 0.");

        if (incomingUnitCost < 0)
            throw new DomainException("Đơn giá nhập kho không được âm.");

        var balanceBefore = StockQuantity;
        var currentTotalValue = StockQuantity * AverageCost;
        var incomingTotalValue = incomingQuantity * incomingUnitCost;

        var newStockQuantity = StockQuantity + incomingQuantity;

        // Tính lại giá vốn bình quân gia quyền mới
        AverageCost = Math.Round(
            (currentTotalValue + incomingTotalValue) / newStockQuantity,
            2,
            MidpointRounding.AwayFromZero);

        StockQuantity = newStockQuantity;

        AddDomainEvent(new StockUpdatedDomainEvent(TenantId, Id, StockQuantity));

        return InventoryTransaction.Record(
            tenantId: TenantId,
            productId: Id,
            type: InventoryTransactionType.PurchaseReceipt,
            quantityDelta: incomingQuantity,
            balanceBefore: balanceBefore,
            unitCost: incomingUnitCost,
            createdBy: managerId,
            referenceType: "PurchaseOrder",
            referenceId: purchaseOrderId,
            note: $"Nhập kho {incomingQuantity} đơn vị @ {incomingUnitCost:N0}đ (WAC mới: {AverageCost:N0}đ)"
        );
    }
}
```

### 3.2. Công thức tính Doanh thu & Lợi nhuận gộp trên Báo cáo Quản lý
Nhờ lưu trữ đồng thời `unit_price` (giá bán snapshot) và `unit_cost` (giá vốn WAC snapshot) trên từng dòng `order_details` của các đơn hàng ở trạng thái `Completed`, truy vấn báo cáo lợi nhuận chạy cực nhanh mà không cần đối chiếu ngược lại lịch sử nhập kho:

$$\text{Doanh thu thuần (Net Revenue)} = \sum (\text{unit\_price} \times \text{quantity}) - \text{discount}$$

$$\text{Tổng giá vốn (Total COGS)} = \sum (\text{unit\_cost} \times \text{quantity})$$

$$\text{Lợi nhuận gộp (Gross Profit)} = \text{Doanh thu thuần} - \text{Tổng giá vốn}$$

---
