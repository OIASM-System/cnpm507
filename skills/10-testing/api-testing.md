# 🔌 REST API Contract, Security & Multi-Tenant Isolation Testing - POS PWA Project

Tài liệu này quy định các kịch bản **Kiểm thử Hợp đồng API & Bảo mật Phân tầng (API Contract, RBAC & Multi-Tenant Isolation Testing)** sử dụng **`WebApplicationFactory<Program>`** và **`HttpClient`** thực tế trong hệ thống **POS PWA (Point of Sale Progressive Web App)**. Các bài kiểm thử này đi xuyên qua toàn bộ chuỗi Middleware của ASP.NET Core 8 (CORS, Rate Limiting, JWT Authentication, Role Authorization, FluentValidation, Global Query Filters và Exception Handler) để đảm bảo mọi endpoint tuân thủ đúng chuẩn HTTP Status Code và tuyệt đối không xảy ra rò rỉ dữ liệu giữa các cửa hàng (**Cross-Tenant Data Leak**).

---

## 🛡️ 1. Ma trận Kiểm thử Bảo mật & Phân quyền (Security & RBAC Test Matrix)

| Nhóm kiểm thử | Kịch bản đầu vào | Kết quả HTTP kỳ vọng | Tiêu chí xác minh chi tiết |
| :--- | :--- | :---: | :--- |
| **Chưa xác thực (Unauthenticated)** | Gọi `GET /api/v1/products` hoặc `POST /api/v1/orders` không đính kèm `Authorization: Bearer ...` | **`401 Unauthorized`** | Header `WWW-Authenticate` xuất hiện; không lộ thông tin nội bộ. |
| **Sai phân quyền (RBAC Violation)** | Tài khoản vai trò **`Cashier`** (Thu ngân) gọi `POST /api/v1/products` (tạo sản phẩm mới) hoặc `POST /api/v1/orders/{id}/refund` (hoàn tiền). | **`403 Forbidden`** | Thu ngân chỉ được phép bán hàng, không được sửa giá/nhập kho/hoàn tiền. |
| **Cô lập Đa cửa hàng (Tenant Isolation)** | Thu ngân của **Cửa hàng A** dùng `productId` hoặc `orderId` hợp lệ thuộc **Cửa hàng B** để đặt hàng hoặc xem chi tiết hóa đơn. | **`404 Not Found`** | EF Core Global Query Filter tự động lọc theo `tenant_id`, trả về `404` (không trả `403` để tránh lộ sự tồn tại của ID bên Tenant khác). |
| **Xoay vòng Refresh Token (Token Rotation)** | Dùng lại một `RefreshToken` đã từng được sử dụng trước đó (`Replay Attack`). | **`401 Unauthorized`** | Hệ thống phát hiện tấn công đánh cắp token, thu hồi toàn bộ chuỗi phiên (`Token Family Revocation`) của người dùng đó. |
| **Xác thực Webhook giả mạo** | Gửi gói tin `POST /api/v1/webhooks/bank-transfer` với chữ ký `X-Webhook-Signature` sai lệch 1 ký tự. | **`401 Unauthorized`** | Chặn đứng trước khi đưa vào hàng đợi Hangfire. |

---

## 💻 2. Triển khai Mẫu Kiểm thử Cô lập Multi-Tenant (`MultiTenantIsolationApiTests.cs`)

```csharp
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using FluentAssertions;
using Xunit;

[Collection("PosIntegrationTests")]
public sealed class MultiTenantIsolationApiTests
{
    private readonly PosApiWebApplicationFactory _factory;

    public MultiTenantIsolationApiTests(PosApiWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task GetOrderById_WhenRequestingOrderFromAnotherTenant_Returns404NotFound()
    {
        // Arrange: Khởi tạo dữ liệu cho Cửa hàng A và Cửa hàng B độc lập
        var client = _factory.CreateClient();
        var storeASeed = await TestDataSeeder.SeedStoreWithOrderAsync(_factory.Services, "store-a");
        var storeBSeed = await TestDataSeeder.SeedStoreWithTokenAsync(_factory.Services, "store-b", role: "Manager");

        // Sử dụng JWT Token của Quản lý Cửa hàng B để truy vấn mã đơn hàng của Cửa hàng A
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", storeBSeed.AccessToken);

        // Act
        var response = await client.GetAsync($"/api/v1/orders/{storeASeed.OrderId}");

        // Assert: Tuyệt đối không nhìn thấy dữ liệu của Cửa hàng A
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task RefundOrder_WhenCalledByCashierRole_Returns403Forbidden()
    {
        // Arrange
        var client = _factory.CreateClient();
        var storeSeed = await TestDataSeeder.SeedStoreWithOrderAsync(_factory.Services, "store-rbac");
        var cashierToken = await TestDataSeeder.GenerateTokenForRoleAsync(
            _factory.Services, storeSeed.TenantId, role: "Cashier");

        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", cashierToken);

        // Act
        var response = await client.PostAsJsonAsync(
            $"/api/v1/orders/{storeSeed.OrderId}/refund",
            new { reason = "Thu ngân tự ý hoàn tiền" });

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }
}
```

---

## 📋 3. Kiểm thử Chuẩn Phản hồi Lỗi RFC 7807 (`ProblemDetails`)

Mọi phản hồi lỗi `400 Bad Request` (lỗi FluentValidation), `404 Not Found`, `409 Conflict` (hết tồn kho / xung đột phiên bản) và `429 Too Many Requests` đều được kiểm thử tự động về cấu trúc JSON đầu ra (`type`, `title`, `status`, `detail`, `traceId`) để đảm bảo tầng Frontend React PWA luôn phân tích cú pháp thông báo lỗi nhất quán.

---
