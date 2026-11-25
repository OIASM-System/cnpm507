# TÀI LIỆU HƯỚNG DẪN SỬ DỤNG HỆ THỐNG OISM (USER MANUAL)


---

## MỤC LỤC

1. EP01: Tổng quan hệ thống OISM & Nguyên lý vận hành cốt lõi
2. EP02: Yêu cầu môi trường, Cài đặt, Khởi chạy & Dữ liệu mẫu
3. EP03: Đăng nhập, Quản trị Tổ chức, Chi nhánh & Phân quyền 
4. EP04: Bảng điều khiển Admin Dashboard & Tổng quan vận hành
5. EP05: Quản lý Danh mục, Thương hiệu, Sản phẩm, Biến thể SKU & Giá (FR-PROD)
6. EP06: Quản lý Kho, Sổ cái Tồn kho & Tính Giá vốn WAC (FR-INV & FR-COST)
7. EP07: Trung tâm Quản lý Đơn hàng Đa kênh & Chống bán vượt (FR-ORD & FR-RSE)
8. EP08: Hướng dẫn sử dụng Ứng dụng Bán hàng tại quầy PWA POS (FR-POS)
9. EP09: Báo cáo Kinh doanh, Cảnh báo Tồn kho & Đề xuất Nhập hàng AI (FR-REP & AI)
10.EP10: Bộ công cụ Kiểm thử, Giả lập Webhook & Tác vụ nền (FR-SIM & NFR-PERF)
11.EP11: Xử lý sự cố thường gặp (Troubleshooting)
12.EP012: Phụ lục — Đối chiếu phạm vi API & Bảng tham chiếu nhanh

---

## EP01: Tổng quan hệ thống OISM & Nguyên lý vận hành cốt lõi

### 1.1. Mục tiêu và kiến trúc kỹ thuật tổng thể

**OISM (Omnichannel Inventory and Sales Management System)** là hệ thống quản lý tồn kho và bán hàng đa kênh xây dựng theo kiến trúc SaaS đa khách hàng (Multi-tenant) và đa chi nhánh (Multi-branch). Hệ thống giải quyết 3 bài toán cốt lõi của doanh nghiệp bán lẻ đa kênh (quầy POS kết hợp các sàn thương mại điện tử Shopee, TikTok Shop, Lazada):

1. Ngăn chặn bán vượt tồn kho (overselling) khi nhiều kênh cùng chốt đơn một mã sản phẩm tại cùng thời điểm.
2. Tính chính xác Giá vốn hàng bán (COGS) theo phương pháp Bình quân Gia quyền (WAC) để xác định đúng Lợi nhuận gộp.
3. Loại bỏ thất thoát và sai lệch số liệu do chỉnh sửa trực tiếp số lượng tồn kho không có chứng từ.

**Thành phần kiến trúc kỹ thuật:**

* **Backend (.NET 8.0):** ASP.NET Core xây dựng theo Clean Architecture gồm 4 tầng (`OISM.Domain`, `OISM.Application`, `OISM.Infrastructure`, `OISM.WebAPI`) kết nối cơ sở dữ liệu PostgreSQL. Dữ liệu được cô lập chặt chẽ theo `TenantId` (qua header `X-Tenant-Id`) và `BranchId` (qua tham số `branchId`).
* **Frontend (React + TypeScript + Vite):** Ứng dụng đơn trang (SPA) sử dụng React 18.3.1, TypeScript 5.7.2, Vite 6.0.5 và bộ biểu tượng `lucide-react`, hỗ trợ cài đặt dưới dạng Ứng dụng Web Tiến bộ (PWA) thông qua `manifest.webmanifest` và Service Worker `sw.js`.
* **Thời gian thực & Tác vụ nền:** Tích hợp SignalR (`OrderHub`) để đẩy thông báo đơn hàng mới lên giao diện mà không cần tải lại trang, cùng Hangfire (`ExpiredReservationJob`) để tự động hủy các bản ghi giữ chỗ quá hạn.

### 1.2. Ba nguyên lý nghiệp vụ bắt buộc người dùng cần nắm

1. **Sổ cái tồn kho chỉ ghi thêm (Append-only Inventory Ledger — `FR-INV-01`):**
   Hệ thống **nghiêm cấm** sửa hoặc xóa trực tiếp các dòng lịch sử tồn kho. Mọi biến động (nhập hàng, xuất bán POS, giữ chỗ đơn Online, hủy đơn, chuyển kho nội bộ, kiểm kê điều chỉnh) đều tạo một dòng bút toán bất biến gồm: loại giao dịch (`movementType`), số lượng thay đổi (`quantity`), mã chứng từ/đơn hàng liên quan (`orderId` / `referenceId`) và số dư sau giao dịch (`onHandAfter`, `reservedAfter`).
2. **Công thức tồn kho khả dụng & Chống bán vượt (`FR-RSE-01`, `NFR-PERF-02`):**
   Tại mỗi chi nhánh, tồn kho của từng mã SKU luôn được kiểm soát bằng khóa cơ sở dữ liệu để đảm bảo lượng hàng có thể bán không bao giờ âm:
   $$\text{Có thể bán (Available)} = \text{Tồn kho thực tế (OnHand)} - \text{Đang giữ chỗ (Reserved)} \ge 0$$
   Khi có đơn hàng Online ở trạng thái chờ (`Pending`), hệ thống tăng `Reserved` tương ứng để ngăn Thu ngân POS bán lấn phần hàng đã giữ cho khách đặt online.
3. **Tính Giá vốn Bình quân Gia quyền (WAC) & Chụp nhanh giá vốn (`FR-INV-02`, `FR-COST-02`):**
   Mỗi khi hoàn tất phiếu nhập hàng từ nhà cung cấp, hệ thống tự động tính lại đơn giá vốn bình quân gia quyền theo công thức:
   $$\text{WAC}_{\text{mới}} = \frac{(\text{Tồn cũ} \times \text{WAC}_{\text{cũ}}) + (\text{SL nhập} \times \text{Đơn giá nhập})}{\text{Tồn cũ} + \text{SL nhập}}$$
   Ngay tại thời điểm đơn hàng được xác nhận (`Confirmed`) hoặc thanh toán tại quầy POS, đơn giá vốn hiện hành được chụp cố định (`CostPrice` snapshot) vào dòng chi tiết đơn hàng để tính Lợi nhuận gộp chính xác, không bị sai lệch bởi các đợt nhập hàng sau này.

### 1.3. Ma trận phân quyền theo vai trò người dùng (RBAC)

Hệ thống phân tách 4 vai trò chuẩn theo 6 nhóm quyền nghiệp vụ:

| Nhóm quyền / Phân hệ nghiệp vụ | `Owner` (Chủ cửa hàng) | `Store Manager` (Quản lý CN) | `Warehouse Staff` (Nhân viên kho) | `Cashier` (Thu ngân POS) |
| :--- | :---: | :---: | :---: | :---: |
| **Quản trị hệ thống, Chi nhánh, Tài khoản** (`SYSTEM_ADMIN`) | Toàn quyền | Không | Không | Không |
| **Quản lý Sản phẩm, SKU, Mã vạch, Giá** (`PRODUCT_MANAGE`) | Toàn quyền | Toàn quyền | Chỉ xem | Chỉ xem |
| **Nhập kho, Chuyển kho, Kiểm kê, Sổ cái** (`INVENTORY_MANAGE`) | Toàn quyền | Toàn quyền | Toàn quyền | Không |
| **Quản lý Đơn hàng đa kênh, Duyệt/Hủy** (`ORDER_MANAGE`) | Toàn quyền | Toàn quyền | Xem & giao nhận | Không |
| **Bán hàng tại quầy POS, Quét mã, Thanh toán** (`POS_SELL`) | Toàn quyền | Toàn quyền | Không | Toàn quyền |
| **Xem Báo cáo Doanh thu/COGS & Đề xuất AI** (`REPORT_VIEW`) | Toàn quyền | Toàn quyền | Không | Không |

---

## EP02: Yêu cầu môi trường, Cài đặt, Khởi chạy & Dữ liệu mẫu

### 2.1. Yêu cầu phần mềm và thiết bị đầu cuối

* **Môi trường máy chủ / phát triển:**
  * Node.js phiên bản $20$ trở lên.
  * .NET 8.0 SDK.
  * PostgreSQL phiên bản $15$ trở lên (đã khởi tạo lược đồ từ `07-database-design/database-schema.sql` và dữ liệu hạt giống).
  * Tùy chọn Docker & Docker Compose nếu triển khai đóng gói container.
