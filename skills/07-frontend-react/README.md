# 💻 Frontend React PWA Architecture - POS PWA Project

Thư mục này tổng hợp toàn bộ tài liệu thiết kế kiến trúc ứng dụng phía khách hàng (**Client-Side Architecture**) được xây dựng bằng **React 18+**, **TypeScript**, **Vite** và **Tailwind CSS** cho hệ thống **POS PWA (Point of Sale Progressive Web App)**. Ứng dụng được thiết kế theo mô hình **Feature-Based Architecture**, tối ưu hóa tốc độ thao tác chạm/quét mã vạch tại quầy thu ngân ($< 16\text{ms}$ khung hình), hỗ trợ giao tiếp thời gian thực qua **SignalR** và duy trì khả năng bán hàng liên tục khi mất kết nối mạng (**Offline-First PWA**).

---

## 📂 Cấu trúc thư mục `07-frontend-react/`

```text
07-frontend-react/
├── README.md                 # Tổng quan kiến trúc Frontend React PWA & Cấu trúc mã nguồn
├── typescript.md             # Quy chuẩn TypeScript Strict Mode, Type Safety & DTO Contracts
├── reactjs.md                # Kiến trúc Component, Custom Hooks & Tối ưu hiệu năng Render
├── state-management.md       # Quản lý trạng thái đa tầng (Zustand + TanStack Query + IndexedDB)
├── api-integration.md        # Tích hợp Axios, Single-Flight Refresh Token & SignalR Client
├── form-validation.md        # Kiểm duyệt biểu mẫu với React Hook Form & Zod Schema
├── responsive-design.md      # Thiết kế giao diện thích ứng (POS Tablet, Desktop, Mobile) & In nhiệt
└── frontend-testing.md       # Chiến lược kiểm thử tự động (Vitest, React Testing Library, Playwright)
```

---

## 🏗️ Tổ chức thư mục mã nguồn dự án (`src/`)

Hệ thống áp dụng cấu trúc **Feature-Sliced / Feature-Based** giúp tách biệt rõ ràng giữa hạ tầng kỹ thuật dùng chung và từng phân hệ nghiệp vụ POS:

```text
src/
├── app/                      # Cấu hình khởi tạo ứng dụng (Router, QueryClient, Providers)
├── assets/                   # Hình ảnh, biểu tượng SVG, âm thanh quét mã vạch (Beep sound)
├── components/               # UI Components dùng chung (Button, Modal, Badge, OfflineBanner)
│   └── guards/               # Route Guards (AuthGuard, RoleGuard)
├── features/                 # Các phân hệ nghiệp vụ độc lập
│   ├── auth/                 # Đăng nhập, nhận diện Tenant, quản lý phiên & Refresh Token
│   ├── pos-terminal/         # Màn hình bán hàng chính (Lưới sản phẩm, Giỏ hàng, Thanh toán, In bill)
│   ├── orders/               # Lịch sử hóa đơn, chi tiết đơn hàng, hoàn tiền (Manager)
│   ├── inventory/            # Quản lý danh mục, sản phẩm, nhập kho & Thẻ kho (Stock Card)
│   └── reports/              # Dashboard doanh thu, lợi nhuận gộp (WAC) & xuất báo cáo
├── hooks/                    # Custom Hooks toàn cục (useOnlineStatus, useBarcodeScanner, useSignalR)
├── lib/                      # Cấu hình thư viện lõi (axiosInstance, dexieDb, signalrConnection)
├── stores/                   # Global Client State với Zustand (useAuthStore, useCartStore, useSyncStore)
├── types/                    # Định nghĩa kiểu dữ liệu chuẩn hóa khớp với Backend .NET 8 DTOs
└── utils/                    # Hàm tiện ích thuần (formatCurrencyVND, generateClientOfflineId)
```

---

## 🎯 Nguyên tắc kỹ thuật cốt lõi (Core Frontend Principles)

| Trụ cột kiến trúc | Công nghệ áp dụng | Mục tiêu trải nghiệm tại quầy POS |
| :--- | :--- | :--- |
| **Strict Type Safety** | TypeScript `strict: true` + Zod | Loại bỏ lỗi `undefined is not a function` ngay lúc biên dịch; đồng bộ kiểu dữ liệu 1:1 với API .NET 8. |
| **3-Layer State Separation** | **Zustand** (UI/Cart) + **TanStack Query** (Server Cache) + **Dexie.js** (IndexedDB) | Tách bạch dữ liệu giỏ hàng tức thời, dữ liệu truy vấn API và hàng đợi đơn hàng ngoại tuyến. |
| **Zero-Latency POS UX** | Optimistic UI + Web Audio Beep + Keyboard Shortcuts | Thu ngân có thể quét mã vạch liên tục hoặc nhấn phím tắt `F9` để thanh toán mà không cần dùng chuột. |
| **Resilient Network Layer** | Axios Single-Flight Refresh + SignalR Auto-Reconnect | Tự động làm mới `Access Token` trong RAM khi hết hạn và đồng bộ lại kênh tồn kho ngay khi có mạng. |

---
