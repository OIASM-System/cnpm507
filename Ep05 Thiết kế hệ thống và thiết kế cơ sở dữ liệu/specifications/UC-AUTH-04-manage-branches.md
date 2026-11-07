# Use Case Specification: UC-AUTH-04 Manage Branches

## 1. Details
- **ID & Name:** `UC-AUTH-04 Manage Branches`
- **Primary Actor:** **Chủ cửa hàng (Owner)**
- **Goal in Context:** Tạo mới, cập nhật thông tin địa lý và quản lý trạng thái ẩn/hiện của các chi nhánh/kho hàng.

## 2. Main Success Flow
1. Owner mở màn hình "Quản lý Chi nhánh".
2. Nhập thông tin: Tên chi nhánh, Địa chỉ, Số điện thoại kho.
3. Hệ thống lưu bản ghi `Branch` liên kết với `TenantId`.
4. Phân công nhân viên phụ trách chi nhánh nếu cần.

## 3. Business Rules & NFRs
- **FR-AUTH-04:** Cho phép tạo, sửa, bật/tắt hiển thị chi nhánh thuộc sở hữu.