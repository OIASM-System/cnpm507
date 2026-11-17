# ⚛️ React Architecture & POS Performance Patterns - POS PWA Project

Tài liệu này quy định kiến trúc xây dựng giao diện **React 18+** cho hệ thống **POS PWA (Point of Sale Progressive Web App)**. Khác với các trang web thông tin thông thường, màn hình thu ngân POS hoạt động liên tục suốt 8–12 giờ với tần suất thao tác chạm và quét mã vạch dày đặc. Do đó, kiến trúc Component và Custom Hooks được tối ưu hóa để triệt tiêu hiện tượng giật lag khung hình (**Unnecessary Re-renders**), hỗ trợ phím tắt tốc độ cao và tách bạch hoàn toàn logic nghiệp vụ khỏi tầng hiển thị UI.

---

## 🧩 1. Phân tầng Kiến trúc Component (Component Architecture)

Hệ thống phân chia các thành phần React theo 3 cấp độ rõ ràng:

| Cấp độ Component | Vị trí thư mục | Trách nhiệm & Quy tắc thiết kế |
| :--- | :--- | :--- |
| **1. Primitive UI Components** | `src/components/ui/` | Các thành phần giao diện thuần túy (`Button`, `Input`, `Modal`, `Badge`, `Spinner`), không chứa logic gọi API hay state nghiệp vụ. |
| **2. Feature Domain Components** | `src/features/<feature>/components/` | Các khối chức năng gắn với nghiệp vụ cụ thể (`ProductGrid`, `ProductCard`, `CartPanel`, `CheckoutModal`, `ReceiptPrintTemplate`). |
| **3. Page / Screen Containers** | `src/features/<feature>/pages/` | Điều phối bố cục tổng thể của màn hình (`PosTerminalPage`, `OrderHistoryPage`, `InventoryPage`), kết nối dữ liệu từ Hooks xuống các Component con. |

---

## ⚡ 2. Tối ưu hóa Hiệu năng Render tại Màn hình Bán hàng (`PosTerminalPage`)

Một cửa hàng bán lẻ có thể có từ **200 đến 1,000+ sản phẩm** hiển thị trên lưới bán hàng. Nếu mỗi lần thu ngân bấm tăng số lượng 1 món trong giỏ hàng mà toàn bộ 500 thẻ `ProductCard` đều bị re-render lại, giao diện trên máy tính bảng sẽ bị trễ đáng kể.

### 2.1. Cô lập State Giỏ hàng & Dùng `React.memo` cho `ProductCard`
* Thành phần **`ProductCard`** được bọc bằng `React.memo` và chỉ nhận các props nguyên thủy (`id`, `name`, `price`, `availableQuantity`, `onAddToCart`) để chỉ re-render đúng thẻ sản phẩm nào vừa có biến động tồn kho qua SignalR.
* Thành phần **`CartPanel`** đăng ký lắng nghe riêng nhánh state `items` từ `useCartStore` mà không làm ảnh hưởng tới `ProductGrid`.

