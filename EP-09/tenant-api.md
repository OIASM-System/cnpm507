# Tenant API / API tenant

**Scope:** tenant context, branches and warehouses. Exact tenant provisioning workflow is [TBD].
**Phạm vi:** ngữ cảnh tenant, chi nhánh và kho. Quy trình tạo tenant chính thức [CHỜ XÁC NHẬN].

## `GET /api/v1/tenants/current` [PROPOSED]
Returns only the tenant associated with the authenticated principal.
Chỉ trả tenant gắn với người dùng đã xác thực.
```json
{"id":"ten_123","displayName":"Example Store","status":"Active"}
```

## `GET /api/v1/branches` [PROPOSED]
Optional filters: `page`, `pageSize`, `search`, `status`.
Returns only branches the principal is allowed to see in the current tenant.
Chỉ trả chi nhánh người dùng được phép xem trong tenant hiện tại.

## `GET /api/v1/branches/{branchId}` [PROPOSED]
Returns a branch only if it belongs to the current tenant and is in the caller's permitted scope.

## `POST /api/v1/branches` [PROPOSED]
Owner-only by default as a conservative proposed policy; confirm role matrix before implementation.
Mặc định đề xuất chỉ Owner; cần duyệt ma trận quyền.
```json
{"code":"BR-01","name":"Main branch","address":"<optional>"}
```

## `GET /api/v1/warehouses` and `POST /api/v1/warehouses` [PROPOSED]
Warehouse endpoints mirror tenant/branch scoping. Request fields and warehouse-to-branch cardinality are [TBD].
API kho tuân thủ phạm vi tenant/chi nhánh; trường dữ liệu và quan hệ kho-chi nhánh [CHỜ XÁC NHẬN].

## Tenant security rules / Quy tắc bảo mật
- Never allow a request body/query parameter to select arbitrary tenant data.
- Every read/write query is scoped by trusted tenant context.
- Validate branch/warehouse ownership in each command.
- Return a generic `404` or policy-approved response for cross-tenant IDs to avoid confirming existence.
