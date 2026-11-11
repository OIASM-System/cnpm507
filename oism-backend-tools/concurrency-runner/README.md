# Concurrency Runner

Mô phỏng nhiều khách hàng đồng thời tạo đơn cùng mua một SKU/chi nhánh để kiểm tra NFR-PERF-02 và FR-RSE.

```bash
npm run concurrency -- --sku SKU-DEMO-001 --branch BRANCH-DEMO-001 --quantity 1 --requests 50 --concurrency 50
```

Mặc định gọi `ORDER_CREATE_PATH` bằng POST. Payload mặc định là contract đề xuất; sửa `buildOrderPayload()` theo Swagger/DTO thực tế. `--requests` là tổng request; `--concurrency` là số request chạy đồng thời tối đa.

Không chạy trên production. Kết quả HTTP thành công không tự chứng minh không oversell; cần xác minh tồn kho sau test qua `INVENTORY_CHECK_PATH` hoặc DB.
