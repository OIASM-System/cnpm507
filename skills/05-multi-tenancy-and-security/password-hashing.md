# 🔒 Password Hashing & Credential Security - POS PWA Project

Tài liệu này quy định tiêu chuẩn băm mật khẩu (**Password Hashing**), chính sách độ phức tạp mật khẩu và các nguyên tắc bảo vệ thông tin định danh của nhân viên thu ngân/quản lý trong hệ thống **POS PWA (Point of Sale Progressive Web App)**. Hệ thống tuyệt đối không lưu trữ mật khẩu dưới dạng văn bản thuần (**Plaintext**) hoặc sử dụng các thuật toán băm nhanh đã lỗi thời (`MD5`, `SHA-1`, `SHA-256` không muối).

---

## 🛡️ 1. Lựa chọn thuật toán băm mật khẩu (BCrypt)

Hệ thống sử dụng thuật toán **BCrypt** thông qua thư viện chuẩn **`BCrypt.Net-Next`** trên **.NET 8** với hệ số chi phí tính toán (**Work Factor / Cost**) tối thiểu là **`12`**:

| Thuộc tính kỹ thuật | Giá trị / Cấu hình chuẩn | Lý do lựa chọn cho POS PWA |
| :--- | :--- | :--- |
| **Thuật toán** | **BCrypt** (`$2a$` / `$2b$`) | Thuật toán băm chậm có chủ đích (Key Stretching), kháng lại các cuộc tấn công dò mật khẩu bằng GPU/ASIC chuyên dụng. |
| **Work Factor (Cost)** | **`12`** ($2^{12} = 4,096$ vòng lặp) | Cân bằng tối ưu giữa độ an toàn bảo mật và hiệu năng đăng nhập (~200–300ms mỗi lượt đăng nhập tại quầy). |
| **Salt (Muối ngẫu nhiên)** | **Tự động sinh 128-bit (16 bytes)** cho từng mật khẩu | Hai nhân viên dùng chung một mật khẩu vẫn tạo ra hai chuỗi `password_hash` hoàn toàn khác nhau, triệt tiêu tấn công **Rainbow Table**. |
| **Định dạng lưu trữ** | `varchar(255)` trên cột `users.password_hash` | Lưu trọn vẹn chuỗi 60 ký tự bao gồm phiên bản thuật toán, Work Factor, Salt và giá trị băm. |

---

## 💻 2. Triển khai dịch vụ băm mật khẩu (`IPasswordHasher`)

Để tuân thủ nguyên tắc **Clean Architecture** (tầng `Application` không phụ thuộc trực tiếp vào thư viện bên thứ ba `BCrypt.Net`), hệ thống định nghĩa giao diện trừu tượng `IPasswordHasher` tại `PosPwa.Application/Abstractions/Authentication/` và triển khai tại `PosPwa.Infrastructure/Authentication/`:

### 2.1. Giao diện `IPasswordHasher.cs`
```csharp
public interface IPasswordHasher
{
    string Hash(string password);
    bool Verify(string password, string passwordHash);
    bool NeedsRehash(string passwordHash);
}
```

### 2.2. Triển khai `BCryptPasswordHasher.cs`
```csharp
using PosPwa.Application.Abstractions.Authentication;

public sealed class BCryptPasswordHasher : IPasswordHasher
{
    private const int WorkFactor = 12;

    public string Hash(string password)
    {
        if (string.IsNullOrWhiteSpace(password))
            throw new ArgumentException("Mật khẩu không được để trống.", nameof(password));

        return BCrypt.Net.BCrypt.HashPassword(password, workFactor: WorkFactor);
    }

    public bool Verify(string password, string passwordHash)
    {
        if (string.IsNullOrWhiteSpace(password) || string.IsNullOrWhiteSpace(passwordHash))
            return false;

        // BCrypt.Verify thực hiện so sánh hằng thời gian (Constant-Time Comparison)
        // nhằm ngăn chặn tấn công đo thời gian phản hồi (Timing Attack)
        return BCrypt.Net.BCrypt.Verify(password, passwordHash);
    }

    public bool NeedsRehash(string passwordHash)
    {
        // Tự động nâng cấp độ khó nếu sau này hệ thống tăng WorkFactor lên 13 hoặc 14
        return BCrypt.Net.BCrypt.PasswordNeedsRehash(passwordHash, WorkFactor);
    }
}
```

---

## 📏 3. Chính sách mật khẩu & Xác thực đầu vào (`FluentValidation`)

Khi Quản lý tạo tài khoản nhân viên mới hoặc nhân viên đổi mật khẩu, dữ liệu đầu vào phải vượt qua bộ kiểm tra `CreateUserCommandValidator`:

* **Độ dài tối thiểu:** Ít nhất **8 ký tự**, tối đa **64 ký tự** (tránh tấn công DoS khi gửi chuỗi mật khẩu quá dài vào hàm băm BCrypt, lưu ý BCrypt chỉ xử lý tối đa 72 bytes đầu tiên).
* **Độ phức tạp bắt buộc:** Chứa ít nhất **1 chữ hoa** (`A-Z`), **1 chữ thường** (`a-z`), **1 chữ số** (`0-9`) và **1 ký tự đặc biệt** (`@$!%*?&`).

```csharp
public sealed class CreateUserCommandValidator : AbstractValidator<CreateUserCommand>
{
    public CreateUserCommandValidator()
    {
        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("Tên đăng nhập không được để trống.")
            .MinimumLength(4).MaximumLength(50)
            .Matches("^[a-zA-Z0-9._-]+$").WithMessage("Tên đăng nhập chỉ được chứa chữ cái, số và dấu chấm/gạch dưới.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Mật khẩu không được để trống.")
            .MinimumLength(8).WithMessage("Mật khẩu phải có ít nhất 8 ký tự.")
            .MaximumLength(64).WithMessage("Mật khẩu không được vượt quá 64 ký tự.")
            .Matches("[A-Z]").WithMessage("Mật khẩu phải chứa ít nhất một chữ cái viết hoa.")
            .Matches("[a-z]").WithMessage("Mật khẩu phải chứa ít nhất một chữ cái viết thường.")
            .Matches("[0-9]").WithMessage("Mật khẩu phải chứa ít nhất một chữ số.")
            .Matches("[^a-zA-Z0-9]").WithMessage("Mật khẩu phải chứa ít nhất một ký tự đặc biệt.");
    }
}
```

---

## 🚫 4. Các nguyên tắc bảo mật thông tin đăng nhập bắt buộc

1. **Thông báo lỗi đăng nhập chung chung (Chống User Enumeration):**
   Khi sai tên đăng nhập hoặc sai mật khẩu, API `/api/v1/auth/login` luôn trả về cùng một thông báo **`401 Unauthorized` — *"Tên đăng nhập hoặc mật khẩu không chính xác"***, tuyệt đối không tiết lộ cụ thể tài khoản có tồn tại trong cửa hàng hay không.
2. **Chống tấn công đo thời gian (Constant-Time Execution):**
   Nếu `username` không tồn tại trong cơ sở dữ liệu, hệ thống vẫn thực hiện một phép kiểm tra băm giả (`BCrypt.Verify(password, DummyHash)`) để thời gian phản hồi tương đương với trường hợp sai mật khẩu thật, ngăn kẻ tấn công dò tìm tài khoản hợp lệ dựa trên độ trễ phản hồi.
3. **Cấm ghi log mật khẩu ở mọi tầng:**
   Trong `LoggingBehavior` (Serilog) và DTO trả về (`UserDto`), tuyệt đối không bao giờ ánh xạ thuộc tính `Password` hay `PasswordHash`.

---
