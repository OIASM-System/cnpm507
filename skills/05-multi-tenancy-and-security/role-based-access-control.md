# 🛂 Role-Based Access Control (RBAC) - POS PWA Project

Tài liệu này quy định cơ chế phân quyền truy cập theo vai trò (**Role-Based Access Control - RBAC**) và mô hình phân quyền dựa trên chính sách (**Policy-Based Authorization**) trong **ASP.NET Core 8** cho hệ thống **POS PWA (Point of Sale Progressive Web App)**. Hệ thống tách bạch rõ ràng quyền hạn giữa nhân viên vận hành quầy thu ngân hàng ngày (`Cashier`) và người quản lý cửa hàng (`Manager`), ngăn chặn các rủi ro thất thoát tài chính như tự ý hoàn tiền hóa đơn, sửa giá bán sản phẩm hoặc xóa lịch sử giao dịch.

---

## 👥 1. Ma trận Phân quyền Nghiệp vụ (Permission Matrix)

Hệ thống định nghĩa hai vai trò chuẩn trong một cửa hàng (`Tenant`) thông qua Enum `UserRole` (`Cashier`, `Manager`):

| Nhóm chức năng / Tài nguyên | Hành động (Endpoint / Command) | `Cashier` (Thu ngân) | `Manager` (Quản lý) | Ghi chú bảo mật |
| :--- | :--- | :---: | :---: | :--- |
| **Bán hàng tại quầy (POS)** | Xem danh mục & Quét mã sản phẩm | ✅ | ✅ | Đọc dữ liệu cached/online |
| | Tạo đơn hàng & Thanh toán (`CreateOrder`) | ✅ | ✅ | Ghi nhận kèm `CashierId` thực hiện |
| | Đồng bộ đơn hàng ngoại tuyến (`SyncOfflineOrders`) | ✅ | ✅ | Đối soát khớp `TenantId` & `UserId` |
| | Xem danh sách đơn hàng trong ca của mình | ✅ | ✅ | Thu ngân chỉ xem đơn trong ca |
| **Kiểm soát rủi ro & Hoàn tiền** | Hủy đơn nháp chưa thanh toán (`CancelDraftOrder`) | ✅ | ✅ | Chỉ áp dụng cho trạng thái `Draft` |
| | Hoàn tiền hóa đơn đã thanh toán (`RefundOrder`) | ❌ | ✅ | **Bắt buộc** quyền `Manager` để chống gian lận |
| | Áp dụng chiết khấu đặc biệt vượt mức quy định | ❌ | ✅ | Yêu cầu xác thực quyền Quản lý |
| **Quản lý Danh mục & Kho** | Thêm / Sửa / Ngừng bán sản phẩm | ❌ | ✅ | Tránh thu ngân tự ý hạ giá bán |
| | Nhập kho & Điều chỉnh tồn kho thủ công | ❌ | ✅ | Ghi log kiểm toán (`Audit Log`) |
| **Báo cáo & Nhân sự** | Xem báo cáo doanh thu tổng hợp & lợi nhuận | ❌ | ✅ | Thu ngân chỉ xem tổng kết ca cá nhân |
| | Tạo / Khóa tài khoản nhân viên (`Users`) | ❌ | ✅ | Thu hồi Refresh Token ngay khi khóa |

---

## 💻 2. Triển khai Policy-Based Authorization trong .NET 8

Thay vì gắn cứng chuỗi vai trò `[Authorize(Roles = "Manager")]` rải rác khắp các Controller, dự án sử dụng **Policy-Based Authorization** để tập trung quản lý quy tắc phân quyền tại một nơi duy nhất, dễ dàng mở rộng thêm quyền chi tiết (Claims/Permissions) trong tương lai.

### 2.1. Định nghĩa hằng số Policy (`PosPolicies.cs`)
Đặt tại tầng `PosPwa.Application/Common/Security/PosPolicies.cs`:

