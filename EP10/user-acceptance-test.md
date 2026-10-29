# KIỂM THỬ CHẤP NHẬN NGƯỜI DÙNG (USER ACCEPTANCE TEST - UAT)

1. TỔNG QUAN UAT
Kế hoạch kiểm thử chấp nhận người dùng được thực hiện bởi Đại diện Chủ cửa hàng, Quản lý kho và Thu ngân trên môi trường Staging giống hệt Production.

2. KỊCH BẢN UAT THEO LUỒNG NGHIỆP VỤ THỰC TẾ (END-TO-END BUSINESS FLOW)

Mã kịch bản UAT: UAT-FLOW-01
Luồng nghiệp vụ trọn vẹn: Nhập kho -> Đồng bộ bán đa kênh -> Thanh toán quầy & Báo cáo
• Bước 1: Chủ cửa hàng tạo tài khoản cho Nhân viên kho và Thu ngân.
• Bước 2: Nhân viên kho tạo Phiếu nhập 50 chiếc Áo thun với giá nhập 100.000 VND -> Kiểm tra giá vốn WAC cập nhật chính xác.
• Bước 3: Đơn hàng từ Shopee tự động đổ về mua 2 chiếc -> Kiểm tra hệ thống tự động giữ hàng (reserved = 2, available = 48).
• Bước 4: Thu ngân tại quầy POS mở ứng dụng, quét mã vạch bán 1 chiếc -> Thanh toán Tiền mặt & in hóa đơn.
• Bước 5: Quản lý vào Admin Dashboard duyệt đơn Shopee -> Kiểm tra tồn kho $on\_hand$ giảm chính xác.
• Bước 6: Chủ cửa hàng mở Báo cáo Doanh thu & Lợi nhuận gộp -> Kiểm tra số liệu Doanh thu, COGS và Lợi nhuận gộp hiển thị chính xác.
• Đánh giá UAT: Bấm PASSED nếu toàn bộ 6 bước hoạt động trôi chảy, không phát sinh lỗi lệch kho.