1.Quy ước đặt tên
Tên bảng: Sử dụng chữ hoa, phân tách bằng dấu gạch dưới như APP_USER, ORDER_ITEM.
Tên cột: Sử dụng chữ thường, phân tách bằng dấu gạch dưới như tenant_id, created_at, unit_price.
Khóa chính: Luôn đặt tên cột là id với kiểu dữ liệu BIGSERIAL.
Khóa ngoại: Đặt tên theo định dạng ten_bang_chinh_id như tenant_id, branch_id, product_id.
2.Quy ước kiểu dữ liệu
Định danh: Sử dụng BIGSERIAL cho khóa chính và BIGINT cho khóa ngoại.
Văn bản: Sử dụng VARCHAR cho chuỗi ngắn và TEXT cho mô tả dài.
Số tiền và giá trị tài chính: Luôn sử dụng DECIMAL với độ chính xác cao để tránh sai số.
Thời gian: Sử dụng TIMESTAMP WITH TIME ZONE cho các mốc thời gian tạo hoặc cập nhật.
Trạng thái: Sử dụng VARCHAR hoặc BOOLEAN tùy theo nghiệp vụ.
3.Quy ước chỉ mục và ràng buộc
Chỉ mục: Đặt chỉ mục cho tất cả các cột khóa ngoại và các cột thường xuyên dùng để tìm kiếm như barcode, created_at.
Ràng buộc toàn vẹn: Đảm bảo thiết lập đầy đủ quan hệ khóa ngoại giữa các bảng để duy trì tính nhất quán dữ liệu.
