# Webhook Simulator

Gửi đơn hàng mẫu theo ba kênh Shopee, TikTok Shop và Lazada tới endpoint webhook đã cấu hình.

```bash
npm run webhook -- --platform shopee --count 5
npm run webhook -- --platform tiktok --count 10
npm run webhook -- --platform lazada --count 3
```

Mỗi request có `eventId` duy nhất để hỗ trợ kiểm thử idempotency. Payload trong `payloads/` là dữ liệu giả lập nội bộ, không phải schema chính thức của sàn. Chỉnh `src/payload-builder.ts` theo DTO/contract mà Backend nhóm đã thống nhất.
