# Reporting API / API báo cáo

**Status:** endpoints and metric definitions are [PROPOSED/TBD]. Financial definitions must be approved before numbers are treated as authoritative.
**Trạng thái:** route đề xuất; định nghĩa chỉ số cần duyệt trước khi dùng số liệu chính thức.

## `GET /api/v1/reports/sales` [PROPOSED]
Filters: `from`, `to`, `branchId`, `channel`, `groupBy` (allowed values [TBD]).
Possible metrics: order count, gross sales, discounts, refunds, net revenue, taxes and shipping. Definitions and inclusion/exclusion of cancelled orders are [TBD].

## `GET /api/v1/reports/inventory` [PROPOSED]
Possible outputs: current stock by SKU/branch, low-stock list, movement summary. Low-stock threshold scope (tenant/branch/SKU) is [TBD].

## `GET /api/v1/reports/cogs` [PROPOSED]
Returns COGS derived from persisted CostPrice snapshots and approved refund/cancellation policy.
COGS dựa trên snapshot CostPrice đã lưu và quy tắc hoàn/hủy được duyệt.

## `GET /api/v1/alerts` [PROPOSED]
Returns low-stock and operational alerts within authorized tenant/branch scope.

## Common rules / Quy tắc chung
- Require date range limits and authorization; maximum range [TBD].
- Include applied filters, timezone and generation timestamp in report metadata.
- Large reports may be asynchronous; export formats and Hangfire job contract [TBD].
- Report totals must reconcile to source orders/ledger under the agreed accounting definitions.
- Giới hạn khoảng ngày và quyền; trả metadata bộ lọc/múi giờ/thời điểm tạo; báo cáo lớn có thể chạy nền; tổng phải đối soát theo định nghĩa đã duyệt.
