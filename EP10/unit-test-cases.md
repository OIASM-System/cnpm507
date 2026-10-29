# CÁC CA KIỂM THỬ ĐƠN VỊ (UNIT TEST CASES)

1. PHẠM VI KIỂM THỬ ĐƠN VỊ
Tập trung kiểm thử logic nghiệp vụ thuần túy trong tầng OISM.Domain và OISM.Application, không truy vấn cơ sở dữ liệu thực (sử dụng Mock/InMemory Database).

2. DANH SÁCH CA KIỂM THỬ CỐT LÕI

Mã ca kiểm thử: UT-COST-01
Kiểm thử tính Giá vốn bình quân gia quyền (Weighted Average Cost) khi nhập hàng
• Module: Domain/Rules/WeightedAverageCostRule
• Đầu vào: Tồn cũ = 10, Giá vốn cũ = 100.000 VND. Nhập mới = 10, Giá nhập = 120.000 VND.
• Công thức kiểm tra: (10 x 100.000 + 10 x 120.000) / 20
• Kết quả kỳ vọng: Giá vốn mới tính ra chính xác là 110.000 VND.

Mã ca kiểm thử: UT-INV-01
Kiểm thử tính nhất quán của Sổ cái tồn kho chỉ ghi thêm (Append-Only)
• Module: Infrastructure/Interceptors/AppendOnlyLedgerInterceptor
• Hành động: Thực hiện lệnh DbContext.Update() hoặc DbContext.Remove() lên một bản ghi trong bảng InventoryLedger.
• Kết quả kỳ vọng: Hệ thống ném ra ngoại lệ InvalidOperationException và chặn hoàn toàn thao tác sửa/xóa.

Mã ca kiểm thử: UT-AUTH-01
Kiểm thử cô lập dữ liệu đa khách hàng (Tenant Isolation)
• Module: Infrastructure/MultiTenancy/TenantQueryFilter
• Hành động: Truy vấn danh sách Sản phẩm bằng User của Tenant-A.
• Kết quả kỳ vọng: Chỉ trả về các sản phẩm có TenantId = Tenant-A, tuyệt đối không rò rỉ dữ liệu của Tenant-B.