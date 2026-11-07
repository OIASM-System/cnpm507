# Use Case Specification: UC-PROD-02 Manage Products & Variants

## 1. Details
- **ID & Name:** `UC-PROD-02 Manage Products & Variants`
- **Primary Actor:** **Nhân viên kho (Staff)**
- **Goal in Context:** Quản lý sản phẩm đơn giản (Simple) hoặc sản phẩm có thuộc tính biến thể (Color, Size).

## 2. Main Success Flow
1. Staff nhập thông tin chung: Tên sản phẩm, Danh mục, Thương hiệu, Mô tả.
2. Chọn loại sản phẩm: **Đơn giản** hoặc **Biến thể**.
3. Nếu là sản phẩm biến thể: Khai báo thuộc tính (Ví dụ: Màu = [Đỏ, Xanh], Size = [M, L]).
4. Hệ thống tự động tổ hợp phát sinh danh sách các bản ghi `ProductVariant`.
5. Lưu dữ liệu `Product` và `ProductVariant` vào CSDL.

## 3. Business Rules & NFRs
- **FR-PROD-02:** Hỗ trợ sản phẩm đơn giản và biến thể.