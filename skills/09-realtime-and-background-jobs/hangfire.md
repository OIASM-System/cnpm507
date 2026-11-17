# 🔄 Hangfire Persistent Background Jobs Architecture - POS PWA Project

Tài liệu này quy định kiến trúc xử lý các tác vụ nền bất đồng bộ (**Fire-and-Forget Jobs**) và tác vụ định kỳ (**Recurring Cron Jobs**) sử dụng thư viện **Hangfire** kết hợp lưu trữ bền vững trên **PostgreSQL 16 (`Hangfire.PostgreSql`)** trong hệ thống **POS PWA (Point of Sale Progressive Web App)**. Việc tách các tác vụ hậu xử lý ra khỏi luồng HTTP Request chính giúp API thanh toán tại quầy phản hồi siêu nhanh ($< 50\text{ms}$), đồng thời đảm bảo các công việc nền không bao giờ bị thất lạc nếu máy chủ khởi động lại.

---

## 🏗️ 1. Lý do lựa chọn Hangfire + PostgreSQL Storage

| Tiêu chí kỹ thuật | `IHostedService` thuần túy (In-Memory) | **Hangfire + PostgreSQL 16 Storage** |
| :--- | :---: | :---: |
| **Độ bền vững khi Restart Server** | ❌ Mất toàn bộ tác vụ đang nằm trong RAM. | ✅ Lưu trạng thái vào schema `hangfire` trên PostgreSQL; tự động tiếp tục chạy ngay khi ứng dụng khởi động lại. |
| **Cơ chế thử lại tự động (Auto-Retry)** | ❌ Phải tự lập trình vòng lặp & xử lý lỗi. | ✅ Tích hợp sẵn cơ chế thử lại kèm **Exponential Backoff** và ghi nhận chi tiết StackTrace lỗi. |
| **Giám sát & Điều khiển trực quan** | ❌ Chỉ xem được qua log text thô. | ✅ Tích hợp **Hangfire Dashboard (`/hangfire`)** bảo mật cho phép Quản trị viên theo dõi tiến độ và kích hoạt chạy lại thủ công. |
| **Hạ tầng triển khai** | Không cần dịch vụ ngoài. | Tận dụng ngay **PostgreSQL 16** sẵn có của dự án, không phát sinh chi phí cài đặt thêm Redis hay RabbitMQ. |

---

## 📋 2. Danh mục Tác vụ Nền trong Hệ thống POS PWA

### 2.1. Các tác vụ định kỳ (`Recurring Jobs - Cron Schedule`)
| Mã tác vụ (`JobId`) | Chu kỳ chạy (`Cron`) | Nghiệp vụ thực thi | Giải pháp Multi-Tenant |
| :--- | :--- | :--- | :--- |
| **`release-expired-reservations`** | Mỗi **1 phút** (`* * * * *`) | Quét bảng `stock_reservations` có `status = 'Active'` và `expires_at <= NOW()`, chuyển sang `Expired` và phát sự kiện SignalR cập nhật lại `AvailableQuantity` cho các quầy. | Chạy xuyên suốt toàn hệ thống (`IgnoreQueryFilters()`), gom nhóm theo `TenantId` để phát SignalR đúng cửa hàng. |
| **`cleanup-expired-refresh-tokens`** | Mỗi ngày lúc **03:00 sáng** (`0 3 * * *`) | Dọn dẹp các bản ghi `refresh_tokens` đã hết hạn hoặc bị thu hồi quá 30 ngày để giữ bảng xác thực luôn gọn nhẹ. | Xóa theo lô (`Batch Delete`) tránh khóa bảng lâu. |
| **`daily-store-summary-snapshot`** | Mỗi ngày lúc **00:05 sáng** (`5 0 * * *`) | Tổng hợp báo cáo doanh thu thuần, giá vốn (WAC) và lợi nhuận gộp ngày hôm trước cho từng cửa hàng hoạt động. | Lặp qua danh sách `Tenants` đang kích hoạt (`IsActive == true`). |

