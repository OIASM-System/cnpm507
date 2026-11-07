# Use Case Specification: UC-PROD-04 Manage Barcodes & Listed Prices

## 1. Details
- **ID & Name:** `UC-PROD-04 Manage Barcodes & Listed Prices`
- **Primary Actor:** **Nhân viên (Staff)**
- **Goal in Context:** Gán mã vạch (EAN-13/Code128) và thiết lập giá bán lẻ, giá bán sỉ tách biệt hoàn toàn với Giá vốn (COGS).

## 2. Main Success Flow
1. Staff quét mã vạch thiết bị hoặc nhập chuỗi Barcode cho SKU.
2. Nhập Giá bán lẻ (Retail Price) và Giá bán sỉ (Wholesale Price).
3. Hệ thống lưu Barcode và Giá niêm yết vào SKU.

## 3. Business Rules & NFRs
- **FR-PROD-03:** Mã vạch dùng cho quét máy POS.
- **FR-PROD-04:** Giá niêm yết tách biệt hoàn toàn với COGS (Giá vốn WAC).