* **Thiết bị vận hành:** Trình duyệt web hiện đại (Google Chrome, Microsoft Edge, Cốc Cốc, Firefox, Safari) trên máy tính, máy tính bảng hoặc điện thoại di động (giao diện đáp ứng tốt từ chiều rộng màn hình $320\text{px}$).
* **Thiết bị ngoại vi (tùy chọn cho quầy POS):** Đầu đọc mã vạch USB/Bluetooth (chế độ bàn phím HID có bật tự động xuống dòng `Enter`) và máy in hóa đơn nhiệt khổ 58mm/80mm hỗ trợ in qua trình duyệt.

### 2.2. Cấu hình kết nối môi trường (`frontend/.env` & `vite.config.ts`)

Trước khi chạy giao diện web, kiểm tra tệp `frontend/.env` (có thể sao chép từ `frontend/.env.example`) để đảm bảo mã định danh Tenant và Chi nhánh khớp chính xác với dữ liệu trong PostgreSQL:

```env
VITE_API_BASE_URL=/backend
VITE_TENANT_ID=00000000-0000-0000-0000-000000000001
VITE_BRANCH_ID=11111111-1111-1111-1111-111111111111
```

> **Lưu ý kỹ thuật quan trọng:**
> * **Cơ chế Proxy:** Tệp `frontend/vite.config.ts` tự động chuyển tiếp mọi yêu cầu `/backend/*` sang máy chủ Backend tại `http://localhost:5185/*`. Nếu Backend chạy ở cổng khác, cần sửa trường `target` trong `vite.config.ts` và khởi động lại Vite.
> * **Header gửi tự động (`frontend/src/api.ts`):** Mọi lời gọi API tự động đính kèm `Accept: application/json`, `X-Tenant-Id`, `Content-Type: application/json` (khi có body) và `Authorization: Bearer <token>` (nếu có khóa `oism.accessToken` trong `localStorage`).
> * **Không tự đổi GUID ngẫu nhiên:** Nếu đổi `VITE_TENANT_ID` hoặc `VITE_BRANCH_ID` sang GUID không tồn tại trong PostgreSQL, danh sách tồn kho và sổ cái sẽ trả về rỗng.

### 2.3. Quy trình 3 bước khởi chạy hệ thống (Local Development)

1. **Bước 1 — Khởi động máy chủ Backend (.NET 8 WebAPI):** Mở cửa sổ Terminal thứ nhất tại thư mục gốc dự án và giữ tiến trình này chạy xuyên suốt phiên làm việc:
   ```powershell
   dotnet run --project .\backend\src\OISM.WebAPI\OISM.WebAPI.csproj
   ```
   *Xác nhận thành công:* Terminal thông báo ứng dụng đang lắng nghe tại `http://localhost:5185`.

2. **Bước 2 — Cài đặt thư viện, biên dịch kiểm tra và khởi chạy Frontend:** Mở cửa sổ Terminal thứ hai, đi vào thư mục `frontend` và chạy lần lượt:
   ```powershell
   cd frontend
   npm install
   npm run build
   npm run dev
   ```
   *Xác nhận thành công:* Vite hiển thị đường dẫn cục bộ (mặc định `http://localhost:5173`).

3. **Bước 3 — Truy cập ứng dụng:** Mở trình duyệt tại `http://localhost:5173`. Tiêu đề trình duyệt hiển thị **OISM · Quản lý bán hàng đa kênh**.

### 2.4. Bộ dữ liệu mẫu & Tài khoản kiểm thử (`OISM Fashion Studio`)

Dự án cung cấp bộ dữ liệu mẫu gồm **1 Tenant (`OISM Fashion Studio`)**, **2 chi nhánh**, **10 dòng sản phẩm**, **30 biến thể SKU thời trang** kèm mã vạch EAN-13 duy nhất trong tệp `07-database-design/seed-fashion-30-skus.sql`:

* **Chi nhánh 1 (`HCM-Q1`):** Chi nhánh Quận 1 - Flagship (128 Nguyễn Trãi, P. Bến Thành, Q.1, TP.HCM) — điểm bán POS và xử lý đơn Online.
* **Chi nhánh 2 (`HCM-TD`):** Chi nhánh Thủ Đức - Kho Tổng (45 Võ Văn Ngân, P. Linh Chiểu, TP. Thủ Đức) — kho lưu trữ và điều chuyển nội bộ.

**Danh sách 4 tài khoản mẫu (mật khẩu mặc định theo seed SQL: `Oism@123`; riêng màn hình đăng nhập kiểm thử `frontend/src/components/loginpage.tsx` hỗ trợ nút điền nhanh `owner@oism.vn` / `cashier@oism.vn`, mật khẩu `123456`):**

| Vai trò | Username | Email (Seed SQL) | Họ tên | Chi nhánh mặc định |
| :--- | :--- | :--- | :--- | :--- |
| **Owner** | `owner_oism` | `owner@oismfashion.vn` | Nguyễn Tuấn Anh | `HCM-Q1` (Toàn hệ thống) |
| **Store Manager** | `manager_q1` | `manager.q1@oismfashion.vn` | Trần Minh Khôi | `HCM-Q1` |
| **Warehouse Staff** | `kho_thuduc` | `kho.td@oismfashion.vn` | Lê Hoàng Nam | `HCM-TD` |
| **Cashier** | `thungan_q1` | `pos.q1@oismfashion.vn` | Phạm Thảo Vy | `HCM-Q1` |

**4 nhóm mã SKU tiêu biểu dùng để kiểm thử các kịch bản nghiệp vụ biên:**

| Mã SKU | Sản phẩm & Biến thể | Mã vạch EAN-13 | Tồn tại `HCM-Q1` | Kịch bản kiểm thử tương ứng |
| :--- | :--- | :--- | :--- | :--- |
| `ATB-TRG-M` | Áo Thun Cotton Basic (Trắng / M) | `8938507000011` | `OnHand` $= 30$, `Reserved` $= 0$ (`Available` $= 30$) | Bán hàng POS, quét mã vạch, tạo và xác nhận đơn bình thường |
| `DML-TRS-S` | Đầm Midi Linen Cổ Vuông (Trắng Sữa / S) | `8938507000165` | `OnHand` $= 5$, `Reserved` $= 3$ (`Available` $= 2$) | Test **Chống bán vượt (Anti-Oversell)**: thử đặt $3$ sẽ bị chặn để bảo vệ đơn Online |
| `ACT-HPA-M` | Áo Croptop Gân Tăm (Hồng Pastel / M) | `8938507000219` | `OnHand` $= 0$ (Kho Thủ Đức: $20$) | Test cảnh báo hết hàng POS & lập phiếu Chuyển kho `HCM-TD` $\rightarrow$ `HCM-Q1` |
| `ATB-NVY-XL`, `QJN-DEN-34`, `HDN-NAU-XL` | Nhóm 3 SKU tồn kho thấp tại Q1 | `...00035`, `...00127`, `...00271` | `OnHand` từ $2$ đến $3$ (`Available` $\le 5$) | Test cảnh báo tồn kho thấp (`LOW_STOCK`) & Đề xuất nhập hàng AI |

---

## EP03: Đăng nhập, Quản trị Tổ chức, Chi nhánh & Phân quyền (FR-AUTH)

### 3.1. Đăng nhập và quản lý phiên làm việc

1. **Bước 1 — Mở màn hình đăng nhập:** Truy cập đường dẫn đăng nhập của hệ thống OISM Admin hoặc giao diện `LoginPage` (`frontend/src/components/loginpage.tsx`).
2. **Bước 2 — Nhập thông tin xác thực:**
   * Điền **Tài khoản / Mã nhân viên** (Email hoặc Username) và **Mật khẩu / PIN** do Chủ cửa hàng cấp.
   * Tích chọn **Ghi nhớ đăng nhập** nếu làm việc trên thiết bị cố định tại quầy (hoặc chọn **Quên mật khẩu ?** khi cần cấp lại).
   * Trên màn hình kiểm thử nhanh (`loginpage.tsx`), có thể bấm nút **Chủ shop** (`owner@oism.vn`) hoặc **Thu ngân** (`cashier@oism.vn`) để hệ thống tự điền thông tin mẫu.
3. **Bước 3 — Xác nhận đăng nhập:** Nhấn **Đăng nhập**. Hệ thống xác thực tài khoản, lưu mã phiên (`token` / `oism.accessToken`) cùng thông tin vai trò, `tenantId` vào `localStorage` qua `AuthContext`, sau đó điều hướng về màn hình đúng vai trò (Admin Dashboard cho `Owner`/`Store Manager`/`Warehouse Staff`; POS PWA cho `Cashier`).
4. **Bước 4 — Đăng xuất an toàn cuối ca:** Nhấn biểu tượng tài khoản ở cuối thanh Sidebar và chọn **Đăng xuất**. Hệ thống gọi `logout()` xóa sạch token và phiên làm việc khỏi `localStorage` để tránh lộ phiên khi đổi ca.

