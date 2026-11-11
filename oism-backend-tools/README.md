# OISM Backend Testing Tools

Bộ công cụ kiểm thử độc lập cho Omnichannel Inventory and Sales Management System (OISM).

## Thành phần
- `webhook-simulator`: gửi payload đơn hàng giả lập từ Shopee, TikTok Shop, Lazada.
- `concurrency-runner`: gửi nhiều yêu cầu đặt hàng đồng thời và tổng hợp kết quả.
- `data-generator`: sinh dữ liệu tenant/branch/product/SKU/order ở dạng JSON hoặc seed qua API.

## Yêu cầu
- Node.js 22 LTS trở lên
- npm
- Backend OISM .NET 8 đang chạy (nếu kiểm thử tích hợp)
- PostgreSQL chỉ cần khi nhóm chọn seed trực tiếp; phiên bản này ưu tiên seed qua API.

## Cài đặt
```bash
npm install
cp .env.example .env
```
Windows PowerShell:
```powershell
Copy-Item .env.example .env
```

Sửa `.env` theo môi trường local. Không commit `.env`, JWT hoặc secret thật.

## Chạy
```bash
npm run webhook -- --platform shopee --count 5
npm run concurrency -- --sku SKU-DEMO-001 --branch BRANCH-DEMO-001 --quantity 1 --requests 50 --concurrency 50
npm run generate -- --tenants 2 --branches 2 --products 20 --skus 2 --orders 10 --out ./output/demo-data.json
```

## Lưu ý tích hợp API
Các route trong `.env.example` là cấu hình mặc định mang tính placeholder. Đối chiếu Swagger của Backend rồi cập nhật:
- `WEBHOOK_PATH`: endpoint tiếp nhận webhook.
- `ORDER_CREATE_PATH`: endpoint tạo đơn hàng.
- `PRODUCT_CREATE_PATH`, `TENANT_CREATE_PATH`, `BRANCH_CREATE_PATH`: endpoint seed tương ứng.

Payload mẫu là canonical test payload. Nếu Backend yêu cầu DTO khác, chỉnh `payload-builder.ts`/`api-client.ts` theo Swagger. Không giả định các route này đã tồn tại.

## Kết quả Concurrency
Báo cáo gồm tổng request, HTTP 2xx, request lỗi, latency trung bình/p95/max và throughput ước tính. Kiểm tra cuối cùng `available >= 0` cần endpoint tồn kho đọc được; cấu hình `INVENTORY_CHECK_PATH` hoặc xác minh bằng truy vấn DB do nhóm backend/test thực hiện.

## Nguyên tắc an toàn
- Chỉ chạy trên local/staging được nhóm cho phép.
- Không chạy tải trên production.
- Dùng tenant và SKU test riêng.
- Chạy Data Generator với `--dry-run` trước khi seed.
- Không đưa access token/secret vào commit hoặc báo cáo.

## Cấu trúc
```text
tools/
├── webhook-simulator/
├── concurrency-runner/
└── data-generator/
```
