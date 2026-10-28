# OISM API Overview / Tổng quan API OISM

**Status:** Draft contract for implementation alignment / Bản nháp hợp đồng API  
**Base path:** `/api/v1` [PROPOSED versioning convention]  
**Runtime:** ASP.NET Core Web API on .NET 8; EF Core 8; PostgreSQL.  
**Architecture:** Clean Architecture — Domain, Application, Infrastructure, Presentation/WebAPI.

## 1. Source-derived architecture / Kiến trúc theo nguồn
- Authentication: JWT; roles Owner, Staff, Cashier.
- Multi-tenancy: TenantId context, JWT claims and EF Core Global Query Filters.
- Inventory Ledger: append-only; corrections via compensating entries.
- Order lifecycle: reserve/deduct/release stock with transactional consistency and anti-oversell protection.
- Costing: weighted-average cost (WAC), CostPrice snapshot and COGS.
- POS: barcode, checkout and receipt; reports; Webhook Simulator; SignalR events; Hangfire background jobs are in the project context.
- Xác thực JWT; tenant qua TenantId/claims/query filters; ledger chỉ ghi nối tiếp; giữ/trừ/hoàn tồn nhất quán; WAC/COGS; POS; báo cáo; webhook mô phỏng; SignalR và Hangfire.

## 2. Contract status / Trạng thái hợp đồng
- **[SOURCE]** Architecture and business constraints listed above.
- **[PROPOSED]** Resource names, endpoint paths, pagination envelope, problem response shape, API version prefix and most DTO field names in this folder.
- **[TBD]** Exact entity schema, enum values, payment provider, refresh-token storage, external marketplace signatures, report definitions and some authorization granularity.
- Do not treat example IDs, prices, currency, token lifetimes or sample payloads as production configuration unless confirmed.
- **[NGUỒN]** Các ràng buộc kiến trúc/nghiệp vụ ở trên.
- **[ĐỀ XUẤT]** Tên tài nguyên, đường dẫn, cấu trúc phân trang/lỗi, version prefix và phần lớn DTO.
- **[CHỜ XÁC NHẬN]** Schema chính thức, enum, cổng thanh toán, lưu refresh token, chữ ký sàn, định nghĩa báo cáo và quyền chi tiết.

## 3. Authentication and tenant context / Xác thực và tenant
- Protected endpoints require `Authorization: Bearer <access-token>`.
- API derives tenant from trusted claims/context. Never trust a client-supplied TenantId as authorization.
- `X-Tenant-Id` must not override JWT tenant scope unless a reviewed tenant-switching design explicitly permits it.
- EF Core Global Query Filters are defense-in-depth, not the only security control. Verify tenant scope in application use cases and writes.
- Endpoint authorization combines authentication, role/permission checks and tenant/branch scope.
- API lấy tenant từ claims/ngữ cảnh đáng tin cậy; không tin TenantId do client gửi để cấp quyền; `X-Tenant-Id` không tự ghi đè claims; query filter không phải lớp bảo vệ duy nhất.

## 4. Conventions / Quy ước
- JSON uses camelCase; timestamps are ISO 8601 UTC.
- Resource IDs are opaque strings in examples; actual type/format [TBD].
- Lists use `page`, `pageSize`, optional filters and a response envelope [PROPOSED].
- Mutating operations return a persisted resource or operation result, not UI-calculated state.
- Use idempotency for checkout and event ingestion where appropriate.
- JSON camelCase; thời gian ISO 8601 UTC; ID là ví dụ; danh sách dùng phân trang đề xuất; mutation trả dữ liệu đã lưu; cân nhắc idempotency cho checkout/webhook.

## 5. Error model / Mô hình lỗi
Use RFC 9457-style `application/problem+json` [PROPOSED], with stable application `code`, human-readable `title/detail`, `traceId` and optional field errors. Never include stack traces, secrets or cross-tenant existence details.
Dùng dạng lỗi tương thích RFC 9457 [ĐỀ XUẤT], có mã ổn định, mô tả, traceId và lỗi theo trường; không trả stack trace, bí mật hoặc thông tin làm lộ dữ liệu tenant khác.

## 6. API module index / Danh mục module
- `authentication-api.md`: sign-in/refresh/logout/session.
- `tenant-api.md`: current tenant and branches/warehouses.
- `product-api.md`: product catalog.
- `inventory-api.md`: stock, ledger, adjustments and costing.
- `order-api.md`: order lifecycle, reservation and state transitions.
- `pos-api.md`: POS checkout and receipt.
- `report-api.md`: reports/alerts.
- `webhook-api.md`: simulated/external event ingestion.
- `signalr-events.md`: real-time event conventions.
- `error-codes.md`: stable error catalogue.
- `openapi.json`: OpenAPI 3.1 draft contract.
- `OISM.postman_collection.json`: runnable structure with placeholder base URL and environment variables.

## 7. Security checklist / Danh sách kiểm tra bảo mật
- Tenant isolation tests on every tenant-owned resource.
- RBAC tests for Owner/Staff/Cashier and forbidden mutations.
- No update/delete routes for ledger entries.
- Atomic order/stock transaction and rollback tests.
- Idempotency/replay tests for checkout/webhook.
- Rate limiting and audit logging policy [TBD].
