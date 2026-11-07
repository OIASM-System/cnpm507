# Use Case Specification: UC-AUTH-03 Manage Users & Roles

## 1. Details
- **ID & Name:** `UC-AUTH-03 Manage Users & Roles`
- **Primary Actor:** **Chủ cửa hàng (Owner)** 
- **Goal in Context:** Phân quyền và quản lý tài khoản nhân viên theo mô hình RBAC (Owner, Staff, Cashier) 

## 2. Main Success Flow
1. Owner truy cập giao diện Quản lý người dùng.
2. Thêm mới tài khoản: Nhập Tên, Email/SĐT, Mật khẩu ban đầu và Chọn Vai trò (`Staff` hoặc `Cashier`) 
3. Hệ thống tự động gán `TenantId` của Owner hiện tại vào bản ghi User mới
4. Lưu bản ghi người dùng mới và phân quyền tương ứng.

## 3. Business Rules & NFRs
- **FR-AUTH-03:** Phân quyền RBAC nghiêm ngặt: `Owner` (Toàn quyền), `Staff` (Kho/Đơn hàng), `Cashier` (POS)