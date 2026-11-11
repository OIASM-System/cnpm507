# Data Generator

Sinh dữ liệu kiểm thử giả cho OISM. Chế độ mặc định xuất JSON, không ghi vào database.

```bash
npm run generate -- --tenants 2 --branches 2 --products 20 --skus 2 --orders 10 --out ./output/demo-data.json
```

Seed qua API chỉ bật khi truyền `--seed-api`. Cần cấu hình token và các endpoint tương ứng trong `.env`. Nên chạy `--dry-run` trước; mặc định công cụ không tự seed.

Dữ liệu ID UUID, có liên kết tenant → branch/product/SKU/order. Generator không tự tạo user/password hoặc token.
