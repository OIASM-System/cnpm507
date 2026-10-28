# HƯỚNG DẪN SỬ DỤNG DÀNH CHO THU NGÂN QUẦY (CASHIER / POS OPERATOR)

1. GIỚI THIỆU
Ứng dụng Progressive Web App (PWA POS) được thiết kế tối ưu cho các thao tác cảm ứng, máy quét mã vạch và bán hàng tốc độ cao tại quầy.

2. ĐĂNG NHẬP & CHỌN CA LÀM VIỆC
• Mở ứng dụng POS trên trình duyệt hoặc biểu tượng PWA trên màn hình.
• Đăng nhập bằng Email/Số điện thoại và Mật khẩu được cấp.
• Chọn Chi nhánh làm việc tương ứng với quầy POS.

3. THAO TÁC BÁN HÀNG & QUÉT MÃ VẠCH FAST-CHECKOUT
• Thêm sản phẩm vào giỏ hàng:
  - Cách 1: Dùng máy quét mã vạch quét trực tiếp tem EAN-13/Code128 trên sản phẩm.
  - Cách 2: Nhập mã SKU hoặc Tên sản phẩm vào thanh tìm kiếm nhanh (Phím tắt F2).
  - Cách 3: Chọn trực tiếp từ danh mục sản phẩm hiển thị trên màn hình cảm ứng.
• Kiểm tra tồn kho khả dụng:
  Ứng dụng kiểm tra tức thì available = on_hand - reserved. Hệ thống sẽ chặn bán vượt nếu mặt hàng đã hết kho khả dụng (do đã bị giữ hàng cho đơn online).

4. QUY TRÌNH THANH TOÁN NGUYÊN TỬ (ATOMIC POS CHECKOUT)
Khi bấm Thanh toán (Phím tắt Enter / F9):
• Chọn phương thức thanh toán:
  - Tiền mặt: Nhập số tiền khách đưa, hệ thống tự tính tiền thừa trả lại.
  - Chuyển khoản QR Code: Hệ thống hiển thị mã QR động (VNPAY/VietQR). Thu ngân xác nhận khi nhận được tiền.
• Thực thi giao dịch nguyên tử (Atomic Transaction):
  Chuỗi Giữ hàng (Reserve) -> Xác nhận (Confirm) -> Trừ kho (Deduct) được thực thi trong một Database Transaction duy nhất.
• In hóa đơn:
  Cửa sổ in của trình duyệt tự động bật lên qua Browser Print API. Thu ngân nhấn Enter để in hóa đơn giao cho khách.

5. QUẢN LÝ GIỎ HÀNG TẠM GIỮ (HELD ORDERS)
• Trong trường hợp khách hàng quên đồ hoặc chờ thanh toán, thu ngân bấm Tạm giữ đơn (Phím tắt F4).
• Giỏ hàng sẽ được lưu vào danh sách đơn tạm giữ. Thu ngân có thể phục hồi lại đơn hàng bất kỳ lúc nào để tiếp tục thanh toán cho khách.