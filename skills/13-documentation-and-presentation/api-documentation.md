# 🔌 REST API & SignalR Contract Documentation Standards - POS PWA Project

Tài liệu này quy định tiêu chuẩn tài liệu hóa giao diện lập trình ứng dụng (**API Documentation**) cho hệ thống **POS PWA (Point of Sale Progressive Web App)**. Toàn bộ các endpoint RESTful của **ASP.NET Core 8 Web API** được tự động sinh đặc tả chuẩn **OpenAPI 3.1** thông qua **`Swashbuckle.AspNetCore`** và hiển thị qua giao diện tương tác hiện đại **Scalar UI / Swagger UI**, giúp lập trình viên Frontend và đội kiểm thử tra cứu, chạy thử request trực tiếp mà không cần viết tài liệu thủ công dễ bị lỗi thời.

---

## 🛠️ 1. Quy chuẩn Chú thích Endpoint trong ASP.NET Core 8

Mọi Controller / Minimal API Endpoint bắt buộc khai báo đầy đủ metadata đầu vào, đầu ra và mã trạng thái HTTP bằng XML Comments kết hợp `[ProducesResponseType]`:

```csharp
/// <summary>
/// Tạo và hoàn tất thanh toán một đơn hàng mới tại quầy thu ngân POS.
/// </summary>
/// <remarks>
/// Hỗ trợ cơ chế chống trùng lặp giao dịch thông qua HTTP Header <c>X-Idempotency-Key</c>.
/// Hệ thống tự động khóa dòng tồn kho (<c>FOR UPDATE</c>), trừ số lượng khả dụng và ghi nhận bút toán vào sổ cái kho.
/// </remarks>
/// <param name="command">Thông tin phương thức thanh toán, chiết khấu và danh sách sản phẩm.</param>
/// <param name="idempotencyKey">Khóa UUID v4 duy nhất do Client sinh cho mỗi lần bấm thanh toán.</param>
/// <param name="ct">CancellationToken.</param>
/// <returns>Thông tin hóa đơn hoàn chỉnh kèm ảnh chụp đơn giá và mã số hóa đơn.</returns>
[HttpPost]
[Authorize(Roles = "Cashier,Manager")]
[ProducesResponseType(typeof(OrderReceiptDto), StatusCodes.Status201Created)]
[ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
[ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
[ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
public async Task<IActionResult> CreateOrder(
    [FromBody] CreateOrderCommand command,
    [FromHeader(Name = "X-Idempotency-Key")] string? idempotencyKey,
    CancellationToken ct)
{
    var enrichedCommand = command with { IdempotencyKey = idempotencyKey ?? string.Empty };
    var result = await _sender.Send(enrichedCommand, ct);
    return CreatedAtAction(nameof(GetOrderById), new { id = result.Id }, result);
}
```

---

## 📋 2. Bảng Tổng hợp Các Nhóm Endpoint Cốt lõi (`API v1`)

| Phân hệ nghiệp vụ | Method & Đường dẫn (`Route`) | Quyền truy cập (`Role`) | Mô tả chức năng chính |
| :--- | :--- | :---: | :--- |
| **Xác thực (`Auth`)** | `POST /api/v1/auth/login` | `AllowAnonymous` | Đăng nhập theo `tenantCode`, trả về `AccessToken` (JSON) & `RefreshToken` (`HttpOnly Cookie`). |
| **Xác thực (`Auth`)** | `POST /api/v1/auth/refresh` | `AllowAnonymous` | Xoay vòng `RefreshToken` và cấp mới `AccessToken` 15 phút. |
| **Sản phẩm (`Products`)** | `GET /api/v1/products` | `Cashier`, `Manager` | Lấy danh sách sản phẩm đang kinh doanh kèm `availableQuantity` thực tế. |
| **Sản phẩm (`Products`)** | `POST /api/v1/products` | `Manager` | Thêm sản phẩm mới vào danh mục cửa hàng. |
| **Kho hàng (`Inventory`)** | `POST /api/v1/inventory/receive` | `Manager` | Nhập kho lô hàng mới, tính lại **Giá vốn WAC** và ghi bút toán `PurchaseReceipt`. |
| **Kho hàng (`Inventory`)** | `GET /api/v1/inventory/{productId}/ledger` | `Manager` | Truy xuất **Thẻ kho (Stock Card)** chi tiết mọi biến động nhập/xuất của sản phẩm. |
| **Đơn hàng (`Orders`)** | `POST /api/v1/orders` | `Cashier`, `Manager` | Chốt đơn và thanh toán trực tiếp tại quầy (`Online Checkout`). |
| **Đơn hàng (`Orders`)** | `POST /api/v1/orders/sync` | `Cashier`, `Manager` | Đồng bộ lô đơn hàng phát sinh khi quầy thu ngân mất mạng (`Offline Sync`). |
| **Đơn hàng (`Orders`)** | `POST /api/v1/orders/{id}/refund` | `Manager` | Duyệt hoàn tiền hóa đơn `Completed` và hoàn trả tồn kho. |
| **Webhook (`Webhooks`)** | `POST /api/v1/webhooks/bank-transfer` | `HMAC Signature` | Tiếp nhận biến động số dư chuyển khoản VietQR từ cổng thanh toán. |
| **Báo cáo & AI (`Reports`)** | `GET /api/v1/reports/reorder-suggestions` | `Manager` | Lấy danh sách gợi ý nhập hàng dựa trên mô hình dự báo nhu cầu AI & điểm đặt hàng lại `ROP`. |

---

## 🔒 3. Kiểm soát Truy cập Tài liệu API trên Môi trường Production

* Trên môi trường **`Development`** và **`Staging`**, giao diện OpenAPI UI (`/swagger` hoặc `/scalar/v1`) được mở kèm nút **Authorize** hỗ trợ dán nhanh `JWT Bearer Token` để kiểm thử.
* Trên môi trường **`Production`**, giao diện tài liệu tương tác công khai được tắt tự động (`if (app.Environment.IsDevelopment())`) nhằm tránh lộ cấu trúc toàn bộ các endpoint nội bộ cho người dùng bên ngoài.

---
