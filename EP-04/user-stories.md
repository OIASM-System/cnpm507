# User Stories và Product Backlog

> **Dự án:** Omnichannel Inventory and Sales Management System (OISM)  
> **Phiên bản:** 1.0  
> **Trạng thái:** Bản đặc tả cơ sở  
> **Ngày cập nhật:** 29/10/2026  
> **Phạm vi:** SaaS đa khách hàng, Backend .NET 8, PostgreSQL, ReactJS Admin, PWA POS, SignalR, Hangfire và Docker.

---

## 1. Quy ước

Mẫu: **Là [vai trò], tôi muốn [mục tiêu], để [giá trị].** Ưu tiên: Must/Should/Could. Story chỉ hoàn tất khi đạt tiêu chí trong `acceptance-criteria.md`, có test phù hợp và cập nhật tài liệu/API.

## Epic 1 – Tenant, xác thực và quyền

- **US-AUTH-01 [Must]:** Là chủ cửa hàng, tôi muốn đăng ký tenant và tài khoản Owner để bắt đầu sử dụng hệ thống với dữ liệu riêng.
- **US-AUTH-02 [Must]:** Là người dùng, tôi muốn đăng nhập bằng email/số điện thoại và nhận phiên an toàn để truy cập đúng tenant.
- **US-AUTH-03 [Must]:** Là Owner, tôi muốn gán vai trò Owner/Staff/Cashier để mỗi người chỉ dùng chức năng cần thiết.
- **US-AUTH-04 [Must]:** Là Owner, tôi muốn quản lý chi nhánh/kho để tổ chức tồn và bán hàng theo địa điểm.

## Epic 2 – Catalog

- **US-PROD-01 [Must]:** Là Staff, tôi muốn quản lý danh mục và thương hiệu để tổ chức sản phẩm.
- **US-PROD-02 [Must]:** Là Staff, tôi muốn tạo sản phẩm có biến thể và SKU duy nhất để theo dõi từng mặt hàng.
- **US-PROD-03 [Must]:** Là Staff, tôi muốn gán/sinh barcode để quét nhanh khi bán và kiểm kê.
- **US-PROD-04 [Must]:** Là Owner, tôi muốn cấu hình giá bán lẻ/sỉ độc lập với giá vốn để áp dụng đúng chính sách bán.

## Epic 3 – Inventory Ledger và kho

- **US-INV-01 [Must]:** Là quản lý kho, tôi muốn mọi biến động tồn được ghi vào ledger bất biến để kiểm toán.
- **US-INV-02 [Must]:** Là Staff, tôi muốn xác nhận phiếu nhập để tăng tồn và cập nhật giá vốn tự động.
- **US-INV-03 [Must]:** Là Staff, tôi muốn chuyển kho theo Dispatch/Receive để biết hàng đang vận chuyển và tồn từng nơi.
- **US-INV-04 [Must]:** Là quản lý kho, tôi muốn kiểm kê và tạo bút toán chênh lệch để số liệu khớp thực tế mà vẫn truy vết.
- **US-INV-05 [Should]:** Là Owner, tôi muốn xem lịch sử ledger theo SKU/chi nhánh/thời gian để điều tra sai lệch.

## Epic 4 – COGS

- **US-COST-01 [Must]:** Là Owner, tôi muốn hệ thống tính weighted average cost khi nhập để giá vốn cập nhật nhất quán.
- **US-COST-02 [Must]:** Là kế toán quản trị, tôi muốn snapshot cost trên dòng bán để báo cáo quá khứ không đổi khi nhập lô mới.

## Epic 5 – Centralized Order Hub

- **US-ORD-01 [Must]:** Là Staff, tôi muốn đơn từ POS, Admin và simulator về cùng mô hình để xử lý tập trung.
- **US-ORD-02 [Must]:** Là quản lý, tôi muốn state machine chặn chuyển trạng thái sai để bảo vệ nghiệp vụ.
- **US-ORD-03 [Must]:** Là Staff, tôi muốn lọc, duyệt, in phiếu giao và hủy đơn hợp lệ để vận hành hằng ngày.
- **US-ORD-04 [Must]:** Là hệ thống, tôi muốn nhận webhook idempotent để retry không tạo đơn trùng.

## Epic 6 – Reservation và anti-oversell

