# CÁC CA KIỂM THỬ TÍCH HỢP (INTEGRATION TEST CASES)

1. PHẠM VI KIỂM THỬ TÍCH HỢP
Kiểm thử sự tương tác chuẩn xác giữa tệp mã Backend, Cơ sở dữ liệu PostgreSQL thực, Cơ chế khóa Database và Các tác vụ nền.

2. DANH SÁCH CA KIỂM THỬ TÍCH HỢP CỐT LÕI

Mã ca kiểm thử: IT-INV-01
Tạo Phiếu nhập kho và ghi nhận Sổ cái tự động (FR-INV-02)
• Đầu vào: Đơn nhập hàng chứa SKU-001, Số lượng = 20, Đơn giá nhập = 150.000 VND.
• Các bước thực hiện:
  1. Gửi Command CreateGoodsReceiptCommand qua MediatR.
  2. Truy vấn Database xác minh bảng InventoryBalance và InventoryLedger.
• Kết quả kỳ vọng:
  - Cột on_hand của SKU-001 tăng thêm 20.
  - Một dòng bản ghi mới xuất hiện trong bảng InventoryLedger với Type = IN, ReferenceId = Mã phiếu nhập.
  - Giá vốn WAC được cập nhật tự động.

Mã ca kiểm thử: IT-ORD-01
Quy trình Tiếp nhận Đơn hàng TMĐT và Giữ hàng chống bán vượt (FR-ORD-01, FR-RSE-02)
• Đầu vào: Payload đơn hàng giả lập từ Shopee chứa SKU-001, Số lượng mua = 2.
• Các bước thực hiện:
  1. Gọi API Webhook Ingest Order.
  2. Kiểm tra trạng thái đơn hàng trong DB.
• Kết quả kỳ vọng:
  - Đơn hàng tạo thành công với trạng thái Reserved.
  - Chỉ số reserved của SKU-001 tăng thêm 2, chỉ số available giảm đi 2.
  - Chuỗi giao dịch tuân thủ ACID.