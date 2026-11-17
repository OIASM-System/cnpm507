# ✅ Master Project Checklist & Deliverable Tracker - OISM System

**Đề tài:** Omnichannel Inventory and Sales Management System (OISM)  
**Kiến trúc:** Multi-Tenant SaaS • Clean Architecture (.NET 8) • PostgreSQL 16 • React 18 PWA • SignalR • Hangfire • AI Reordering

---

## 📊 1. Tổng quan Tiến độ 5 Gói Công việc (Work Packages)

- [x] **Gói công việc 1:** Thiết lập nền tảng Clean Architecture (.NET 8), Multi-Tenancy (`TenantId` + EF Core Global Query Filter), PostgreSQL 16 và JWT/RBAC (`Owner`, `Staff`, `Cashier`).
- [x] **Gói công việc 2:** Quản lý Danh mục, Thương hiệu, Sản phẩm, Biến thể (`SKU`), Mã vạch (`EAN-13`/`Code128`), Giá niêm yết, **Sổ cái Tồn kho chỉ ghi thêm (`Append-Only Ledger`)** và **Giá vốn Bình quân Gia quyền (`WAC`)**.
- [ ] **Gói công việc 3:** Trung tâm Tiếp nhận Đơn hàng (`Order Ingestion Hub`), Máy trạng thái (`Draft -> Reserved -> Confirmed -> Completed / Cancelled`), Cơ chế chống bán vượt (`Anti-Oversell Lock`), Trình giả lập Webhook (Shopee/TikTok/Lazada) và Hangfire Background Jobs.
- [ ] **Gói công việc 4:** Giao diện **Admin Dashboard** (ReactJS), Ứng dụng **PWA POS** (Quét mã vạch, Browser Print API, Atomic Checkout) và thông báo đẩy thời gian thực qua **SignalR**.
- [ ] **Gói công việc 5:** Báo cáo Doanh thu/COGS/Lợi nhuận gộp, Tích hợp **AI Dự báo nhu cầu & Điểm đặt hàng lại (ROP)**, Kiểm thử tự động (Unit, Integration, Concurrency Flash Sale), CI/CD GitHub Actions và Docker Compose.

---

## 🎯 2. Checklist Yêu cầu Chức năng (Functional Requirements - `FR`)

### 🔐 FR-AUTH: Đa khách hàng & Xác thực
- [ ] `FR-AUTH-01`: Đăng ký Tenant mới với không gian dữ liệu cô lập (`TenantId` duy nhất).
- [ ] `FR-AUTH-02`: Đăng nhập/Đăng xuất (Email/SĐT + Mật khẩu), cấp JWT chứa `TenantId`, `UserId`, `Role` + Refresh Token Rotation.
- [ ] `FR-AUTH-03`: Phân quyền RBAC chặt chẽ cho 3 vai trò: `Owner`, `Staff`, `Cashier`.
- [ ] `FR-AUTH-04`: Quản lý Chi nhánh (`Branch`) và Kho (`Warehouse`) thuộc Tenant.

### 📦 FR-PROD: Sản phẩm & Biến thể (SKU)
- [ ] `FR-PROD-01`: Quản lý Danh mục phân cấp (`Category`) và Thương hiệu (`Brand`).
- [ ] `FR-PROD-02`: Quản lý Sản phẩm đơn giản & Sản phẩm đa biến thể (`ProductVariant` / `SKU` duy nhất trong mỗi Tenant).
- [ ] `FR-PROD-03`: Sinh tự động hoặc nhập thủ công Mã vạch (`EAN-13` / `Code128`) cho từng SKU.
- [ ] `FR-PROD-04`: Thiết lập Giá bán lẻ & Giá bán sỉ tách biệt hoàn toàn với Giá vốn (`COGS`).

