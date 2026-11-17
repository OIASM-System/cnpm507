# 💻 C# Fundamentals & Coding Standards - POS PWA Project

Tài liệu này quy định các tiêu chuẩn lập trình **C# hiện đại (.NET 8 / C# 12)** áp dụng xuyên suốt mã nguồn Backend của hệ thống **POS PWA (Point of Sale Progressive Web App)**. Việc tuân thủ các quy chuẩn này giúp mã nguồn nhất quán, tối ưu hiệu năng xử lý bất đồng bộ, giảm thiểu lỗi Null Reference và dễ dàng bảo trì cho toàn bộ thành viên trong nhóm.

---

## 📏 1. Quy tắc đặt tên (Naming Conventions)

| Đối tượng | Quy chuẩn (Style) | Ví dụ thực tế trong POS PWA |
| :--- | :--- | :--- |
| **Class / Record / Struct** | `PascalCase` | `Order`, `ProductDto`, `CreateOrderCommand` |
| **Interface** | `IPascalCase` (Bắt đầu bằng `I`) | `IOrderRepository`, `IInventoryService` |
| **Public Method / Property** | `PascalCase` | `CalculateTotal()`, `StockQuantity` |
| **Async Method** | `PascalCase` + hậu tố `Async` | `CreateOrderAsync()`, `GetProductsByCategoryAsync()` |
| **Local Variable / Parameter** | `camelCase` | `orderItems`, `paymentMethod`, `discountAmount` |
| **Private Field** | `_camelCase` (Bắt đầu bằng `_`) | `_orderRepository`, `_logger`, `_dbContext` |
| **Constant (`const`)** | `PascalCase` hoặc `UPPER_SNAKE_CASE` | `MaxDiscountPercentage`, `DEFAULT_CURRENCY` |

---

## 🚀 2. Các tính năng C# hiện đại bắt buộc áp dụng

### 2.1. Lập trình bất đồng bộ (`async` / `await`)
Mọi tác vụ I/O (truy vấn cơ sở dữ liệu PostgreSQL, gọi API cổng thanh toán, phát sự kiện SignalR) **bắt buộc** phải viết bất đồng bộ và truyền `CancellationToken` để giải phóng luồng xử lý khi client hủy request.

```csharp
// ✅ ĐÚNG: Sử dụng async/await và CancellationToken
public async Task<ProductDto?> GetProductByIdAsync(Guid id, CancellationToken cancellationToken)
{
    var product = await _productRepository.GetByIdAsync(id, cancellationToken);
    if (product is null) return null;

    return new ProductDto(product.Id, product.Code, product.Name, product.Price, product.StockQuantity);
}

// ❌ SAI: Sử dụng .Result hoặc .Wait() gây nguy cơ Deadlock
public ProductDto GetProductSync(Guid id)
{
    return _productRepository.GetByIdAsync(id, CancellationToken.None).Result; // TUYỆT ĐỐI TRÁNH
}
```

### 2.2. Sử dụng `record` cho DTOs, Commands và Queries
Sử dụng kiểu dữ liệu `record` (bất biến - Immutable) để định nghĩa các đối tượng truyền tải dữ liệu (DTOs) và thông điệp CQRS giúp mã nguồn ngắn gọn, an toàn luồng và hỗ trợ so sánh theo giá trị.

```csharp
// Định nghĩa DTO trả về danh sách sản phẩm cho màn hình POS
public sealed record ProductResponseDto(
    Guid Id,
    string Code,
    string Name,
    decimal Price,
    int StockQuantity,
    string CategoryName
);

// Định nghĩa Command tạo đơn hàng từ giỏ hàng
public sealed record CreateOrderCommand(
    Guid CashierId,
    string PaymentMethod,
    decimal Discount,
    IReadOnlyList<OrderItemRequest> Items
);
```

### 2.3. Kiểm soát Null an toàn (Nullable Reference Types)
Dự án bật chế độ `<Nullable>enable</Nullable>` trong tệp `.csproj`. Lập trình viên phải khai báo tường minh kiểu có thể null (`?`) và ưu tiên sử dụng **Pattern Matching** (`is null`, `is not null`) thay vì toán tử `== null`.

```csharp
// ✅ ĐÚNG: Kiểm tra null rõ ràng bằng Pattern Matching
if (order is null)
{
    throw new NotFoundException($"Không tìm thấy đơn hàng với mã {orderId}");
}
```

### 2.4. Tối ưu truy vấn dữ liệu với LINQ & `AsNoTracking()`
Đối với các truy vấn chỉ đọc (ví dụ: hiển thị danh mục sản phẩm, xem lịch sử hóa đơn), luôn sử dụng `.AsNoTracking()` trong Entity Framework Core để giảm tải bộ nhớ theo dõi (Change Tracker) và tăng tốc độ phản hồi API.

```csharp
public async Task<List<ProductResponseDto>> SearchProductsAsync(string? keyword, CancellationToken ct)
{
    var query = _dbContext.Products
        .AsNoTracking() // Tối ưu hiệu năng cho truy vấn chỉ đọc
        .Where(p => p.IsActive);

    if (!string.IsNullOrWhiteSpace(keyword))
    {
        query = query.Where(p => p.Name.Contains(keyword) || p.Code.Contains(keyword));
    }

    return await query
        .Select(p => new ProductResponseDto(
            p.Id, p.Code, p.Name, p.Price, p.StockQuantity, p.Category.Name))
        .ToListAsync(ct);
}
```

### 2.5. Quản lý tài nguyên và kiểu dữ liệu tiền tệ
* **Kiểu dữ liệu tiền tệ & số lượng:** Bắt buộc sử dụng kiểu `decimal` cho mọi biến lưu trữ đơn giá (`UnitPrice`), tạm tính (`SubTotal`), chiết khấu (`Discount`) và tổng thanh toán (`TotalAmount`). Tuyệt đối không dùng `float` hoặc `double` để tránh sai số làm tròn số học dấu phẩy động.
* **Thời gian hệ thống:** Mọi mốc thời gian lưu trữ trong hệ thống (`CreatedAt`, `PaidAt`) phải sử dụng chuẩn giờ quốc tế `DateTime.UtcNow` (hoặc `DateTimeOffset.UtcNow`), việc chuyển đổi sang múi giờ địa phương (`UTC+7`) do tầng Frontend đảm nhận.

---

## 🚫 3. Danh sách các lỗi cần tránh (Anti-Patterns)

1. **Không nuốt ngoại lệ (Empty Catch Block):** Không bao giờ viết khối `try { ... } catch { }` trống rỗng mà không ghi log hoặc ném lại ngoại lệ.
2. **Không dùng Magic Numbers / Magic Strings:** Thay thế các chuỗi cứng như `"Completed"`, `"Cash"` bằng `enum` hoặc hằng số định nghĩa sẵn (ví dụ: `OrderStatus.Completed`, `PaymentMethod.Cash`).
3. **Không truy vấn N+1 trong vòng lặp:** Tuyệt đối không gọi câu lệnh truy vấn Database bên trong vòng lặp `foreach` khi duyệt danh sách sản phẩm trong giỏ hàng; hãy tải toàn bộ danh sách sản phẩm cần thiết chỉ bằng một truy vấn `Where(p => productIds.Contains(p.Id))`.

---
