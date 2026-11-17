# 💎 Domain-Driven Design (Thiết kế hướng miền - DDD) - POS PWA Project

Tài liệu này mô tả cách áp dụng **Domain-Driven Design (DDD)** ở mức độ chiến thuật (**Tactical DDD**) vào tầng `PosPwa.Domain` của hệ thống **POS PWA (Point of Sale Progressive Web App)**. Thay vì sử dụng các mô hình dữ liệu thụ động chỉ chứa `get; set;` (*Anemic Domain Model*), mọi quy tắc nghiệp vụ cốt lõi về tính tiền, chiết khấu, chuyển đổi trạng thái đơn hàng và kiểm soát tồn kho đều được đóng gói trực tiếp bên trong các **Aggregates**, **Entities** và **Value Objects**.

---

## 🗺️ 1. Ngôn ngữ chung (Ubiquitous Language)

Toàn bộ nhóm phát triển (BA, Backend, Frontend, QA) thống nhất sử dụng chung các thuật ngữ nghiệp vụ sau trong cả tài liệu lẫn tên lớp/hàm trong mã nguồn:

| Thuật ngữ miền (Domain Term) | Định nghĩa nghiệp vụ trong POS PWA |
| :--- | :--- |
| **Order (Đơn hàng)** | Một phiên giao dịch bán hàng tại quầy, tập hợp các sản phẩm khách mua và thông tin thanh toán tương ứng. |
| **OrderLine / OrderDetail** | Một dòng chi tiết trong đơn hàng, gắn liền với một sản phẩm cụ thể, đơn giá tại thời điểm bán và số lượng mua. |
| **Catalog Product (Sản phẩm)** | Hàng hóa được bày bán trên màn hình POS (tương ứng nút `GET`), có mã định danh SKU và số lượng tồn kho khả dụng. |
| **Inventory Deduction (Trừ kho)** | Hành động giảm số lượng tồn kho thực tế của sản phẩm khi đơn hàng chuyển sang trạng thái `Completed`. |
| **Anti-Oversell Guard** | Quy tắc miền nghiêm cấm số lượng tồn kho giảm xuống dưới `0` dưới mọi hình thức tranh chấp đồng thời. |
| **Receipt (Hóa đơn)** | Chứng từ xác nhận giao dịch hoàn tất (`ORD#...`), dùng để hiển thị trên `Receipt Preview` và in qua máy in nhiệt. |

---

## 🧩 2. Phân rã ranh giới Aggregates (Aggregate Boundaries)

Hệ thống được chia thành **3 Aggregates độc lập**, giao tiếp với nhau thông qua **ID định danh** hoặc **Domain Events** nhằm đảm bảo phạm vi giao dịch (Transaction Boundary) gọn nhẹ và tối ưu khóa dữ liệu trong PostgreSQL:

```mermaid
flowchart TB
    subgraph Order_Aggregate ["📦 Order Aggregate (Giao dịch Bán hàng)"]
        OrderRoot["👑 Order (Aggregate Root)<br/>- Id, OrderNumber, Status<br/>- SubTotal, Discount, TotalAmount"]
        OrderItem["OrderDetail (Child Entity)<br/>- ProductId, Quantity, UnitPrice"]
        PaymentEntity["Payment (Child Entity)<br/>- Method, Amount, TransactionCode"]
        MoneyVO["Money (Value Object)"]
        
        OrderRoot *-- OrderItem
        OrderRoot *-- PaymentEntity
        OrderRoot --- MoneyVO
    end

    subgraph Product_Aggregate ["🏷️ Product Aggregate (Danh mục & Tồn kho)"]
        ProductRoot["👑 Product (Aggregate Root)<br/>- Id, Code, Name, Price<br/>- StockQuantity, RowVersion"]
        SkuVO["SkuCode (Value Object)"]
        
        ProductRoot --- SkuVO
    end

    subgraph User_Aggregate ["👤 User Aggregate (Nhân sự & Phân quyền)"]
        UserRoot["👑 User (Aggregate Root)<br/>- Id, Username, FullName, Role"]
    end

    OrderRoot -.->|Tham chiếu qua CashierId| UserRoot
    OrderItem -.->|Tham chiếu qua ProductId| ProductRoot
```

---

## 🛠️ 3. Triển khai các thành phần Tactical DDD trong C#

### 3.1. Value Objects (Đối tượng giá trị bất biến)
Value Objects không có khóa định danh (`Id`), được so sánh dựa trên giá trị thuộc tính và tự kiểm tra tính hợp lệ ngay khi khởi tạo (ví dụ: `Money` không được mang giá trị âm).

```csharp
public sealed record Money
{
    public decimal Amount { get; }
    public string Currency { get; }

    public Money(decimal amount, string currency = "VND")
    {
        if (amount < 0)
            throw new DomainException("Số tiền không được phép âm.");

        Amount = amount;
        Currency = currency;
    }

    public static Money Zero(string currency = "VND") => new(0, currency);

    public Money Add(Money other) => new(Amount + other.Amount, Currency);
    public Money Subtract(Money other)
    {
        if (Amount < other.Amount)
            throw new DomainException("Số tiền trừ vượt quá số tiền hiện có.");
        return new(Amount - other.Amount, Currency);
    }
}
```