- **US-RSE-01 [Must]:** Là người bán, tôi muốn xem available theo chi nhánh để biết lượng thực sự có thể bán.
- **US-RSE-02 [Must]:** Là hệ thống, tôi muốn khóa/version-check stock khi reserve để nhiều đơn đồng thời không giữ vượt tồn.
- **US-RSE-03 [Must]:** Là hệ thống, tôi muốn confirm trừ on-hand/reserved hoặc cancel giải phóng hàng đúng một lần.
- **US-RSE-04 [Must]:** Là Owner, tôi muốn reservation hết hạn được tự động hủy để tồn quay lại khả dụng.

## Epic 7 – PWA POS

- **US-POS-01 [Must]:** Là Cashier, tôi muốn tìm/quét SKU nhanh để thêm hàng vào giỏ.
- **US-POS-02 [Must]:** Là Cashier, tôi muốn được cảnh báo và chặn khi số lượng vượt available để không chiếm hàng đã giữ online.
- **US-POS-03 [Must]:** Là Cashier, tôi muốn nhận tiền mặt hoặc QR và in hóa đơn để hoàn tất giao dịch.
- **US-POS-04 [Must]:** Là doanh nghiệp, tôi muốn checkout reserve/confirm/deduct nguyên tử để không có đơn thanh toán nhưng chưa trừ kho.
- **US-POS-05 [Should]:** Là Cashier, tôi muốn thao tác bằng phím tắt/máy quét trên giao diện cảm ứng để thanh toán nhanh.

## Epic 8 – Báo cáo và cảnh báo

- **US-REP-01 [Must]:** Là Owner, tôi muốn lọc doanh thu, COGS và lợi nhuận theo thời gian/chi nhánh/kênh/SKU để đánh giá hiệu quả.
- **US-REP-02 [Must]:** Là Owner, tôi muốn xem giá trị tồn, hàng bán chạy và chậm bán để tối ưu vốn.
- **US-REP-03 [Must]:** Là Staff, tôi muốn nhận cảnh báo khi available chạm reorder point để bổ sung kịp thời.
- **US-REP-04 [Should]:** Là Owner, tôi muốn export dữ liệu theo đúng bộ lọc để phân tích bên ngoài.

## Epic 9 – Simulator, realtime và job

- **US-SIM-01 [Should]:** Là Tester, tôi muốn gửi payload giả lập theo kênh và mức đồng thời để kiểm thử mapping/locking.
- **US-SIM-02 [Should]:** Là Staff/Cashier, tôi muốn nhận popup/âm báo đơn mới đúng tenant mà không tải lại trang.
- **US-SIM-03 [Must]:** Là quản trị hệ thống, tôi muốn job nền có retry, idempotency và dashboard theo dõi để vận hành tin cậy.

## Epic 10 – AI, chất lượng và triển khai

- **US-AI-01 [Could]:** Là Owner, tôi muốn nhận gợi ý số lượng đặt lại có giải thích để ra quyết định nhập hàng.
- **US-QLT-01 [Must]:** Là lập trình viên, tôi muốn test tự động cho ledger, COGS và reservation để tránh regression.
- **US-QLT-02 [Must]:** Là Tester, tôi muốn chạy kịch bản 50 đơn cạnh tranh một SKU để chứng minh không oversell.
- **US-DEP-01 [Must]:** Là người triển khai, tôi muốn khởi động demo bằng Docker Compose để cài đặt nhất quán.
- **US-DEP-02 [Must]:** Là nhóm phát triển, tôi muốn CI build/test/image tự động để phát hiện lỗi sớm.

## 2. Definition of Ready

Một story sẵn sàng khi có mục tiêu, actor, phạm vi tenant/branch, dữ liệu vào/ra, business rule liên quan, phụ thuộc, tiêu chí chấp nhận và mock/API contract nếu cần.

## 3. Definition of Done

- Code tuân Clean Architecture và review hoàn tất.
- Unit/integration/concurrency test phù hợp đã chạy; module lõi đạt mục tiêu coverage.
- Tenant isolation, authorization, validation và idempotency được kiểm tra.
- Migration/index/API docs được cập nhật.
- Không có lỗi mức Critical/High còn mở.
- Tiêu chí chấp nhận được Product Owner/giảng viên xác minh trên môi trường demo.
