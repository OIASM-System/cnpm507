# 🖨️ Browser Thermal Receipt Printing Architecture - POS PWA Project

Tài liệu này quy định kiến trúc in hóa đơn bán hàng (**Thermal Receipt Printing**) cho hệ thống **POS PWA (Point of Sale Progressive Web App)**. Tại các cửa hàng bán lẻ và F&B, hệ thống phải hỗ trợ xuất biên lai tức thì ra các dòng máy in nhiệt khổ **58mm (K58)** hoặc **80mm (K80)** ngay sau khi thanh toán thành công — kể cả khi cửa hàng đang mất kết nối Internet (**Offline PWA Mode**).

---

## 🏗️ 1. Hai Chế độ In Hóa Đơn Linh Hoạt (Dual Printing Modes)

Hệ thống hỗ trợ quản lý cấu hình linh hoạt theo từng thiết bị quầy thu ngân (`Settings -> Thiết lập máy in`):

| Chế độ in | Cơ chế kỹ thuật | Thiết bị tương thích | Ưu điểm nổi bật |
| :--- | :--- | :--- | :--- |
| **1. Standard Browser Print (`window.print()`)** *(Mặc định)* | Sử dụng CSS `@media print` kết hợp kích thước trang `@page { size: 80mm auto; margin: 0; }` và cổng ẩn `React Portal`. | Mọi máy in nhiệt có cài Driver trên Windows, macOS, Linux, iPad (AirPrint). | **Không cần phần mềm bên thứ ba**, hoạt động ổn định trên mọi trình duyệt và hiển thị chuẩn tiếng Việt có dấu sắc nét. |
| **2. Silent / Kiosk Auto-Print** *(Tối ưu quầy cố định)* | Chạy trình duyệt Chrome/Edge với cờ `--kiosk-printing` kết hợp `window.print()`. | Máy tính POS cố định chạy Windows / Linux tại quầy thu ngân. | **In tự động 100% không hiện hộp thoại xác nhận**, biên lai chạy ra ngay sau khi bấm `Enter` thanh toán ($< 0.5\text{s}$). |

---

## 🎨 2. Kiến trúc Cô lập Mẫu In bằng React Portal (`ReceiptPrintPortal.tsx`)

Thay vì chèn trực tiếp HTML của hóa đơn vào cây DOM của màn hình bán hàng (dễ bị ảnh hưởng bởi các thuộc tính `overflow: hidden` hoặc `flex` của giao diện chính), hệ thống sử dụng **`createPortal`** để gắn mẫu hóa đơn vào một thẻ `<div id="print-root">` nằm trực tiếp dưới `<body>`:

```tsx
import { createPortal } from 'react-dom';
import { formatCurrencyVND } from '@/utils/formatters';
import type { OrderReceiptDto } from '@/types/order.types';

interface ReceiptPrintPortalProps {
  order: OrderReceiptDto | null;
  storeName: string;
  storeAddress: string;
  storePhone: string;
  paperWidth: '58mm' | '80mm';
}

export function ReceiptPrintPortal({
  order,
  storeName,
  storeAddress,
  storePhone,
  paperWidth,
}: ReceiptPrintPortalProps) {
  if (!order) return null;

  const printRoot = document.getElementById('print-root');
  if (!printRoot) return null;

  const widthClass = paperWidth === '58mm' ? 'w-[50mm] text-[10px]' : 'w-[72mm] text-[12px]';

  return createPortal(
    <div id="thermal-receipt-area" className={`mx-auto font-mono text-black ${widthClass}`}>
      {/* Phần đầu hóa đơn (Header) */}
      <div className="border-b border-dashed border-black pb-2 text-center">
        <h2 className="text-sm font-bold uppercase">{storeName}</h2>
        <p className="mt-0.5">{storeAddress}</p>
        <p>ĐT: {storePhone}</p>
      </div>

      {/* Thông tin định danh đơn hàng */}
      <div className="border-b border-dashed border-black py-2">
        <div className="text-center font-bold">HÓA ĐƠN BÁN HÀNG</div>
        <p className="mt-1">Số HĐ: {order.orderNumber}</p>
        <p>Ngày: {new Date(order.completedAt ?? order.createdAt).toLocaleString('vi-VN')}</p>
        {order.clientOfflineId && !order.orderNumber.startsWith('ORD-') && (
          <p className="italic">* Biên lai tạm (Chế độ Offline)</p>
        )}
      </div>

      {/* Bảng chi tiết từng món (Sử dụng dữ liệu Snapshot) */}
      <table className="w-full border-b border-dashed border-black py-2">
        <thead>
          <tr className="border-b border-black text-left">
            <th className="py-1">Tên món</th>
            <th className="py-1 text-center">SL</th>
            <th className="py-1 text-right">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.id}>
              <td className="py-1 pr-1">{item.productNameSnapshot}</td>
              <td className="py-1 text-center">{item.quantity}</td>
              <td className="py-1 text-right">{formatCurrencyVND(item.lineTotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Tổng kết thanh toán */}
      <div className="space-y-1 py-2">
        <div className="flex justify-between">
          <span>Tạm tính:</span>
          <span>{formatCurrencyVND(order.subTotal)}</span>
        </div>
        {order.discountAmount > 0 && (
          <div className="flex justify-between">
            <span>Chiết khấu:</span>
            <span>-{formatCurrencyVND(order.discountAmount)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm font-bold">
          <span>TỔNG CỘNG:</span>
          <span>{formatCurrencyVND(order.totalAmount)}</span>
        </div>
      </div>

      {/* Chân trang hóa đơn */}
      <div className="border-t border-dashed border-black pt-2 text-center">
        <p>Cảm ơn quý khách & Hẹn gặp lại!</p>
      </div>
    </div>,
    printRoot
  );
}
```

---

## ⚙️ 3. Quy tắc Đảm bảo Độ nét & Khổ giấy In Nhiệt

1. **Màu đen tuyệt đối (`#000000`):** Máy in nhiệt không in được thang màu xám nhạt (dễ bị mờ hoặc mất chữ). Toàn bộ văn bản và đường kẻ đứt nét (`border-dashed`) trên mẫu in bắt buộc dùng màu đen thuần `#000000` trên nền trắng `#FFFFFF`.
2. **Đợi Render xong trước khi gọi `window.print()`:** Sử dụng `requestAnimationFrame` hoặc sự kiện `onafterprint` để đảm bảo React đã gắn xong dữ liệu hóa đơn mới vào `#print-root` trước khi trình duyệt chụp trang in, và tự động dọn dẹp state sau khi in xong.
3. **Hỗ trợ In lại hóa đơn cũ (Reprint Receipt):** Trong màn hình **Lịch sử đơn hàng (`OrderHistoryPage`)**, thu ngân và quản lý có thể bấm nút **In lại biên lai** cho bất kỳ đơn `Completed` nào (hệ thống tự động gắn thêm dòng chú thích `"[BẢN IN LẠI]"` để tránh gian lận dùng 1 hóa đơn nhận hàng 2 lần).

---
