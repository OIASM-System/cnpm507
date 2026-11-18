# OISM Frontend (React + TypeScript)

## Yêu cầu
- Node.js 20 trở lên
- Backend OISM chạy tại `http://localhost:5185`
- PostgreSQL đã được cấu hình ở backend

## Cài đặt frontend
Mở terminal tại thư mục `frontend`:

```powershell
npm install
npm run build
npm run dev
```

Mở URL Vite in ra (thường là `http://localhost:5173`).

## Chạy backend
Mở terminal riêng tại thư mục gốc dự án:

```powershell
dotnet run --project .\backend\src\OISM.WebAPI\OISM.WebAPI.csproj
```

Backend cần tiếp tục chạy trong khi sử dụng frontend.

## Cấu hình kết nối
File `frontend/.env`:

```env
VITE_API_BASE_URL=/backend
VITE_TENANT_ID=00000000-0000-0000-0000-000000000001
VITE_BRANCH_ID=11111111-1111-1111-1111-111111111111
```

`vite.config.ts` chuyển tiếp `/backend/*` đến `http://localhost:5185/*`.
Nếu backend chạy ở cổng khác, sửa `target` trong `vite.config.ts`, sau đó khởi động lại Vite.

## Chức năng đã nối API hiện có
- Tổng quan: số lượng mặt hàng, tổng tồn, số lượng khả dụng và mặt hàng tồn thấp (tính từ API tồn kho).
- Tồn kho: tìm kiếm SKU/tên và điều chỉnh tồn kho bằng `PUT /api/inventory/adjust`.
- Sản phẩm: hiển thị SKU/tên lấy từ dữ liệu tồn kho hiện có.
- Đơn hàng: tạo đơn, tra cứu theo Order ID, xác nhận và hủy đơn.
- Lịch sử kho: đọc `GET /api/inventory/ledger`.

## Giới hạn theo backend hiện tại
Backend trong source hiện chỉ có API tạo/tra cứu từng đơn hàng, chưa có API danh sách đơn hàng. Chưa thấy API danh mục sản phẩm độc lập, tạo/sửa sản phẩm, báo cáo doanh thu hoặc đăng nhập. Vì vậy giao diện không giả lập các chức năng này và không tự tạo dữ liệu mẫu. Trang báo cáo ghi rõ endpoint chưa được cung cấp.

## Lưu ý
Frontend gửi `X-Tenant-Id` và `branchId` theo cấu hình `.env`. Nếu đổi tenant/branch, phải dùng đúng GUID đã có trong PostgreSQL/backend seed data. Không thay đổi GUID ngẫu nhiên.
