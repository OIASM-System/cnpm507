# Mô tả sơ đồ Use Case – Inventory Ledger & Stock Management

## 1. Mục đích
Sơ đồ mô tả các nghiệp vụ nhập hàng, chuyển kho, kiểm kê, theo dõi sổ cái tồn kho và tính giá vốn bình quân.

## 2. System Boundary
Ranh giới hệ thống là **Inventory Ledger & Stock Management Subsystem**.

## 3. Actors
- **Warehouse Staff:** thực hiện nghiệp vụ kho.
- **Store Manager:** giám sát và thực hiện các nghiệp vụ kho theo quyền được cấp.

## 4. Các Use Case
- **UC-INV-01: Create Goods Import Receipt:** tạo phiếu nhập hàng và ghi nhận hàng nhập.
- **UC-COST-01: Calculate Weighted Average Cost:** tính giá vốn bình quân gia quyền.
- **UC-INV-02: Process Warehouse Transfer:** xử lý chuyển hàng giữa các kho/chi nhánh.
- **UC-INV-03: Perform Physical Stocktake:** kiểm kê số lượng thực tế.
- **UC-INV-04: View Append-Only Inventory Ledger:** xem lịch sử giao dịch tồn kho không chỉnh sửa/xóa trực tiếp.
- **Generate Adjustment Ledger Entries:** tạo bút toán điều chỉnh khi kiểm kê phát hiện chênh lệch.

## 5. Quan hệ
- `Create Goods Import Receipt` **include** `Calculate Weighted Average Cost`: khi xác nhận phiếu nhập, hệ thống tính/cập nhật giá vốn bình quân theo quy tắc nghiệp vụ.
- `Perform Physical Stocktake` **include** `Generate Adjustment Ledger Entries`: phiên kiểm kê có thể cần ghi bút toán điều chỉnh cho phần chênh lệch. Nếu không có chênh lệch, bước điều chỉnh có thể không phát sinh; nhóm nên cân nhắc mô hình hóa điều kiện này trong đặc tả.

## 6. Quy tắc nghiệp vụ
- Sổ cái tồn kho là append-only; không sửa/xóa trực tiếp giao dịch đã ghi nhận.
- Điều chỉnh sai lệch được ghi bằng bút toán mới để giữ lịch sử kiểm toán.
- Chuyển kho cần ghi nhận xuất tại kho nguồn và nhập tại kho đích theo quy trình nhất quán.
- Các thay đổi số dư và giá vốn cần được lưu nhất quán trong giao dịch cơ sở dữ liệu.

## 7. Kết quả
Sơ đồ xác định các nghiệp vụ cốt lõi của phân hệ kho. Các quy tắc về trạng thái phiếu, kiểm soát tồn kho âm và xử lý giao dịch đồng thời cần được ghi rõ trong tài liệu thiết kế hệ thống.
