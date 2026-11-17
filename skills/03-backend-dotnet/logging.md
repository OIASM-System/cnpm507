# 📝 Structured Logging & Observability (Serilog) - POS PWA Project

Tài liệu này quy định tiêu chuẩn ghi nhận nhật ký hệ thống có cấu trúc (**Structured Logging**) sử dụng thư viện **Serilog** cho Backend **.NET 8** của hệ thống **POS PWA (Point of Sale Progressive Web App)**. Hệ thống logging giúp đội ngũ phát triển và vận hành dễ dàng truy vết giao dịch thanh toán, phát hiện sớm các điểm nghẽn hiệu năng tại quầy thu ngân và điều tra sự cố xung đột tồn kho (`Anti-oversell`).

---

## 🎯 1. Nguyên tắc ghi Log (Logging Standards)

1. **Structured Logging (Log có cấu trúc):** Tuyệt đối **không sử dụng chuỗi nội suy (`$"..."`)** trong câu lệnh log; bắt buộc dùng **Message Templates** (`{PropertyName}`) để Serilog lưu trữ các thuộc tính dưới dạng JSON có thể truy vấn và lọc được.
2. **Bảo mật dữ liệu nhạy cảm (No Sensitive Data):** Nghiêm cấm ghi mật khẩu (`Password`), mã xác thực (`JWT Token`, `RefreshToken`) hoặc thông tin thẻ ngân hàng vào bất kỳ cấp độ log nào.
3. **Gắn định danh truy vết (Correlation ID / Request ID):** Mọi log phát sinh trong cùng một HTTP Request đều tự động đính kèm `TraceId` và `CashierId` (nếu đã đăng nhập) để xâu chuỗi toàn bộ luồng xử lý của một đơn hàng.

### Bảng phân cấp mức độ Log (Log Levels)

| Cấp độ (Level) | Mục đích sử dụng trong POS PWA | Ví dụ thực tế |
| :--- | :--- | :--- |
| **`Information`** | Ghi nhận các mốc nghiệp vụ quan trọng hoạt động bình thường. | Thu ngân đăng nhập, chốt đơn thành công (`ORD#...`), hoàn tất đồng bộ đơn Offline. |
| **`Warning`** | Các tình huống bất thường nhưng hệ thống vẫn tự xử lý được hoặc sắp chạm ngưỡng giới hạn. | Xung đột tồn kho (`Anti-oversell`), truy vấn sản phẩm chậm hơn `500ms`. |
| **`Error`** | Lỗi nghiêm trọng khiến giao dịch hiện tại thất bại nhưng ứng dụng vẫn chạy. | Mất kết nối cổng thanh toán VietQR, lỗi ràng buộc Database khi lưu đơn. |
| **`Fatal`** | Lỗi sập hệ thống nghiêm trọng khiến ứng dụng không thể khởi động hoặc ngừng hoạt động. | Không thể kết nối tới PostgreSQL lúc khởi động, thiếu cấu hình JWT Secret Key. |

---

## ⚙️ 2. Cấu hình Serilog trong `appsettings.json` & `Program.cs`

### 2.1. Cấu hình Sinks (Đầu ra) trong `appsettings.json`
Hệ thống xuất log đồng thời ra **Console** (phục vụ xem log trực tiếp trên Docker Container) và **Rolling File** (tự động tách tệp theo ngày trong thư mục `logs/`, lưu trữ tối đa 30 ngày).

```json
{
  "Serilog": {
    "Using": [ "Serilog.Sinks.Console", "Serilog.Sinks.File" ],
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "Microsoft.AspNetCore": "Warning",
        "Microsoft.EntityFrameworkCore.Database.Command": "Warning"
      }
    },
    "WriteTo": [
      {
        "Name": "Console",
        "Args": {
          "outputTemplate": "[{Timestamp:HH:mm:ss} {Level:u3}] [{TraceId}] {Message:lj}{NewLine}{Exception}"
        }
      },
      {
        "Name": "File",
        "Args": {
          "path": "logs/pos-pwa-.json",
          "rollingInterval": "Day",
          "retainedFileCountLimit": 30,
          "formatter": "Serilog.Formatting.Compact.CompactJsonFormatter, Serilog.Formatting.Compact"
        }
      }
    ],
    "Enrich": [ "FromLogContext", "WithMachineName", "WithThreadId" ]
  }
}
```

### 2.2. Khởi tạo trong `Program.cs`

```csharp
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Tích hợp Serilog làm Logger chính cho .NET 8
builder.Host.UseSerilog((context, services, configuration) => configuration
    .ReadFrom.Configuration(context.Configuration)
    .ReadFrom.Services(services)
    .Enrich.FromLogContext());

var app = builder.Build();

// Tự động ghi log tóm tắt mọi HTTP Request (Method, Path, StatusCode, Elapsed ms)
app.UseSerilogRequestLogging(options =>
{
    options.MessageTemplate = "HTTP {RequestMethod} {RequestPath} responded {StatusCode} in {Elapsed:0.0000} ms";
});
```

---

## 🔍 3. Tự động giám sát hiệu năng qua `LoggingBehavior` (MediatR)

Thay vì viết log thủ công trong từng Handler, hệ thống sử dụng `LoggingBehavior` trong chuỗi pipeline của MediatR để tự động đo thời gian xử lý của mọi `Command` và `Query`.

```csharp
public sealed class LoggingBehavior<TRequest, TResponse> 
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly ILogger<LoggingBehavior<TRequest, TResponse>> _logger;

    public LoggingBehavior(ILogger<LoggingBehavior<TRequest, TResponse>> logger)
    {
        _logger = logger;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        var requestName = typeof(TRequest).Name;
        var stopwatch = Stopwatch.StartNew();

        _logger.LogInformation("Bắt đầu xử lý yêu cầu {RequestName}", requestName);

        var response = await next();

        stopwatch.Stop();
        var elapsedMs = stopwatch.ElapsedMilliseconds;

        // Cảnh báo nếu thao tác tại quầy POS mất quá 500ms
        if (elapsedMs > 500)
        {
            _logger.LogWarning(
                "Hiệu năng chậm: {RequestName} mất {ElapsedMilliseconds} ms để hoàn tất {@Request}",
                requestName, elapsedMs, request);
        }
        else
        {
            _logger.LogInformation(
                "Hoàn tất {RequestName} trong {ElapsedMilliseconds} ms",
                requestName, elapsedMs);
        }

        return response;
    }
}
```

---

## ✅ 4. Quy chuẩn viết Log trong Nghiệp vụ (Đúng vs. Sai)

```csharp
// ✅ ĐÚNG: Dùng Structured Logging Template giúp truy vấn nhanh theo OrderNumber hoặc CashierId
_logger.LogInformation(
    "Chốt đơn hàng {OrderNumber} thành công với tổng tiền {TotalAmount} VND bởi thu ngân {CashierId}",
    order.OrderNumber, order.TotalAmount, order.CashierId);

// ❌ SAI: Dùng chuỗi nội suy ($"") làm mất cấu trúc dữ liệu, gây tốn bộ nhớ và khó tìm kiếm
_logger.LogInformation($"Chốt đơn hàng {order.OrderNumber} thành công với tổng tiền {order.TotalAmount}");
```

---
