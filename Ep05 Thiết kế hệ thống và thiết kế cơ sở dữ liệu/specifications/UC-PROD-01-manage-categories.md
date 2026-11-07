# Use Case Specification: UC-PROD-01 Manage Categories & Brands

## 1. Details
- **ID & Name:** `UC-PROD-01 Manage Categories & Brands`
- **Primary Actor:** **Nhân viên / Chủ cửa hàng (Staff / Owner)**
- **Goal in Context:** Xây dựng cấu trúc danh mục sản phẩm phân cấp (Parent-Child) và danh sách thương hiệu.

## 2. Main Success Flow
1. Người dùng chọn tạo mới "Danh mục" hoặc "Thương hiệu".
2. Nhập Tên, Mã danh mục, Slug và chọn Danh mục cha (nếu là danh mục con).
3. Hệ thống lưu thông tin và kiểm tra tính duy nhất của Mã danh mục trong phạm vi `TenantId`.

## 3. Business Rules & NFRs
- **FR-PROD-01:** Quản lý danh mục phân cấp và thương hiệu.