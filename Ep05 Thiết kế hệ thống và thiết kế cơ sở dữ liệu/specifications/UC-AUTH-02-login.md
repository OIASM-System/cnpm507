# Use Case Specification: UC-AUTH-02 User Login & Logout

## 1. Details
- **ID & Name:** `UC-AUTH-02 User Login & Logout`
- **Primary Actor:** **Người dùng hệ thống (Owner, Staff, Cashier)**
- **Secondary Actors:** JWT Token Service, Redis Cache Cluster 
- **Goal in Context:** Xác thực người dùng và cấp phát cặp JWT Access Token (60 phút) & Refresh Token an toàn

## 2. Conditions
- **Preconditions:** Tài khoản người dùng đang ở trạng thái hoạt động (`IsActive = true`).
- **Postconditions:** Client nhận Token chứa các Claims: `TenantId`, `UserId`, `Role`, `BranchId` 

## 3. Main Success Flow
1. Người dùng nhập Email/Số điện thoại và Mật khẩu trên màn hình Login.
2. Hệ thống truy vấn người dùng (áp dụng Query Filter theo danh tính nếu có) 
3. Hệ thống xác thực mật khẩu băm với BCrypt/Argon2 [31, 35].
4. Kiểm tra mã `TenantId` đi kèm; nếu Tenant bị vô hiệu hóa, chặn truy cập (`403 Forbidden`) 
5. Sinh JWT Access Token (hạn 60 min) và Refresh Token; lưu Refresh Token vào Redis 
6. Trả về Token cùng thông tin phiên làm việc.

## 4. Alternative & Exception Flows
- **3a. Sai mật khẩu hoặc email:** Trả về `401 Unauthorized`.
- **4a. Thuê bao hết hạn/bị khóa:** Trả về `403 Forbidden` với message `"Tenant is inactive"`.

## 5. Business Rules & NFRs
- **FR-AUTH-02:** Xác thực qua Email/SĐT + Password
- **NFR-SEC-01:** HTTPS/TLS 1.3 và JWT Access Token 