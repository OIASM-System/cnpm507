# CÁC CA KIỂM THỬ HIỆU NĂNG (PERFORMANCE TEST CASES)

1. MỤC TIÊU KIỂM THỬ HIỆU NĂNG
Đo lường thời gian phản hồi API (Latency), thông lượng xử lý (Throughput) và độ ổn định của hệ thống OISM dưới tải trọng cao theo các chỉ tiêu NFR-PERF.

2. CÁC KỊCH BẢN KIỂM THỬ BẰNG K6

Mã kịch bản: PERF-POS-01
Đo thời gian phản hồi API quét mã vạch POS (NFR-PERF-01)
• Điều kiện tải: 100 VUs (Virtual Users) giả lập 100 thu ngân quét mã vạch đồng thời trong 5 phút.
• Chỉ tiêu chấp nhận (Pass Criteria):
  - Độ trễ phản hồi p95 < 200ms.
  - Tỷ lệ lỗi HTTP Error Rate < 0.1%.

Mã kịch bản: PERF-REP-01
Đo thời gian tổng hợp báo cáo Doanh thu & Lợi nhuận gộp (NFR-PERF-01)
• Điều kiện dữ liệu: Cơ sở dữ liệu chứa 100.000 bản ghi đơn hàng và dòng sổ cái.
• Hành động: Gửi request xuất Báo cáo Lợi nhuận gộp lọc theo khoảng thời gian 1 năm.
• Chỉ tiêu chấp nhận: Thời gian API trả về kết quả < 2.0 giây.