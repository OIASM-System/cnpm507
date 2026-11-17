# 🛡️ Validation & Data Integrity - POS PWA Project

Tài liệu này quy định tiêu chuẩn kiểm tra tính hợp lệ dữ liệu đầu vào (**Validation**) cho Backend **.NET 8** của hệ thống **POS PWA (Point of Sale Progressive Web App)**. Việc kiểm soát dữ liệu chặt chẽ ngay từ biên của ứng dụng giúp ngăn chặn các yêu cầu không hợp lệ (giỏ hàng trống, số lượng âm, phương thức thanh toán sai quy định) trước khi chạm tới tầng nghiệp vụ cốt lõi (**Domain Layer**).

---

## 🛠️ 1. Thư viện cốt lõi & Nguyên tắc

* **Thư viện sử dụng:** **`FluentValidation.AspNetCore`** (.NET 8).
* **Nguyên tắc thiết kế:**
  1. **Tách biệt Validator:** Mỗi `Command` hoặc `Query` đều có một lớp `AbstractValidator<T>` riêng biệt, đặt ngay trong cùng thư mục tính năng của tầng `Application`.
  2. **Fail-Fast (Phát hiện lỗi sớm):** Dữ liệu bắt buộc phải được kiểm tra tự động thông qua MediatR Pipeline trước khi Handler được kích hoạt, tránh lặp lại mã kiểm tra thủ công trong từng Controller hay Handler.

---

## 📝 2. Ví dụ thực tế: Validator cho `CreateOrderCommand`

Dưới đây là quy tắc kiểm tra tính hợp lệ cho giao dịch tạo đơn hàng và thanh toán tại quầy POS:

```csharp
using FluentValidation;

public sealed class CreateOrderCommandValidator : AbstractValidator<CreateOrderCommand>
{
    public CreateOrderCommandValidator()
    {
        RuleFor(x => x.CashierId)
            .NotEmpty().WithMessage("Mã thu ngân không được để trống.")
            .NotEqual(Guid.Empty).WithMessage("Mã thu ngân không hợp lệ.");

        RuleFor(x => x.PaymentMethod)
            .IsInEnum().WithMessage("Phương thức thanh toán không được hỗ trợ.");

        RuleFor(x => x.Discount)
            .GreaterThanOrEqualTo(0).WithMessage("Số tiền chiết khấu không được nhỏ hơn 0.");

        RuleFor(x => x.Items)
            .NotEmpty().WithMessage("Giỏ hàng (Shopping Cart) không được để trống.")
            .Must(items => items.Count <= 100).WithMessage("Một đơn hàng tối đa không quá 100 sản phẩm.");

        RuleFor(x => x.Items)
            .ChildRules(items =>
            {
                items.RuleFor(i => i.ProductId)
                    .NotEmpty().WithMessage("Mã sản phẩm bắt buộc phải có.");

                items.RuleFor(i => i.Quantity)
                    .GreaterThan(0).WithMessage("Số lượng sản phẩm đặt mua phải lớn hơn 0.")
                    .LessThanOrEqualTo(999).WithMessage("Số lượng mua vượt quá giới hạn cho phép.");
            });
    }
}
```

---

## ⚙️ 3. Tự động hóa qua MediatR Pipeline (`ValidationBehavior`)

Để tránh việc phải gọi thủ công `validator.ValidateAsync()` trong mọi Handler, hệ thống đăng ký một **Pipeline Behavior** chạy chung cho tất cả các `Command`. Nếu dữ liệu không hợp lệ, hệ thống sẽ tự động ném ra ngoại lệ `ValidationException` và chặn đứng luồng xử lý.

```csharp
public sealed class ValidationBehavior<TRequest, TResponse> 
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly IEnumerable<IValidator<TRequest>> _validators;

    public ValidationBehavior(IEnumerable<IValidator<TRequest>> validators)
    {
        _validators = validators;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        if (!_validators.Any())
        {
            return await next();
        }

        var context = new ValidationContext<Request>(request);

        var validationResults = await Task.WhenAll(
            _validators.Select(v => v.ValidateAsync(context, cancellationToken))
        );

        var failures = validationResults
            .SelectMany(r => r.Errors)
            .Where(f => f != null)
            .ToList();

        if (failures.Count != 0)
        {
            throw new CustomValidationException(failures);
        }

        return await next();
    }
}
```

---

## ❌ 4. Chuẩn hóa phản hồi lỗi Validation (RFC 7807)

Khi ngoại lệ `ValidationException` xảy ra, **Global Exception Handler Middleware** sẽ bắt lại và chuyển đổi thành phản hồi HTTP chuẩn `400 Bad Request` dạng **ProblemDetails**, giúp giao diện React PWA dễ dàng đọc thông báo lỗi và hiển thị tương ứng lên màn hình POS cho thu ngân:

```json
{
  "type": "[https://tools.ietf.org/html/rfc7231#section-6.5.1](https://tools.ietf.org/html/rfc7231#section-6.5.1)",
  "title": "Dữ liệu đầu vào không hợp lệ",
  "status": 400,
  "errors": {
    "Items": [
      "Giỏ hàng (Shopping Cart) không được để trống."
    ],
    "Discount": [
      "Số tiền chiết khấu không được nhỏ hơn 0."
    ]
  }
}
```

---