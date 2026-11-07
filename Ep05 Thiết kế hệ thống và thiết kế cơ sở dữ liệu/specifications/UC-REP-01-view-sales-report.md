# Use Case Specification: UC-REP-01 View Sales & Gross Profit Report

## 1. Details
- **ID & Name:** `UC-REP-01 View Sales & Gross Profit Report`
- **Primary Actor:** **Chủ cửa hàng / Quản lý (Owner / Manager)**
- **Goal in Context:** Phân tích Doanh thu thuần, Tổng COGS (dựa trên snapshots) và Lợi nhuận gộp.

## 2. Main Success Flow
1. Quản lý chọn bộ lọc: Khoảng thời gian, Chi nhánh, Kênh bán, SKU.
2. Hệ thống tổng hợp dữ liệu (thời gian phản hồi < 2s cho < 100.000 bản ghi theo `NFR-PERF-01`).
3. Tính toán Lợi nhuận gộp theo công thức:
   $$\text{Gross Profit} = \text{Revenue} - \text{COGS}$$
4. Hiển thị báo cáo bảng dữ liệu 