### 3.2. Cài đặt hệ thống, Chi nhánh, Đồng bộ PWA & Máy in (`FR-AUTH-04`)

Phân hệ **Cài đặt hệ thống** chỉ khả dụng với vai trò **Chủ cửa hàng (`Owner` — quyền `SYSTEM_ADMIN`)**, gồm 3 khối cấu hình chính:

1. **Cấu hình chung cửa hàng & Chi nhánh:**
   * Cập nhật **Tên cửa hàng / Chi nhánh** (ví dụ: *POS Đa Chi Nhánh - Cơ sở 1 (Quận 1)*), **Địa chỉ in trên hóa đơn** và **Số điện thoại hỗ trợ**.
   * Trong mục quản trị Chi nhánh: nhấn **Thêm chi nhánh mới** để khai báo mã chi nhánh (`HCM-Q1`, `HCM-TD`...), địa chỉ, số điện thoại; hoặc bật/tắt trạng thái **Hoạt động (`is_active`)** để tạm ngưng giao dịch một chi nhánh mà vẫn giữ nguyên toàn bộ lịch sử sổ kho.
2. **Cài đặt kết nối & PWA (Đồng bộ):**
   * Theo dõi **Trạng thái máy chủ cục bộ (Local Server)** (`Đang kết nối (Online)`).
   * Bật/tắt công tắc **Đồng bộ dữ liệu thời gian thực qua SignalR** (`Bật / Tự động`).
   * Bật/tắt **Chế độ Offline PWA** (`Cho phép lưu cache ngoại tuyến` cho khung ứng dụng).
3. **Cài đặt máy in & Hóa đơn:**
   * Chọn **Khổ giấy in** nhiệt (`K80 (80mm)` hoặc `K58 (58mm)`).
   * Chọn **Cổng kết nối máy in hóa đơn** (`LAN`, `USB`, `Bluetooth`).
   * Nhấn **Kiểm tra máy in (Test Print)** để in thử mẫu kiểm tra trước khi vào ca.
4. **Lưu thay đổi:** Nhấn **Lưu cài đặt** để áp dụng, hoặc nhấn **Khôi phục mặc định** để quay lại cấu hình chuẩn ban đầu.

### 3.3. Quản lý Tài khoản & Gán vai trò phân quyền (`FR-AUTH-03`)

1. Trong phân hệ **Cài đặt hệ thống**, chọn thẻ **Người dùng & Vai trò**.
2. Nhấn **Tạo tài khoản**, nhập Họ tên, Email, Tên đăng nhập và Mật khẩu khởi tạo.
3. Gán đúng **Vai trò** (`Store Manager`, `Warehouse Staff` hoặc `Cashier`) và chọn **Chi nhánh phụ trách** (`branch_id`).
4. Nhấn **Lưu**; tài khoản mới khi đăng nhập sẽ chỉ thấy và thao tác được đúng các chức năng và dữ liệu thuộc chi nhánh đã phân công.

---

## Ep04: Bảng điều khiển Admin Dashboard & Tổng quan vận hành

### 4.1. Bố cục không gian làm việc (Workspace Layout)

Giao diện Web Admin (`http://localhost:5173`, khung `app-shell`) được chia thành 4 khu vực cố định, hỗ trợ tự động co giãn trên máy tính bảng và điện thoại (khi chiều rộng màn hình $\le 760\text{px}$, thanh Sidebar tự động thu gọn thành cột biểu tượng):

| Khu vực | Thành phần hiển thị | Cách sử dụng & Hành vi hệ thống |
| :--- | :--- | :--- |
| **1. Thanh điều hướng trái (Sidebar)** | Logo **OISM — INVENTORY & SALES**, 6 mục `WORKSPACE` (`Tổng quan`, `Tồn kho`, `Sản phẩm`, `Đơn hàng`, `Lịch sử kho`, `Báo cáo`) và đèn trạng thái `Backend API` | Nhấn vào từng mục để chuyển màn hình tức thì. Khi chọn `Tổng quan`, `Tồn kho` hoặc `Sản phẩm`, hệ thống tự động gọi lại API tồn kho; khi chọn `Lịch sử kho`, hệ thống tự tải lại sổ cái kho. |
| **2. Thanh tiêu đề trên (Topbar)** | Nhãn `OMNICHANNEL INVENTORY SYSTEM`, tiêu đề phân hệ đang mở và nút **Làm mới** | Xác định màn hình hiện tại. Nhấn **Làm mới** để đồng bộ lại dữ liệu trực tiếp từ Backend/PostgreSQL (nút tự khóa tạm thời trong khi đang tải). |
| **3. Thanh thông báo (Alert Bar)** | Khung màu xanh lá (thành công) hoặc khung màu đỏ (lỗi/cảnh báo) kèm nút đóng `×` | Phản hồi ngay sau mọi thao tác tạo đơn, xác nhận/hủy đơn, điều chỉnh tồn kho hoặc cảnh báo mất kết nối/nhập sai dữ liệu. |
| **4. Vùng nội dung chính (Page Content)** | Thẻ chào mừng, lưới thẻ KPI, ô tìm kiếm, bảng dữ liệu và biểu mẫu đơn hàng | Tự động co giãn lưới từ 4 cột xuống 2 cột ($\le 1100\text{px}$) và 1 cột trên điện thoại ($\le 430\text{px}$). |

### 4.2. Hướng dẫn sử dụng màn hình Tổng quan (`Tổng quan`)

Màn hình **Tổng quan** là trang mở mặc định ngay khi truy cập hệ thống, tổng hợp dữ liệu trực tiếp từ chi nhánh đang cấu hình (`GET /api/inventory/all`):

1. **Thẻ chào mừng (`BRANCH OVERVIEW`):** Xác nhận số liệu đang hiển thị là dữ liệu thật tải trực tiếp từ Backend và PostgreSQL.
2. **4 thẻ KPI Tồn kho thời gian thực (bản Web đang chạy):**
   * **Mặt hàng trong kho:** Tổng số mã SKU hiện có trong tồn kho chi nhánh.
   * **Tổng số lượng tồn:** Tổng giá trị cột `Tồn kho (OnHand)` của toàn bộ mặt hàng.
   * **Số lượng có thể bán:** Tổng giá trị cột `Có thể bán (Available)` sẵn sàng bán.
   * **Mặt hàng sắp hết:** Tổng số mã SKU có lượng khả dụng ở mức cảnh báo ($\text{Available} \le 5$).
3. **Thẻ KPI Kinh doanh & Biểu đồ (bản mở rộng Admin Dashboard / `dashboardstats.tsx`):**
   * Hiển thị các chỉ số *Doanh thu hôm nay / Doanh thu thuần*, *Tổng giá vốn (COGS WAC)*, *Lợi nhuận gộp*, *Đơn hàng mới / Đơn hoàn tất*, *Cảnh báo tồn kho*, biểu đồ cột *Doanh thu 7 ngày (T2–CN)* và bảng *Sản phẩm nhập/xuất kho*.
4. **Bảng Tồn kho gần đây & Cảnh báo tồn thấp (`FR-REP-03`):**
   * Hiển thị nhanh tối đa **6 mặt hàng đầu tiên** của chi nhánh. Nhấn nút **Xem tồn kho** ở góc phải bảng để mở màn hình Quản lý tồn kho đầy đủ, hoặc nhấn **Tải lại** ở chân trang để làm mới dữ liệu.
   * Bảng cảnh báo (`stockalerttable.tsx`) làm nổi bật các mã SKU dưới ngưỡng an toàn kèm khuyến nghị ***"Cần lập phiếu nhập"***.

---

## EP05: Quản lý Danh mục, Thương hiệu, Sản phẩm, Biến thể SKU & Giá (FR-PROD)

### 5.1. Quản lý Danh mục phân cấp & Thương hiệu (`FR-PROD-01`)

1. Mở phân hệ **Quản lý Sản phẩm**, chọn thẻ **Danh mục** hoặc **Thương hiệu**.
2. Nhấn **Thêm mới**:
   * **Với Danh mục:** Nhập Tên danh mục (ví dụ: *Thời trang Nam* $\rightarrow$ *Áo Nam*, *Quần Nam*; *Thời trang Nữ* $\rightarrow$ *Áo & Đầm Nữ*) và chọn **Danh mục cha** nếu là danh mục cấp con.
   * **Với Thương hiệu:** Nhập tên thương hiệu (*OISM Basic*, *Saigon Denim*, *Linen & Co.*, *Urban Street*) cùng mô tả.
3. Nhấn **Lưu** để áp dụng trong phạm vi Tenant.

### 5.2. Quy ước đặt mã SKU & Mã vạch chuẩn EAN-13

