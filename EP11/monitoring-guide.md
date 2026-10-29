# HƯỚNG DẪN GIÁM SÁT HỆ THỐNG (MONITORING GUIDE)

1. TỔNG QUAN GIÁM SÁT
Hệ thống OISM tích hợp giải pháp giám sát toàn diện gồm: Health Checks (.NET), Prometheus (Thu thập chỉ số Metric) và Grafana (Giao diện hiển thị Biểu đồ).

2. GIÁM SÁT SỨC KHỎE API (HEALTH CHECKS)
• Endpoint kiểm tra sức khỏe tổng thể: GET /health
• Endpoint kiểm tra kết nối Database: GET /health/ready
• HTTP Status 200 OK đại diện cho trạng thái Healthy. Nếu kết nối Database bị gián đoạn, API trả về HTTP Status 539 Unhealthy.

3. THU THẬP METRICS VỚI PROMETHEUS & GRAFANA
• Prometheus Endpoint: GET /metrics
• Các chỉ số cốt lõi cần theo dõi trên Grafana Dashboard:
  - HTTP Request Rate & Latency (Độ trễ p95, p99 của API).
  - Database Connection Pool Usage (Số lượng kết nối đang sử dụng tới PostgreSQL).
  - Hangfire Pending / Failed Jobs Count (Số lượng tác vụ ngầm bị lỗi hoặc nghẽn).
  - Active SignalR Connections (Số lượng kết nối thời gian thực đang duy trì với POS PWA).