# ⚠️ Global Exception Handling & Error Response - POS PWA Project

Tài liệu này quy định cơ chế xử lý ngoại lệ tập trung (**Global Exception Handling**) cho Backend **.NET 8** của hệ thống **POS PWA (Point of Sale Progressive Web App)**. Thay vì để các Controller tự xử lý `try-catch` lặp đi lặp lại, mọi ngoại lệ phát sinh từ tầng Domain, Application hay Infrastructure đều được bắt lại tại một điểm duy nhất và chuyển đổi thành phản hồi lỗi chuẩn hóa theo chuẩn **RFC 7807 (`ProblemDetails`)**.

---

## 🎯 1. Nguyên tắc cốt lõi

1. **Không làm lộ Stack Trace:** Môi trường Production tuyệt đối không trả về thông tin vết lỗi chi tiết (Stack Trace) của hệ thống ra ngoài client nhằm đảm bảo an toàn bảo mật.
2. **Phân loại ngoại lệ rõ ràng:** Sử dụng các ngoại lệ tùy chỉnh (`Custom Exceptions`) để ánh xạ chính xác sang các HTTP Status Code (`400`, `404`, `409`, `500`).
3. **Chuẩn hóa định dạng lỗi:** Phản hồi lỗi trả về cho ứng dụng React PWA luôn tuân theo cấu trúc `ProblemDetails` giúp Frontend dễ dàng bóc tách và hiển thị thông báo tương ứng cho thu ngân.

---

## 📂 2. Định nghĩa các Ngoại lệ Tùy chỉnh (Custom Exceptions)

Các ngoại lệ này được đặt tại thư mục `PosPwa.Domain/Exceptions/` hoặc `PosPwa.Application/Common/Exceptions/`:

```csharp
// Ngoại lệ chung cho các vi phạm quy tắc nghiệp vụ Domain
public class DomainException : Exception
{
    public DomainException(string message) : base(message) { }
}

// Ngoại lệ khi không tìm thấy tài nguyên (User, Product, Order) -> HTTP 404
public class NotFoundException : Exception
{
    public NotFoundException(string message) : base(message) { }
}

// Ngoại lệ khi tồn kho không đủ (Anti-oversell conflict) -> HTTP 409
public class InsufficientStockException : Exception
{
    public InsufficientStockException(string message) : base(message) { }
}

// Ngoại lệ khi dữ liệu đầu vào không hợp lệ từ FluentValidation -> HTTP 400
public class CustomValidationException : Exception
{
    public IDictionary<string, string[]> Errors { get; }

    public CustomValidationException(IEnumerable<FluentValidation.Results.ValidationFailure> failures)
        : base("Dữ liệu đầu vào không hợp lệ.")
    {
        Errors = failures
            .GroupBy(e => e.PropertyName, e => e.ErrorMessage)
            .ToDictionary(failureGroup => failureGroup.Key, failureGroup => failureGroup.ToArray());
    }
}
```

---

## ⚙️ 3. Triển khai `.NET 8 IExceptionHandler`

Từ phiên bản .NET 8, Microsoft cung cấp giao diện chuẩn `IExceptionHandler` để xử lý ngoại lệ một cách gọn gàng và hiện đại thay vì dùng Middleware thủ công.

```csharp
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Serilog;

public sealed class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        _logger.LogError(exception, "Đã xảy ra lỗi không mong muốn: {Message}", exception.Message);

        var (statusCode, title, detail) = exception switch
        {
            NotFoundException => (StatusCodes.Status404NotFound, "Không tìm thấy tài nguyên", exception.Message),
            InsufficientStockException => (StatusCodes.Status409Conflict, "Xung đột tồn kho", exception.Message),
            DomainException => (StatusCodes.Status400BadRequest, "Lỗi quy tắc nghiệp vụ", exception.Message),
            CustomValidationException => (StatusCodes.Status400BadRequest, "Dữ liệu không hợp lệ", exception.Message),
            _ => (StatusCodes.Status500InternalServerError, "Lỗi hệ thống nội bộ", "Đã xảy ra lỗi ở máy chủ. Vui lòng thử lại sau.")
        };

        httpContext.Response.StatusCode = statusCode;

        var problemDetails = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = detail,
            Instance = httpContext.Request.Path
        };

        // Nếu là lỗi Validation, bổ sung chi tiết danh sách lỗi vào Extensions
        if (exception is CustomValidationException validationEx)
        {
            problemDetails.Extensions["errors"] = validationEx.Errors;
        }

        await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);

        return true; // Đã xử lý ngoại lệ thành công
    }
}
```

---

## 🔌 4. Đăng ký trong `Program.cs`

Để kích hoạt Global Exception Handler, đăng ký dịch vụ và thêm vào pipeline HTTP:

```csharp
// Đăng ký vào DI Container
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

// Cấu hình Middleware Pipeline
var app = builder.Build();

app.UseExceptionHandler(); // Bắt buộc gọi trước UseRouting / UseAuthorization
```

---

## 📄 5. Cấu trúc phản hồi lỗi trả về (JSON Response)

Khi xảy ra lỗi xung đột tồn kho (`InsufficientStockException`), API sẽ phản hồi về ứng dụng React PWA với cấu trúc chuẩn:

```json
{
  "type": "[https://tools.ietf.org/html/rfc7231#section-6.5.8](https://tools.ietf.org/html/rfc7231#section-6.5.8)",
  "title": "Xung đột tồn kho",
  "status": 409,
  "detail": "Sản phẩm 'Cà phê sữa đá' chỉ còn 2 trong kho, không đủ đáp ứng 5.",
  "instance": "/api/v1/orders"
}
```

---