Để tối ưu tìm kiếm trên Admin Dashboard và quét mã tại quầy POS, hệ thống áp dụng chuẩn mã hóa 3 phân đoạn `[NHÓM]-[MÀU]-[SIZE]` (ví dụ `ATB-TRG-M`: Áo Thun Cotton Basic — Trắng — Size M) đi kèm mã vạch **EAN-13** gồm $13$ chữ số (ví dụ `8938507000011`). Cơ sở dữ liệu áp đặt ràng buộc duy nhất cho cả Mã SKU và Mã vạch trong cùng một Tenant (`uq_sku_tenant_barcode`).

### 5.3. Tra cứu Danh sách Sản phẩm & Biến thể SKU

1. Chọn mục **Sản phẩm** (hoặc **Quản lý Sản phẩm**) trên thanh Sidebar. Góc trên bên phải hiển thị tổng số lượng SKU hiện có (`X SKU`).
2. Nhập mã SKU, mã vạch hoặc tên sản phẩm vào ô tìm kiếm ***"Tìm theo SKU hoặc tên sản phẩm..."***; bảng tự động lọc theo từng ký tự gõ (hỗ trợ tiếng Việt, không phân biệt hoa/thường).
3. Theo dõi các cột thông tin: **SKU**, **Sản phẩm**, **Giá bán**, **Tồn kho**, **Đã giữ**, **Có thể bán** (nhãn xanh lá khi $> 5$; nhãn cam cảnh báo khi $\le 5$). Trên bản đầy đủ có thêm nút **+ Thêm mới**, cột **Hình ảnh**, nút hành động **Sửa/Xóa** và thanh phân trang.

> **Lưu ý trên phiên bản Web hiện tại (`http://localhost:5173`):** Vì Backend hiện chưa cung cấp API CRUD danh mục sản phẩm độc lập, tab **Sản phẩm** đang tổng hợp danh sách SKU trực tiếp từ dữ liệu tồn kho thật tại chi nhánh và không tạo dữ liệu giả. Quy trình tạo/sửa bên dưới áp dụng theo đặc tả đầy đủ `FR-PROD-02` $\rightarrow$ `FR-PROD-04`.

### 5.4. Tạo mới & Chỉnh sửa Chi tiết Sản phẩm, Biến thể SKU, Bảng giá (`FR-PROD-02` $\rightarrow$ `FR-PROD-04`)

1. Tại màn hình Danh sách Sản phẩm, nhấn **+ Thêm mới** hoặc chọn nút **Detail** / **Sửa** tại sản phẩm cần cập nhật để mở màn hình **Chi tiết chỉnh sửa sản phẩm**.
2. **Thông tin chung & Biến thể SKU (`FR-PROD-02`):** Nhập **Tên sản phẩm**, **Mã SKU** duy nhất, chọn **Danh mục**, **Thương hiệu** và khai báo thuộc tính biến thể (Màu sắc, Kích cỡ, Chất liệu). Hệ thống tự động chặn lưu nếu mã SKU bị trùng trong cùng Tenant.
3. **Cấp Mã vạch (`FR-PROD-03`):** Nhập mã vạch sẵn có trên tem hàng hoặc nhấn tạo mã tự động theo chuẩn EAN-13 / Code128.
4. **Thiết lập Giá vốn, Giá bán & Tồn kho (`FR-PROD-04`):** Nhập **Giá bán niêm yết** theo từng chi nhánh và ngày hiệu lực (`effective_from`), kiểm tra **Giá vốn** và **Số lượng tồn kho**. Giá bán niêm yết luôn được tách biệt với Giá vốn bình quân gia quyền (WAC).
5. Nhấn **Lưu thay đổi** để ghi nhận (hoặc nhấn **Hủy** để hoàn tác).

---

## EP06: Quản lý Kho, Sổ cái Tồn kho & Tính Giá vốn WAC (FR-INV & FR-COST)

### 6.1. Xem tồn kho chi nhánh & Điều chỉnh tồn kho kiểm kê (`PUT /api/inventory/adjust`)

Phân hệ **Tồn kho** cho phép theo dõi số tồn vật lý, số đang giữ chỗ, số có thể bán và điều chỉnh kiểm kê trực tiếp vào cơ sở dữ liệu PostgreSQL:

1. **Bước 1 — Mở danh sách tồn kho:** Chọn mục **Tồn kho** trên thanh Sidebar. Hệ thống gọi `GET /api/inventory/all?branchId=...` và hiển thị tổng số mặt hàng (`X mặt hàng`).
2. **Bước 2 — Tìm kiếm mặt hàng:** Nhập SKU hoặc tên sản phẩm vào ô ***"Tìm theo SKU hoặc tên sản phẩm..."*** để lọc nhanh.
3. **Bước 3 — Mở hộp thoại Điều chỉnh tồn kho:** Tại dòng sản phẩm cần cập nhật, nhấn nút **Điều chỉnh** ở cột cuối cùng bên phải. Cửa sổ **`INVENTORY ADJUSTMENT`** mở ra, hiển thị mã `SKU · Tên sản phẩm`, ô nhập **Số lượng tồn kho mới** và dòng chú thích `Đã giữ: X`.
4. **Bước 4 — Nhập số tồn kho mới hợp lệ:** Giá trị nhập phải đáp ứng 2 quy tắc bắt buộc (được kiểm tra ở cả Frontend và tầng `OISM.Domain`):
   * Phải là **số nguyên không âm** ($\ge 0$). Nếu nhập số âm hoặc số thập phân, hệ thống báo lỗi: *"Tồn kho mới phải là số nguyên không âm."*
   * Phải **lớn hơn hoặc bằng số lượng đang giữ chỗ** ($\text{NewOnHand} \ge \text{Reserved}$). Nếu thấp hơn, hệ thống báo lỗi: *"Tồn kho mới không được thấp hơn số lượng đã giữ (X)."*
5. **Bước 5 — Lưu và xác nhận:** Nhấn **Lưu thay đổi** (hoặc nhấn **Hủy** / `×` để đóng không lưu). Khi lưu thành công, thanh thông báo xanh hiển thị ***"Đã cập nhật tồn kho trong cơ sở dữ liệu."***, bảng Tồn kho tự động làm mới số dư và Sổ cái kho tự động ghi thêm 1 bút toán điều chỉnh.

### 6.2. Lập Phiếu nhập kho từ Nhà cung cấp & Tự động tính WAC (`FR-INV-02`)

1. Mở phân hệ **Quản lý Nhập/Xuất hàng** $\rightarrow$ **Phiếu nhập kho** (`Goods Receipt`).
2. Chọn khoảng ngày chứng từ, **Chi nhánh nhận hàng** (`HCM-Q1` hoặc `HCM-TD`), **Nhà cung cấp** (ví dụ *Công ty TNHH May Mặc Việt Tiến Phát*) và kiểm tra **Mã phiếu** tự sinh (ví dụ `GR-Q1-YYYYMMDD-XXX`).
3. Thêm từng dòng sản phẩm (`STT`, `Tên sản phẩm`, `Mã SKU`, `Số lượng nhập` $> 0$ và `Đơn giá nhập` $\ge 0$); hệ thống tự cộng cột **Thành tiền**, **Tổng SL** và tổng **Thành tiền** cuối phiếu.
4. Kiểm tra kỹ số liệu rồi nhấn **Lưu & Đóng** (hoặc **Hủy** nếu không lưu).
5. **Tác động tự động của hệ thống:**
   * Ghi bút toán dương (`GOODS_RECEIPT`) vào Sổ cái tồn kho (`inventory_transaction`).
   * Tăng đồng thời `OnHand` và `Available`.
   * Tự động tính lại **Giá vốn bình quân gia quyền (WAC)** mới cho từng SKU trong phiếu.

### 6.3. Chuyển kho nội bộ (`Stock Transfer`) & Kiểm kê kho (`Stocktake`)

* **Chuyển kho nội bộ giữa các chi nhánh:**
  1. Chọn **Chuyển kho nội bộ** $\rightarrow$ **Tạo phiếu chuyển kho**.
  2. Chọn **Chi nhánh xuất** (ví dụ Kho Tổng `HCM-TD`) và **Chi nhánh nhận** (ví dụ `HCM-Q1` — hệ thống ràng buộc kho xuất phải khác kho nhận).
  3. Chọn danh sách SKU (ví dụ điều chuyển $10$ chiếc `ACT-HPA-M` đang hết hàng tại Q1) và nhập số lượng chuyển (không vượt quá `Available` tại kho xuất).
  4. Xác nhận **Xuất chuyển** và **Xác nhận nhận hàng** tại kho đích; hệ thống tự ghi đồng thời 2 bút toán đối ứng (`OUT` tại kho xuất, `IN` tại kho nhận) trong Sổ cái tồn kho.
