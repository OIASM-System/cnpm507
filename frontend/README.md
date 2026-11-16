# OISM Frontend – Admin Dashboard + POS PWA

Frontend React + TypeScript + Vite. Admin Dashboard và POS PWA dùng chung một ứng dụng, truy cập bằng `/admin` và `/pos`.

## Yêu cầu
- Node.js 20 LTS hoặc mới hơn
- npm 10+
- Backend ASP.NET Core chạy HTTP tại `http://localhost:5185` (để kiểm thử tích hợp API)

## Chạy lần đầu (Windows PowerShell)
```powershell
cd frontend
Copy-Item .env.example .env
npm.cmd install
npm.cmd run dev
```
Mở `http://localhost:5173/admin` hoặc `http://localhost:5173/pos`.

> Nếu bạn giải nén riêng thư mục frontend này thành thư mục dự án, chạy lệnh trong chính thư mục có `package.json` (không chạy `cd frontend` lần nữa).

## Kết nối backend
Vite proxy `/backend/*` sang `http://localhost:5185/*`. Cấu hình trong `.env`:
```env
VITE_API_BASE_URL=/backend
VITE_TENANT_ID=<GUID tenant thực tế>
VITE_BRANCH_ID=<GUID chi nhánh thực tế>
```
Hai GUID phải là dữ liệu thực có trong database của backend. Sau khi sửa `.env`, khởi động lại Vite một lần.

### Endpoint có thật trong backend đính kèm
- `GET /` – health check đơn giản
- `GET /api/inventory/all?branchId={guid}` – tồn kho theo chi nhánh, yêu cầu `X-Tenant-Id`
- `GET /api/inventory?branchId={guid}&productId={guid}` – tồn kho một sản phẩm
- `PUT /api/inventory/adjust` – điều chỉnh tồn kho
- `GET /api/inventory/ledger?branchId={guid}` – lịch sử biến động kho
- `POST /api/orders` – tạo đơn; yêu cầu `X-Tenant-Id`, `BranchId`, `Items[{ProductId,Quantity}]`
- `GET /api/orders/{orderId}`, `POST /api/orders/{orderId}/confirm`, `POST /api/orders/{orderId}/cancel`

### Giới hạn backend cần biết
Source backend trong ZIP **chưa có** ProductsController, AuthController, API danh sách đơn hàng, hoặc endpoint checkout/thanh toán POS. Vì vậy:
- Catalog và các chỉ số dashboard mặc định là dữ liệu minh họa trong frontend.
- Nút đồng bộ tồn kho gọi endpoint tồn kho thật khi đã cấu hình Tenant ID và Branch ID; số lượng được ghép theo SKU.
- Giá bán, danh mục và sản phẩm không có trong response inventory nên không được giả định là dữ liệu backend.
- Giao diện không giả vờ đăng nhập hay thanh toán thành công khi API tương ứng chưa tồn tại.
- Tạo đơn thật cần ProductId GUID và BranchId hợp lệ; dữ liệu catalog minh họa hiện không tự tạo được đơn hợp lệ.

## Build kiểm tra
```powershell
npm.cmd run build
```

## Cấu trúc
```text
src/
  App.tsx       Admin Dashboard + POS PWA
  api.ts        HTTP client, tenant header, inventory API
  main.tsx      React entry point
  styles.css    Design system và responsive layouts
public/
  sw.js         Service worker (chỉ đăng ký ở production)
  manifest.webmanifest
```

## Ghi chú lỗi Vite restart
Bản bàn giao loại bỏ các thư mục package/app monorepo rỗng khỏi frontend và dùng một Vite app duy nhất. Các file cấu hình TypeScript/Vite được điền đầy đủ, không còn file cấu hình rỗng được Vite theo dõi. Vite dùng `strictPort` để báo rõ nếu cổng 5173 đang bị chiếm thay vì tự đổi cổng.
