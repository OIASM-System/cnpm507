# URS – Đặc tả yêu cầu người dùng

> **Dự án:** Omnichannel Inventory and Sales Management System (OISM)  
> **Phiên bản:** 1.0  
> **Trạng thái:** Bản đặc tả cơ sở  
> **Ngày cập nhật:** 29/10/2026  
> **Phạm vi:** SaaS đa khách hàng, Backend .NET 8, PostgreSQL, ReactJS Admin, PWA POS, SignalR, Hangfire và Docker.

---

## 1. Mục đích

Tài liệu URS mô tả nhu cầu nghiệp vụ, mục tiêu, phạm vi và kỳ vọng của người dùng đối với OISM. URS tập trung vào **người dùng cần gì và vì sao**, không quy định chi tiết cách lập trình.

## 2. Bối cảnh và vấn đề

Doanh nghiệp bán lẻ vận hành đồng thời cửa hàng vật lý và các kênh Shopee, TikTok Shop, Lazada thường gặp:

- Dữ liệu đơn hàng và tồn kho phân tán theo từng kênh.
- Bán vượt tồn kho do đồng bộ chậm hoặc nhiều đơn cùng mua một SKU.
- Giá vốn hàng bán không đồng nhất, khó tính lợi nhuận gộp chính xác.
- Điều chỉnh kho thủ công gây sai lệch và khó truy vết.
- Thiếu cảnh báo tức thời, báo cáo hợp nhất và nhật ký kiểm toán.
- Khó cô lập dữ liệu khi cung cấp phần mềm theo mô hình SaaS đa khách hàng.

## 3. Mục tiêu nghiệp vụ

| ID | Mục tiêu | Chỉ số thành công |
|---|---|---|
| OBJ-01 | Hợp nhất quản lý đơn hàng và tồn kho đa kênh | 100% đơn tiếp nhận được chuẩn hóa thành Canonical Order |
| OBJ-02 | Ngăn bán vượt tồn kho | Không để `available < 0` trong thử nghiệm đồng thời |
| OBJ-03 | Đảm bảo khả năng kiểm toán | 100% biến động kho có bút toán ledger và tham chiếu nguồn |
| OBJ-04 | Tự động hóa COGS | Giá vốn được tính lại khi nhập và snapshot khi xuất |
| OBJ-05 | Tăng tốc bán tại quầy | Thanh toán dưới 3 cú nhấp hoặc quét mã + Enter |
| OBJ-06 | Cung cấp báo cáo hợp nhất | Doanh thu, COGS, lợi nhuận lọc được theo thời gian, chi nhánh, kênh, SKU |
| OBJ-07 | Cô lập dữ liệu tenant | Không có truy cập chéo tenant trong kiểm thử bảo mật |

## 4. Bên liên quan

| Vai trò | Mối quan tâm chính |
|---|---|
| Chủ cửa hàng/Owner | Cấu hình tenant, chi nhánh, nhân sự, báo cáo, kiểm soát toàn hệ thống |
| Nhân viên/Staff | Quản lý sản phẩm, kho, nhập/chuyển/kiểm kê và xử lý đơn |
| Thu ngân/Cashier | Tìm/quét hàng, kiểm tra tồn khả dụng, thanh toán và in hóa đơn |
| Quản trị nền tảng | Vận hành SaaS, triển khai, giám sát, sao lưu và xử lý sự cố |
| Lập trình viên/Tester | Gửi webhook giả lập, kiểm thử API, đồng thời và tích hợp |
| Nhà cung cấp | Cung cấp hàng hóa và thông tin giá nhập |
| Kênh thương mại điện tử | Gửi đơn hàng/webhook vào hệ thống |
| Khách mua hàng | Nhận đúng hàng, đúng số lượng, chứng từ thanh toán phù hợp |

## 5. Phạm vi

### 5.1 Trong phạm vi

- Đăng ký tenant, xác thực JWT/Refresh Token và RBAC.
- Chi nhánh, kho, danh mục, thương hiệu, sản phẩm, biến thể, SKU, mã vạch và giá bán.
- Nhập hàng, chuyển kho hai bước, kiểm kê và điều chỉnh.
- Inventory Ledger append-only; theo dõi `on_hand`, `reserved`, `available`.
- Giá vốn bình quân gia quyền và snapshot COGS.
- Tiếp nhận đơn POS, đơn thủ công và webhook giả lập.
- Order state machine và cơ chế reserve/confirm/cancel chống oversell.
- React Admin Dashboard, PWA POS, SignalR, Hangfire.
- Báo cáo, cảnh báo tồn thấp và AI đề xuất đặt hàng lại ở mức hỗ trợ quyết định.
- Swagger/Postman, kiểm thử tự động, Docker Compose và GitHub Actions.

### 5.2 Ngoài phạm vi phiên bản cơ sở

