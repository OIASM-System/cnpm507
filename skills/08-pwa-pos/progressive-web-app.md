# 📲 Progressive Web App (PWA) Architecture & Manifest - POS PWA Project

Tài liệu này quy định cấu hình tiêu chuẩn **Progressive Web App (PWA)** sử dụng **`vite-plugin-pwa`** cho ứng dụng **React Frontend** trong hệ thống **POS PWA (Point of Sale Progressive Web App)**. Thay vì yêu cầu cửa hàng phải mua máy tính chạy Windows đắt đỏ để cài đặt phần mềm `.exe` truyền thống, kiến trúc PWA cho phép cài đặt ứng dụng POS trực tiếp lên **iPad, máy tính bảng Android, Chromebook hoặc PC Windows/macOS** thông qua trình duyệt với trải nghiệm toàn màn hình (**Standalone Mode**), ẩn thanh địa chỉ trình duyệt và tự động cập nhật phiên bản mới không gián đoạn.

---

## 📋 1. Cấu hình Web App Manifest (`manifest.webmanifest`)

Tệp Manifest định nghĩa danh tính, biểu tượng và hành vi hiển thị của ứng dụng khi thu ngân nhấn **"Cài đặt ứng dụng (Install App)"**:

```json
{
  "name": "UTH Smart POS - Hệ thống Quản lý Bán hàng",
  "short_name": "Smart POS",
  "description": "Phần mềm bán hàng POS đa chi nhánh hỗ trợ vận hành ngoại tuyến và đồng bộ thời gian thực.",
  "start_url": "/pos?source=pwa",
  "scope": "/",
  "display": "standalone",
  "orientation": "any",
  "background_color": "#0f172a",
  "theme_color": "#2563eb",
  "categories": ["business", "finance", "productivity"],
  "icons": [
    {
      "src": "/icons/pwa-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/pwa-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "src": "/icons/pwa-maskable-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "shortcuts": [
    {
      "name": "Mở Quầy Bán Hàng",
      "short_name": "Bán hàng",
      "url": "/pos",
      "icons": [{ "src": "/icons/shortcut-pos.png", "sizes": "96x96" }]
    },
    {
      "name": "Lịch sử Hóa đơn",
      "short_name": "Hóa đơn",
      "url": "/orders",
      "icons": [{ "src": "/icons/shortcut-orders.png", "sizes": "96x96" }]
    }
  ]
}
```

### Ý nghĩa các thuộc tính quan trọng cho quầy POS:
* **`"display": "standalone"`:** Ẩn hoàn toàn thanh URL, nút Back/Forward và thanh Tab của trình duyệt, tối ưu hóa **100% diện tích màn hình cảm ứng** cho lưới sản phẩm và giỏ hàng, đồng thời ngăn thu ngân vô tình bấm đóng nhầm tab khi đang tính tiền.
* **`"start_url": "/pos?source=pwa"`:** Mở thẳng vào màn hình bán hàng POS ngay khi khởi động từ biểu tượng ngoài màn hình chính (`Desktop` / `Home Screen`).
* **`"purpose": "maskable"`:** Đảm bảo biểu tượng ứng dụng hiển thị sắc nét, không bị cắt góc trên các dòng máy tính bảng Android khác nhau.

---

## 🔄 2. Quản lý Vòng đời Cập nhật Phiên bản (`Prompt-for-Update Lifecycle`)

**Vấn đề thực tế tại quầy thu ngân:** Nếu cấu hình Service Worker tự động tải lại trang (`autoUpdate` + `window.location.reload()`) ngay khi có bản vá lỗi mới được đẩy lên server, trình duyệt có thể đột ngột reload đúng lúc thu ngân đang nhập giỏ hàng 15 món cho khách, gây mất dữ liệu thao tác.

**Giải pháp chuẩn (`registerType: 'prompt'`):**
1. Khi phát hiện có bản build mới trên máy chủ, Service Worker âm thầm tải các tệp tĩnh mới về bộ nhớ đệm nền (**Waiting State**) mà **không làm gián đoạn** màn hình hiện tại.
2. Hiển thị một thông báo nhỏ gọn ở góc màn hình: *"Đã có phiên bản nâng cấp hệ thống POS mới — Cập nhật ngay"*.
3. Thu ngân chủ động bấm nút **Cập nhật** vào lúc rảnh khách (hoặc hệ thống tự kích hoạt `updateServiceWorker(true)` khi giỏ hàng đang trống).

```tsx
import { useRegisterSW } from 'virtual:pwa-register/react';

export function PwaUpdateNotifier() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      // Kiểm tra phiên bản mới định kỳ mỗi 60 phút
      if (registration) {
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      }
    },
  });

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-lg">
      <span>Có bản cập nhật hệ thống POS mới.</span>
      <button
        type="button"
        onClick={() => updateServiceWorker(true)}
        className="rounded-lg bg-blue-600 px-3 py-1.5 font-semibold hover:bg-blue-500"
      >
        Cập nhật ngay
      </button>
      <button
        type="button"
        onClick={() => setNeedRefresh(false)}
        className="text-slate-400 hover:text-white"
      >
        Để sau
      </button>
    </div>
  );
}
```

---

## 🔒 3. Điều kiện Bắt buộc của Môi trường Triển khai PWA

* **HTTPS Secure Context:** Trình duyệt chỉ cho phép đăng ký `Service Worker` và kích hoạt nút cài đặt PWA trên kết nối mã hóa **HTTPS** (hoặc `http://localhost` khi phát triển).
* **Persistent Storage API (`navigator.storage.persist()`):** Khi thu ngân đăng nhập lần đầu, ứng dụng yêu cầu trình duyệt cấp quyền **Lưu trữ bền vững** nhằm ngăn hệ điều hành (đặc biệt là iPadOS / Android) tự động dọn dẹp dữ liệu `IndexedDB` (nơi chứa hàng đợi đơn hàng Offline) khi dung lượng ổ cứng thiết bị xuống thấp.

---