* **Kiểm kê định kỳ (`Stocktake`):**
  1. Tạo phiên kiểm kê tại chi nhánh, dùng máy quét mã vạch hoặc nhập số lượng thực đếm từng SKU.
  2. Hệ thống tự tính chênh lệch giữa số thực đếm và số sổ sách (`OnHand`).
  3. Khi Quản lý duyệt phiên kiểm kê, hệ thống sinh bút toán điều chỉnh chênh lệch tương ứng vào Sổ cái thay vì ghi đè trực tiếp số dư.

### 6.4. Tra cứu Sổ nhật ký kho / Sổ cái biến động kho (`Lịch sử kho` — `FR-INV-01`)

Chọn mục **Lịch sử kho** (hoặc **Sổ nhật ký kho**) trên thanh Sidebar để xem toàn bộ nhật ký biến động tồn kho tại chi nhánh (`GET /api/inventory/ledger?branchId=...`, hỗ trợ lọc theo khoảng thời gian, mã SKU, `productId` và `orderId`). Góc trên bên phải hiển thị tổng số giao dịch (`X giao dịch`).

| Tên cột | Trường API | Ý nghĩa đối soát kiểm toán |
| :--- | :--- | :--- |
| **Thời gian** | `createdAt` | Ngày giờ phát sinh biến động kho theo múi giờ Việt Nam (`vi-VN`) |
| **Loại giao dịch** | `movementType` | Phân loại nghiệp vụ (`NHẬP KHO`, `XUẤT KHO`, giữ chỗ, hoàn giữ chỗ, điều chỉnh) |
| **Product ID** | `productId` | Mã GUID định danh sản phẩm chịu biến động |
| **Số lượng thay đổi** | `quantity` | Lượng tăng hoặc giảm của riêng bút toán đó |
| **Tồn sau giao dịch** | `onHandAfter` | Số dư tồn kho thực tế (`OnHand`) ngay sau khi ghi bút toán |
| **Đã giữ** | `reservedAfter` | Tổng số lượng đang bị khóa giữ chỗ (`Reserved`) ngay sau bút toán |
| **Order ID** | `orderId` | Mã GUID đơn hàng liên quan (hiển thị `—` nếu là điều chỉnh kho thủ công; có thể sao chép mã này sang tab **Đơn hàng** để tra cứu nhanh) |

---

## EP07: Trung tâm Quản lý Đơn hàng Đa kênh & Chống bán vượt (FR-ORD & FR-RSE)

### 7.1. Mô hình đơn hàng chuẩn & Máy trạng thái (`FR-ORD-01`, `FR-ORD-02`)

Mọi đơn hàng phát sinh từ quầy **POS**, tạo thủ công trên Web Admin (`MANUAL`), kênh trực tuyến (`ONLINE`) hay Webhook từ các sàn thương mại điện tử (**Shopee**, **TikTok Shop**, **Lazada**) đều được chuẩn hóa về **Mô hình đơn hàng chuẩn (Canonical Order Model)** với mã đơn tự sinh định dạng `OISM-...` và vận hành theo Máy trạng thái sau:

* **Luồng chính:** `0 (Draft)` $\rightarrow$ `1 (Pending / Reserved)` $\rightarrow$ `2 (Confirmed)` $\rightarrow$ `Completed`
* **Luồng hủy / từ chối:** `1 (Pending / Reserved)` $\rightarrow$ `3 (Cancelled)` hoặc `4 (Rejected)`

| Mã số | Trạng thái | Màu nhãn | Tác động tồn kho & Quy tắc chuyển trạng thái |
| :---: | :--- | :--- | :--- |
| `0` | **Draft** | Cam nhạt | Đơn nháp chưa đưa vào hàng chờ xử lý, chưa khóa tồn kho. |
| `1` | **Pending** *(Reserved)* | Cam nhạt | Trạng thái mặc định ngay khi tạo đơn thành công. Gọi `Reserve()` tăng `Reserved` và giảm `Available`. Cho phép bấm **Xác nhận đơn** hoặc **Hủy đơn**. |
| `2` | **Confirmed** | Xanh lá | Gọi `ConfirmReservation()` giảm đồng thời `OnHand` và `Reserved`, chụp cố định giá vốn WAC và ghi Sổ cái. Quy tắc Domain (`OrderTests.cs`) chặn không cho gọi `Cancel()` sau khi đã `Confirmed`. |
| `3` | **Cancelled** | Đỏ nhạt | Gọi `ReleaseReservation()` giữ nguyên `OnHand` và giảm `Reserved` trả lại `Available`. Quy tắc Domain chặn không cho gọi `Confirm()` sau khi đã `Cancelled`. |
| `4` | **Rejected** | Đỏ nhạt | Đơn bị từ chối xử lý (ví dụ không đủ tồn kho khả dụng hoặc dữ liệu không hợp lệ). |

> **Tự động giải phóng giữ chỗ quá hạn (Hangfire — `FR-SIM-03`):** Tác vụ nền `ExpiredReservationJob` định kỳ quét các bản ghi giữ chỗ (`stock_reservation`) quá thời điểm `expires_at` mà đơn chưa được xác nhận để tự động hủy và hoàn trả hàng về kho khả dụng (`Available`).

### 7.2. Danh sách Đơn hàng tập trung & Cập nhật thời gian thực (SignalR)

Trên thiết kế Trung tâm Quản lý Đơn hàng tập trung (`/admin/orders`):
* **Tìm kiếm & Bộ lọc đa điều kiện:** Tìm theo mã đơn / mã đơn sàn TMĐT / số điện thoại khách hàng; lọc theo Chi nhánh (`HCM-Q1`, `HCM-TD`), Thu ngân, Kênh bán (`POS`, `Shopee`, `TikTok Shop`, `Lazada`, `AdminManual`), Trạng thái đơn và Khoảng thời gian.
* **Thao tác nhanh trên từng dòng đơn:** Xem chi tiết đơn hàng, chỉnh sửa thông tin (khi còn trạng thái hợp lệ) và in hóa đơn/phiếu giao hàng.
* **Cập nhật thời gian thực (`FR-SIM-02`):** Kết nối **SignalR (`OrderHub`)** tự động thông báo và cập nhật đơn mới phát sinh từ POS hoặc Webhook sàn TMĐT mà không cần tải lại trang.

### 7.3. Hướng dẫn Tạo đơn hàng mới trên Web Admin (`POST /api/orders`)

Trên bản Web chạy thực tế tại `http://localhost:5173`, mục **Đơn hàng** bố trí theo 2 cột song song: cột trái dùng để **Tạo đơn hàng**, cột phải dùng để **Tra cứu, Xác nhận và Hủy đơn hàng**.

1. Chọn mục **Đơn hàng** trên thanh Sidebar bên trái.
2. Tại cột **Tạo đơn hàng**, chọn **Nguồn đơn (`source`)**: `POS`, `ONLINE` hoặc `MANUAL` (Backend tự động chuẩn hóa viết hoa và cắt khoảng trắng thừa).
3. Mở hộp chọn **Sản phẩm** (`-- Chọn SKU --`) và chọn mặt hàng cần bán. Mỗi tùy chọn hiển thị rõ `SKU - Tên sản phẩm (có thể bán: X)` để nhân viên đối chiếu tồn kho trước khi đặt.
4. Nhập **Số lượng** (phải là số nguyên $\ge 1$) rồi nhấn nút **Tạo đơn hàng**. *(Nếu chưa chọn sản phẩm hoặc nhập $\le 0$, hệ thống báo lỗi: "Hãy chọn sản phẩm và nhập số lượng nguyên lớn hơn 0.")*
5. **Kết quả sau khi tạo thành công:**
   * Thanh thông báo xanh hiển thị: ***"Đơn hàng đã được tạo trong cơ sở dữ liệu."***
   * Backend kiểm tra tồn kho khả dụng, giữ chỗ (`Reserve`), sinh mã đơn `OISM-...` ở trạng thái **Pending** (`status = 1`).
   * Giao diện tự động điền `Order ID (GUID)` vừa tạo sang ô tra cứu bên cột phải, hiển thị ngay chi tiết đơn và tự động cập nhật lại bảng Tồn kho.

### 7.4. Tra cứu, Xem chi tiết, Xác nhận, Hủy đơn & In phiếu giao (`FR-ORD-03`)

1. **Tra cứu đơn hàng (`GET /api/orders/{orderId}`):**
   * Tại cột **Tra cứu đơn hàng** bên phải, dán mã **Order ID (GUID)** (lấy ngay sau khi tạo đơn hoặc sao chép từ cột `Order ID` trong màn hình **Lịch sử kho**) rồi nhấn nút **Tra cứu**.
