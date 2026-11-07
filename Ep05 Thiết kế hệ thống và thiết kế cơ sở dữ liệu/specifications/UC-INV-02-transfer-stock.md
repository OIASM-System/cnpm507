# Use Case Specification: UC-INV-02 Transfer Stock

## 1. Details
- **ID & Name:** `UC-INV-02 Transfer Stock`
- **Primary Actor:** **Nhân viên kho (Warehouse Staff)**
- **Goal in Context:** Chuyển tồn kho giữa Chi nhánh A và Chi nhánh B theo quy trình 2 bước để kiểm soát hàng vận chuyển.

## 2. Main Success Flow
1. **Bước 1 (Xuất kho vận chuyển):** Chi nhánh A xuất hàng $\rightarrow$ giảm `on_hand` A, ghi nhật ký Sổ cái loại `TRANSFER_OUT`.
2. Trạng thái phiếu chuyển kho là `In-Transit`.
3. **Bước 2 (Nhận kho xác nhận):** Nhân viên Chi nhánh B kiểm hàng thực tế $\rightarrow$ tăng `on_hand` B, ghi nhật ký Sổ cái loại `TRANSFER_IN`.
4. Trạng thái phiếu chuyển chuyển thành `Completed`.

## 3. Business Rules & NFRs
- **FR-INV-03:** Quy trình chuyển kho 2 bước (Xuất kho vận chuyển $\rightarrow$ Nhập kho xác nhận).