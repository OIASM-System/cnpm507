# Error Codes / Danh mục mã lỗi

The list is a proposed stable application-level catalogue. Actual codes should be centrally defined in Application/WebAPI and mapped consistently.
Danh sách đề xuất; mã thực tế cần được định nghĩa tập trung và ánh xạ nhất quán.

| HTTP | Code | Meaning / Ý nghĩa | Client behavior / Hành vi client |
|---:|---|---|---|
| 400 | `VALIDATION_FAILED` | Invalid fields / Dữ liệu không hợp lệ | Show field errors |
| 401 | `AUTH_REQUIRED` | Missing/invalid token / Chưa xác thực | Re-authenticate |
| 403 | `FORBIDDEN` | Not permitted / Không đủ quyền | Do not retry unchanged |
| 404 | `RESOURCE_NOT_FOUND` | Not found or hidden by policy / Không tìm thấy | Refresh or return |
| 409 | `STATE_CONFLICT` | Invalid state transition / Xung đột trạng thái | Refetch current state |
| 409 | `INSUFFICIENT_STOCK` | Not enough available stock / Không đủ tồn | Refresh stock/cart |
| 409 | `IDEMPOTENCY_CONFLICT` | Key reused with different payload / Key dùng lại payload khác | Investigate request |
| 409 | `DUPLICATE_EVENT` | Duplicate external event / Webhook trùng | Treat per response contract |
| 422 | `BUSINESS_RULE_VIOLATION` | Domain rule failed / Vi phạm nghiệp vụ | Show safe explanation |
| 429 | `RATE_LIMITED` | Too many requests / Quá nhiều request | Back off |
| 500 | `INTERNAL_ERROR` | Unexpected server error / Lỗi máy chủ | Show trace ID; do not expose details |
| 503 | `SERVICE_UNAVAILABLE` | Temporary outage / Tạm thời gián đoạn | Retry only safe/idempotent requests |

## Response shape [PROPOSED]
```json
{
  "type":"about:blank",
  "title":"Conflict",
  "status":409,
  "detail":"The order state has changed. Refresh and try again.",
  "code":"STATE_CONFLICT",
  "traceId":"00-example",
  "errors":{}
}
```

## Rules / Quy tắc
- Never include stack traces, SQL, secrets, raw tokens or sensitive cross-tenant details.
- Error messages may be localized by client; `code` must remain stable.
- Do not automatically retry non-idempotent mutations unless protected by idempotency.
- Không trả stack trace/SQL/bí mật; mã ổn định; không tự retry mutation không idempotent.
