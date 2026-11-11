# Acceptance Criteria – Backend Tools

## WEB-01 Webhook Simulator
- Gửi được payload cho 3 platform: Shopee, TikTok Shop, Lazada.
- Mỗi event có eventId duy nhất.
- Ghi lại HTTP status, response/error và latency.
- Không ghi nhận HTTP 2xx là bằng chứng đơn hàng đã reserve thành công nếu không xác minh response nghiệp vụ.

## CON-01 Concurrency Runner
- Chạy được tối thiểu 50 request đồng thời cùng SKU/branch.
- Báo cáo total/success/failure, latency average/p95/max và throughput.
- Kịch bản tồn kho ban đầu N, tổng lượng đặt > N: tổng lượng được xác nhận không được vượt N.
- Tồn kho khả dụng không âm: available = on_hand - reserved >= 0.
- Các request bị từ chối do hết hàng là kết quả hợp lệ, không phải lỗi công cụ.

## DAT-01 Data Generator
- Sinh được tenant, branch, product, SKU, inventory và order có quan hệ nhất quán.
- ID duy nhất; SKU thuộc đúng tenant; inventory gắn branch và SKU cùng tenant.
- Xuất JSON trước; seed API chỉ bật sau khi mapping DTO theo Swagger.
- Không seed production.

## Evidence cần nộp
- README hướng dẫn.
- File cấu hình mẫu không chứa secret.
- Payload JSON mẫu.
- Một báo cáo webhook.
- Một báo cáo concurrency.
- Một bộ dữ liệu demo JSON.
- Ảnh chụp chạy thành công hoặc log CI.
