# Tenant Registration Process

## Mục đích
Cho phép chủ cửa hàng đăng ký hệ thống mới và tạo Tenant độc lập.

## Tác nhân
- Owner
- Authentication Service

## Tiền điều kiện
- Email hoặc số điện thoại chưa tồn tại.

## Luồng chính
1. Người dùng truy cập trang đăng ký.
2. Nhập tên cửa hàng, email/SĐT, mật khẩu.
3. Hệ thống kiểm tra dữ liệu.
4. Tạo Tenant, Owner, chi nhánh mặc định.
5. Mã hóa mật khẩu.
6. Lưu dữ liệu.
7. Trả JWT.
8. Chuyển Dashboard.
