1.Mô hình kiến trúc cô lập dữ liệu
Hệ thống áp dụng mô hình Shared Database và Shared Schema kết hợp với cột phân định tenant_id trên mọi bảng dữ liệu.
Mô hình này tối ưu chi phí hạ tầng, dễ dàng mở rộng và bảo trì, đồng thời đảm bảo hiệu suất truy vấn cao cho ứng dụng PWA.
2.Cơ chế phân tách dữ liệu theo Tenant
Cột định danh tenant_id bắt buộc xuất hiện trong tất cả các bảng dữ liệu nghiệp vụ ngoại trừ bảng tenant gốc.
Mọi câu lệnh truy vấn SQL từ ứng dụng đều phải kèm theo điều kiện lọc theo tenant_id của người dùng đang đăng nhập.
3.Phân quyền và kiểm soát theo chi nhánh
Bên cạnh tenant_id, các bảng dữ liệu vận hành tại cửa hàng như đơn hàng, tồn kho, người dùng đều gắn thêm trường branch_id để phân quyền chi nhánh.
Thu ngân hoặc quản lý cửa hàng chỉ có quyền truy cập dữ liệu thuộc chi nhánh được phân công, ngăn chặn rò rỉ thông tin giữa các cơ sở kinh doanh.
