# 🔁 Retry Policies, Resilience & Failure Handling - POS PWA Project

Tài liệu này quy định chiến lược **Chịu lỗi và Phục hồi Tự động (Resilience, Retry & Failure Handling)** cho toàn bộ các tác vụ nền **Hangfire**, kết nối cơ sở dữ liệu **PostgreSQL 16** và các cuộc gọi mạng từ **React PWA** trong hệ thống **POS PWA (Point of Sale Progressive Web App)**. Trong vận hành thực tế, các lỗi tạm thời (**Transient Faults**) như nghẽn mạng ngắn hạn, xung đột khóa đồng thời (`40001 serialization_failure` / `DbUpdateConcurrencyException`) hoặc dịch vụ đối ngoại chậm phản hồi là không thể tránh khỏi. Hệ thống được thiết kế để tự phục hồi âm thầm mà không làm mất dữ liệu giao dịch.

---

## 📊 1. Phân loại Lỗi & Chiến lược Xử lý (Transient vs. Permanent Faults)

| Phân loại lỗi | Ví dụ cụ thể trong POS PWA | Chiến lược xử lý | Có thử lại (Retry) không? |
| :--- | :--- | :--- | :---: |
| **1. Lỗi tạm thời (Transient Faults)** | • Mất kết nối mạng tạm thời (`TimeoutException`, `HttpRequestException`)<br>• Xung đột cập nhật đồng thời (`DbUpdateConcurrencyException`)<br>• PostgreSQL deadlock / connection pool bận | **Thử lại tự động kèm Exponential Backoff + Jitter** (giãn cách thời gian tăng dần kèm độ trễ ngẫu nhiên). | ✅ **Có** (Tối đa 3–5 lần) |
| **2. Lỗi nghiệp vụ / Dữ liệu (Permanent / Domain Faults)** | • Sản phẩm đã hết tồn kho (`InsufficientStockException`)<br>• Chữ ký Webhook giả mạo (`Unauthorized`)<br>• Vi phạm quy tắc chuyển trạng thái đơn hàng | **Thất bại nhanh (Fail-Fast)**, không thử lại vô ích; ghi log cảnh báo và trả thông báo rõ ràng cho người dùng. | ❌ **Không** |

---

## ⚙️ 2. Cấu hình Retry cho Hangfire Background Jobs

Hệ thống cấu hình chính sách thử lại với khoảng thời gian giãn cách tăng dần (**Exponential Backoff**) trên các tác vụ nền Hangfire để tránh gây quá tải cho máy chủ khi có sự cố mạng:

```csharp
// Cấu hình mặc định toàn cục trong Program.cs (Tối đa 5 lần thử lại)
GlobalJobFilters.Filters.Add(new AutomaticRetryAttribute
{
    Attempts = 5,
    DelaysInSeconds = new[] { 5, 15, 45, 120, 300 }, // 5s -> 15s -> 45s -> 2 phút -> 5 phút
    OnAttemptsExceeded = AttemptsExceededAction.Fail // Chuyển vào tab 'Failed' (Dead-Letter) để Quản trị viên kiểm tra
});
```

### Quy trình xử lý Tác vụ Chết (Dead-Letter / Failed Jobs Monitoring):
* Khi một tác vụ nền (ví dụ: `ProcessBankWebhookJob`) thất bại sau toàn bộ **5 lần thử lại**, Hangfire chuyển tác vụ đó sang trạng thái **`Failed`** (đóng vai trò như **Dead-Letter Queue**), giữ nguyên toàn bộ tham số đầu vào (`Payload`) và StackTrace ngoại lệ.
* Quản trị viên có thể mở **Hangfire Dashboard (`/hangfire`)**, kiểm tra nguyên nhân lỗi và bấm nút **Requeue** để chạy lại tác vụ đó bất cứ lúc nào mà không bao giờ bị mất giao dịch của khách hàng.

---

## 🛡️ 3. Cơ chế Phục hồi Kết nối Cơ sở Dữ liệu (`Npgsql EnableRetryOnFailure`)

Tại tầng `PosPwa.Infrastructure`, cấu hình **EF Core PostgreSQL Execution Strategy** để tự động thử lại các truy vấn gặp lỗi mạng thoáng qua giữa container Web API và PostgreSQL:

```csharp
services.AddDbContext<AppDbContext>((serviceProvider, options) =>
{
    options.UseNpgsql(connectionString, npgsqlOptions =>
    {
        npgsqlOptions.EnableRetryOnFailure(
            maxRetryCount: 3,
            maxRetryDelay: TimeSpan.FromSeconds(5),
            errorCodesToAdd: null);
        npgsqlOptions.CommandTimeout(15);
    });
});
```

> **Lưu ý quan trọng khi kết hợp Transaction tường minh:** Khi sử dụng `BeginTransactionAsync()` thủ công (như trong `CreateOrderCommandHandler` dùng khóa `FOR UPDATE`), hệ thống bọc khối giao dịch bên trong `dbContext.Database.CreateExecutionStrategy().ExecuteAsync(...)` để EF Core có thể thực thi lại toàn bộ Transaction từ đầu một cách an toàn nếu gặp lỗi kết nối tạm thời.

---

## 📱 4. Cơ chế Exponential Backoff trên Hàng đợi Offline React PWA

Khi ứng dụng **React PWA** vừa có kết nối mạng trở lại và bắt đầu đồng bộ các đơn hàng lưu trong `IndexedDB`:
* Nếu máy chủ đang bận hoặc mạng 4G tại cửa hàng còn yếu khiến yêu cầu đồng bộ bị lỗi `502/503/504` hoặc `Network Error`:
  * Bộ đồng bộ không gửi dồn dập liên tục mà giãn cách thời gian thử lại theo công thức:
    $$\text{Delay} = \min\left(60\text{s},\ 2^{\text{retryCount}} \times 1000\text{ms} + \text{Random}(0..500\text{ms})\right)$$
  * Việc cộng thêm **`Random(0..500ms)` (Jitter)** giúp ngăn chặn hiện tượng **Thundering Herd** khi hàng chục máy tính bảng tại nhiều chi nhánh cùng lúc có mạng trở lại và đồng loạt bắn request về máy chủ.

---
