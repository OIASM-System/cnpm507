```
# Use Case Specification: UC-AUTH-01 Register Tenant

## 1. Details
- **ID &amp; Name:** `UC-AUTH-01 Register Tenant`
- **Primary Actor:** **Chủ cửa hàng mới (New Store Owner)** 
- **Secondary Actors:** PostgreSQL Engine, Identity Service 
- **Goal in Context:** Khởi tạo một thuê bao cửa hàng mới (Store Tenant) với không gian dữ liệu cô lập qua `TenantId` duy nhất 
## 2. Conditions
- **Preconditions:** Email và Số điện thoại đăng ký chưa tồn tại trên toàn hệ thống [14, 18].
- **Postconditions:** Tạo thành công bản ghi `Tenant`, tài khoản Owner mặc định, Chi nhánh chính (`Main Branch`) và kích hoạt bộ lọc EF Core Global Query Filter 

## 3. Main Success Flow
1. Người dùng nhập: Tên cửa hàng, Email, Số điện thoại, Mật khẩu.
2. Hệ thống kiểm tra tính duy nhất của Email/Số điện thoại
3. Hệ thống sinh mã `TenantId` (UUID/GUID) duy nhất 
4. Băm mật khẩu bằng thuật toán BCrypt/Argon2 (`NFR-SEC-01`) 
5. Lưu thông tin `Tenant`, `User` (Role = Owner) và `Branch` mặc định vào DB trong 1 Transaction 
6. Hệ thống gửi phản hồi đăng ký thành công (201 Created).

## 4. Alternative &amp; Exception Flows
- **2a. Email/Số điện thoại đã tồn tại:** Trả về lỗi 409 Conflict: `"Thông tin đăng ký đã được sử dụng."`
- **4a. Lỗi khởi tạo cơ sở dữ liệu:** Rollback giao dịch, trả về 500 Internal Server Error.

## 5. Business Rules &amp; NFRs
- **FR-AUTH-01:** Đăng ký cửa hàng thuê bao cô lập dữ liệu 
- **NFR-TENANT-01:** Mọi bảng vận hành phải chứa `TenantId` 

```