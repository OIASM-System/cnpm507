# OISM – Backend FR/NFR Traceability Mapping

- **Repository:** `cnpm507`
- **Backend solution:** `backend/OISM.sln`
- **Backend source root:** `backend/src/`
- **Ngày đối chiếu:** 2026-11-16
- **Mục đích:** Giúp nhóm và giảng viên truy vết từ yêu cầu FR/NFR đến mã nguồn Backend hiện có.

> **Phạm vi và cách đọc:** Tài liệu này ghi nhận những gì tìm thấy trong source code của repository tại thời điểm đối chiếu. “Có một phần” nghĩa là đã có một phần logic/API liên quan, không có nghĩa toàn bộ yêu cầu đã hoàn thành. “Chưa thấy trong source” nghĩa là không tìm thấy triển khai tương ứng trong `backend/src/`; không khẳng định chức năng đó không tồn tại ở nơi khác.

## 1. Tổng quan cấu trúc Backend được đối chiếu

```text
backend/
├── OISM.sln
└── src/
    ├── OISM.Domain/
    ├── OISM.Application/
    ├── OISM.Infrastructure/
    └── OISM.WebAPI/
```

Solution `backend/OISM.sln` hiện khai báo 4 project: `OISM.Domain`, `OISM.Application`, `OISM.Infrastructure` và `OISM.WebAPI`.

## 2. Bảng truy vết 9 Functional Requirements (FR)

| Mã FR | Chức năng theo tài liệu yêu cầu | Phần Backend tìm thấy trong source | API / vị trí mã nguồn | Đánh giá tại thời điểm đối chiếu |
|---|---|---|---|---|
| FR-AUTH | Đa khách hàng & xác thực | Các API hiện có đọc header `X-Tenant-Id` và truyền `tenantId` xuống service/repository. Chưa tìm thấy Login API, JWT issuance/validation hoặc role authorization trong `backend/src/`. | `OISM.WebAPI/Controllers/InventoryController.cs`; `InventoryLedgerController.cs`; `OrdersController.cs`; `OISM.WebAPI/Program.cs` | **Có một phần về Tenant header; chưa thấy xác thực JWT/đăng nhập/phân quyền.** |
| FR-PROD | Sản phẩm & biến thể SKU | Có Product entity với `TenantId`, `Sku`, `Name`, `UnitPrice`, `IsActive`; có repository tra cứu sản phẩm theo tenant và ID. Chưa tìm thấy ProductController hoặc API CRUD sản phẩm/biến thể. | `OISM.Domain/Entities/Product.cs`; `OISM.Application/Interfaces/Repositories/IProductRepository.cs`; `OISM.Infrastructure/Repositories/ProductRepository.cs`; `OISM.Infrastructure/Persistence/OismDbContext.cs` | **Có một phần về mô hình và truy vấn Product; chưa thấy API quản lý sản phẩm/SKU đầy đủ.** |
| FR-INV | Sổ cái tồn kho (Ledger) & nhập kho | Có truy vấn tồn kho, điều chỉnh OnHand, tính Available, ghi InventoryLedger khi điều chỉnh và truy vấn lịch sử ledger. Chưa thấy API nhập kho chuyên biệt/phiếu nhập kho trong controller hiện tại. | `GET /api/inventory?branchId={id}&productId={id}`; `PUT /api/inventory/adjust`; `GET /api/inventory/ledger?branchId={id}&productId={id}&orderId={id}`. Controllers: `InventoryController.cs`, `InventoryLedgerController.cs`; services: `InventoryService.cs`, `InventoryLedgerService.cs`; entities: `Inventory.cs`, `InventoryLedger.cs` | **Có một phần: xem tồn, điều chỉnh tồn, xem ledger; chưa thấy luồng nhập kho hoàn chỉnh.** |
| FR-COST | Tính giá vốn bình quân (WAC) | Trong Product entity hiện có `UnitPrice`; chưa tìm thấy service/công thức WAC, lịch sử giá vốn hoặc trường `CostPrice` trong các entity và service thuộc `backend/src/`. | Đã kiểm tra `OISM.Domain/Entities/Product.cs`, `OISM.Application/Services/`, `OISM.Infrastructure/Repositories/` | **Chưa thấy triển khai WAC trong source Backend hiện tại.** |
| FR-ORD | Trung tâm đơn hàng tập trung | Có tạo đơn, lấy đơn theo ID, xác nhận và hủy đơn; tạo OrderItem và tính TotalAmount; khi tạo đơn có giữ tồn kho và ghi ledger. Chưa thấy API danh sách đơn, tích hợp Shopee/TikTok hoặc đồng bộ đơn đa kênh. | `POST /api/orders`; `GET /api/orders/{orderId}`; `POST /api/orders/{orderId}/confirm`; `POST /api/orders/{orderId}/cancel`. `OrdersController.cs`; `OrderService.cs`; `Order.cs`; `OrderItem.cs` | **Có một phần: vòng đời đơn cơ bản; chưa thấy trung tâm đơn hàng đa kênh đầy đủ.** |
| FR-RSE | Cơ chế chống bán vượt | Khi tạo đơn, service lấy tồn kho bằng `GetForUpdateAsync`, gọi `Reserve(quantity)` và chạy trong transaction. Entity kiểm tra `Available < quantity` và từ chối nếu không đủ hàng. | `OrderService.cs`; `Inventory.cs`; `InventoryRepository.cs` (`SELECT ... FOR UPDATE`); `UnitOfWork.cs` | **Có logic nền tảng chống giữ/bán vượt ở luồng tạo đơn; cần kiểm thử tải đồng thời và xác minh transaction trên DB thực tế.** |
| FR-POS | Bán hàng tại quầy (PWA POS) | API tạo đơn với `Source` và các OrderItem có thể là nền tảng cho POS. Chưa tìm thấy API checkout riêng, xử lý thanh toán, phát hành/in hóa đơn hoặc mã frontend POS trong Backend. | `POST /api/orders`; `CreateOrderRequest.cs`; `OrderService.cs`; `Order.cs` | **Có một phần nền tảng tạo đơn; chưa thấy quy trình POS/checkout/thanh toán hoàn chỉnh.** |
| FR-REP | Báo cáo và cảnh báo | Chưa tìm thấy ReportController, report service, truy vấn tổng doanh thu/COGS/lợi nhuận hoặc cảnh báo tồn kho thấp trong `backend/src/`. | Đã rà soát `OISM.WebAPI/Controllers/` và `OISM.Application/Services/` | **Chưa thấy triển khai báo cáo/cảnh báo trong source Backend hiện tại.** |
| FR-SIM | Webhook Simulator & Real-time | Trong `backend/src/` chưa tìm thấy webhook endpoint, SignalR Hub hoặc xử lý sự kiện realtime. Repository có thư mục công cụ riêng `backend/oism-backend-tools/` nhưng không được xem là API/Hub đã tích hợp vào WebAPI. | Đã rà soát `OISM.WebAPI/Controllers/`, `Program.cs` và `OISM.Application/Services/` | **Chưa thấy webhook/SignalR tích hợp trong WebAPI hiện tại.** |

