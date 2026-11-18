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

### Luồng đã nối với backend thật
- **POS thanh toán**: `POST /api/orders` → `POST /api/orders/{id}/confirm` → `GET /api/orders/{id}`. Tổng tiền hiển thị sau đó là số do server tính; giá server trả về được lưu lại làm giá hiển thị cho SKU.
- **Admin > Đơn hàng**: theo dõi các đơn tạo trên thiết bị này, làm mới trạng thái, xác nhận/hủy đơn `Pending`.
- **Admin > Kho hàng**: đồng bộ tồn kho, điều chỉnh tồn (`PUT /api/inventory/adjust`), xem sổ kho (`GET /api/inventory/ledger`).
- Backend trả `OrderStatus` dạng số (0..4); frontend tự ánh xạ sang nhãn.

### Giới hạn backend cần biết
Backend **chưa có**: đăng nhập/JWT, API sản phẩm và giá, API danh sách đơn, báo cáo, giảm giá, ghi nhận thanh toán. Vì vậy:
- Danh mục POS lấy từ tồn kho thật (cần `VITE_TENANT_ID`, `VITE_BRANCH_ID`); giá hiển thị nhập tay ở Admin > Sản phẩm hoặc học từ đơn đầu tiên. Giá thật luôn do server tính.
- Tiền khách đưa/tiền thừa chỉ tính trên giao diện, không lưu server. Giảm giá chưa được hỗ trợ nên chặn thanh toán khi có giảm giá.
- Số liệu Tổng quan/Báo cáo, Chi nhánh, Nhân viên là dữ liệu minh họa.

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
