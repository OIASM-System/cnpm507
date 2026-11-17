# ⚙️ Unit Testing Standards (xUnit + FluentAssertions) - POS PWA Project

Tài liệu này quy định tiêu chuẩn viết **Kiểm thử Đơn vị (Unit Testing)** cho tầng **Domain (`PosPwa.Domain`)** và tầng **Application (`PosPwa.Application`)** trong hệ thống **POS PWA (Point of Sale Progressive Web App)**. Nhờ áp dụng kiến trúc **Clean Architecture** và **Rich Domain Model**, toàn bộ các quy tắc nghiệp vụ phức tạp nhất (tính giá vốn bình quân gia quyền WAC, máy trạng thái đơn hàng, chiết khấu, kiểm tra tồn kho khả dụng) đều được kiểm thử thuần túy trong bộ nhớ RAM với tốc độ siêu nhanh (**$< 1\text{ms}$ mỗi test case**) mà không cần khởi tạo cơ sở dữ liệu.

---

## 📏 1. Quy chuẩn Đặt tên & Cấu trúc Bài kiểm thử (AAA Pattern)

### 1.1. Quy ước đặt tên phương thức Test
Tuân theo mẫu **`MethodName_StateUnderTest_ExpectedBehavior`** để đọc báo cáo kiểm thử như một tài liệu đặc tả nghiệp vụ:
* *Ví dụ đúng:* `DeductStock_WhenRequestedQuantityExceedsAvailable_ThrowsInsufficientStockException`
* *Ví dụ đúng:* `ReceiveStock_WithNewPurchasePrice_RecalculatesWeightedAverageCostCorrectly`
* *Ví dụ sai:* `TestDeductStock1()`

### 1.2. Cấu trúc 3 phần chuẩn (Arrange - Act - Assert)
Mỗi phương thức kiểm thử bắt buộc phân tách rõ ràng 3 giai đoạn bằng dòng trống và sử dụng thư viện **`FluentAssertions`** để câu khẳng định tự nhiên, dễ đọc lỗi khi thất bại.

---

## 💻 2. Triển khai Mẫu Kiểm thử Nghiệp vụ Cốt lõi (`PosPwa.Domain.UnitTests`)

### 2.1. Kiểm thử tính Giá vốn Bình quân Gia quyền (`ProductWeightedAverageCostTests.cs`)
```csharp
using FluentAssertions;
using PosPwa.Domain.Entities;
using PosPwa.Domain.Exceptions;
using Xunit;

public sealed class ProductWeightedAverageCostTests
{
    private readonly Guid _tenantId = Guid.NewGuid();
    private readonly Guid _managerId = Guid.NewGuid();

    [Fact]
    public void ReceiveStock_WhenAddingBatchWithDifferentCost_RecalculatesWeightedAverageCost()
    {
        // Arrange: Khởi tạo 10 gói cà phê với giá vốn ban đầu 200,000đ
        var product = Product.Create(
            tenantId: _tenantId,
            categoryId: Guid.NewGuid(),
            code: "CF-HAT-1KG",
            name: "Cà phê hạt rang xay 1kg",
            price: 320_000m,
            initialCost: 200_000m,
            initialStock: 10);

        // Act: Nhập thêm 14 gói với giá nhập mới 250,000đ
        var transaction = product.ReceiveStock(
            incomingQuantity: 14,
            incomingUnitCost: 250_000m,
            managerId: _managerId);

        // Assert: Tồn mới = 24; WAC mới = ((10 * 200,000) + (14 * 250,000)) / 24 = 229,166.67đ
        product.StockQuantity.Should().Be(24);
        product.AverageCost.Should().Be(229_166.67m);
        transaction.QuantityDelta.Should().Be(14);
        transaction.BalanceAfter.Should().Be(24);
    }

    [Fact]
    public void DeductStock_WhenQuantityExceedsAvailableStock_ThrowsInsufficientStockException()
    {
        // Arrange: Tồn kho vật lý là 5, không đủ để bán 6
        var product = Product.Create(_tenantId, Guid.NewGuid(), "TR-VAI", "Trà vải", 35_000m, 12_000m, 5);

        // Act
        var act = () => product.DeductStock(quantity: 6, orderId: Guid.NewGuid(), cashierId: Guid.NewGuid());

        // Assert
        act.Should().Throw<InsufficientStockException>()
            .WithMessage("*Trà vải*");
        product.StockQuantity.Should().Be(5); // Tồn kho giữ nguyên không bị biến đổi
    }
}
```

### 2.2. Kiểm thử Máy Trạng thái Đơn hàng (`OrderStateMachineTests.cs`)
```csharp
using FluentAssertions;
using PosPwa.Domain.Entities;
using PosPwa.Domain.Enums;
using PosPwa.Domain.Exceptions;
using Xunit;

public sealed class OrderStateMachineTests
{
    [Fact]
    public void Refund_WhenOrderIsDraft_ThrowsDomainException()
    {
        // Arrange: Đơn hàng mới tạo ở trạng thái Draft (chưa thanh toán)
        var order = Order.Create(Guid.NewGuid(), Guid.NewGuid(), "ORD202611180001");

        // Act
        var act = () => order.Refund(managerId: Guid.NewGuid(), reason: "Khách đổi ý trả hàng");

        // Assert
        act.Should().Throw<DomainException>()
            .WithMessage("*Completed*");
    }

    [Fact]
    public void CompletePayment_WhenPaidAmountCoversTotal_TransitionsToCompletedAndRecordsSnapshot()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var product = Product.Create(tenantId, Guid.NewGuid(), "CF01", "Cà phê sữa", 30_000m, 10_000m, 50);
        var order = Order.Create(tenantId, Guid.NewGuid(), "ORD202611180002");
        order.AddItem(product, quantity: 2);
        order.ApplyDiscount(5_000m); // Tổng thanh toán = 60,000 - 5,000 = 55,000đ

        // Act
        order.CompletePayment(PaymentMethod.Cash, amountPaid: 100_000m);

        // Assert
        order.Status.Should().Be(OrderStatus.Completed);
        order.TotalAmount.Should().Be(55_000m);
        order.CompletedAt.Should().NotBeNull();
        order.Items.Should().ContainSingle(i =>
            i.UnitPriceSnapshot == 30_000m && i.UnitCostSnapshot == 10_000m);
    }
}
```

---

## 🚫 3. Quy tắc Cấm trong Unit Testing

1. **Cấm phụ thuộc đồng hồ hệ thống cứng (`DateTime.Now`):** Các lớp dịch vụ sử dụng giao diện trừu tượng `TimeProvider` của **.NET 8** (`FakeTimeProvider` trong test) để dễ dàng kiểm thử các kịch bản hết hạn phiếu giữ chỗ tồn kho (`StockReservation TTL`) hoặc hết hạn `RefreshToken` mà không cần dùng `Thread.Sleep()`.
2. **Không Mock thực thể Domain:** Luôn khởi tạo thực thể Domain thật (`Product.Create`, `Order.Create`), chỉ dùng `NSubstitute` để giả lập các cổng giao tiếp hạ tầng bên ngoài (`IPosRealtimeNotifier`, `IWebhookSignatureValidator`).

---
