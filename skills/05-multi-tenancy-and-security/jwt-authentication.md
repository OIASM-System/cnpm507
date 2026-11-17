# 🔑 JWT Authentication Architecture - POS PWA Project

Tài liệu này quy định cơ chế xác thực không trạng thái (**Stateless Authentication**) sử dụng **JSON Web Token (JWT Bearer)** cho Backend **.NET 8** và ứng dụng **React PWA** trong hệ thống **POS PWA (Point of Sale Progressive Web App)**. Cơ chế này đảm bảo mỗi yêu cầu từ quầy thu ngân đều được xác minh danh tính, vai trò (`Role`) và cửa hàng (`TenantId`) với tốc độ cao ($< 1\text{ms}$ trên RAM), đồng thời hỗ trợ kết nối thời gian thực qua **SignalR** và duy trì trạng thái bán hàng ngoại tuyến (**Offline PWA**).

---

## 🏗️ 1. Cấu trúc JWT Access Token

Hệ thống sử dụng thuật toán ký đối xứng **HMAC-SHA256 (`HS256`)** với khóa bí mật tối thiểu **256-bit (32 ký tự trở lên)** được lưu trữ an toàn trong biến môi trường (`Environment Variables`), tuyệt đối không lưu cứng trong mã nguồn Git.

### 1.1. Danh sách Claims chuẩn trong Payload
Mỗi `Access Token` phát hành cho thu ngân/quản lý có thời hạn sống ngắn (**15 phút**) nhằm giảm thiểu rủi ro nếu token bị lộ trên thiết bị công cộng, và chứa đầy đủ các thông tin định danh sau:

| Claim Name | Ví dụ giá trị | Mục đích sử dụng trong POS PWA |
| :--- | :--- | :--- |
| `sub` (Subject) | `"7c9e6679-7425-40de-944b-e07fc1f90ae7"` | Mã định danh duy nhất của nhân viên (`UserId`). |
| `tenant_id` | `"11111111-1111-1111-1111-111111111111"` | **Bắt buộc** — Định danh cửa hàng phục vụ `TenantResolutionMiddleware`. |
| `unique_name` | `"cashier01"` | Tên đăng nhập của nhân viên. |
| `name` | `"Nguyễn Văn A"` | Họ tên đầy đủ hiển thị trên góc màn hình POS và in trên hóa đơn. |
| `role` | `"Cashier"` hoặc `"Manager"` | Phục vụ phân quyền truy cập API theo vai trò (`RBAC`). |
| `jti` (JWT ID) | `"f47ac10b-58cc-4372-a567-0e02b2c3d479"` | Mã định danh duy nhất của từng token, dùng để truy vết log bảo mật. |
| `exp` (Expiration) | `1794853020` | Thời điểm hết hạn (mặc định `15 phút` kể từ lúc cấp phát). |

---

## 💻 2. Triển khai dịch vụ sinh Token (`JwtTokenGenerator`)

Đặt tại tầng `PosPwa.Infrastructure/Authentication/JwtTokenGenerator.cs`, triển khai giao diện `IJwtTokenGenerator` từ tầng `Application`:

```csharp
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using PosPwa.Application.Abstractions.Authentication;
using PosPwa.Domain.Entities;

public sealed class JwtTokenGenerator : IJwtTokenGenerator
{
    private readonly JwtSettings _jwtSettings;

    public JwtTokenGenerator(IOptions<JwtSettings> jwtOptions)
    {
        _jwtSettings = jwtOptions.Value;
    }

    public string GenerateAccessToken(User user)
    {
        var signingKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_jwtSettings.SecretKey));

        var credentials = new SigningCredentials(
            signingKey, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new("tenant_id", user.TenantId.ToString()),
            new(JwtRegisteredClaimNames.UniqueName, user.Username),
            new(JwtRegisteredClaimNames.Name, user.FullName),
            new(ClaimTypes.Role, user.Role.ToString()),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpirationMinutes), // 15 phút
            Issuer = _jwtSettings.Issuer,
            Audience = _jwtSettings.Audience,
            SigningCredentials = credentials
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);
    }
}
```

---

## ⚙️ 3. Cấu hình xác thực JWT Bearer & SignalR trong `Program.cs`

Vì trình duyệt không cho phép gắn tùy ý HTTP Header `Authorization: Bearer ...` khi khởi tạo kết nối **WebSocket** của **SignalR**, hệ thống cấu hình sự kiện `OnMessageReceived` để tự động trích xuất `access_token` từ Query String khi đường dẫn bắt đầu bằng `/hubs`:

```csharp
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>()!;

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        // Tắt ánh xạ tên Claim mặc định cũ của Microsoft để giữ nguyên tên 'sub', 'role'
        options.MapInboundClaims = false;

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidAudience = jwtSettings.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.SecretKey)),
            RoleClaimType = "role",
            NameClaimType = "unique_name",
            // Giảm ClockSkew từ 5 phút mặc định xuống 30 giây để token hết hạn chính xác
            ClockSkew = TimeSpan.FromSeconds(30)
        };

        // Hỗ trợ xác thực JWT qua Query String cho kết nối Real-time SignalR Hub
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;

                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                {
                    context.Token = accessToken;
                }

                return Task.CompletedTask;
            }
        };
    });
```

---

## 📱 4. Quy chuẩn lưu trữ & Xử lý Token trên React PWA (Frontend)

1. **Lưu trữ Access Token trong bộ nhớ RAM (In-Memory State):**
   * `Access Token` chỉ được giữ trong biến trạng thái của ứng dụng React (Zustand / Context API), **tuyệt đối không lưu trong `localStorage` hay `sessionStorage`** để phòng chống tấn công đánh cắp token qua lỗ hổng **XSS (Cross-Site Scripting)**.
   * Khi người dùng nhấn tải lại trang (`F5`), ứng dụng tự động gọi âm thầm endpoint `POST /api/v1/auth/refresh` (kèm `HttpOnly Cookie`) để cấp lại `Access Token` mới vào RAM.
2. **Xử lý phiên làm việc khi mất kết nối Internet (Offline PWA Mode):**
   * Khi mất mạng tại quầy thu ngân, `Access Token` hiện tại có thể vượt quá thời hạn 15 phút trong lúc thu ngân vẫn đang lập đơn ngoại tuyến lưu vào `IndexedDB`.
   * Giao diện PWA vẫn cho phép thu ngân tạo và in hóa đơn tạm từ dữ liệu phiên đã lưu trong RAM. Ngay khi có mạng trở lại (`window.addEventListener('online', ...)`), **Axios Interceptor** tự động gọi `/api/v1/auth/refresh` lấy `Access Token` mới trước khi đẩy toàn bộ hàng đợi đơn hàng Offline lên API `/api/v1/orders/sync`.

---
