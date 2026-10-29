# MẪU BÁO CÁO LỖI (DEFECT REPORT TEMPLATE)

1. THÔNG TIN BÁO CÁO LỖI
• Mã lỗi (Defect ID): DEF-OISM-001
• Tóm tắt lỗi (Summary): Lỗi lệch giá vốn COGS khi nhập hàng số lượng lớn với đơn giá lẻ.
• Phân hệ (Module): Inventory / Goods Receipt
• Mức độ nghiêm trọng (Severity): Critical / High / Medium / Low
• Độ ưu tiên xử lý (Priority): P1 / P2 / P3 / P4
• Người phát hiện (Reporter): Tester Name
• Người xử lý (Assignee): Developer Name
• Trạng thái (Status): New / Open / In Progress / Resolved / Verified / Closed

2. CHI TIẾT CÁC BƯỚC TÁI HIỆN LỖI (STEPS TO REPRODUCE)
• Bước 1: Đăng nhập vào Admin Dashboard với tài khoản Staff.
• Bước 2: Vào menu Quản lý Tồn kho -> Phiếu nhập hàng -> Tạo phiếu mới.
• Bước 3: Nhập SKU-005 với Số lượng = 3, Đơn giá nhập = 33.333,33 VND.
• Bước 4: Bấm Xác nhận nhập kho và kiểm tra giá vốn hiển thị trên hệ thống.

3. KẾT QUẢ THỰC TẾ VS KẾT QUẢ KỲ VỌNG
• Kết quả thực tế (Actual Result): Giá vốn bình quân mới bị làm tròn sai chữ số thập phân, dẫn đến chênh lệch 1 VND trên sổ cái.
• Kết quả kỳ vọng (Expected Result): Hệ thống phải giữ nguyên độ chính xác 4 chữ số thập phân khi tính toán trung gian trước khi hiển thị.

4. TỆP ĐÍNH KÈM & LOGS (ATTACHMENTS & LOGS)
• Đính kèm ảnh chụp màn hình console log và bản ghi trong bảng InventoryLedger.