2. **Kiểm tra chi tiết đơn hàng:**
   * Xem **Mã đơn hàng** (`orderNumber`), **Nhãn trạng thái** (`Draft`/`Pending`/`Confirmed`/`Cancelled`/`Rejected`), **ID**, **Ngày tạo** (định dạng Việt Nam), danh sách dòng hàng (`Tên sản phẩm × Số lượng`, `Thành tiền`) và dòng **Tổng cộng** (VNĐ). Trên bản mở rộng hiển thị thêm Thu ngân thực hiện, Hình thức thanh toán, Tạm tính, Giảm giá và trạng thái giữ chỗ (`Reserved`/`Deducted`/`Released`).
3. **Thao tác chuyển trạng thái (chỉ hiển thị khi đơn ở trạng thái `Pending`, tức `status === 1`):**
   * **Nhấn `Xác nhận đơn`** (`POST /api/orders/{orderId}/confirm`): Trừ đồng thời `OnHand` và `Reserved`, nhãn chuyển sang màu xanh lá **Confirmed** và thanh thông báo xanh hiển thị ***"Đã xác nhận đơn hàng."***
   * **Nhấn `Hủy đơn`** (`POST /api/orders/{orderId}/cancel`): Giữ nguyên `OnHand`, giải phóng lượng hàng giữ chỗ trả về `Available`, nhãn chuyển sang màu đỏ **Cancelled** và thông báo ***"Đã hủy đơn hàng."***
4. **Đồng bộ & In hóa đơn/phiếu giao:** Ngay sau khi Xác nhận hoặc Hủy, hệ thống tự động tải lại chi tiết đơn, bảng **Tồn kho** và bảng **Lịch sử kho**. Nhấn **In hóa đơn / In phiếu giao hàng** để mở hộp thoại in của trình duyệt.

---

## EP08: Hướng dẫn sử dụng Ứng dụng Bán hàng tại quầy PWA POS (FR-POS)

Ứng dụng **OISM POS** được xây dựng theo chuẩn **Progressive Web App (PWA)** (`manifest.webmanifest`, `start_url: "/pos"`, `display: "standalone"`, màu chủ đạo `#1e3a8a`), tối ưu cho thao tác cảm ứng và phím tắt nhanh của Thu ngân (`Cashier`).

### 8.1. Cài đặt PWA POS & Đăng nhập ca bán hàng

1. **Cài đặt ra màn hình chính (tùy chọn):** Mở trình duyệt Chrome/Edge tại đường dẫn POS, nhấn biểu tượng **Cài đặt (Install OISM POS)** trên thanh địa chỉ để ghim ứng dụng chạy toàn màn hình như phần mềm gốc.
2. **Cơ chế lưu đệm an toàn (`sw.js`):** Service Worker lưu cache `oism-shell-v2` cho khung giao diện tĩnh (`/`, `/index.html`, `/manifest.webmanifest`, `/icon.svg`) giúp mở ứng dụng tức thì, đồng thời **bỏ qua hoàn toàn cache đối với `/api/` và `/backend/`** để số liệu tồn kho và đơn hàng luôn được đọc trực tiếp từ máy chủ.
3. **Đăng nhập ca:** Thu ngân đăng nhập bằng tài khoản có quyền `POS_SELL` (ví dụ `thungan_q1` / `pos.q1@oismfashion.vn`); hệ thống tự động gắn phiên bán hàng vào chi nhánh phụ trách (`HCM-Q1`).

### 8.2. Tìm kiếm sản phẩm nhanh & Quét mã vạch EAN-13 (`FR-POS-01`, `NFR-PERF-01`)

* **Tìm kiếm bằng từ khóa:** Nhập Tên sản phẩm (ví dụ *Áo Thun Cotton*) hoặc Mã SKU (`ATB-TRG-M`) vào thanh tìm kiếm trên cùng; hệ thống trả về danh sách khớp kèm giá bán và tồn khả dụng (mục tiêu độ trễ $\text{p95} < 200\text{ms}$). Nhấn vào sản phẩm để thêm vào giỏ hàng.
* **Quét mã vạch (`Barcode Scan`):**
  1. Đặt con trỏ vào ô tìm kiếm hoặc kích hoạt chế độ Quét mã vạch.
  2. Dùng máy quét USB/Bluetooth (hoặc camera thiết bị) quét tem **EAN-13/Code128** trên sản phẩm (ví dụ `8938507000011` cho `ATB-TRG-M`).
  3. Sản phẩm tự động cộng $+1$ vào giỏ hàng ngay lập tức.

### 8.3. Quản lý Giỏ hàng & Chặn bán vượt tồn kho bảo vệ đơn Online (`FR-POS-02`)

Tại khung **Giỏ hàng**, Thu ngân có thể bấm `+`/`-` điều chỉnh số lượng, nhập chiết khấu dòng hàng (nếu có), gắn thông tin khách hàng thành viên theo số điện thoại hoặc xóa sản phẩm. Mỗi lần thêm hoặc tăng số lượng, POS kiểm tra tức thì công thức $\text{Available} = \text{OnHand} - \text{Reserved}$:

* **Tình huống hết hàng:** Khi quét mã `ACT-HPA-M` (`HCM-Q1` có `OnHand` $= 0$), hệ thống lập tức chặn và hiển thị cảnh báo **Không đủ tồn kho**, gợi ý kiểm tra tồn tại Kho Tổng Thủ Đức (`HCM-TD`).
* **Tình huống bảo vệ đơn Online (Anti-Oversell):** Mã `DML-TRS-S` tại `HCM-Q1` có $5$ chiếc vật lý nhưng đang có $3$ chiếc bị giữ chỗ cho đơn Shopee ($\text{Reserved} = 3 \Rightarrow \text{Available} = 2$). Nếu Thu ngân cố nhập số lượng $3$, hệ thống chặn ngay và thông báo chỉ được bán tối đa $2$ chiếc.

### 8.4. Thanh toán nhanh nguyên tử (Tiền mặt / VietQR) & In hóa đơn (`FR-POS-03`, `FR-POS-04`)

1. **Bước 1 — Chọn phương thức thanh toán:** Nhấn **Thanh toán** cuối giỏ hàng, chọn **Tiền mặt (`Cash`)** hoặc **Chuyển khoản mã QR (`QrTransfer`)**.
2. **Bước 2 — Thu tiền:**
   * **Tiền mặt:** Nhập số tiền khách đưa để hệ thống tự tính tiền thừa trả khách.
   * **Chuyển khoản QR:** Màn hình hiển thị mã **VietQR** điền sẵn tổng tiền và nội dung chuyển khoản (ví dụ `VIETQR-OISM-...`); Thu ngân xác nhận ngay khi nhận được báo có.
3. **Bước 3 — Xử lý giao dịch nguyên tử (`FR-POS-04`):** Nhấn **Hoàn tất thanh toán**. Backend thực hiện trọn vẹn chuỗi `Reserve` $\rightarrow$ `Confirm` $\rightarrow$ `Deduct` trong **một giao dịch cơ sở dữ liệu nguyên tử duy nhất** (mục tiêu độ trễ $< 500\text{ms}$ theo `NFR-PERF-01`), chụp cố định giá vốn WAC và ghi bút toán `POS_SALE` vào Sổ cái tồn kho.
4. **Bước 4 — Xem trước & In hóa đơn (`FR-POS-03`):** Màn hình **Thanh toán thành công** hiển thị bản xem trước hóa đơn (tên cửa hàng, chi nhánh, mã đơn, ngày giờ, danh sách SKU, chiết khấu, tổng thanh toán, phương thức thanh toán) và kích hoạt hộp thoại in của trình duyệt (**Browser Print API** — `window.print()`). Nhấn **Đơn mới** để phục vụ khách tiếp theo.

---

## EP09: Báo cáo Kinh doanh, Cảnh báo Tồn kho & Đề xuất Nhập hàng AI (FR-REP & AI)

### 9.1. Báo cáo Doanh thu thuần, Giá vốn (COGS) và Lợi nhuận gộp (`FR-REP-01`)

Phân hệ **Báo cáo Doanh thu** dành riêng cho Chủ cửa hàng (`Owner`) và Quản lý chi nhánh (`Store Manager` — quyền `REPORT_VIEW`), hỗ trợ lọc theo Khoảng thời gian (`DD/MM/YY`), Chi nhánh, Kênh bán (`POS`, `Shopee`, `TikTok Shop`, `Lazada`), từng SKU và xuất bảng tính qua nút **Xuất file Excel**:

