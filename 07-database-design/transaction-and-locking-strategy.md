Chiến lược giao dịch và khóa dữ liệu (Transaction & Locking Strategy) - Hệ thống POS Đa chi nhánh

Tài liệu này quy định các cấp độ cô lập giao dịch (Transaction Isolation Levels) và chiến lược khóa (Locking Strategy) nhằm đảm bảo tính toàn vẹn dữ liệu và tránh tranh chấp tài nguyên khi nhiều chi nhánh cùng truy cập.

1. Cấp độ cô lập giao dịch (Transaction Isolation Levels)
- Mặc định hệ thống sử dụng cấp độ Read Committed cho các truy vấn xem dữ liệu thông thường (xem danh sách sản phẩm, báo cáo).
- Sử dụng cấp độ Repeatable Read hoặc Serializable đối với các giao dịch bán hàng tại quầy, nhập kho, điều chuyển kho và thanh toán để tránh hiện tượng đọc dữ liệu rác (Dirty Read) hoặc dữ liệu bóng ma (Phantom Read).

2. Chiến lược khóa dữ liệu (Locking Strategy)

Khoá lạc quan (Optimistic Locking)
- Áp dụng cho các bảng ít xảy ra xung đột đồng thời như: cập nhật thông tin sản phẩm, thông tin khách hàng, nhà cung cấp.
- Cơ chế: Sử dụng cột version (số nguyên) hoặc updated_at. Khi UPDATE, hệ thống kiểm tra nếu version không đổi mới tiến hành ghi dữ liệu.

Khoá bi quan (Pessimistic Locking)
- Áp dụng cho các nghiệp vụ biến động kho và số dư thanh toán tại quầy POS (tránh bán quá số lượng tồn kho khi nhiều thu ngân cùng chọn 1 mặt hàng).
- Cơ chế: Sử dụng câu lệnh SELECT ... FOR UPDATE trên dòng dữ liệu tồn kho (inventory_balance) trong thời gian xử lý thanh toán đơn hàng.

3. Quy tắc phòng tránh bế tắc (Deadlock Prevention)
- Tất cả các giao dịch tác động lên nhiều bảng phải truy cập và khóa các bảng theo đúng một thứ tự cố định.
- Thiết lập thời gian chờ tối đa cho khóa (lock_timeout = 15 seconds) để tự động hủy giao dịch nếu bị nghẽn quá lâu, tránh làm treo hệ thống POS.