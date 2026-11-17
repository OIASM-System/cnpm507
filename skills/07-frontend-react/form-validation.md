# ✅ Form Validation & Input Guardrails (React Hook Form + Zod) - POS PWA Project

Tài liệu này quy định kiến trúc kiểm duyệt biểu mẫu và dữ liệu đầu vào phía Client (**Client-Side Form Validation**) cho ứng dụng **React PWA** trong hệ thống **POS PWA (Point of Sale Progressive Web App)**. Hệ thống kết hợp **React Hook Form v7** (tối ưu hiệu năng Uncontrolled Inputs, không gây re-render toàn biểu mẫu khi gõ phím) cùng thư viện **Zod** (khai báo Schema đồng bộ 1:1 với quy tắc **FluentValidation** ở Backend .NET 8) nhằm ngăn chặn sai sót nhập liệu ngay tại quầy thu ngân trước khi gửi request lên máy chủ.

---

## 🎯 1. Nguyên tắc Đồng bộ Quy tắc Kiểm duyệt (Client-Server Parity)

Mọi biểu mẫu quan trọng trong hệ thống POS đều áp dụng cơ chế **Dual Validation**:
1. **Lớp 1 — Frontend (`Zod Schema`):** Phản hồi tức thì ($< 10\text{ms}$) khi thu ngân/quản lý gõ sai định dạng, nhập giá âm hoặc thiếu trường bắt buộc, hoạt động hoàn hảo ngay cả khi mất mạng (**Offline PWA Mode**).
2. **Lớp 2 — Backend (`FluentValidation` + Domain Invariants):** Chốt chặn bảo mật cuối cùng trên .NET 8 Web API, đảm bảo toàn vẹn dữ liệu kể cả khi API bị gọi trực tiếp qua công cụ bên ngoài.

| Biểu mẫu nghiệp vụ | Zod Schema (`src/features/.../schemas/`) | Backend Validator tương ứng |
| :--- | :--- | :--- |
| **Đăng nhập thu ngân** | `loginSchema` (`tenantCode`, `username`, `password`) | `LoginCommandValidator` |
| **Thêm / Sửa sản phẩm** | `productFormSchema` (`code`, `name`, `price`, `categoryId`) | `CreateProductCommandValidator` |
| **Nhập kho lô hàng (WAC)** | `receiveStockSchema` (`incomingQuantity`, `incomingUnitCost`) | `ReceiveStockCommandValidator` |
| **Thanh toán & Chiết khấu** | `checkoutSchema` (`paymentMethod`, `amountPaid`, `discountAmount`) | `CreateOrderCommandValidator` |
| **Hoàn tiền hóa đơn** | `refundOrderSchema` (`reason` tối thiểu 10 ký tự) | `RefundOrderCommandValidator` |

---

## 💻 2. Triển khai Mẫu: Biểu mẫu Thanh toán (`CheckoutModal`) & Nhập kho

### 2.1. Khai báo Schema với thông báo tiếng Việt chuẩn (`checkout.schema.ts`)
Sử dụng `.superRefine()` của Zod để kiểm tra chéo giữa **Tổng tiền cần thanh toán (`totalAmount`)**, **Số tiền chiết khấu (`discountAmount`)** và **Tiền khách đưa (`amountPaid`)**:

```typescript
import { z } from 'zod';
import { PaymentMethod } from '@/types/order.types';

export const createCheckoutSchema = (subTotal: number) =>
  z
    .object({
      paymentMethod: z.enum([
        PaymentMethod.Cash,
        PaymentMethod.BankTransferQr,
        PaymentMethod.Card,
      ]),
      discountAmount: z
        .number({ invalid_type_error: 'Vui lòng nhập số tiền chiết khấu hợp lệ.' })
        .min(0, 'Chiết khấu không được nhỏ hơn 0đ.')
        .max(subTotal, 'Chiết khấu không được vượt quá tổng tiền hàng.'),
      amountPaid: z
        .number({ invalid_type_error: 'Vui lòng nhập số tiền khách đưa.' })
        .min(0, 'Số tiền thanh toán không được âm.'),
      note: z.string().max(250, 'Ghi chú tối đa 250 ký tự.').optional(),
    })
    .superRefine((data, ctx) => {
      const finalPayable = Math.max(0, subTotal - data.discountAmount);

      if (data.paymentMethod === PaymentMethod.Cash && data.amountPaid < finalPayable) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['amountPaid'],
          message: `Tiền khách đưa phải lớn hơn hoặc bằng ${finalPayable.toLocaleString('vi-VN')}đ.`,
        });
      }
    });

export type CheckoutFormValues = z.infer<ReturnType<typeof createCheckoutSchema>>;
```

### 2.2. Kết nối `React Hook Form` với `zodResolver` & Ánh xạ lỗi 400 từ .NET 8
Khi Backend trả về lỗi validation chuẩn **RFC 7807 `ValidationProblemDetails`** (`errors: { Code: ["Mã SKU đã tồn tại"] }`), hàm tiện ích `mapServerErrorsToForm` tự động gắn thông báo lỗi vào đúng ô input tương ứng trên giao diện:

```typescript
import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import type { AxiosError } from 'axios';

interface ProblemDetailsError {
  errors?: Record<string, string[]>;
}

export function mapServerErrorsToForm<T FieldValues extends>(
  error: unknown,
  setError: UseFormSetError<T>
): boolean {
  const axiosError = error as AxiosError<ProblemDetailsError>;
  const serverErrors = axiosError.response?.data?.errors;

  if (!serverErrors) return false;

  Object.entries(serverErrors).forEach(([fieldKey, messages]) => {
    // Chuyển PascalCase từ .NET (VD: "Code") sang camelCase của React Form ("code")
    const camelField = (fieldKey.charAt(0).toLowerCase() + fieldKey.slice(1)) as Path<T>;
    if (messages && messages.length > 0) {
      setError(camelField, { type: 'server', message: messages[0] });
    }
  });

  return true;
}
```

---

## 🔢 3. Chuẩn hóa Nhập liệu Tiền tệ & Số lượng tại Quầy POS

* **Kiểm soát giá trị số (`valueAsNumber: true`):** Luôn chuyển đổi chuỗi nhập liệu sang kiểu `number` nguyên bản trước khi đưa vào Zod để tránh lỗi cộng chuỗi (`"50000" + "10000" = "5000010000"`).
* **Gợi ý mệnh giá tiền mặt thông minh (Quick Cash Denomination Buttons):** Trên hộp thoại thanh toán tiền mặt, hệ thống tự động tính toán và hiển thị các nút chọn nhanh mệnh giá tiền Việt Nam đồng hợp lệ dựa trên `finalPayable` (ví dụ: đơn `65,000đ` sẽ gợi ý sẵn các nút `65,000đ`, `70,000đ`, `100,000đ`, `200,000đ`, `500,000đ`) giúp thu ngân hoàn tất giao dịch chỉ với **1 lần chạm** mà không cần gõ bàn phím số.

---
