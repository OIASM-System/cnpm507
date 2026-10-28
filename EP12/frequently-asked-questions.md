# THẮC MẮC THƯỜNG GẶP & XỬ LÝ SỰ CỐ (FAQ & TROUBLESHOOTING)

1. CÂU HỎI THƯỜNG GẶP (FAQ)

Tại sao chỉ số on_hand và available của sản phẩm lại khác nhau?
• Trả lời: 
  - on_hand là tổng số lượng hàng thực tế đang có trong kho.
  - reserved là số lượng hàng đang được giữ cho các đơn hàng online chưa xác nhận/chưa xuất kho.
  - available = on_hand - reserved là số lượng hàng thực sự còn rảnh rỗi để bán tại POS hoặc tiếp nhận đơn mới.

Tại sao hệ thống không cho phép sửa hoặc xóa phiếu nhập kho/dòng sổ cái?
• Trả lời: Hệ thống OISM áp dụng nguyên tắc Append-Only Inventory Ledger để đảm bảo khả năng kiểm toán 100%. Mọi điều chỉnh kho phải được thực hiện bằng cách tạo một phiếu điều chỉnh (Adjustment) hoặc giao dịch bù trừ mới.

Cơ chế chống bán vượt (Anti-Oversell) hoạt động như thế nào khi Flash Sale?
• Trả lời: Khi nhiều đơn hàng đồng thời nhắm vào 1 SKU, hệ thống áp dụng cơ chế khóa ở cấp Database (Pessimistic Locking / Optimistic Locking). Nếu available < Số lượng mua, đơn hàng đến sau sẽ bị từ chối ngay lập tức.

2. HƯỚNG DẪN XỬ LÝ SỰ CỐ (TROUBLESHOOTING)

Sự cố 1: Đơn hàng online quá hạn giữ hàng nhưng không tự động giải phóng tồn kho
• Nguyên nhân: Tác vụ xử lý nền Hangfire (ExpiredReservationJob) bị gián đoạn.
• Khắc phục: 
  - Kiểm tra trạng thái dịch vụ Hangfire tại trang Dashboard Admin (/hangfire).
  - Bấm chạy thủ công công việc Trigger Expired Reservation Cleanup.

Sự cố 2: Máy quét mã vạch quét nhưng không tự động thêm sản phẩm tại POS
• Nguyên nhân: Máy quét chưa được cấu hình ký tự kết thúc Enter (CR/LF).
• Khắc phục: Quét mã vạch cấu hình Add Enter Suffix trong sách hướng dẫn kèm theo của máy quét.

Sự cố 3: Không thể in hóa đơn từ trình duyệt tại quầy POS
• Nguyên nhân: Trình duyệt đang chặn cửa sổ Bật lên (Pop-up) của Browser Print API.
• Khắc phục: Cho phép hiển thị Pop-up và Tự động điều hướng in cho trang web POS trên trình duyệt.