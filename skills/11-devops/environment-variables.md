# 🔐 Environment Variables & Secrets Management - POS PWA Project

Tài liệu này quy định danh mục toàn bộ **Biến Môi Trường (Environment Variables)** và khóa bí mật (**Secrets**) được sử dụng để cấu hình hành vi của hệ thống **POS PWA (Point of Sale Progressive Web App)** qua từng môi trường (`Development`, `Testing`, `Production`). Toàn bộ cấu hình tuân theo chuẩn **12-Factor App (Factor III: Store config in the environment)**, đảm bảo cùng một Docker Image có thể triển khai sang nhiều máy chủ khác nhau chỉ bằng cách thay đổi biến môi trường mà không cần biên dịch lại mã nguồn.

---

## 📋 1. Danh mục Biến Môi trường Backend (`.NET 8 Web API`)

Trong ASP.NET Core 8, dấu hai chấm phân cấp trong `appsettings.json` (`JwtSettings:SecretKey`) được ánh xạ sang dấu gạch dưới kép (`JwtSettings__SecretKey`) khi truyền qua biến môi trường của Docker / Linux:

| Tên biến môi trường | Bắt buộc | Giá trị mẫu (`Development`) | Mô tả & Yêu cầu bảo mật (`Production`) |
| :--- | :---: | :--- | :--- |
| **`ASPNETCORE_ENVIRONMENT`** | ✅ | `Development` | Giá trị hợp lệ: `Development`, `Staging`, `Production`. Trên `Production` tự động tắt Swagger UI công khai. |
| **`ConnectionStrings__DefaultConnection`** | ✅ | `Host=localhost;Port=5432;Database=pos_pwa_dev;...` | Chuỗi kết nối PostgreSQL 16 (bắt buộc bật `Pooling=true` và `SSL Mode=Require` trên Production). |
| **`JwtSettings__SecretKey`** | ✅ | `dev-only-super-secret-key-min-32-chars!!` | Khóa đối xứng ký **JWT Access Token**. Trên Production bắt buộc sinh ngẫu nhiên **$\ge 256\text{ bits}$ (32+ ký tự)**. |
| **`JwtSettings__Issuer`** | ✅ | `https://api.pos-pwa.uth.edu.vn` | Định danh máy chủ phát hành Token (`iss` claim). |
| **`JwtSettings__Audience`** | ✅ | `https://pos-pwa.uth.edu.vn` | Định danh ứng dụng đích được phép sử dụng Token (`aud` claim). |
| **`JwtSettings__AccessTokenExpirationMinutes`** | ❌ | `15` | Thời hạn sống ngắn của Access Token trong RAM (mặc định `15` phút). |
| **`JwtSettings__RefreshTokenExpirationDays`** | ❌ | `7` | Thời hạn sống của HttpOnly Refresh Token Cookie (mặc định `7` ngày). |
| **`WebhookSettings__SecretKey`** | ✅ | `whsec_dev_hmac_signature_key_2026` | Khóa bí mật dùng để xác thực chữ ký `HMAC-SHA256` từ cổng thanh toán ngân hàng / VietQR. |
| **`CorsSettings__AllowedOrigins__0`** | ✅ | `http://localhost:5173` | Danh sách tên miền Frontend PWA được phép gọi API kèm Credentials (`withCredentials: true`). |

---

## 🌐 2. Danh mục Biến Môi trường Frontend (`React + Vite PWA`)

Trong Vite, chỉ những biến có tiền tố **`VITE_`** mới được nhúng vào gói mã nguồn JavaScript phía trình duyệt. Do đó, **tuyệt đối không bao giờ** đặt khóa bí mật (`SecretKey`, mật khẩu DB) vào biến có tiền tố `VITE_`:

| Tên biến môi trường | Giá trị mặc định (Qua Nginx Proxy) | Mô tả chức năng |
| :--- | :--- | :--- |
| **`VITE_API_BASE_URL`** | `/api/v1` | Đường dẫn gốc gọi REST API (dùng đường dẫn tương đối `/api/v1` để Nginx định tuyến nội bộ, tránh lỗi CORS). |
| **`VITE_SIGNALR_HUB_URL`** | `/hubs/pos-sync` | Đường dẫn kết nối WebSocket tới ASP.NET Core SignalR Hub. |
| **`VITE_APP_VERSION`** | `1.0.0` | Số phiên bản ứng dụng hiển thị ở chân trang Cài đặt và dùng để kiểm tra tương thích dữ liệu `IndexedDB`. |

---

## 🛡️ 3. Kiểm tra Cấu hình Bắt buộc lúc Khởi động (`Fail-Fast Validation`)

Thay vì để ứng dụng khởi động thành công rồi mới gặp lỗi `NullReferenceException` lúc khách hàng đang thanh toán, hệ thống sử dụng cơ chế **`ValidateDataAnnotations()` + `ValidateOnStart()`** của .NET 8 Options Pattern:

```csharp
builder.Services.AddOptions<JwtSettings>()
    .BindConfiguration("JwtSettings")
    .ValidateDataAnnotations()
    .Validate(settings => settings.SecretKey.Length >= 32,
        "LỖI BẢO MẬT: JwtSettings:SecretKey bắt buộc phải dài tối thiểu 32 ký tự (256-bit)!")
    .ValidateOnStart();
```

Nếu thiếu bất kỳ biến môi trường bắt buộc nào hoặc khóa ký JWT quá ngắn, container Backend sẽ dừng ngay tại giây đầu tiên khởi động kèm thông báo lỗi rõ ràng trên Log.

---
