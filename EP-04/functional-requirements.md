# Yêu cầu chức năng

> **Dự án:** Omnichannel Inventory and Sales Management System (OISM)  
> **Phiên bản:** 1.0  
> **Trạng thái:** Bản đặc tả cơ sở  
> **Ngày cập nhật:** 29/10/2026  
> **Phạm vi:** SaaS đa khách hàng, Backend .NET 8, PostgreSQL, ReactJS Admin, PWA POS, SignalR, Hangfire và Docker.

---

## 1. Quy ước

- **Must/Should/Could:** ưu tiên MoSCoW.
- Mỗi yêu cầu phải có kiểm tra quyền, tenant scope, validation, audit phù hợp và phản hồi lỗi xác định.
- “Ghi ledger” luôn có `TenantId`, `BranchId`, `SKUId`, `Type`, `Quantity`, `BalanceAfter`, `ReferenceType`, `ReferenceId`, `CreatedAt` và actor/source khi áp dụng.

## 2. FR-AUTH – Tenant, xác thực và phân quyền

### FR-AUTH-01 – Đăng ký Tenant [Must]
Hệ thống cho phép tạo tenant với TenantId duy nhất, thông tin cửa hàng, múi giờ, tiền tệ mặc định và tài khoản Owner đầu tiên. Việc tạo phải nguyên tử; không tạo tenant mồ côi nếu tạo Owner thất bại.

### FR-AUTH-02 – Xác thực người dùng [Must]
Đăng nhập bằng email hoặc số điện thoại và mật khẩu; trả access JWT tối đa 60 phút cùng refresh token. JWT chứa TenantId, UserId, Role và token identifier. Hỗ trợ logout/revoke.

### FR-AUTH-03 – RBAC [Must]
Áp dụng chính sách Owner, Staff, Cashier ở cả API và màn hình. Ẩn menu không thay thế cho kiểm tra quyền phía server. Yêu cầu bị cấm trả 403, chưa xác thực trả 401.

### FR-AUTH-04 – Quản lý chi nhánh/kho [Must]
Owner tạo, cập nhật, kích hoạt/vô hiệu hóa chi nhánh và kho. Không xóa cứng đơn vị đã phát sinh giao dịch; chi nhánh vô hiệu hóa không nhận giao dịch mới nhưng vẫn xem được lịch sử.

## 3. FR-PROD – Sản phẩm và biến thể

### FR-PROD-01 – Danh mục và thương hiệu [Must]
CRUD danh mục phân cấp và thương hiệu trong tenant; ngăn chu kỳ cây danh mục; hỗ trợ trạng thái active.

### FR-PROD-02 – Sản phẩm, biến thể và SKU [Must]
Quản lý sản phẩm đơn giản hoặc có biến thể. Mỗi SKU code duy nhất trong tenant; thuộc tính biến thể phải tạo tổ hợp không trùng.

### FR-PROD-03 – Mã vạch [Must]
Cho phép sinh/nhập EAN-13 hoặc Code128; kiểm tra định dạng/check digit khi phù hợp và không cho barcode ánh xạ nhiều SKU trong một tenant.

### FR-PROD-04 – Giá niêm yết [Must]
Thiết lập giá bán lẻ/sỉ theo SKU, số tiền không âm, có hiệu lực theo thời gian nếu triển khai price history. Giá bán tách khỏi CostPrice.

## 4. FR-INV – Tồn kho và ledger

### FR-INV-01 – Append-only Inventory Ledger [Must]
Mọi tăng/giảm kho phải tạo ledger trong cùng transaction thay đổi StockBalance. API và database role ứng dụng không được UPDATE/DELETE ledger; chỉnh sai bằng bút toán bù.

### FR-INV-02 – Phiếu nhập [Must]
Tạo phiếu nhập theo nhà cung cấp, dòng SKU, quantity, unit cost; chỉ khi Confirmed mới tăng on-hand, cập nhật weighted average cost và ghi ledger. Confirmed không được sửa.

### FR-INV-03 – Chuyển kho hai bước [Must]
Dispatch làm giảm tồn kho nguồn và tạo lượng in-transit; Receive tăng tồn kho đích và kết thúc in-transit. Không cho nhận quá số đã dispatch trừ khi có luật xử lý chênh lệch được phê duyệt.

### FR-INV-04 – Kiểm kê [Must]
Tạo phiên, chụp số dư hệ thống, nhập số đếm, tính chênh lệch và khi phê duyệt tạo ledger Adjustment. Lưu người đếm, người duyệt và thời điểm.

## 5. FR-COST – Giá vốn

### FR-COST-01 – Weighted Average Cost [Must]
Khi receipt được xác nhận, tính:

`NewCost = ((OldOnHand × OldCost) + (ReceivedQty × UnitCost)) / (OldOnHand + ReceivedQty)`

Làm tròn theo cấu hình tiền tệ; nếu mẫu số bằng 0 thì không thực hiện phép chia và xử lý theo BR-COST-03.

### FR-COST-02 – Snapshot COGS [Must]
Khi Confirmed/POS payment, lưu `OrderItem.CostPrice` từ cost hiện hành trong cùng transaction. Snapshot không đổi khi cost tương lai thay đổi.

## 6. FR-ORD – Order Hub

