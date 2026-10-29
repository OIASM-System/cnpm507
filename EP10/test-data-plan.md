# KẾ HOẠCH CHUẨN BỊ DỮ LIỆU KIỂM THỬ (TEST DATA PLAN)

1. MỤC TIÊU
Cung cấp tập dữ liệu đầu vào chuẩn xác, đa dạng cho các bộ kiểm thử tự động, kiểm thử thủ công và kiểm thử hiệu năng chịu tải.

2. DANH SÁCH TẬP DỮ LIỆU MẪU (SEED DATA SETS)
• Tập dữ liệu Tenant & Khách hàng:
  - Tenant-01: Cửa hàng Bán lẻ Thời trang Alpha (Mã TenantId: tenant-alpha-id).
  - Tenant-02: Cửa hàng Điện máy Beta (Mã TenantId: tenant-beta-id).
• Tập dữ liệu Người dùng & Phân quyền:
  - Tài khoản Owner: owner@alpha.com / Password123!
  - Tài khoản Staff: staff@alpha.com / Password123!
  - Tài khoản Cashier: cashier@alpha.com / Password123!
• Tập dữ liệu Sản phẩm & SKU:
  - SKU-001: Áo thun Nam Size M (Mã vạch EAN-13: 8935001000012, Tồn kho thực tế: 100, Tồn giữ hàng: 0).
  - SKU-002: Áo thun Nam Size L (Mã vạch Code128: SKU-ATN-L, Tồn kho thực tế: 1, Tồn giữ hàng: 0 - Phục vụ Test Flash Sale).
  - SKU-003: Quần Jeans Size 30 (Tồn kho thực tế: 0 - Phục vụ Test hết hàng khả dụng).