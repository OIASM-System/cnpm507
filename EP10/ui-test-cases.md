# CÁC CA KIỂM THỬ GIAO DIỆN & E2E (UI TEST CASES)

1. PHẠM VI KIỂM THỬ GIAO DIỆN
Sử dụng công cụ Playwright để tự động hóa kiểm thử luồng thao tác người dùng trên hai ứng dụng Web Frontend: Admin Dashboard và POS PWA.

2. CÁC KỊCH BẢN KIỂM THỬ E2E

Mã kịch bản: UI-POS-01
Luồng bán hàng cảm ứng và Thanh toán nhanh tại quầy POS (FR-POS-01, FR-POS-03)
• Tác nhân: Thu ngân (Cashier).
• Các bước thực hiện:
  1. Truy cập màn hình POS PWA và đăng nhập thành công.
  2. Bấm chọn 2 sản phẩm trên màn hình cảm ứng hoặc nhập mã vạch.
  3. Bấm phím F9 (Thanh toán) -> Chọn phương thức Tiền mặt -> Nhập số tiền khách đưa.
  4. Bấm Hoàn tất thanh toán.
• Kết quả kỳ vọng:
  - Màn hình thông báo Thanh toán thành công.
  - Hộp thoại in hóa đơn tự động bật mở qua Browser Print API.
  - Giỏ hàng tự động làm sạch để sẵn sàng cho đơn hàng tiếp theo.

Mã kịch bản: UI-ADM-01
Luồng tạo sản phẩm mới và tự động sinh biến thể SKU trên Admin Dashboard (FR-PROD-02)
• Tác nhân: Chủ cửa hàng (Owner).
• Các bước thực hiện:
  1. Mở Admin Dashboard -> Quản lý Sản phẩm -> Bấm Thêm sản phẩm.
  2. Nhập tên sản phẩm, chọn Danh mục, Thương hiệu.
  3. Thêm thuộc tính Màu sắc (Đỏ, Xanh) và Size (S, M).
  4. Bấm Tạo biến thể.
• Kết quả kỳ vọng: Màn hình hiển thị bảng 4 mã SKU tự động tạo kèm trường nhập giá bán và mã vạch.