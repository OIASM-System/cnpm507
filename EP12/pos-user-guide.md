# HƯỚNG DẪN CHI TIẾT ỨNG DỤNG BÁN HÀNG PROGRESSIVE WEB APP (POS PWA)

1. GIỚI THIỆU TÍNH NĂNG PWA
Ứng dụng POS PWA tích hợp các công nghệ web hiện đại:
• Hoạt động mượt mà trên máy tính để bàn, máy tính bảng (iPad/Android Tablet) và thiết bị POS cầm tay.
• Hỗ trợ cài đặt trực tiếp lên màn hình chính (Add to Home Screen) như ứng dụng native.
• Tích hợp Service Worker giúp lưu trữ bộ nhớ đệm (Cache), tối ưu tốc độ tải dưới 200ms.

2. HƯỚNG DẪN CÀI ĐẶT PWA
• Mở trình duyệt Chrome/Safari/Edge và truy cập đường dẫn POS PWA.
• Nhấp vào biểu tượng Cài đặt trên thanh địa chỉ (hoặc menu trình duyệt -> Thêm vào màn hình chính).
• Mở ứng dụng POS từ biểu tượng ngoài màn hình Desktop/App Drawer.

3. KHẢ NĂNG VẬN HÀNH KHI MẤT KẾT NỐI (OFFLINE RESILIENCE)
• Khi bị ngắt kết nối Internet tạm thời, Service Worker duy trì giao diện bán hàng và danh mục sản phẩm đã được cache.
• Khi có kết nối lại, hệ thống tự động đồng bộ danh sách đơn hàng và trạng thái tồn kho với máy chủ Backend.

4. TÍCH HỢP THÔNG BÁO THỜI GIAN THỰC (SIGNALR)
POS PWA kết nối SignalR Hub để nhận thông báo âm thanh và popup cảnh báo lập tức khi:
• Có đơn hàng online mới vào hệ thống.
• Một mặt hàng vừa bị giữ hết kho khả dụng.