```tsx
import { memo } from 'react';
import { formatCurrencyVND } from '@/utils/formatters';

interface ProductCardProps {
  id: string;
  code: string;
  name: string;
  price: number;
  availableQuantity: number;
  onSelect: (productId: string) => void;
}

export const ProductCard = memo(function ProductCard({
  id,
  code,
  name,
  price,
  availableQuantity,
  onSelect,
}: ProductCardProps) {
  const isOutOfStock = availableQuantity <= 0;

  return (
    <button
      type="button"
      disabled={isOutOfStock}
      onClick={() => onSelect(id)}
      className={`flex flex-col justify-between rounded-xl border p-3 text-left transition active:scale-95 ${
        isOutOfStock
          ? 'cursor-not-allowed border-slate-200 bg-slate-100 opacity-60'
          : 'border-slate-200 bg-white shadow-sm hover:border-blue-500 hover:shadow-md'
      }`}
    >
      <div>
        <span className="text-xs font-medium text-slate-400">{code}</span>
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-slate-800">{name}</h3>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-base font-bold text-blue-600">{formatCurrencyVND(price)}</span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            isOutOfStock
              ? 'bg-red-100 text-red-700'
              : availableQuantity <= 5
                ? 'bg-amber-100 text-amber-700'
                : 'bg-emerald-100 text-emerald-700'
          }`}
        >
          {isOutOfStock ? 'Hết hàng' : `Còn ${availableQuantity}`}
        </span>
      </div>
    </button>
  );
});
```

### 2.2. Lọc & Tìm kiếm sản phẩm tức thì với `useDeferredValue`
Khi thu ngân gõ tên hoặc mã SKU vào ô tìm kiếm nhanh trên danh sách hàng trăm sản phẩm, sử dụng `useDeferredValue` của React 18 để giữ cho khung nhập liệu luôn mượt mà mà không chặn luồng gõ phím:

```tsx
const [searchTerm, setSearchTerm] = useState('');
const deferredSearch = useDeferredValue(searchTerm);

const filteredProducts = useMemo(() => {
  const keyword = deferredSearch.trim().toLowerCase();
  if (!keyword) return products;

  return products.filter(
    (p) => p.name.toLowerCase().includes(keyword) || p.code.toLowerCase().includes(keyword)
  );
}, [products, deferredSearch]);
```

---

## 🔫 3. Custom Hooks Chuyên biệt cho Nghiệp vụ POS (`src/hooks/`)

### 3.1. `useBarcodeScanner` (Hỗ trợ máy quét mã vạch cầm tay USB/Bluetooth)
Các máy quét mã vạch vật lý hoạt động như một bàn phím tốc độ cao (gửi liên tiếp các ký tự trong vòng $< 30\text{ms}$ và kết thúc bằng phím `Enter`). Hook `useBarcodeScanner` tự động phân biệt thao tác quét mã vạch với việc nhân viên gõ bàn phím thông thường:

```typescript
import { useEffect, useRef } from 'react';

export function useBarcodeScanner(onScan: (barcode: string) => void, enabled = true) {
  const bufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Bỏ qua nếu người dùng đang nhập liệu trong ô input tìm kiếm hoặc ghi chú
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      const now = Date.now();
      // Nếu khoảng cách giữa 2 phím > 50ms -> người dùng đang gõ tay, reset bộ đệm
      if (now - lastKeyTimeRef.current > 50) {
        bufferRef.current = '';
      }
      lastKeyTimeRef.current = now;

      if (e.key === 'Enter' && bufferRef.current.length >= 3) {
        e.preventDefault();
        onScan(bufferRef.current);
        bufferRef.current = '';
        return;
      }

      if (e.key.length === 1) {
        bufferRef.current += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onScan, enabled]);
}
```

### 3.2. `usePosShortcuts` (Hệ thống phím tắt quầy thu ngân)
* **`F2`**: Focus nhanh vào ô tìm kiếm sản phẩm.
* **`F4`**: Tạm lưu đơn chờ (`Hold Order`).
* **`F9`**: Mở hộp thoại Thanh toán & Xuất hóa đơn (`CheckoutModal`).
* **`Esc`**: Đóng hộp thoại hiện tại hoặc hủy thao tác chọn.

---

## 🛡️ 4. Xử lý Lỗi Giao diện (React Error Boundaries)

Mỗi phân hệ chính (`PosTerminal`, `Inventory`, `Reports`) được bọc trong một `<FeatureErrorBoundary>` độc lập kết hợp với `QueryErrorResetBoundary` của TanStack Query. Nếu một biểu đồ báo cáo gặp sự cố hiển thị dữ liệu, thu ngân vẫn có thể chuyển sang tab **Bán hàng POS** và thanh toán cho khách bình thường mà không bị sập toàn bộ ứng dụng.

---