## 3. API Backend hiện tìm thấy

Tất cả các API dưới đây nằm dưới base path của WebAPI. Các endpoint trong controller đều yêu cầu header `X-Tenant-Id` hợp lệ.

| Method | Endpoint | Mục đích | Controller |
|---|---|---|---|
| GET | `/api/inventory?branchId={branchId}&productId={productId}` | Lấy số liệu tồn kho (OnHand, Reserved, Available) | `InventoryController` |
| PUT | `/api/inventory/adjust` | Điều chỉnh số lượng OnHand | `InventoryController` |
| GET | `/api/inventory/ledger?branchId={branchId}` | Lấy lịch sử ledger theo chi nhánh; hỗ trợ lọc thêm `productId`, `orderId` | `InventoryLedgerController` |
| POST | `/api/orders` | Tạo đơn hàng và giữ tồn kho cho các dòng hàng | `OrdersController` |
| GET | `/api/orders/{orderId}` | Lấy chi tiết đơn hàng | `OrdersController` |
| POST | `/api/orders/{orderId}/confirm` | Xác nhận đơn; chuyển giữ hàng thành xuất bán | `OrdersController` |
| POST | `/api/orders/{orderId}/cancel` | Hủy đơn; giải phóng số lượng đã giữ | `OrdersController` |

### Header và ví dụ request

Header tenant được controller đọc trực tiếp:

```http
X-Tenant-Id: <tenant-guid>
```

Ví dụ truy vấn tồn kho:

```http
GET /api/inventory?branchId=<branch-guid>&productId=<product-guid>
X-Tenant-Id: <tenant-guid>
```

