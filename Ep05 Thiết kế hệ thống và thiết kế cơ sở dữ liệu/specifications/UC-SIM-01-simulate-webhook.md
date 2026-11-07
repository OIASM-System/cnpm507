# Use Case Specification: UC-SIM-01 Simulate E-commerce Webhook

## 1. Details
- **ID & Name:** `UC-SIM-01 Simulate E-commerce Webhook`
- **Primary Actor:** **Kiểm thử viên / Developer (Tester / Dev)**
- **Secondary Actors:** SignalR Real-time Hub, Webhook Engine
- **Goal in Context:** Giả lập bắn Webhook đơn hàng đa kênh để kiểm thử tải giữ chỗ và đẩy thông báo SignalR thời gian thực.

## 2. Main Success Flow
1. Tester cấu hình thông số: Kênh bán (Shopee/TikTok), SKU, Số lượng đơn đồng thời.
2. Trình giả lập gửi các HTTP POST Webhook payload đến hệ thống.
3. Hệ thống nạp đơn (`UC-ORD-01`) và giữ chỗ (`UC-ORD-02`).
4. SignalR Hub đẩy thông báo âm thanh/popup đơn hàng mới tới màn hình Admin/POS tức thì không cần reload trang (`FR-SIM-02`).

## 3. Business Rules & NFRs
- **FR-SIM-01 / FR-SIM-02:** Giả lập Webhook và Đẩy thông báo thời gian thực.