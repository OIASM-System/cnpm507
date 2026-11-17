# 🌐 ASP.NET Core Web API & SignalR Design - POS PWA Project

Tài liệu này quy định các tiêu chuẩn thiết kế giao diện lập trình ứng dụng (**RESTful API**), cơ chế bảo mật **JWT Authentication**, phân quyền theo vai trò (**RBAC**) và giao tiếp thời gian thực qua **SignalR Hub** trong hệ thống **POS PWA (Point of Sale Progressive Web App)**.

---

## 🔗 1. Quy chuẩn thiết kế RESTful API & Versioning

### 1.1. Quy tắc đặt tên Endpoint & Versioning
* Mọi endpoint đều bắt buộc gắn phiên bản API qua đường dẫn URL: `/api/v1/{resource}`.
* Sử dụng **danh từ số nhiều** viết thường (`kebab-case`) cho tên tài nguyên; hành động được biểu thị thông qua phương thức HTTP (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`).

| Nhóm chức năng | Method | Endpoint | Mô tả nghiệp vụ | Quyền truy cập |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/v1/auth/login` | Đăng nhập thu ngân/quản lý, cấp phát Access & Refresh Token | Public |
| **Products** | `GET` | `/api/v1/products` | Lấy danh sách sản phẩm hỗ trợ lọc (`categoryId`, `search`, `page`) | Cashier, Manager |
| **Products** | `POST` | `/api/v1/products` | Tạo mới sản phẩm vào danh mục cửa hàng | Manager |
| **Orders** | `POST` | `/api/v1/orders` | Tạo đơn hàng mới, khóa tồn kho (Anti-oversell) & thanh toán | Cashier, Manager |
| **Orders** | `GET` | `/api/v1/orders/{id}` | Truy xuất chi tiết hóa đơn phục vụ màn hình **Receipt Preview** & In lại | Cashier, Manager |
| **Orders** | `POST` | `/api/v1/orders/{id}/refund` | Duyệt hoàn tiền và cộng hoàn tồn kho cho đơn đã thanh toán | Manager |
| **Sync** | `POST` | `/api/v1/orders/sync-offline` | Đồng bộ hàng loạt đơn hàng được tạo ngoại tuyến từ `IndexedDB` | Cashier, Manager |

### 1.2. Cấu trúc Controller mỏng (Thin Controllers)
Tầng `Presentation` (`Controllers`) tuyệt đối **không chứa logic nghiệp vụ hay truy vấn Database**. Controller chỉ đóng vai trò tiếp nhận HTTP Request, ủy quyền cho `MediatR` (`ISender`) xử lý và ánh xạ kết quả sang HTTP Status Code chuẩn.

```csharp
[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public sealed class OrdersController : ControllerBase
{
    private readonly ISender _sender;

    public OrdersController(ISender sender)
    {
        _sender = sender;
    }

    /// <summary>
    /// Tạo đơn hàng mới và xử lý thanh toán tại quầy POS
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(OrderReceiptDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreateOrder(
        [FromBody] CreateOrderCommand command,
        CancellationToken cancellationToken)
    {
        var result = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetOrderById), new { id = result.OrderId }, result);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(OrderReceiptDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetOrderById(Guid id, CancellationToken cancellationToken)
    {
        var query = new GetOrderByIdQuery(id);
        var receipt = await _sender.Send(query, cancellationToken);
        return Ok(receipt);
    }
}
```

---

## 🔐 2. Xác thực & Phân quyền (JWT & RBAC)

1. **JWT Bearer Authentication:**
   * Sử dụng thuật toán ký bất đối xứng hoặc khóa bí mật mạnh (`HMAC-SHA256`).
   * **Access Token** có thời hạn ngắn (`15 – 30 phút`) chứa các Claims cốt lõi: `sub` (UserId), `name` (FullName), `role` (`Cashier` hoặc `Manager`).
   * **Refresh Token** lưu trữ an toàn dưới dạng `HttpOnly Secure Cookie` để gia hạn phiên đăng nhập tự động trong suốt ca làm việc của thu ngân mà không làm gián đoạn thao tác bán hàng.
2. **Phân quyền theo vai trò (Role-Based Access Control):**
   * `[Authorize(Roles = "Cashier,Manager")]`: Cho phép thao tác bán hàng, tìm kiếm món, tạo đơn, xem trước hóa đơn và in chứng từ.
   * `[Authorize(Roles = "Manager")]`: Giới hạn các thao tác nhạy cảm như chỉnh sửa giá bán, nhập điều chỉnh kho, duyệt hoàn tiền (`Refund`) và xem báo cáo doanh thu tổng hợp.

---

## ⚡ 3. Đồng bộ thời gian thực với ASP.NET Core SignalR

Để đảm bảo dữ liệu tồn kho luôn nhất quán giữa nhiều quầy thu ngân hoạt động song song, hệ thống triển khai `PosSyncHub` tại đường dẫn `/hubs/pos-sync`.

### 3.1. Các sự kiện phát sóng (Server-to-Client Events)
* **`StockUpdated`:** Phát ngay sau khi một đơn hàng chốt thành công (`Commit Transaction`). Payload chứa `ProductId` và `NewStockQuantity` để giao diện React PWA của các quầy khác tự động cập nhật số lượng tồn hoặc vô hiệu hóa nút `GET` nếu sản phẩm vừa hết hàng.
* **`NewOrderCreated`:** Thông báo cho màn hình quản lý hoặc khu vực pha chế/kho hàng biết có đơn hàng mới vừa được thanh toán.

```csharp
[Authorize]
public sealed class PosSyncHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        // Đưa thiết bị thu ngân vào nhóm theo chi nhánh/cửa hàng
        var storeId = Context.User?.FindFirst("store_id")?.Value ?? "default-store";
        await Groups.AddToGroupAsync(Context.ConnectionId, storeId);
        await base.OnConnectedAsync();
    }
}
```

---

## 🛡️ 4. Chính sách CORS & Tài liệu hóa API (Swagger / OpenAPI)

* **CORS (Cross-Origin Resource Sharing):** Cấu hình chính sách `AllowPosFrontend` chỉ cho phép các domain hợp lệ của ứng dụng React PWA (ví dụ: `https://pos.uth-project.vn` và `http://localhost:5173` ở môi trường phát triển) kèm cờ `.AllowCredentials()` để hỗ trợ kết nối WebSocket của SignalR và Cookie Refresh Token.
* **OpenAPI / Swagger UI:** Tích hợp `Swashbuckle.AspNetCore` ở môi trường `Development` và `Staging`, cấu hình sẵn nút **Authorize (Bearer Token)** để đội ngũ Frontend dễ dàng kiểm thử API trực tiếp.

---
