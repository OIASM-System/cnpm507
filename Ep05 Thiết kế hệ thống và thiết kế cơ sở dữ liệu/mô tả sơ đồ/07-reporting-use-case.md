# Mô tả sơ đồ Use Case – Reporting & AI Demand Forecasting

## 1. Mục đích
Sơ đồ mô tả các chức năng báo cáo kinh doanh, theo dõi tồn kho, cảnh báo thiếu hàng và hỗ trợ dự báo nhu cầu/đề xuất nhập hàng.

## 2. System Boundary
Ranh giới là **Reporting & AI Demand Forecasting Subsystem**.

## 3. Actors
- **Store Owner / Admin:** xem báo cáo doanh thu, lợi nhuận, định giá tồn kho và dự báo phục vụ quản trị.
- **Store Manager:** theo dõi báo cáo vận hành và cảnh báo tồn kho trong phạm vi được phân quyền.

## 4. Các Use Case
- **UC-REP-01: View Revenue & Gross Profit Report:** xem doanh thu và lợi nhuận gộp.
- **UC-REP-02: View Inventory Valuation & Turnover:** xem giá trị tồn kho và tốc độ luân chuyển hàng.
- **UC-REP-03: Real-time SignalR Low Stock Alert:** nhận cảnh báo tồn kho thấp theo thời gian thực thông qua SignalR.
- **UC-AI-01: View AI Reorder & Demand Forecast:** xem dự báo nhu cầu và đề xuất nhập hàng do thành phần AI hỗ trợ.

## 5. Quy tắc dữ liệu và nghiệp vụ
- Báo cáo phải áp dụng bộ lọc tenant và phạm vi chi nhánh theo quyền người dùng.
- Doanh thu, giá vốn và lợi nhuận gộp cần dùng định nghĩa thống nhất với nghiệp vụ bán hàng/COGS.
- Giá trị tồn kho và turnover cần nêu rõ công thức, khoảng thời gian và thời điểm chốt dữ liệu.
- Cảnh báo SignalR là thông báo thời gian thực; dữ liệu cảnh báo/trạng thái quan trọng vẫn cần được lưu bền vững nếu nghiệp vụ yêu cầu.
- Dự báo AI nên trình bày khoảng thời gian dự báo, dữ liệu đầu vào và giới hạn của kết quả; đề xuất nhập hàng không tự động thay thế quyết định phê duyệt của người có quyền trừ khi có yêu cầu rõ ràng.

## 6. Kết quả
Sơ đồ xác định phạm vi báo cáo và dự báo. Công thức KPI, ngưỡng cảnh báo, nguồn dữ liệu và cách đánh giá độ chính xác dự báo cần được định nghĩa trong tài liệu yêu cầu/thiết kế chi tiết.
