# Use Case Specification: UC-ORD-01 Omnichannel Order Ingestion

## 1. Details
- **ID & Name:** `UC-ORD-01 Omnichannel Order Ingestion`
- **Primary Actor:** **Marketplace Webhooks / POS / Admin**
- **Secondary Actors:** Integration Adapter, Hangfire Worker
- **Goal in Context:** Tiếp nhận và chuyển đổi đơn hàng đa kênh về Mô hình Đơn hàng Chuẩn hóa (Canonical Order Model).

## 2. Main Success Flow
1. Webhook từ Shopee/TikTok/Lazada gửi payload đơn hàng đến API.
2. Hệ thống kiểm tra trùng lặp (Idempotency Check) dựa trên `(TenantId, ChannelType, ExternalOrderId)`.
3. Integration Adapter ánh xạ payload sang **Canonical Order Model**.
4. Lưu đơn hàng ở trạng thái `Draft` và gọi ngay Use Case `UC-ORD-02 Reserve Stock`.

## 3. Alternative Flows
- **2a. Đơn hàng đã tồn tại (Duplicate Event):** Bỏ qua xử lý, trả về HTTP 200 OK cho sàn.

## 4. Business Rules & NFRs
- **FR-ORD-01:** Chuẩn hóa đơn hàng đa kênh về Canonical Model.