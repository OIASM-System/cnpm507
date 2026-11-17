# 🔄 Business Process Modeling (Mô hình hóa quy trình nghiệp vụ) - POS PWA Project

Tài liệu này mô tả các sơ đồ luồng quy trình nghiệp vụ (Business Process Flows) của hệ thống **POS PWA (Point of Sale Progressive Web App)**, phác họa trực quan các bước tương tác giữa thu ngân, hệ thống giao diện và cơ sở dữ liệu backend.

---

## 1. Tổng quan quy trình nghiệp vụ POS
Hệ thống xoay quanh hai quy trình nghiệp vụ cốt lõi:
1. **Quy trình Bán hàng & Thanh toán tại quầy (Sales & Checkout Flow):** Từ lúc khách chọn món đến khi hoàn tất thanh toán và in hóa đơn.
2. **Quy trình Quản lý Kho & Cập nhật tồn kho (Inventory & Stock Flow):** Trừ kho tự động khi đơn hàng thành công và cảnh báo khi sắp hết hàng.

---

## 2. Luồng Bán hàng & Thanh toán chi tiết (Sales & Checkout Flow)

Sơ đồ tuần tự của luồng này mô tả các bước thao tác trên giao diện màn hình POS:

```text
[Thu Ngân / Khách Hàng]                 [Frontend (PWA UI)]                 [Backend API & DB]
         |                                      |                                   |
         |--- 1. Tìm kiếm / Lọc sản phẩm ------>|                                   |
         |    (Chọn [Tất cả], [Sản phẩm],...)   |--- Truy vấn danh mục sản phẩm --->|
         |                                      |<-- Trả về danh sách sản phẩm -----|
         |                                      |                                   |
         |--- 2. Nhấn nút [GET] sản phẩm ------>|                                   |
         |                                      |--- Thêm vào "Shopping Cart" ------|
         |                                      |    (Cập nhật số lượng +, -)       |
         |                                      |                                   |
         |--- 3. Nhấn "Thanh Toán" ------------>|                                   |
         |                                      |--- Hiển thị "Receipt Preview" ----|
         |                                      |    (Xem lại đơn ORD#..., giá,...) |
         |                                      |                                   |
         |--- 4. Chọn phương thức ------------->|                                   |
         |    (Tiền mặt / Chuyển khoản / Thẻ)   |                                   |
         |                                      |--- Gửi yêu cầu tạo đơn hàng ----->|
         |                                      |    (Xử lý đồng thời & Trừ kho)    |
         |                                      |<-- Phản hồi giao dịch thành công -|
         |                                      |                                   |
         |--- 5. Nhấn "In hóa đơn" ------------>|                                   |
         |    (Print Invoice)                   |--- Kích hoạt máy in nhiệt POS ----|