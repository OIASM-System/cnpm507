# Mô tả sơ đồ Use Case – Centralized Order Hub & Anti-Oversell

## 1. Mục đích
Sơ đồ mô tả tiếp nhận đơn hàng đa kênh và các chức năng quản lý trạng thái đơn, giữ hàng, xác nhận đơn và hủy đơn để hạn chế tình trạng bán vượt tồn kho.

## 2. System Boundary
Ranh giới là **Centralized Order Hub & Anti-Oversell Subsystem**.

## 3. Actors
- **E-Com Platform / Simulator:** gửi dữ liệu đơn hàng từ kênh thương mại điện tử hoặc payload mô phỏng.
- **Store Manager:** theo dõi và xử lý đơn hàng theo quyền nghiệp vụ.

## 4. Các Use Case
- **UC-ORD-01: Ingest Multi-Channel Order:** tiếp nhận đơn từ nhiều kênh.
- **UC-RSE-02: Execute Anti-Oversell Stock Reserve:** giữ lượng tồn kho cần thiết cho đơn.
- **UC-ORD-02: Transition Order State Machine:** quản lý chuyển trạng thái đơn theo quy tắc hợp lệ.
- **UC-ORD-03: Confirm Order & Deduct Stock:** xác nhận đơn và cập nhật tồn kho.
- **UC-RSE-03: Cancel Order & Release Reserve:** hủy đơn và giải phóng lượng hàng đang giữ.
- **UC-SIM-01: Simulate E-Com Webhook Payload:** mô phỏng payload webhook để kiểm thử tích hợp.

## 5. Quan hệ
- `UC-ORD-01: Ingest Multi-Channel Order` **include** `UC-RSE-02: Execute Anti-Oversell Stock Reserve`: việc tiếp nhận đơn được thiết kế để gọi quy trình giữ hàng theo quan hệ thể hiện trên sơ đồ.
- Các Use Case còn lại mô tả những hành vi liên quan trong vòng đời đơn hàng. Sơ đồ hiện tại không thể hiện rõ tất cả các đường liên kết giữa chúng; cần bổ sung Association và quan hệ phụ thuộc nếu đó là ý định thiết kế.

## 6. Quy tắc nghiệp vụ trọng tâm
- Lượng có thể bán được tính theo `available = on_hand - reserved`.
- Việc giữ hàng phải kiểm tra và cập nhật trong transaction có khóa dòng hoặc cơ chế concurrency tương đương.
- Không cho phép nhiều yêu cầu đồng thời giữ vượt quá lượng khả dụng.
- Hủy đơn phải giải phóng reservation đúng một lần.
- Webhook nên có khóa chống xử lý trùng (idempotency/event key).

## 7. Kết quả
Sơ đồ mô tả phạm vi Order Hub và chống bán vượt. Các luồng thành công/thất bại, hết hạn giữ hàng và chuyển trạng thái cần được đặc tả chi tiết.