- Tích hợp chính thức vào API sản xuất của từng sàn và đối soát thanh toán sàn.
- Kế toán tài chính đầy đủ, hóa đơn điện tử và khai báo thuế.
- Quản lý vận chuyển chặng cuối, lộ trình giao hàng hoặc hoàn tiền ngân hàng.
- Tự động đặt hàng nhà cung cấp không cần phê duyệt.
- Hoạt động POS offline hoàn toàn và đồng bộ xung đột sau khi trực tuyến lại.

## 6. Yêu cầu người dùng cấp cao

| ID | Yêu cầu người dùng | Độ ưu tiên | Liên kết |
|---|---|---:|---|
| UR-AUTH-01 | Owner cần đăng ký không gian cửa hàng riêng và quản lý người dùng theo vai trò | Must | FR-AUTH-01..04 |
| UR-PROD-01 | Nhân viên cần quản lý sản phẩm, SKU, mã vạch và giá theo tenant | Must | FR-PROD-01..04 |
| UR-INV-01 | Người quản lý kho cần thấy tồn chính xác và truy vết mọi biến động | Must | FR-INV-01..04 |
| UR-COST-01 | Owner cần COGS tự động để xem lợi nhuận gộp đáng tin cậy | Must | FR-COST-01..02 |
| UR-ORD-01 | Nhân viên cần tiếp nhận và xử lý đơn của nhiều kênh tại một nơi | Must | FR-ORD-01..03 |
| UR-RSE-01 | Doanh nghiệp cần giữ/trừ/giải phóng tồn nguyên tử để không oversell | Must | FR-RSE-01..03 |
| UR-POS-01 | Cashier cần POS nhanh, dễ quét mã, thanh toán và in hóa đơn | Must | FR-POS-01..04 |
| UR-REP-01 | Owner cần báo cáo doanh thu, COGS, lợi nhuận và tồn kho | Must | FR-REP-01..03 |
| UR-SIM-01 | Tester cần mô phỏng webhook và kiểm tra tải đồng thời | Should | FR-SIM-01..03 |
| UR-AI-01 | Owner cần gợi ý đặt hàng lại nhưng vẫn tự quyết định | Could | AI-01 |

## 7. Quy trình nghiệp vụ cấp cao

1. Owner tạo tenant, chi nhánh, kho và tài khoản người dùng.
2. Staff tạo danh mục, sản phẩm, SKU, mã vạch, giá và ngưỡng tồn.
3. Staff nhập hàng; hệ thống ghi ledger, tăng on-hand và tính lại COGS.
4. Đơn đa kênh được chuẩn hóa và yêu cầu giữ hàng tại chi nhánh phù hợp.
5. Hệ thống khóa bản ghi tồn, kiểm tra available rồi tạo reservation.
6. Khi xác nhận, hệ thống giảm on-hand và reserved, snapshot COGS và ghi ledger.
7. Nếu hủy trước xác nhận, hệ thống giải phóng reserved.
8. Dashboard/POS nhận thông báo tức thời; Hangfire xử lý reservation hết hạn.
9. Owner xem báo cáo và cảnh báo để ra quyết định bổ sung hàng.

## 8. Giả định và ràng buộc

- Mỗi request nghiệp vụ phải xác định được TenantId từ ngữ cảnh xác thực, không tin TenantId tùy ý từ client.
- Mỗi SKU duy nhất trong phạm vi một tenant; barcode phải ánh xạ không mơ hồ.
- Phiên bản cơ sở sử dụng PostgreSQL, .NET 8, EF Core và ReactJS.
- Ledger chỉ thêm mới; mọi sửa sai dùng bút toán bù trừ.
- Tích hợp Shopee/TikTok/Lazada trong đồ án là simulator nếu chưa có credential chính thức.
- AI chỉ đề xuất, phải hiển thị dữ liệu đầu vào, độ tin cậy hoặc lý do và cho phép người dùng bỏ qua.

## 9. Tiêu chí chấp nhận URS tổng quát

- Các luồng nhập, bán, trả, kiểm kê, chuyển kho đều sinh ledger cân bằng và truy vết được.
- Flash Sale 50 yêu cầu đồng thời trên một SKU không làm tồn khả dụng âm.
- Dữ liệu của tenant A không xuất hiện trong API, báo cáo hoặc SignalR của tenant B.
- Báo cáo doanh thu/COGS/lợi nhuận đối chiếu đúng với đơn Completed và CostPrice snapshot.
- Hệ thống triển khai được bằng Docker Compose kèm dữ liệu mẫu và tài liệu sử dụng.

## 10. Truy vết tài liệu

URS được chi tiết hóa trong `SRS-software-requirements-specification.md`; các mã FR/NFR tương ứng nằm trong `functional-requirements.md` và `non-functional-requirements.md`; điều kiện nghiệm thu nằm trong `acceptance-criteria.md`.