```csharp
public static class PosPolicies
{
    // Quyền bán hàng cơ bản (Cả Cashier và Manager đều có)
    public const string CanOperatePos = nameof(CanOperatePos);

    // Quyền quản trị nhạy cảm (Chỉ Manager mới có)
    public const string RequireManager = nameof(RequireManager);
}
```

### 2.2. Đăng ký Policies trong `Program.cs`
```csharp
builder.Services.AddAuthorization(options =>
{
    // Mặc định mọi endpoint yêu cầu người dùng đã đăng nhập (trừ endpoint gắn [AllowAnonymous])
    options.FallbackPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();

    options.AddPolicy(PosPolicies.CanOperatePos, policy =>
        policy.RequireRole(nameof(UserRole.Cashier), nameof(UserRole.Manager)));

    options.AddPolicy(PosPolicies.RequireManager, policy =>
        policy.RequireRole(nameof(UserRole.Manager)));
});
```

> **Lưu ý bảo mật quan trọng (`FallbackPolicy`):** Việc thiết lập `FallbackPolicy = RequireAuthenticatedUser()` đảm bảo nguyên tắc **Deny-by-Default (Mặc định từ chối)**. Nếu lập trình viên tạo một Controller mới và vô tình quên gắn `[Authorize]`, hệ thống vẫn tự động chặn truy cập ẩn danh với mã lỗi `401 Unauthorized`. Các API công khai như `/api/v1/auth/login` bắt buộc phải đánh dấu tường minh bằng `[AllowAnonymous]`.

---

## 🔌 3. Áp dụng phân quyền trên Endpoints & MediatR Pipeline

### 3.1. Áp dụng trên Controller / Minimal API
```csharp
[ApiController]
[Route("api/v1/orders")]
[Authorize(Policy = PosPolicies.CanOperatePos)]
public sealed class OrdersController : ControllerBase
{
    private readonly ISender _sender;

    public OrdersController(ISender sender) => _sender = sender;

    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderCommand command, CancellationToken ct)
    {
        var result = await _sender.Send(command, ct);
        return CreatedAtAction(nameof(GetOrderById), new { id = result.Id }, result);
    }

    [HttpPost("{id:guid}/refund")]
    [Authorize(Policy = PosPolicies.RequireManager)] // Ghi đè chính sách: Chỉ Manager được hoàn tiền
    public async Task<IActionResult> RefundOrder(Guid id, [FromBody] RefundOrderRequest request, CancellationToken ct)
    {
        await _sender.Send(new RefundOrderCommand(id, request.Reason), ct);
        return NoContent();
    }
}
```

### 3.2. Kiểm tra quyền sở hữu tài nguyên (Resource-Based Authorization)
Ngoài vai trò (`Role`), đối với một số thao tác như xem chi tiết hóa đơn (`GetOrderByIdQuery`), tầng `Application` kiểm tra thêm ngữ cảnh người dùng hiện tại (`ICurrentUserService`):
* Nếu người dùng có vai trò **`Manager`**: Cho phép xem toàn bộ hóa đơn thuộc cửa hàng (`TenantId`).
* Nếu người dùng có vai trò **`Cashier`**: Chỉ cho phép xem hóa đơn do chính thu ngân đó lập (`order.CashierId == _currentUser.UserId`) hoặc phát sinh trong ca hiện tại.

---

## 📱 4. Đồng bộ phân quyền trên giao diện React PWA (Frontend)

Phân quyền trên giao diện Frontend chỉ mang tính chất **cải thiện trải nghiệm người dùng (UX)**, chốt chặn bảo mật thực sự luôn nằm ở **Backend .NET 8**:
* Khi đăng nhập thành công, React PWA giải mã `role` từ `Access Token` và lưu vào `AuthStore`.
* Các thành phần giao diện dành riêng cho quản lý (tab *Báo cáo doanh thu*, nút *Hoàn tiền hóa đơn*, nút *Thêm/Sửa sản phẩm*) được bọc trong component `<RoleGuard allowedRoles={['Manager']}>` để ẩn khỏi màn hình thu ngân, giúp giao diện quầy bán hàng tinh gọn và tránh thao tác nhầm.

---
