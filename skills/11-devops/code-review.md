# 🔍 Code Review Guidelines & Pull Request Standards - POS PWA Project

Tài liệu này quy định quy trình **Đánh giá Mã nguồn (Peer Code Review)** và tiêu chuẩn mở **Pull Request (PR)** trong nhóm phát triển dự án **POS PWA (Point of Sale Progressive Web App)**. Tại một hệ thống quản lý bán hàng đa chi nhánh có tính nhạy cảm cao về tiền tệ, tồn kho và cô lập dữ liệu khách hàng (**Multi-Tenancy**), hoạt động Code Review không chỉ nhằm phát hiện lỗi cú pháp mà còn là chốt chặn kiểm soát chất lượng kiến trúc, bảo mật và chia sẻ tri thức giữa các thành viên trong nhóm.

---

## 📋 1. Mẫu Mô tả Pull Request Chuẩn (`.github/PULL_REQUEST_TEMPLATE.md`)

Mọi Pull Request gửi vào nhánh `main` bắt buộc điền đầy đủ các mục theo mẫu chuẩn sau (kích thước mỗi PR nên giữ gọn dưới **400 dòng thay đổi** để người duyệt đọc sâu và chính xác):

```markdown
## 🎯 Mục tiêu thay đổi & Liên kết Jira
- **Jira Ticket:** [POS-XX]
- **Loại thay đổi:** [ ] Tính năng mới (`feat`) | [ ] Sửa lỗi (`fix`) | [ ] Tái cấu trúc (`refactor`) | [ ] Tài liệu (`docs`)
- **Tóm tắt nội dung:** Mô tả ngắn gọn vấn đề được giải quyết và cách tiếp cận.

## 🧪 Bằng chứng Kiểm thử (Verification)
- [ ] Đã viết và chạy xanh Unit Tests (`dotnet test` / `npm run test:unit`).
- [ ] Đã kiểm thử thực tế trên trình duyệt (bao gồm kiểm tra chế độ Offline PWA nếu có thay đổi UI/Sync).
- [ ] Không phát sinh cảnh báo biên dịch (`0 Warnings`) hoặc lỗi ESLint/TypeScript.

## 🛡️ Danh sách Kiểm tra An toàn Hệ thống POS (Security & Domain Checklist)
- [ ] Mọi thực thể mới đều kế thừa `IMustHaveTenant` và tuân thủ EF Core Global Query Filter.
- [ ] Các thao tác xuất/nhập kho đều ghi nhận bút toán bất biến vào `inventory_transactions` (Append-Only).
- [ ] Không chứa mật khẩu, JWT Secret, API Key hoặc chuỗi kết nối cứng trong mã nguồn.
```

---

## 🧐 2. Danh sách Kiểm tra Dành cho Người Duyệt (Reviewer Checklist)

Khi duyệt mã nguồn của đồng đội, người duyệt tập trung rà soát theo **4 nhóm tiêu chí ưu tiên** sau:

| Nhóm rà soát | Câu hỏi kiểm tra trọng tâm | Mức độ nghiêm trọng |
| :--- | :--- | :---: |
| **1. Cô lập Multi-Tenant & Bảo mật** | • Truy vấn mới có bị vô tình dùng `IgnoreQueryFilters()` mà quên lọc tay theo `TenantId` không?<br>• Endpoint nhạy cảm (hoàn tiền, nhập kho, xóa sản phẩm) đã gắn đúng thuộc tính `[Authorize(Roles = "Manager")]` chưa? | **Chặn Merge ngay (`Blocker`)** |
| **2. Toàn vẹn Dữ liệu & Concurrency** | • Thao tác trừ tồn kho có đi qua khóa dòng `FOR UPDATE` và phương thức `Product.DeductStock()` của Domain Entity không?<br>• Các phép tính tiền tệ và giá vốn WAC có dùng kiểu `decimal` với quy tắc làm tròn chuẩn kế toán không? | **Chặn Merge ngay (`Blocker`)** |
| **3. Hiệu năng & Tối ưu Truy vấn** | • Truy vấn chỉ đọc (`GET`) đã bật `.AsNoTracking()` chưa? Có dính lỗi truy vấn `N+1` trong vòng lặp không?<br>• Component React hiển thị danh sách lớn có bị re-render thừa khi giỏ hàng thay đổi không? | **Cần sửa trước Merge (`Major`)** |
| **4. Tính sạch & Dễ đọc (`Clean Code`)** | • Tên biến, tên hàm và thông báo lỗi tiếng Việt trả về cho thu ngân có rõ ràng, dễ hiểu không?<br>• Đã loại bỏ các đoạn code comment thừa hoặc `console.log` gỡ lỗi chưa? | **Góp ý cải thiện (`Minor`)** |

---

## 🤝 3. Văn hóa Giao tiếp & Phản hồi trong Code Review

* **Phê bình mã nguồn, không phê bình cá nhân:** Sử dụng ngôn ngữ mang tính xây dựng, khách quan và giải thích rõ *"Tại sao"* (ví dụ: *"Chỗ này nên dùng `decimal` thay vì `double` để tránh sai số làm tròn khi tính tổng hóa đơn"* thay vì *"Code chỗ này sai rồi"*).
* **Phân loại mức độ góp ý bằng tiền tố:**
  * `[Blocker]`: Lỗi bảo mật, sai logic tài chính hoặc rò rỉ dữ liệu Tenant — bắt buộc sửa trước khi Approve.
  * `[Suggestion]`: Đề xuất cách viết gọn hoặc tối ưu hơn — tác giả cân nhắc áp dụng.
  * `[Nitpick]`: Chi tiết nhỏ về định dạng/đặt tên — không chặn việc hợp nhất PR.
* **Cam kết thời gian phản hồi (Review SLA):** Mọi PR mở ra đều được thành viên trong nhóm phản hồi trong vòng tối đa **4–8 giờ làm việc** để không làm tắc nghẽn tiến độ Sprint.

---