### 📒 FR-INV & FR-COST: Sổ cái Tồn kho & Giá vốn WAC
- [ ] `FR-INV-01`: Mọi biến động (`IN`/`OUT`) bắt buộc ghi vào bảng Append-Only `InventoryTransaction` (`TenantId`, `BranchId`, `SKUId`, `Type`, `Quantity`, `BalanceAfter`, `ReferenceId`, `CreatedAt`). Nghiêm cấm sửa/xóa trực tiếp.
- [ ] `FR-INV-02`: Phiếu nhập hàng (`GoodsReceipt`) $\rightarrow$ Tăng `on_hand` + Cập nhật giá vốn WAC.
- [ ] `FR-INV-03`: Chuyển kho 2 bước giữa 2 chi nhánh (`StockTransfer`: Xuất vận chuyển $\rightarrow$ Xác nhận nhập).
- [ ] `FR-INV-04`: Phiên kiểm kê (`StocktakeSession`) $\rightarrow$ Đối chiếu lệch kho $\rightarrow$ Sinh bút toán điều chỉnh (`Adjustment Ledger`).
- [ ] `FR-COST-01`: Tính lại WAC chính xác khi nhập hàng: $\text{WAC}_{\text{mới}} = \frac{(\text{Tồn cũ} \times \text{Giá vốn cũ}) + (\text{SL nhập} \times \text{Giá nhập})}{\text{Tồn cũ} + \text{SL nhập}}$.
- [ ] `FR-COST-02`: Chụp nhanh (`Snapshot`) đơn giá vốn vào `OrderItem.CostPrice` khi đơn `Confirmed` hoặc thanh toán tại POS.

### 🛒 FR-ORD & FR-RSE: Trung tâm Đơn hàng & Chống bán vượt
- [ ] `FR-ORD-01`: Chuẩn hóa đơn hàng đa kênh (POS, Admin, Webhook Shopee/TikTok/Lazada) về `Canonical Order Model`.
- [ ] `FR-ORD-02`: Thực thi máy trạng thái đơn hàng: `Draft -> Reserved -> Confirmed -> Completed` (hoặc `Cancelled`).
- [ ] `FR-ORD-03`: Xử lý duyệt đơn, in phiếu giao hàng và hủy đơn.
- [ ] `FR-RSE-01`: Tính động tồn kho khả dụng: `available = on_hand - reserved`.
- [ ] `FR-RSE-02`: Giữ hàng (`StockReservation`) khi đơn online vào trạng thái `Reserved`; từ chối ngay nếu `available < số lượng mua`.
- [ ] `FR-RSE-03`: `Confirmed` $\rightarrow$ Trừ `on_hand`, giảm `reserved`, ghi Ledger; `Cancelled` $\rightarrow$ Giảm `reserved` hoàn lại `available`.

### 🖥️ FR-POS, FR-REP & FR-SIM: POS PWA, Báo cáo, Webhook & AI
- [ ] `FR-POS-01`: Giao diện POS cảm ứng + phím tắt, tìm kiếm tức thì theo Tên / SKU / Mã vạch.
- [ ] `FR-POS-02`: Chặn bán vượt `available` tại quầy để bảo vệ lượng hàng đã giữ cho đơn online.
- [ ] `FR-POS-03`: Thanh toán Tiền mặt, QR Code và in biên lai qua Browser Print API.
- [ ] `FR-POS-04`: Thực hiện `Reserve -> Confirm -> Deduct` trong **1 Atomic Database Transaction** duy nhất tại POS.
- [ ] `FR-REP-01`: Báo cáo Doanh thu thuần, Tổng COGS, Lợi nhuận gộp lọc theo Thời gian / Chi nhánh / Kênh bán / SKU.
- [ ] `FR-REP-02`: Báo cáo giá trị tồn kho, hàng bán chạy và hàng chậm luân chuyển.
- [ ] `FR-REP-03`: Cảnh báo tự động trên Dashboard khi `available <= ReorderPoint` (kết hợp gợi ý nhập hàng AI).
- [ ] `FR-SIM-01`: Trình giả lập Webhook TMĐT (Shopee/TikTok/Lazada) kiểm thử tải & giữ hàng.
- [ ] `FR-SIM-02`: Đẩy thông báo đơn mới & âm thanh cảnh báo real-time qua **SignalR**.
- [ ] `FR-SIM-03`: Tác vụ nền **Hangfire** tự động hủy đơn giữ hàng quá hạn (`TTL`) & tổng hợp báo cáo ngày.

---

## 🛡️ 3. Checklist Yêu cầu Phi chức năng (Non-Functional Requirements - `NFR`)

