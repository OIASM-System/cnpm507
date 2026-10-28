# Authentication API / API xác thực

All paths are proposed under `/api/v1/auth`. Identity-provider and refresh-token storage details require confirmation.
Các đường dẫn dưới đây là đề xuất; chi tiết Identity và lưu refresh token cần xác nhận.

## `POST /auth/login`
Authenticate credentials and return an access token/session response.
Xác thực thông tin đăng nhập và trả access token/phiên.

Request [PROPOSED]:
```json
{"userNameOrEmail":"user@example.test","password":"<redacted>"}
```
Success `200` [PROPOSED]:
```json
{"accessToken":"<token>","tokenType":"Bearer","expiresAt":"2026-10-29T01:00:00Z","user":{"id":"usr_123","displayName":"Example","roles":["Staff"],"tenantId":"ten_123"}}
```
Do not use the sample token, IDs or expiration as real values. Claims should include stable user identity, tenant context and role/permission claims as approved.

## `POST /auth/refresh` [TBD]
If refresh tokens are enabled, rotate them securely and detect reuse. Prefer secure, HttpOnly, SameSite cookies for browser refresh tokens where architecture supports them. Exact contract/storage is not confirmed.
Nếu dùng refresh token, cần xoay vòng an toàn và phát hiện tái sử dụng; cấu hình cookie HttpOnly/SameSite cần thống nhất.

## `POST /auth/logout` [PROPOSED]
Invalidate/revoke refresh session if supported. Stateless access JWTs may remain valid until expiry unless a revocation strategy exists.
Thu hồi phiên/refresh token nếu hỗ trợ. JWT stateless có thể còn hiệu lực đến khi hết hạn nếu chưa có cơ chế thu hồi.

## `GET /auth/me` [PROPOSED]
Returns the current user's identity, tenant context, roles and permitted branch scope; never returns secrets.
Trả danh tính, tenant, vai trò và phạm vi chi nhánh được phép; không trả bí mật.

## Security / Bảo mật
- `401` missing/invalid/expired authentication.
- `403` authenticated but not authorized.
- Never accept role or tenant claims directly from an untrusted request body.
- Password hashing, access-token lifetime and MFA policy must match the approved identity configuration; example values elsewhere are not configuration.