### FR-ORD-01 – Tiếp nhận đa kênh [Must]
Chuẩn hóa POS, Admin, Shopee Simulator, TikTok Simulator và Lazada Simulator thành Canonical Order. Lưu raw payload an toàn hoặc hash/tham chiếu để truy vết; chống trùng theo channel + external ID/idempotency key.

### FR-ORD-02 – State machine [Must]
Chỉ cho phép chuyển trạng thái hợp lệ: Draft -> Reserved -> Confirmed -> Completed, cùng các nhánh Cancelled được quy định. Mỗi chuyển trạng thái lưu lịch sử actor, timestamp và lý do.

### FR-ORD-03 – Xử lý đơn [Must]
Staff xem/lọc các đơn chờ, duyệt, xác nhận, in phiếu giao hàng và hủy khi hợp lệ. Thao tác phải tuân theo quyền, state và tồn.

## 7. FR-RSE – Anti-oversell

### FR-RSE-01 – Tồn khả dụng [Must]
Duy trì `available = on_hand - reserved`; giá trị được tính nhất quán theo StockBalance và không âm sau command thành công.

### FR-RSE-02 – Reservation [Must]
Khi đơn online vào Reserved, khóa/version-check balance, kiểm tra available, tăng reserved và tạo reservation có expiry. Nếu thiếu, không thay đổi dữ liệu và trả lỗi `INSUFFICIENT_STOCK`.

### FR-RSE-03 – Confirm hoặc Release [Must]
Confirmed: giảm on-hand và reserved, snapshot COGS và ghi ledger SALE. Cancelled/Expired trước confirm: giảm reserved, đánh dấu reservation released; thao tác lặp lại không làm giảm hai lần.

## 8. FR-POS – PWA POS

### FR-POS-01 – Bán hàng nhanh [Must]
Tìm kiếm theo tên/SKU/barcode; hỗ trợ bàn phím, máy quét và cảm ứng; hiển thị giá, available, số lượng giỏ và tổng tiền.

### FR-POS-02 – Ràng buộc tồn [Must]
Kiểm tra nhanh khi thêm/sửa số lượng và kiểm tra bắt buộc lại trong transaction thanh toán. Không dựa duy nhất vào tồn hiển thị ở client.

### FR-POS-03 – Thanh toán và in [Must]
Hỗ trợ Cash và QR Transfer; ghi phương thức, số tiền, reference khi có. Sau thanh toán thành công cho phép mở print dialog với mẫu hóa đơn.

### FR-POS-04 – Thanh toán nguyên tử [Must]
Reserve -> Confirm -> Deduct -> Payment -> Ledger thực hiện trong một transaction. Không phát hành hóa đơn “đã thanh toán” nếu transaction rollback.

## 9. FR-REP – Báo cáo và cảnh báo

### FR-REP-01 – Doanh thu/lợi nhuận [Must]
Tổng hợp net revenue, COGS và gross profit theo khoảng thời gian, branch, channel, SKU; định nghĩa rõ trạng thái đơn được tính và tác động return/discount.

### FR-REP-02 – Tồn kho/tốc độ bán [Must]
Hiển thị on-hand, reserved, available, inventory value theo cost, top seller và slow-moving theo khoảng phân tích cấu hình.

### FR-REP-03 – Cảnh báo tồn thấp [Must]
Khi available <= reorder point, tạo cảnh báo dashboard, chống tạo trùng còn mở và cho phép acknowledge/resolve.

## 10. FR-SIM – Simulator, realtime và background

### FR-SIM-01 – Webhook Simulator [Should]
Cho phép chọn kênh, tạo payload hợp lệ/không hợp lệ, số lượng request và mức đồng thời; giới hạn cho môi trường/role được phép; hiển thị response và kết quả idempotency.

### FR-SIM-02 – SignalR [Should]
Đẩy sự kiện đơn mới/cảnh báo sau commit đến đúng tenant/branch/role; client reconnect và tải lại dữ liệu chuẩn từ API khi cần.

### FR-SIM-03 – Hangfire [Must]
Hủy reservation hết hạn, tổng hợp báo cáo ngày và retry tác vụ tạm lỗi. Job idempotent, có theo dõi thất bại và không làm thay đổi dữ liệu hai lần.

## 11. FR-AI – Đề xuất đặt hàng lại

### FR-AI-01 – Forecast/Reorder Recommendation [Could]
Tính đề xuất nhập theo lịch sử bán, lead time, tồn khả dụng, hàng đang về và safety stock. Kết quả gồm suggested quantity, kỳ dự báo, dữ liệu sử dụng và trạng thái phê duyệt; không tự tạo receipt đã Confirmed.

## 12. Yêu cầu chức năng dùng chung

- FR-COM-01: Mọi danh sách lớn hỗ trợ phân trang, lọc và sắp xếp.
- FR-COM-02: Mọi command quan trọng trả trace ID và mã lỗi ổn định.
- FR-COM-03: Các bản ghi master đã được tham chiếu dùng soft-disable thay vì hard delete.
- FR-COM-04: Export báo cáo phải áp dụng cùng tenant scope và bộ lọc như màn hình.
- FR-COM-05: Giao dịch quan trọng tạo audit trail và/hoặc state history.