* **4 chỉ số tổng hợp đầu trang:** Tổng doanh thu kỳ (kèm tỷ lệ tăng trưởng `%`), Tổng đơn hàng, Sản phẩm bán ra và Lợi nhuận gộp, đi kèm biểu đồ xu hướng doanh thu theo ngày và bảng tỷ trọng đóng góp từng SKU.
* **Công thức hạch toán chuẩn:**
  * **Doanh thu thuần:** Tổng giá trị các đơn hàng đã hoàn tất sau khi trừ chiết khấu (loại trừ hoàn toàn đơn đã hủy hoặc từ chối).
  * **Tổng Giá vốn hàng bán (Total COGS):**
    $$\text{Tổng COGS} = \sum (\text{Số lượng bán} \times \text{CostPriceSnapshot})$$
  * **Lợi nhuận gộp:**
    $$\text{Lợi nhuận gộp} = \text{Doanh thu thuần} - \text{Tổng COGS}$$
* **Hiệu năng mục tiêu (`NFR-PERF-01`):** Thời gian tải báo cáo tổng hợp dưới $2\text{ giây}$ cho tập dữ liệu $< 100.000$ bản ghi.

> **Trạng thái trên phiên bản Web hiện tại (`http://localhost:5173`):** Vì Backend trong nhánh hiện tại chưa cung cấp endpoint thống kê doanh thu và đơn hàng, tab **Báo cáo** hiển thị minh bạch thông báo: *"Báo cáo chưa khả dụng — Backend hiện chưa có endpoint báo cáo doanh thu hoặc thống kê đơn hàng. Màn hình này chưa hiển thị số liệu giả."* Các thành phần giao diện mẫu đã được chuẩn bị sẵn trong `frontend/src/components/dashboardstats.tsx` và `stockalerttable.tsx`.

### 9.2. Báo cáo Giá trị tồn kho & Cảnh báo tồn dưới ngưỡng (`FR-REP-02`, `FR-REP-03`)

* **Giá trị tồn kho & Tốc độ luân chuyển:** Thống kê tổng giá trị vốn đang tồn tại từng chi nhánh theo công thức $\sum (\text{OnHand} \times \text{WAC})$, phân loại nhóm hàng bán chạy (`Fast-moving`) và hàng tồn chậm luân chuyển (`Slow-moving`).
* **Cảnh báo tồn kho tự động (`FR-REP-03`):** Khi $\text{Available} \le \text{Ngưỡng an toàn}$ ($\le 5$ trên giao diện Web hiện tại, hoặc ngưỡng riêng của các mã như `ATB-NVY-XL`, `QJN-DEN-34`, `HDN-NAU-XL`), hệ thống sinh thông báo `LOW_STOCK`, tô màu cam cảnh báo trên Dashboard và hiển thị khuyến nghị ***"Cần lập phiếu nhập"***.

### 9.3. Mô-đun AI Dự báo nhu cầu & Đề xuất nhập hàng (`14-ai-reordering`)

Phân hệ ứng dụng AI khai thác trực tiếp dữ liệu bán hàng lịch sử từ Sổ cái tồn kho để gợi ý kế hoạch nhập hàng tối ưu:

1. **Dữ liệu đầu vào (`input-data.md`):** Chuỗi thời gian số lượng bán theo ngày của từng SKU tại từng chi nhánh, mức tồn khả dụng hiện tại (`Available`) và thời gian giao hàng dự kiến của nhà cung cấp (Lead Time).
2. **Các chỉ số đề xuất (`reorder-recommendation.md`):**
   * **Tốc độ tiêu thụ dự báo (Forecasted Demand):** Lượng hàng ước tính sẽ tiêu thụ trong chu kỳ $7$–$30$ ngày tới.
   * **Điểm đặt hàng lại (Reorder Point):** Ngưỡng tồn kho cần kích hoạt đặt hàng để không bị đứt hàng trong thời gian chờ giao.
   * **Số lượng đề xuất nhập / điều chuyển:** Ưu tiên các SKU hết hàng hoặc tồn thấp (như `ACT-HPA-M`, `QJN-DEN-34`, `HDN-NAU-XL`).
3. **Giới hạn sử dụng AI (`ai-limitations.md`):** Kết quả dự báo mang tính hỗ trợ quyết định; người quản lý cần cân nhắc thêm các yếu tố biến động ngoài dữ liệu lịch sử như chiến dịch Flash Sale lớn, dịp lễ Tết hoặc chuyển mùa trước khi lập phiếu nhập hàng chính thức.

---

## EP10: Bộ công cụ Kiểm thử, Giả lập Webhook & Tác vụ nền (FR-SIM & NFR-PERF)

Thư mục `backend/oism-backend-tools/` cung cấp 3 công cụ dòng lệnh (Node.js + TypeScript) phục vụ kiểm thử đơn hàng đa sàn, kiểm thử chịu tải đồng thời chống oversell và sinh dữ liệu thử nghiệm, kết hợp bộ xUnit test tại `backend/tests/OISM.Domain.Tests/`.

### 10.1. Cấu hình tệp `.env` cho `oism-backend-tools` (`shared/config.ts`)

| Biến môi trường | Giá trị mặc định | Chức năng cấu hình |
| :--- | :--- | :--- |
| `API_BASE_URL` | `http://localhost:5000` | Địa chỉ gốc Backend API (đặt `http://localhost:5185` khi chạy cổng dev mặc định của `OISM.WebAPI`) |
| `API_TOKEN` | *(trống)* | Chuỗi JWT được `shared/http-client.ts` tự động gắn vào header `Authorization: Bearer <token>` |
| `API_TIMEOUT_MS` | `15000` | Thời gian chờ tối đa mỗi HTTP request (ms) |
| `WEBHOOK_PATH` | `/api/webhooks/orders` | Đường dẫn tiếp nhận webhook đơn hàng từ các sàn TMĐT |
| `ORDER_CREATE_PATH` | `/api/orders` | Đường dẫn tạo đơn hàng dùng cho Concurrency Runner |
| `INVENTORY_CHECK_PATH` | *(trống)* | Endpoint kiểm tra lại số dư tồn kho sau bài test đồng thời |
| `DEFAULT_TENANT_ID`, `DEFAULT_BRANCH_ID`, `DEFAULT_SKU_ID` | *(trống)* | Các mã định danh mặc định theo Backend |
| `WEBHOOK_SECRET` | *(trống)* | Khóa bí mật ký chữ ký HMAC-SHA256 gửi qua header `X-Webhook-Signature` |

### 10.2. Công cụ 1 — Trình giả lập Webhook đa sàn (`WEB-01: Webhook Simulator`)

Gửi payload sự kiện `order.created` giả lập cho 3 sàn **Shopee**, **TikTok Shop** và **Lazada**. Mỗi request tự sinh `eventId` (UUID) duy nhất, mã đơn theo tiền tố sàn (`SP`, `TT`, `LZ`), trạng thái mặc định (`READY_TO_SHIP`, `UNPAID`, `pending`) kèm header `X-Event-Id`, `X-Platform` và `X-Webhook-Signature` (HMAC-SHA256) nhằm kiểm thử tính lũy đẳng (idempotency):

```bash
npm run webhook -- --platform shopee --count 5
npm run webhook -- --platform tiktok --count 10
npm run webhook -- --platform lazada --count 3
```

* **Báo cáo & Nghiệm thu:** Kết quả từng request (`[OK]`/`[FAIL]`, mã HTTP, độ trễ ms) được lưu tại `webhook-simulator/reports/webhook-<timestamp>.json`. Không ghi nhận riêng mã HTTP `2xx` là bằng chứng giữ hàng thành công nếu chưa đối chiếu phản hồi nghiệp vụ và tồn kho.

### 10.3. Công cụ 2 — Kiểm thử Đồng thời Flash Sale (`CON-01: Concurrency Runner`)

Mô phỏng tối thiểu $50$ yêu cầu đặt mua cùng một SKU tại cùng một chi nhánh chạy song song để kiểm chứng `NFR-PERF-02` và `FR-RSE`:

```bash
npm run concurrency -- --sku SKU-DEMO-001 --branch BRANCH-DEMO-001 --quantity 1 --requests 50 --concurrency 50
```

> **Tiêu chí nghiệm thu & Cảnh báo an toàn (`CON-01`):**
> * **Báo cáo tự động:** Xuất tệp `concurrency-runner/reports/concurrency-<timestamp>.json` thống kê `totalRequests`, `successful`, `failed`, `durationMs`, `throughputPerSecond`, `latencyMs` (`average`, `p95`, `max`) và phân bổ `statusCounts`.
> * **Không bán vượt tồn kho:** Với tồn ban đầu $N$ và tổng lượng đặt $> N$, tổng lượng được xác nhận tuyệt đối $\le N$ và $\text{available} = \text{on\_hand} - \text{reserved} \ge 0$. Các request bị từ chối do hết hàng là hành vi hợp lệ, không phải lỗi công cụ.
> * **Cảnh báo môi trường:** **Tuyệt đối KHÔNG chạy công cụ này trên môi trường production.** Luôn kiểm tra lại tồn kho qua `INVENTORY_CHECK_PATH` hoặc truy vấn trực tiếp trên PostgreSQL sau khi chạy test.

