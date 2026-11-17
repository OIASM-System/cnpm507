# 🛡️ Web API Edge Security & Hardening - POS PWA Project

Tài liệu này quy định các lớp bảo vệ biên (**Edge Security & Hardening**) cho **ASP.NET Core 8 Web API** trong hệ thống **POS PWA (Point of Sale Progressive Web App)**. Các cấu hình này giúp ngăn chặn tấn công dò mật khẩu tự động (**Brute-force**), ngăn chặn gọi API trái phép từ tên miền lạ (**CORS**), bảo vệ đường truyền bằng mã hóa **HTTPS/HSTS**, và gia cố các tiêu đề phản hồi HTTP (**Security Headers**) theo chuẩn khuyến nghị của **OWASP API Security Top 10**.

---

## 🌐 1. Cấu hình CORS nghiêm ngặt (Strict Cross-Origin Resource Sharing)

Do ứng dụng **React PWA** sử dụng `HttpOnly Cookie` (`AllowCredentials`) để truyền tải `Refresh Token`, ASP.NET Core **bắt buộc** phải khai báo danh sách tên miền nguồn (`AllowedOrigins`) tường minh, tuyệt đối không sử dụng ký tự đại diện `*` (`AllowAnyOrigin()`).

```csharp
var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ?? Array.Empty<string>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("PosPwaCorsPolicy", policy =>
    {
        policy.WithOrigins(allowedOrigins) // VD: ["[https://pos.uth-smart.vn](https://pos.uth-smart.vn)", "http://localhost:5173"]
              .WithMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
              .WithHeaders("Authorization", "Content-Type", "X-Tenant-Id", "X-Requested-With")
              .AllowCredentials(); // Bắt buộc để trình duyệt gửi kèm HttpOnly Refresh Token Cookie
    });
});
```

---

## 🚦 2. Giới hạn tần suất truy cập (Rate Limiting)

Sử dụng tính năng **Rate Limiting** tích hợp sẵn trong **.NET 8** (`Microsoft.AspNetCore.RateLimiting`) để bảo vệ hệ thống trước các cuộc tấn công vét cạn mật khẩu ở màn hình đăng nhập và hành vi spam tạo đơn hàng ảo:

| Tên chính sách (Policy) | Thuật toán | Ngưỡng giới hạn | Endpoint áp dụng |
| :--- | :--- | :--- | :--- |
| **`AuthStrictPolicy`** | **Fixed Window** | Tối đa **5 requests / phút** theo địa chỉ IP | `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh` |
| **`PosApiPolicy`** | **Sliding Window** | Tối đa **120 requests / phút** theo `TenantId` / IP | Toàn bộ các API bán hàng (`/api/v1/orders`, `/api/v1/products`) |

### Triển khai trong `Program.cs`:
```csharp
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    // 1. Chống Brute-force đăng nhập (5 lần / phút / IP)
    options.AddFixedWindowLimiter("AuthStrictPolicy", opt =>
    {
        opt.Window = TimeSpan.FromMinutes(1);
        opt.PermitLimit = 5;
        opt.QueueLimit = 0;
    });

    // 2. Giới hạn lưu lượng giao dịch POS thông thường (120 requests / phút)
    options.AddSlidingWindowLimiter("PosApiPolicy", opt =>
    {
        opt.Window = TimeSpan.FromMinutes(1);
        opt.SegmentsPerWindow = 4;
        opt.PermitLimit = 120;
        opt.QueueLimit = 5;
    });
});
```

---

## 🔒 3. Gia cố HTTP Security Headers & HTTPS Enforcement

### 3.1. Bắt buộc HTTPS & HSTS (HTTP Strict Transport Security)
Vì công nghệ **Progressive Web App (Service Worker)** trên trình duyệt yêu cầu kết nối bảo mật **HTTPS** để hoạt động, hệ thống kích hoạt HSTS trên môi trường Production:
```csharp
if (!app.Environment.IsDevelopment())
{
    app.UseHsts(); // Ép trình duyệt luôn dùng HTTPS trong 365 ngày
}
app.UseHttpsRedirection();
```

### 3.2. Middleware bổ sung các tiêu đề bảo mật (Security Headers)
Chèn các HTTP Response Headers chuẩn để ngăn chặn tấn công nhúng khung trang giả mạo (**Clickjacking**) và đoán kiểu MIME (**MIME Sniffing**):

```csharp
app.Use(async (context, next) =>
{
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Append("X-Frame-Options", "DENY");
    context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
    context.Response.Headers.Append("X-Permitted-Cross-Domain-Policies", "none");
    
    // Xóa header tiết lộ phiên bản máy chủ web
    context.Response.Headers.Remove("Server");
    context.Response.Headers.Remove("X-Powered-By");

    await next();
});
```

---

## 🧹 4. Kiểm soát kích thước Payload & Bảo mật Secrets

1. **Giới hạn kích thước Request Body (`MaxRequestBodySize`):**
   Ngăn chặn tấn công từ chối dịch vụ (DoS) bằng cách gửi gói tin JSON khổng lồ:
   ```csharp
   builder.WebHost.ConfigureKestrel(options =>
   {
       options.AddServerHeader = false; // Ẩn thông tin Kestrel Server
       options.Limits.MaxRequestBodySize = 2 * 1024 * 1024; // Giới hạn tối đa 2 MB (đủ cho lô đồng bộ hàng trăm đơn Offline)
   });
   ```
2. **Bảo vệ dữ liệu đầu vào chống SQL Injection & XSS:**
   * Mọi truy vấn cơ sở dữ liệu đều sử dụng **EF Core LINQ Parameterization** hoặc **`FromSqlInterpolated`** (tham số hóa tự động), tuyệt đối cấm nối chuỗi SQL (`FromSqlRaw($"... {input}")`).
   * Dữ liệu đầu vào được kiểm duyệt chặt chẽ qua **FluentValidation** trước khi đi vào Domain Layer.
3. **Quản lý khóa bí mật (Secrets Management):**
   * Tuyệt đối không lưu `JwtSettings:SecretKey` hay `ConnectionStrings:DefaultConnection` thật trong `appsettings.json`.
   * Môi trường Local Development sử dụng **`dotnet user-secrets`**.
   * Môi trường Production / Docker Compose nạp trực tiếp qua biến môi trường (`.env` được loại trừ trong `.gitignore`).
4. **Ẩn tài liệu Swagger UI trên Production:**
   * Chỉ kích hoạt `app.UseSwagger()` và `app.UseSwaggerUI()` khi `app.Environment.IsDevelopment()` để không làm lộ cấu trúc toàn bộ các endpoint nội bộ cho kẻ tấn công bên ngoài.

---
