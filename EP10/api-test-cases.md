# CÁC CA KIỂM THỬ WEB API (API TEST CASES)

1. TỔNG QUAN KIỂM THỬ API
Bộ kiểm thử tự động xác minh các Endpoints của Web API (.NET 8) qua HTTP Request/Response, cấu trúc JSON và HTTP Status Codes.

2. CÁC KỊCH BẢN API ĐIỂN HÌNH

Mã kịch bản: API-AUTH-01
Xác thực Đăng nhập và Trả về JWT Token (FR-AUTH-02)
• Endpoint: POST /api/v1/auth/login
• Request Body: Email, Password.
• Kết quả kỳ vọng:
  - HTTP Status 200 OK.
  - Response chứa accessToken (JWT chứa TenantId, UserId, Role) và refreshToken.

Mã kịch bản: API-POS-01
Tìm kiếm nhanh SKU theo mã vạch tại quầy POS (FR-POS-01)
• Endpoint: GET /api/v1/pos/skus/search?barcode=8935001000012
• Header: Authorization: Bearer <JWT_Token_Cashier>
• Kết quả kỳ vọng:
  - HTTP Status 200 OK.
  - Độ trễ phản hồi p95 < 200ms.
  - Trả về thông tin SKU, Giá bán lẻ và Tồn kho khả dụng (available).

Mã kịch bản: API-SEC-01
Chặn truy cập API Admin từ tài khoản Cashier (FR-AUTH-03)
• Endpoint: POST /api/v1/tenants/branches
• Header: Authorization: Bearer <JWT_Token_Cashier>
• Kết quả kỳ vọng: HTTP Status 403 Forbidden.