### 10.4. Công cụ 3 — Sinh dữ liệu kiểm thử (`DAT-01: Data Generator`)

Sinh bộ dữ liệu giả lập có liên kết nhất quán `tenant` $\rightarrow$ `branch` / `product` / `SKU` / `inventory` / `order` bằng UUID và xuất ra tệp JSON (chế độ mặc định không ghi vào database):

```bash
npm run generate -- --tenants 2 --branches 2 --products 20 --skus 2 --orders 10 --out ./output/demo-data.json
```

Hỗ trợ cờ `--dry-run` để chạy thử an toàn và cờ `--seed-api` (chỉ bật sau khi chốt mapping DTO theo Swagger; không seed vào production).

### 10.5. Chạy bộ Kiểm thử Đơn vị tầng Domain (`OISM.Domain.Tests`)

Xác minh tự động toàn bộ quy tắc bất biến của `Inventory` (`InventoryTests.cs`), `OrderItem` (`OrderItemTests.cs`) và `Order State Machine` (`OrderTests.cs`) bằng xUnit trên .NET 8:

```powershell
dotnet test .\backend\tests\OISM.Domain.Tests\OISM.Domain.Tests.csproj
```

---

## EP11: Xử lý sự cố thường gặp (Troubleshooting) 

### 11.1. Bảng chẩn đoán và khắc phục sự cố thường gặp

| Hiện tượng / Thông báo lỗi | Nguyên nhân phổ biến | Hướng dẫn khắc phục chi tiết |
| :--- | :--- | :--- |
| ***"Không thể kết nối Backend. Hãy kiểm tra Backend đang chạy tại http://localhost:5185."*** | Máy chủ `OISM.WebAPI` chưa khởi động, đã dừng hoặc đang chạy ở cổng khác. | Mở Terminal chạy lại `dotnet run --project .\backend\src\OISM.WebAPI\OISM.WebAPI.csproj`. Nếu đổi cổng, sửa trường `target` trong `frontend/vite.config.ts` rồi khởi động lại `npm run dev`. |
| ***"Proxy đang trả về trang HTML thay vì API. Kiểm tra vite.config.ts và khởi động lại Vite."*** | Biến `VITE_API_BASE_URL` sai cấu hình hoặc chưa khởi động lại Vite sau khi sửa proxy. | Đảm bảo `VITE_API_BASE_URL=/backend` trong `frontend/.env`, kiểm tra khối `server.proxy['/backend']` trong `vite.config.ts` và chạy lại `npm run dev`. |
| **Danh sách Tồn kho / Lịch sử kho trống dù PostgreSQL đã có dữ liệu.** | `VITE_TENANT_ID` hoặc `VITE_BRANCH_ID` trong `.env` không khớp GUID đã seed trong DB. | Kiểm tra chính xác GUID của Tenant và Branch trong PostgreSQL, cập nhật lại `frontend/.env` rồi khởi động lại Vite. |
| ***"Tồn kho mới không được thấp hơn số lượng đã giữ (X)."*** | Nhập số tồn điều chỉnh nhỏ hơn lượng hàng đang giữ chỗ cho các đơn `Pending`. | Nhập số lượng tồn mới $\ge X$, hoặc sang tab **Đơn hàng** để Xác nhận/Hủy các đơn `Pending` trước khi điều chỉnh kho. |
| **Không tạo được đơn / POS báo hết hàng dù trên kệ vẫn còn sản phẩm.** | Hàng trên kệ đã bị giữ chỗ (`Reserved`) cho đơn Online chưa duyệt. | Xem cột **Đã giữ** tại tab **Tồn kho**; không bán vượt cột **Có thể bán** để tránh oversell. Duyệt hoặc hủy các đơn Online hết hạn để giải phóng hàng. |
| **Giao diện Web vẫn hiển thị bản cũ sau khi cập nhật mã nguồn.** | Service Worker (`sw.js`) lưu cache khung tĩnh `oism-shell-v2` trên trình duyệt. | Nhấn `Ctrl + Shift + R` (Hard Reload) hoặc mở DevTools $\rightarrow$ Application $\rightarrow$ Clear site data rồi tải lại trang. |
| **Quét mã vạch trên POS nhưng sản phẩm không tự thêm vào giỏ.** | Con trỏ chưa đặt đúng ô tìm kiếm hoặc máy quét chưa bật hậu tố `Enter`. | Nhấn vào ô tìm kiếm POS (hoặc bật chế độ Quét mã) và thiết lập đầu đọc mã vạch tự động gửi phím `Enter` sau khi quét. |
| **Không hiện hộp thoại in hóa đơn sau khi thanh toán POS.** | Trình duyệt đang chặn Pop-up hoặc chưa cấu hình máy in mặc định. | Cấp quyền bật cửa sổ/in cho địa chỉ POS trong cài đặt trình duyệt và nhấn nút **In lại hóa đơn** trên màn hình xem trước. |



---

## EP12: Phụ lục — Đối chiếu phạm vi API & Bảng tham chiếu nhanh

### 12.1. Bảng đối chiếu trạng thái các phân hệ trên mã nguồn hiện tại

| Phân hệ / Tính năng | Trạng thái thực tế trên mã nguồn | Tệp nguồn kỹ thuật tương ứng |
| :--- | :--- | :--- |
| **Tổng quan tồn kho (`Dashboard`)** | Đã kết nối API thật (`GET /api/inventory/all`) | `frontend/src/App.tsx`, `frontend/src/api.ts` |
| **Quản lý & Điều chỉnh tồn kho** | Đã kết nối API thật (`PUT /api/inventory/adjust`) | `frontend/src/App.tsx`, `OISM.Domain/Entities/Inventory.cs` |
| **Danh sách Sản phẩm (theo tồn kho)** | Đã kết nối API thật (tổng hợp từ tồn kho chi nhánh) | `frontend/src/App.tsx` *(CRUD độc lập theo thiết kế `FR-PROD`)* |
| **Đơn hàng (Tạo, Tra cứu ID, Xác nhận, Hủy)** | Đã kết nối API thật (`POST /api/orders`, `GET`, `/confirm`, `/cancel`) | `frontend/src/App.tsx`, `frontend/src/api.ts` *(API liệt kê danh sách chờ mở rộng)* |
| **Lịch sử biến động kho (`Ledger`)** | Đã kết nối API thật (`GET /api/inventory/ledger`) | `frontend/src/App.tsx`, `frontend/src/api.ts` |
| **Báo cáo Doanh thu & Lợi nhuận** | Hiển thị trạng thái chờ endpoint (không giả lập số liệu) | `frontend/src/App.tsx`, `components/dashboardstats.tsx`, `stockalerttable.tsx` |
| **Đăng nhập RBAC & POS PWA** | Có sẵn khung giao diện mẫu, manifest PWA và `sw.js` | `frontend/public/manifest.webmanifest`, `sw.js`, `components/loginpage.tsx`, `authcontext.tsx` |
| **Bộ công cụ Kiểm thử & Unit Tests** | Hoạt động hoàn chỉnh (CLI Node/TS + xUnit .NET 8) | `backend/oism-backend-tools/`, `backend/tests/OISM.Domain.Tests/` |

### 12.2. Bảng tham chiếu nhanh API Endpoint đang kết nối trực tiếp (`frontend/src/api.ts`)

| Phương thức | Đường dẫn API | Tham số / Dữ liệu gửi lên | Mục đích sử dụng |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/inventory/all` | Query: `branchId`, Header: `X-Tenant-Id` | Lấy danh sách tồn kho toàn chi nhánh (`OnHand`, `Reserved`, `Available`) |
| `PUT` | `/api/inventory/adjust` | JSON: `{ branchId, productId, newOnHand }` | Điều chỉnh tồn kho kiểm kê (kiểm tra `newOnHand >= reserved`) |
| `GET` | `/api/inventory/ledger` | Query: `branchId`, tùy chọn `productId`, `orderId` | Tra cứu Sổ cái lịch sử biến động kho |
| `POST` | `/api/orders` | JSON: `{ branchId, source, items: [{ productId, quantity }] }` | Tạo đơn hàng mới ở trạng thái `Pending` và giữ chỗ tồn kho |
| `GET` | `/api/orders/{orderId}` | Path: `orderId` (GUID) | Tra cứu chi tiết một đơn hàng cụ thể |
| `POST` | `/api/orders/{orderId}/confirm` | Path: `orderId` (GUID) | Xác nhận đơn `Pending` $\rightarrow$ `Confirmed`, trừ `OnHand` & `Reserved` |
| `POST` | `/api/orders/{orderId}/cancel` | Path: `orderId` (GUID) | Hủy đơn `Pending` $\rightarrow$ `Cancelled`, giải phóng `Reserved` về `Available` |