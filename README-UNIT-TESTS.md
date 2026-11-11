# Backend Unit Tests – OISM

## Phạm vi hiện tại

Project `OISM.Domain.Tests` kiểm thử các quy tắc nghiệp vụ thuần trong Domain:
- Inventory: khởi tạo tồn kho, giữ hàng, xác nhận giữ hàng, giải phóng giữ hàng và điều chỉnh tồn kho.
- Order: khởi tạo đơn, chuẩn hóa Source, tính tổng tiền, xác nhận/hủy và kiểm tra chuyển trạng thái không hợp lệ.
- OrderItem: tính thành tiền và kiểm tra dữ liệu đầu vào.

Các test này không cần PostgreSQL hoặc kết nối database vì kiểm thử trực tiếp Domain entities.

## Cách chạy trên máy

Mở terminal tại thư mục `backend`:

```bash
dotnet restore OISM.sln
dotnet test OISM.sln
```

## Tích hợp GitHub Actions

Workflow `.github/workflows/backend-ci.yml` chạy:
1. Restore dependencies.
2. Build toàn bộ solution ở cấu hình Release.
3. Chạy Unit Test.

## Giới hạn

Đây là Domain Unit Tests, chưa phải Integration Tests cho `InventoryService`, `OrderService`, API Controller hoặc PostgreSQL. Những phần đó cần test doubles/mock hoặc database test riêng.