- [ ] `NFR-PERF-01`: Độ trễ `p95` tìm kiếm SKU/quét mã vạch $< 200\text{ms}$; tạo đơn hàng $< 500\text{ms}$; báo cáo $< 2\text{s}$ ($< 100\text{k}$ bản ghi).
- [ ] `NFR-PERF-02`: Vượt qua bài kiểm thử Flash Sale **50 đơn hàng đồng thời** nhắm vào 1 SKU cuối cùng bằng khóa `SELECT ... FOR UPDATE` / Optimistic Locking (0% âm kho).
- [ ] `NFR-TENANT-01` & `02`: Áp dụng EF Core Global Query Filter theo `TenantId` và tối ưu Composite Index `(TenantId, CreatedAt)`, `(TenantId, SKUId)`.
- [ ] `NFR-SEC-01` & `02` & `03`: Mật khẩu băm `BCrypt`/`Argon2`; JWT 60 phút + Refresh Token; tuân thủ ACID và Database Trigger chặn `UPDATE`/`DELETE` trên `InventoryLedger`.
- [ ] `NFR-MAINT-01` & `02`: Tuân thủ Clean Architecture 4 tầng và đạt **$\ge 80\%$ độ bao phủ Unit & Integration Test** cho các mô-đun cốt lõi (`Inventory Ledger`, `Anti-Oversell Reserve`, `COGS`).

---

## 📂 4. Checklist Hoàn thiện Tài liệu & Sơ đồ Còn Thiếu trong `docs/` & `Skills/`

### 📌 Các tệp Markdown & Excel cần bổ sung
- [ ] `docs/00-project-overview/`: Hoàn thiện `project-proposal.md`, `problem-statement.md`, `project-objectives.md`, `project-scope.md`, `stakeholders.md`, `assumptions-and-constraints.md`, `glossary.md`, `references.md`.
- [ ] `docs/03-business-analysis/user-roles.md`: Bổ sung mô tả chi tiết 3 vai trò (`Owner`, `Staff`, `Cashier`).
- [ ] `docs/04-requirements/`: Hoàn thiện 2 tệp Excel `requirement-traceability-matrix.xlsx` (RTM) và `product-backlog.xlsx`.
- [ ] `docs/05-use-cases/`: Bổ sung 3 tệp tổng quan còn thiếu: `use-case-overview.md`, `actors.md`, `use-case-matrix.md`.
- [ ] `docs/08-ui-ux-design/`: Bổ sung `README.md`, `ui-requirements.md`, `design-system.md`, `responsive-guidelines.md`, `accessibility-guidelines.md` (hoặc lược bỏ các thư mục mockup Figma chưa dùng).
- [ ] `Skills/04-database/f.md`: Đổi tên tệp gõ nhầm `f.md` thành **`pessimistic-locking.md`**.

### 🖼️ Đồng bộ cặp tệp `.drawio` và `.png` (Để chèn vào Báo cáo Word/PDF)
- [ ] `docs/03-business-analysis/business-flowcharts/`: Xuất thêm 6 ảnh `.png` tương ứng với 6 tệp `.drawio` đã nộp.
- [ ] `docs/05-use-cases/diagrams/`: Xuất thêm 7 ảnh `.png` tương ứng với 7 sơ đồ Use Case `.drawio` đã nộp.
- [ ] `docs/06-system-design/`: Lưu lại tệp nguồn `.drawio` cho các sơ đồ `c4-model/` (4 tệp), `uml/` (7 tệp) và `sequence-diagrams/` (10 tệp) đã có `.png`.
- [ ] `docs/08-ui-ux-design/`: Xuất thêm ảnh `.png` cho `admin-dashboard/wireframes.drawio`, `screen-flow.drawio` và `pos-pwa/wireframes.drawio`, `checkout-flow.drawio`.

---

## 🚀 5. Checklist Gói Đóng gói & Bàn giao Cuối kỳ (Release Readiness)

- [ ] `docker-compose up -d --build` khởi chạy thành công toàn bộ: `PostgreSQL 16`, `OISM.WebAPI`, `Admin Dashboard`, `POS PWA` và tự động nạp dữ liệu mẫu (`seed-demo-data.sql`).
- [ ] File `OISM.postman_collection.json` và `openapi.json` chạy thông suốt toàn bộ luồng nghiệp vụ.
- [ ] Báo cáo đồ án đầy đủ sơ đồ, bảng ma trận truy vết RTM, ảnh chụp kết quả kiểm thử đồng thời (`ConcurrencyTests`) và kết quả chạy thử nghiệm.