Ví dụ tạo đơn:

```http
POST /api/orders
Content-Type: application/json
X-Tenant-Id: <tenant-guid>
```

Body phải theo DTO `CreateOrderRequest` trong `OISM.Application/DTOs/Orders/CreateOrderRequest.cs`. Hãy xem DTO này trong source để biết chính xác schema hiện tại; không tự suy đoán field khi tích hợp FE.

## 4. Bảng truy vết 11 Non-Functional Requirements (NFR)

Bảng dưới đây đối chiếu chủ đề NFR trong tài liệu yêu cầu với bằng chứng tìm thấy trong source. Việc có một cơ chế kỹ thuật không đồng nghĩa đã chứng minh đạt ngưỡng hiệu năng hoặc mức độ an toàn yêu cầu.

| Mã NFR | Yêu cầu | Bằng chứng trong source hiện tại | Đánh giá / việc cần xác minh |
|---|---|---|---|
| NFR-PERF-01 | Hiệu năng API / độ trễ | Có EF Core repositories và các API đọc/ghi cơ bản. | **Chưa có benchmark chứng minh SLA/độ trễ mục tiêu.** Cần đo bằng dữ liệu và môi trường triển khai đại diện. |
| NFR-PERF-02 | Xử lý đồng thời / chống bán vượt | `InventoryRepository.GetForUpdateAsync` dùng `SELECT ... FOR UPDATE`; `OrderService` thực hiện tạo đơn trong transaction; `Inventory.Reserve` kiểm tra Available. | **Có cơ chế ở source; chưa có kết quả kiểm thử đồng thời chứng minh ngưỡng yêu cầu.** |
| NFR-TENANT-01 | Cách ly dữ liệu giữa Tenant | Các controller yêu cầu `X-Tenant-Id`; service/repository truyền và lọc theo `tenantId` ở các truy vấn hiện có. | **Có một phần ở các luồng hiện tại; cần rà soát tất cả query và bổ sung test truy cập chéo Tenant.** Chưa thấy Global Query Filter trong `OismDbContext`. |
| NFR-TENANT-02 | Khả năng mở rộng / indexing | `OismDbContext` khai báo một số index, gồm unique index theo TenantId + SKU và TenantId + BranchId + ProductId; có index cho ledger và order. | **Có một phần về index/schema; chưa có benchmark tải hoặc đánh giá kế hoạch truy vấn.** |
| NFR-SEC-01 | Mã hóa và xác thực an toàn | WebAPI bật HTTPS redirection; có kiểm tra header TenantId. | **Chưa thấy JWT authentication, password hashing hoặc cấu hình authorization trong `Program.cs`.** Cần xác minh cấu hình HTTPS tại môi trường deploy. |
| NFR-SEC-02 | Kiểm soát truy cập theo vai trò | Chưa tìm thấy policy/role authorization hoặc `[Authorize]` trong các controller hiện tại. | **Chưa thấy triển khai phân quyền Owner/Cashier trong Backend source hiện tại.** |
| NFR-SEC-03 | Tính toàn vẹn sổ cái / dữ liệu | Có `InventoryLedger` ghi movement, quantity và số tồn sau giao dịch; các thao tác điều chỉnh/tạo đơn cập nhật trong transaction; có check constraint cho tồn kho. | **Có một phần về ledger và ràng buộc dữ liệu; cần kiểm tra yêu cầu bất biến ledger (không sửa/xóa) và test rollback.** |
| NFR-AVAIL-01 | Tính sẵn sàng của hệ thống | Chưa tìm thấy cấu hình health check, readiness/liveness endpoint hoặc cơ chế failover trong WebAPI source. | **Chưa đủ bằng chứng về SLA/availability.** |
| NFR-AVAIL-02 | Khả năng duy trì hoạt động POS | Chưa tìm thấy logic offline queue/sync hoặc cơ chế POS tiếp tục hoạt động khi mất kết nối trong Backend source. | **Chưa thấy triển khai trong source Backend hiện tại.** |
| NFR-MAINT-01 | Khả năng bảo trì theo Clean Architecture | Solution tách Domain, Application, Infrastructure, WebAPI; có interface cho service/repository và DI. | **Có cấu trúc Clean Architecture cơ bản; cần tiếp tục kiểm tra ranh giới dependency và hoàn thiện module còn thiếu.** |
| NFR-MAINT-02 | Ghi log / giám sát tự động | Có logging mặc định của ASP.NET Core ở mức framework, nhưng chưa tìm thấy cấu hình structured logging, audit log hoặc monitoring cụ thể trong source được rà soát. | **Chưa đủ bằng chứng về logging/monitoring theo yêu cầu.** |

