# CÁC KỊCH BẢN KIỂM THỬ ĐỒNG THỜI & CHỐNG BÁN VƯỢT (CONCURRENCY & ANTI-OVERSELL TEST CASES)

1. TỔNG QUAN KIỂM THỬ ĐỒNG THỜI
Phân hệ xử lý đồng thời tập trung kiểm thử độ chịu tải và cơ chế khóa cơ sở dữ liệu (Pessimistic Locking / Optimistic Locking) nhằm ngăn chặn tuyệt đối tình trạng tồn kho khả dụng âm khi xảy ra Flash Sale.

2. CÁC KỊCH BẢN KIỂM THỬ ĐIỂN HÌNH

Mã kịch bản: TC-CONC-01
Tên kịch bản: Kiểm thử Flash Sale 50 đơn hàng đồng thời mua 1 SKU còn tồn kho khả dụng = 1
• Mục tiêu: Xác minh cơ chế chống bán vượt (FR-RSE-02, NFR-PERF-02).
• Điều kiện tiên quyết: SKU-001 tại Chi nhánh A có on_hand = 1, reserved = 0 -> available = 1.
• Các bước thực hiện:
  1. Sử dụng công cụ k6 gửi đồng thời 50 request tạo đơn hàng chứa SKU-001 (số lượng = 1) vào API Ingest Order.
  2. Ghi nhận phản hồi từ hệ thống và kiểm tra trạng thái cơ sở dữ liệu.
• Kết quả kỳ vọng:
  - Duy nhất 1 đơn hàng nhận phản hồi 200 OK và chuyển sang trạng thái Reserved.
  - 49 đơn hàng còn lại nhận phản hồi 400 Bad Request hoặc 409 Conflict với thông báo "Tồn kho khả dụng không đủ".
  - Tồn kho khả dụng (available) giảm về 0, không bao giờ bị âm.

Mã kịch bản: TC-CONC-02
Tên kịch bản: Kiểm thử đồng thời giữa Thu ngân POS checkout và Đơn online giữ hàng
• Mục tiêu: Đảm bảo giao diện POS bị chặn bán vượt ngay khi đơn online vừa giữ hàng.
• Điều kiện tiên quyết: SKU-002 có available = 1.
• Các bước thực hiện:
  1. Đơn online từ Shopee gửi webhook vào hệ thống thực thi giữ hàng (Reserve) SKU-002.
  2. Cùng thời điểm (độ lệch < 50ms), Thu ngân tại quầy bấm Thanh toán SKU-002 trên PWA POS.
• Kết quả kỳ vọng:
  - Nếu đơn online giữ hàng thành công trước, màn hình POS lập tức cảnh báo "Sản phẩm vừa hết hàng khả dụng" và chặn giao dịch POS.
  - Chuỗi giao dịch Atomic POS Checkout đảm bảo không vi phạm ràng buộc ACID.

Mã kịch bản: TC-CONC-03
Tên kịch bản: Hủy đơn hàng giữ hàng quá hạn (Expired Reservation Job)
• Mục tiêu: Kiểm tra tác vụ nền Hangfire giải phóng hàng giữ tự động (FR-SIM-03).
• Các bước thực hiện:
  1. Tạo đơn hàng online thành công, hàng chuyển sang trạng thái Reserved (reserved = 2).
  2. Đợi hết thời gian giữ hàng cấu hình (15 phút) mà đơn không được Confirmed.
  3. Kiểm tra tác vụ ngầm Hangfire ExpiredReservationJob.
• Kết quả kỳ vọng:
  - Trạng thái đơn chuyển sang Cancelled.
  - Số lượng reserved giảm đi 2, trả lại tồn kho khả dụng (available) cho hệ thống.