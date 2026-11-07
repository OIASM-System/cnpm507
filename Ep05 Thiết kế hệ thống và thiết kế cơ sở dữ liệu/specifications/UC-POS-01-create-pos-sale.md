# Use Case Specification: UC-POS-01 Create POS Sale

## 1. Details
- **ID & Name:** `UC-POS-01 Create POS Sale`
- **Primary Actor:** **Thu ngân (Cashier)**
- **Goal in Context:** Tìm kiếm SKU qua Tên/Mã vạch và xác thực tức thì tồn kho khả dụng tại quầy.

## 2. Main Success Flow
1. Cashier dùng máy quét mã vạch hoặc phím tắt tìm SKU trên PWA POS.
2. Hệ thống truy vấn SKU (độ trễ p95 < 200ms theo `NFR-PERF-01`).
3. Hệ thống kiểm tra: Nếu `available > 0`, cho phép thêm vào giỏ hàng POS.

## 3. Exception Flows
- **3a. Tồn kho khả dụng `available <= 0`:** Chặn thêm vào giỏ hàng POS nhằm bảo vệ tồn kho đã giữ chỗ cho các đơn hàng trực tuyến (`FR-POS-02`).

## 4. Business Rules & NFRs
- **FR-POS-01 / FR-POS-02:** Giao diện bán lẻ nhanh và ràng buộc tồn kho khả dụng.