## 5. Các file Backend nên mở khi giảng viên hỏi

| Chủ đề | File nên mở |
|---|---|
| API tồn kho | `backend/src/OISM.WebAPI/Controllers/InventoryController.cs` |
| API lịch sử tồn kho | `backend/src/OISM.WebAPI/Controllers/InventoryLedgerController.cs` |
| API đơn hàng | `backend/src/OISM.WebAPI/Controllers/OrdersController.cs` |
| Nghiệp vụ tồn kho | `backend/src/OISM.Application/Services/InventoryService.cs` |
| Nghiệp vụ ledger | `backend/src/OISM.Application/Services/InventoryLedgerService.cs` |
| Nghiệp vụ đơn hàng / giữ hàng | `backend/src/OISM.Application/Services/OrderService.cs` |
| Quy tắc tồn kho / chống bán vượt | `backend/src/OISM.Domain/Entities/Inventory.cs` |
| Ghi nhận lịch sử tồn kho | `backend/src/OISM.Domain/Entities/InventoryLedger.cs` |
| Trạng thái đơn hàng | `backend/src/OISM.Domain/Entities/Order.cs` |
| Cấu hình bảng và index | `backend/src/OISM.Infrastructure/Persistence/OismDbContext.cs` |
| Khóa dòng tồn kho | `backend/src/OISM.Infrastructure/Repositories/InventoryRepository.cs` |
| Transaction | `backend/src/OISM.Infrastructure/Persistence/UnitOfWork.cs` |
| Đăng ký DI / PostgreSQL | `backend/src/OISM.Infrastructure/DependencyInjection.cs` |
| Khởi động WebAPI / Swagger | `backend/src/OISM.WebAPI/Program.cs` |

## 6. Frontend mapping – giới hạn bằng chứng trong ZIP

Repository có các file client dự kiến cho `auth`, `inventory`, `order`, `product`, `report`, `SignalR` tại `frontend/packages/api-client/src/`. Tuy nhiên, trong ZIP được đối chiếu, các file này đang có kích thước **0 byte**. Các file router và E2E spec được liệt kê trong ZIP cũng rỗng. Vì vậy, tài liệu này **không khẳng định các màn hình Frontend đã triển khai hoặc đã kết nối API**.

Khi Frontend có code thực tế, cập nhật bảng liên kết theo mẫu:

| Mã FR | API Backend | Frontend page/component | Trạng thái tích hợp |
|---|---|---|---|
| FR-INV | `GET /api/inventory`, `PUT /api/inventory/adjust` | Điền đường dẫn component thực tế | Chưa xác minh |
| FR-ORD | `/api/orders` và các endpoint chi tiết | Điền đường dẫn component thực tế | Chưa xác minh |
| FR-PROD | Chưa có Product CRUD API được tìm thấy | Điền đường dẫn component thực tế | Chờ Backend API |
| FR-AUTH | Chưa có Login/JWT API được tìm thấy | Điền đường dẫn component thực tế | Chờ Backend API |
| FR-COST / FR-REP / FR-SIM | Chưa tìm thấy API tương ứng trong Backend source | Điền đường dẫn component thực tế | Chờ triển khai |

## 7. Việc cần làm tiếp theo

1. Backend team xác nhận các mục “Chưa thấy” có nằm ở branch/commit khác hay chưa.
2. Bổ sung các module/API còn thiếu theo FR đã thống nhất; không tự tạo FR mới chỉ để khớp code.
3. Bổ sung unit/integration tests cho các luồng đã có, đặc biệt là tenant isolation, giữ hàng đồng thời, confirm/cancel và rollback.
4. Frontend team điền đường dẫn page/component thật và trạng thái gọi API sau khi source FE được cập nhật.
5. Cập nhật trạng thái trong file này sau mỗi lần merge code.

---

**Lưu ý khi báo cáo:** Backend CI Build thành công chỉ chứng minh solution biên dịch thành công tại commit được chạy. Không nên dùng dấu xanh của CI để kết luận toàn bộ FR/NFR đã hoàn thành hoặc đã được kiểm thử.
