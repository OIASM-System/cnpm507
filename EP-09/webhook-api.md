# Webhook API / API webhook

Current project context includes a Webhook Simulator. Live marketplace integrations and their signature requirements are [TBD].
Bối cảnh hiện tại có Webhook Simulator; tích hợp sàn thật và chữ ký xác thực [CHỜ XÁC NHẬN].

## `POST /api/v1/webhooks/simulator/events` [PROPOSED]
Accepts a simulated event fixture for development/testing only.
Chỉ nhận fixture sự kiện mô phỏng phục vụ phát triển/kiểm thử.
```json
{"provider":"DemoMarketplace","eventType":"order.created","eventId":"evt_demo_001","payload":{"externalOrderId":"EXT-1001","items":[{"sku":"SKU-001","quantity":1}]}}
```
Do not expose this simulator publicly in production without explicit authorization and safeguards.

## Processing behavior / Hành vi xử lý
1. Validate schema and allowed provider/event type.
2. Record event receipt and correlation/idempotency key.
3. Detect duplicate event IDs and avoid duplicate order creation.
4. Normalize external payload into application command.
5. Process through Application use case and transaction rules.
6. Return accepted/duplicate/rejected status and trace/correlation ID.
7. Publish event only after durable state change, using an outbox pattern if adopted [PROPOSED].
- Kiểm tra schema; ghi nhận event/correlation; chống trùng; chuẩn hóa payload; gọi use case; trả trạng thái; chỉ phát event sau khi lưu bền vững.

## `POST /api/v1/webhooks/{provider}` [TBD for live integration]
A live endpoint must verify provider signature, timestamp/replay window, request size and provider-specific retry semantics before processing. Do not implement generic signature logic without provider documentation.

## Suggested response
```json
{"eventId":"evt_demo_001","status":"Accepted","duplicate":false,"correlationId":"corr_123"}
```
Status enum is [TBD]; examples are illustrative.
