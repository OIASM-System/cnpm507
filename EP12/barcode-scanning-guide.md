# HƯỚNG DẪN CẤU HÌNH & SỬ DỤNG MÁY QUÉT MÁ VẠCH

1. CHUẨN MÃ VẠCH HỖ TRỢ
Hệ thống OISM hỗ trợ 2 chuẩn mã vạch thông dụng nhất trong bán lẻ:
• EAN-13: Áp dụng cho các sản phẩm thương mại tiêu chuẩn (13 chữ số).
• Code128: Áp dụng cho mã vạch nội bộ cửa hàng, hỗ trợ cả chữ cái và chữ số.

2. CẤU HÌNH MÁY QUÉT MÃ VẠCH
• Thiết bị hỗ trợ: Các loại máy quét mã vạch 1D/2D cổng USB hoặc Bluetooth.
• Chế độ cấu hình: Đặt máy quét ở chế độ Keyboard Wedge (HID Mode).
• Ký tự kết thúc (Suffix): Cấu hình máy quét tự động gửi phím Enter (CR/LF) sau khi quét mã vạch để POS tự động thêm sản phẩm vào giỏ hàng mà không cần bấm chuột.

3. QUY TRÌNH TẠO & IN TEM MÃ VẠCH SKU
• Tại Admin Dashboard, truy cập Quản lý Sản phẩm -> Mã vạch.
• Chọn tự động sinh mã vạch EAN-13/Code128 cho các SKU chưa có mã.
• Chọn danh sách SKU cần in tem -> Nhập số lượng tem cần in.
• Chọn khổ giấy in tem (khổ 2 tem/hàng hoặc 3 tem/hàng) -> Nhấn In tem mã vạch.