### 2.2. Các tác vụ bất đồng bộ tức thì (`Fire-and-Forget Enqueued Jobs`)
* **`ProcessBankWebhookJob`:** Tiếp nhận gói tin thanh toán VietQR từ hàng đợi Webhook, đối soát đơn hàng, trừ tồn kho và đẩy thông báo SignalR tới quầy thu ngân.
* **`LowStockAlertJob`:** Kiểm tra khi tồn kho sản phẩm giảm xuống dưới ngưỡng cảnh báo tối thiểu (`MinStockThreshold`) để gửi thông báo nhập hàng cho Quản lý cửa hàng.

---

## 💻 3. Cấu hình Hangfire & Bảo mật Dashboard trong .NET 8

### 3.1. Đăng ký dịch vụ trong `Program.cs`
```csharp
using Hangfire;
using Hangfire.PostgreSql;

builder.Services.AddHangfire(config => config
    .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
    .UseSimpleAssemblyNameTypeSerializer()
    .UseRecommendedSerializerSettings()
    .UsePostgreSqlStorage(options =>
        options.UseNpgsqlConnection(builder.Configuration.GetConnectionString("DefaultConnection")),
        new PostgreSqlStorageOptions
        {
            SchemaName = "hangfire", // Tách biệt hoàn toàn khỏi schema nghiệp vụ 'public'
            QueuePollInterval = TimeSpan.FromSeconds(5),
            PrepareSchemaIfNecessary = true
        }));

builder.Services.AddHangfireServer(options =>
{
    options.WorkerCount = Environment.ProcessorCount * 2;
    options.Queues = new[] { "critical", "default" }; // Ưu tiên hàng đợi 'critical' cho Webhook thanh toán
});
```

### 3.2. Khóa truy cập Hangfire Dashboard bằng Bộ lọc Phân quyền (`HangfireAuthorizationFilter.cs`)
Mặc định, Hangfire chỉ cho phép truy cập `/hangfire` từ `localhost`. Để Quản trị viên có thể giám sát an toàn trên môi trường Docker/Production, hệ thống áp dụng bộ lọc kiểm tra xác thực JWT và quyền `Manager`:

```csharp
using Hangfire.Dashboard;

public sealed class HangfireAuthorizationFilter : IDashboardAuthorizationFilter
{
    public bool Authorize(DashboardContext context)
    {
        var httpContext = context.GetHttpContext();
        return httpContext.User.Identity?.IsAuthenticated == true
               && httpContext.User.IsInRole("Manager");
    }
}
```

### 3.3. Truyền ngữ cảnh `TenantId` vào Background Job
Vì Hangfire Worker chạy trên một luồng nền độc lập (không có `HttpContext` chứa JWT của người dùng), mọi Background Job phục vụ một cửa hàng cụ thể **bắt buộc phải nhận `Guid tenantId` làm tham số đầu tiên** và thiết lập lại ngữ cảnh trên `ITenantContext` trước khi gọi bất kỳ truy vấn EF Core nào:

```csharp
public sealed class ProcessBankWebhookJob
{
    private readonly ITenantContext _tenantContext;
    private readonly ISender _sender;

    public ProcessBankWebhookJob(ITenantContext tenantContext, ISender sender)
    {
        _tenantContext = tenantContext;
        _sender = sender;
    }

    [Queue("critical")]
    [AutomaticRetry(Attempts = 5, DelaysInSeconds = new[] { 2, 5, 15, 30, 60 })]
    public async Task ExecuteAsync(Guid tenantId, BankTransferWebhookPayload payload, CancellationToken ct)
    {
        // Khôi phục ngữ cảnh Tenant cho EF Core Global Query Filter
        _tenantContext.SetTenant(tenantId);

        await _sender.Send(new ConfirmQrPaymentCommand(payload), ct);
    }
}
```

---
