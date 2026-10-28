# HƯỚNG DẪN SỬ DỤNG DÀNH CHO NHÂN VIÊN KHO & QUẢN LÝ ĐƠN HÀNG

1. TỔNG QUAN VAI TRÒ
Nhân viên kho và Quản lý đơn hàng (Staff) chịu trách nhiệm vận hành các nghiệp vụ liên quan đến biến động tồn kho, nhập xuất kho, kiểm kê và xử lý vòng đời đơn hàng đa kênh trên Admin Dashboard.

2. QUẢN LÝ PHIẾU NHẬP HÀNG (GOODS RECEIPT & WAC)
• Quy trình nhập hàng từ Nhà cung cấp:
  - Vào menu Quản lý Tồn kho -> Phiếu nhập hàng -> Tạo mới.
  - Chọn Nhà cung cấp, Chi nhánh nhập kho.
  - Tìm kiếm SKU, nhập Số lượng nhập và Đơn giá nhập.
  - Nhấn Xác nhận nhập kho.
• Cơ chế tính Giá vốn Bình quân Gia quyền (Weighted Average Cost - WAC):
  Khi xác nhận phiếu nhập, hệ thống tự động tính lại giá vốn cho SKU theo công thức:
  Giá vốn mới = [(Tồn cũ x Giá vốn cũ) + (SL nhập x Giá nhập)] / (Tồn cũ + SL nhập)
  Tồn kho thực tế (on_hand) tự động tăng lên và giao dịch được ghi vào Sổ cái.

3. QUY TRÌNH CHUYỂN KHO (STOCK TRANSFER)
Quy trình chuyển hàng giữa Chi nhánh A và Chi nhánh B gồm 2 bước nghiêm ngặt:
• Bước 1 (Xuất chuyển kho): Nhân viên Chi nhánh A tạo phiếu chuyển kho -> Hàng chuyển sang trạng thái In-Transit (Tồn on_hand kho A giảm).
• Bước 2 (Xác nhận nhập kho): Nhân viên Chi nhánh B kiểm tra hàng thực nhận -> Nhấn Xác nhận -> Tồn on_hand kho B tăng.

4. KIỂM KÊ TỒN KHO THỰC TẾ (STOCKTAKE)
• Tạo Phiếu kiểm kê cho chi nhánh/kho cụ thể.
• Nhập Số lượng đếm thực tế cho từng SKU.
• Hệ thống đối chiếu số dư trên phần mềm và tạo bút toán điều chỉnh (Adjustment Ledger Entry) để cân bằng tồn kho.

5. THEO DÕI SỔ CÁI TỒN KHO CHỈ GHI THÊM (APPEND-ONLY INVENTORY LEDGER)
• Mọi biến động tồn kho (Nhập, Xuất, Bán, Trả hàng, Chuyển kho, Điều chỉnh) đều được ghi vào bảng InventoryTransaction.
• Đặc tính: Nghiêm cấm mọi hành vi UPDATE hoặc DELETE dòng sổ cái. Việc sửa lỗi được thực hiện bằng bút toán bù trừ mới để đảm bảo tính kiểm toán 100%.

6. XỬ LÝ ĐƠN HÀNG TẬP TRUNG (CENTRALIZED ORDER HUB)
• Theo dõi các đơn hàng đổ về từ sàn TMĐT (Shopee, TikTok, Lazada) và POS.
• Chuyển trạng thái đơn hàng theo máy trạng thái: Draft -> Reserved -> Confirmed -> Completed (hoặc Cancelled).