### 3.2. Aggregate Root: `Product` (Bảo vệ quy tắc Anti-Oversell)
Mọi thay đổi liên quan đến tồn kho đều bắt buộc phải đi qua phương thức `DeductStock()` hoặc `RestoreStock()` của `Product`, tuyệt đối không cho phép tầng ngoài gán trực tiếp `product.StockQuantity = ...`.

```csharp
public sealed class Product : AggregateRoot
{
    public string Code { get; private set; }
    public string Name { get; private set; }
    public decimal Price { get; private set; }
    public int StockQuantity { get; private set; }
    public Guid CategoryId { get; private set; }

    // Thuộc tính phục vụ Optimistic Concurrency Control trong PostgreSQL
    public uint RowVersion { get; private set; }

    private Product() { } // Dành cho EF Core

    public void DeductStock(int quantity)
    {
        if (quantity <= 0)
            throw new DomainException("Số lượng trừ kho phải lớn hơn 0.");

        if (StockQuantity < quantity)
            throw new InsufficientStockException(
                $"Sản phẩm '{Name}' chỉ còn {StockQuantity} trong kho, không đủ đáp ứng {quantity}.");

        StockQuantity -= quantity;
        AddDomainEvent(new StockDeductedDomainEvent(Id, StockQuantity));
    }

    public void RestoreStock(int quantity)
    {
        if (quantity <= 0)
            throw new DomainException("Số lượng hoàn kho phải lớn hơn 0.");

        StockQuantity += quantity;
    }
}
```

### 3.3. Aggregate Root: `Order` (Đóng gói vòng đời đơn hàng & Thanh toán)
Thực thể `Order` đóng vai trò **Aggregate Root**, chịu trách nhiệm quản lý danh sách `OrderDetail`, tự động tính toán lại `SubTotal` và `TotalAmount` mỗi khi thêm/bớt món, đồng thời kiểm soát chặt chẽ việc chuyển đổi trạng thái.

```csharp
public sealed class Order : AggregateRoot
{
    private readonly List<OrderDetail> _items = new();
    public IReadOnlyCollection<OrderDetail> Items => _items.AsReadOnly();

    public string OrderNumber { get; private set; }
    public Guid CashierId { get; private set; }
    public decimal SubTotal { get; private set; }
    public decimal Discount { get; private set; }
    public decimal TotalAmount { get; private set; }
    public OrderStatus Status { get; private set; }
    public Payment? Payment { get; private set; }
    public DateTime CreatedAt { get; private set; }

    public static Order CreateDraft(Guid cashierId, string orderNumber)
    {
        return new Order
        {
            Id = Guid.NewGuid(),
            CashierId = cashierId,
            OrderNumber = orderNumber,
            Status = OrderStatus.Draft,
            CreatedAt = DateTime.UtcNow
        };
    }

    public void AddItem(Guid productId, string productName, decimal unitPrice, int quantity)
    {
        if (Status != OrderStatus.Draft)
            throw new DomainException("Chỉ có thể thêm sản phẩm khi đơn hàng đang ở trạng thái Draft.");

        var existingItem = _items.FirstOrDefault(x => x.ProductId == productId);
        if (existingItem is not null)
        {
            existingItem.IncreaseQuantity(quantity);
        }
        else
        {
            _items.Add(new OrderDetail(Id, productId, productName, unitPrice, quantity));
        }

        RecalculateTotals();
    }

    public void ApplyDiscount(decimal discountAmount)
    {
        if (discountAmount < 0 || discountAmount > SubTotal)
            throw new DomainException("Số tiền chiết khấu không hợp lệ.");

        Discount = discountAmount;
        RecalculateTotals();
    }

    public void CompletePayment(PaymentMethod method, string? transactionCode = null)
    {
        if (!_items.Any())
            throw new DomainException("Không thể thanh toán đơn hàng trống.");

        if (Status == OrderStatus.Completed)
            throw new DomainException("Đơn hàng này đã được thanh toán trước đó.");

        Payment = new Payment(Id, method, TotalAmount, transactionCode);
        Status = OrderStatus.Completed;

        AddDomainEvent(new OrderCompletedDomainEvent(Id, OrderNumber, TotalAmount));
    }

    private void RecalculateTotals()
    {
        SubTotal = _items.Sum(i => i.LineTotal);
        TotalAmount = SubTotal - Discount;
    }
}
```

---

## ⚡ 4. Domain Events (Sự kiện miền)

Khi một thay đổi quan trọng xảy ra bên trong Aggregate, hệ thống phát sinh các **Domain Events** để kích hoạt các tác vụ phụ trợ một cách lỏng lẻo (Decoupled):

1. **`OrderCompletedDomainEvent`:** Được phát ra khi `order.CompletePayment()` thành công $\rightarrow$ Kích hoạt Handler ghi nhận nhật ký kiểm toán (Audit Log) và thông báo cho giao diện thu ngân in hóa đơn.
2. **`StockDeductedDomainEvent`:** Được phát ra khi `product.DeductStock()` thực thi $\rightarrow$ Kích hoạt Handler đẩy sự kiện `StockUpdated` qua **SignalR Hub** tới tất cả các quầy thu ngân đang mở.

---
