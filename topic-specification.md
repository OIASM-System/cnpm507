# EP01 — Tiêu chí nghiệm thu

## 1. Mục đích

Tài liệu xác định điều kiện để nhóm đánh dấu Epic EP01 — Đặc tả chủ đề là hoàn thành. Các tiêu chí tập trung vào tính đầy đủ, nhất quán và khả năng kiểm tra của bộ tài liệu Markdown; chúng không tự động chứng minh phần mềm đã được xây dựng hoặc vận hành.

## 2. Quy ước nghiệm thu

- **Pass:** Có bằng chứng đáp ứng tiêu chí.
- **Fail:** Chưa đáp ứng hoặc có mâu thuẫn rõ ràng.
- **N/A:** Không áp dụng; phải ghi lý do và được nhóm/giảng viên chấp nhận nếu tiêu chí thuộc yêu cầu bắt buộc.

Người rà soát nên ghi nhận trạng thái và đường dẫn/vị trí bằng chứng ở bảng kiểm tra phía dưới.

## 3. Tiêu chí nghiệm thu chi tiết

### AC-01 — Đầy đủ cấu trúc tệp

**Điều kiện:** Thư mục `01-topic-specification` có đủ sáu file:
- `topic-specification.md`
- `business-context.md`
- `proposed-solution.md`
- `expected-results.md`
- `expected-products.md`
- `acceptance-criteria.md`

**Cách kiểm tra:** Đối chiếu trực tiếp cây thư mục trong repository.

### AC-02 — Đặc tả chủ đề xác định được phạm vi

**Điều kiện:** `topic-specification.md` nêu rõ mục tiêu, vai trò người dùng, chức năng sơ bộ, yêu cầu phi chức năng, nghiệp vụ chính, giả định, rủi ro và nội dung ngoài phạm vi.

**Cách kiểm tra:** Rà soát từng đề mục; không chấp nhận phạm vi mơ hồ đến mức không xác định được hệ thống sẽ làm gì.

### AC-03 — Bối cảnh nghiệp vụ có nguồn gốc rõ ràng

**Điều kiện:** `business-context.md` mô tả vấn đề, bên liên quan, nhu cầu, quy trình và ranh giới hệ thống; các nhận định chưa được khảo sát phải được ghi rõ là giả định.

**Cách kiểm tra:** Xác nhận tài liệu không trình bày kịch bản giả định như dữ kiện của một doanh nghiệp có thật.

### AC-04 — Giải pháp liên kết với vấn đề

**Điều kiện:** `proposed-solution.md` đề xuất chức năng hoặc quy tắc xử lý tương ứng với các nhu cầu trong bối cảnh nghiệp vụ; nêu luồng chính và ít nhất các tình huống lỗi quan trọng như dữ liệu thiếu hoặc xuất vượt tồn.

**Cách kiểm tra:** Đối chiếu các vấn đề với phân hệ/luồng giải quyết; đánh dấu các vấn đề chưa được xử lý để nhóm quyết định.

### AC-05 — Quy tắc nhập/xuất/tồn nhất quán

**Điều kiện:** Bộ tài liệu dùng cùng định nghĩa về giao dịch hợp lệ, thời điểm cập nhật tồn, số lượng dương và kiểm tra tồn khi xuất. Không có tài liệu nào nói rằng phiếu nháp tự động làm thay đổi tồn nếu quy tắc chung đã xác định chỉ phiếu xác nhận mới tác động.

**Cách kiểm tra:** Tìm các đoạn nói về nhập kho, xuất kho, xác nhận và công thức tính tồn; sửa mọi mâu thuẫn.

### AC-06 — Kết quả kỳ vọng có thể kiểm chứng

**Điều kiện:** `expected-results.md` phân biệt lợi ích kỳ vọng với kết quả đã đo lường và chỉ rõ bằng chứng có thể dùng để kiểm tra từng kết quả.

**Cách kiểm tra:** Không có phần trăm hiệu quả hoặc tuyên bố thành công thực tế nếu chưa có dữ liệu đo.

### AC-07 — Sản phẩm bàn giao được định danh

**Điều kiện:** `expected-products.md` xác định các đầu ra, nội dung tối thiểu, định dạng/vị trí và điều kiện hoàn thành.

**Cách kiểm tra:** Mỗi sản phẩm có thể được nhận diện và đánh dấu hoàn thành/chưa hoàn thành.

### AC-08 — Tiêu chí nghiệm thu cụ thể

**Điều kiện:** `acceptance-criteria.md` có tiêu chí được đánh mã, có điều kiện đạt và cách kiểm tra rõ ràng.

**Cách kiểm tra:** Người khác trong nhóm có thể áp dụng tiêu chí mà không phải đoán ý nghĩa của từ như “tốt”, “đẹp” hoặc “đầy đủ” nếu không có giải thích.

### AC-09 — Thuật ngữ và cấu trúc nhất quán

**Điều kiện:** Tên gọi hàng hóa, phiếu nhập, phiếu xuất, tồn kho, trạng thái và vai trò được dùng nhất quán; tiêu đề Markdown theo thứ bậc hợp lý.

**Cách kiểm tra:** Rà soát chéo cả sáu file; bổ sung bảng thuật ngữ nếu có nhiều cách gọi.

### AC-10 — Liên kết nội bộ hoạt động

**Điều kiện:** Các liên kết tương đối giữa tài liệu trong thư mục trỏ đúng tên file hiện có.

**Cách kiểm tra:** Mở từng liên kết trong trình xem Markdown hoặc kiểm tra đường dẫn trong repository.

### AC-11 — Giả định, rủi ro và điểm chưa chốt được ghi nhận

**Điều kiện:** Các quyết định còn thiếu dữ liệu, rủi ro về phạm vi, tính nhất quán hoặc tiến độ được ghi rõ; không che giấu bằng cách khẳng định tùy ý.

**Cách kiểm tra:** Đối chiếu mục giả định/rủi ro và danh sách câu hỏi mở; xác định người phụ trách theo dõi ở Jira/Confluence nếu có.

### AC-12 — Phù hợp yêu cầu giảng viên

**Điều kiện:** Bộ tài liệu không thay thế hoặc làm sai lệch cấu trúc bắt buộc trong mẫu báo cáo do giảng viên cung cấp.

**Cách kiểm tra:** Đối chiếu với hướng dẫn/mẫu chính thức của môn học; điều chỉnh cấu trúc nếu có khác biệt.

## 4. Bảng ghi nhận nghiệm thu

| Mã tiêu chí | Trạng thái (Pass/Fail/N/A) | Bằng chứng hoặc vị trí | Người rà soát | Ghi chú/việc cần sửa |
|---|---|---|---|---|
| AC-01 | Chưa kiểm tra |  |  |  |
| AC-02 | Chưa kiểm tra |  |  |  |
| AC-03 | Chưa kiểm tra |  |  |  |
| AC-04 | Chưa kiểm tra |  |  |  |
| AC-05 | Chưa kiểm tra |  |  |  |
| AC-06 | Chưa kiểm tra |  |  |  |
| AC-07 | Chưa kiểm tra |  |  |  |
| AC-08 | Chưa kiểm tra |  |  |  |
| AC-09 | Chưa kiểm tra |  |  |  |
| AC-10 | Chưa kiểm tra |  |  |  |
| AC-11 | Chưa kiểm tra |  |  |  |
| AC-12 | Chưa kiểm tra |  |  |  |

## 5. Điều kiện hoàn thành EP01

EP01 có thể chuyển sang **Done** khi:

1. Tất cả tiêu chí bắt buộc được đánh dấu Pass.
2. Không còn lỗi mâu thuẫn nghiêm trọng về phạm vi, luồng nghiệp vụ hoặc quy tắc tồn kho.
3. Các tiêu chí Fail có kế hoạch xử lý rõ ràng; tiêu chí N/A có lý do được chấp nhận.
4. Các file được rà soát chéo và liên kết nội bộ đã kiểm tra.
5. Nhóm xác nhận bộ tài liệu phù hợp với yêu cầu giảng viên và đủ cơ sở để chuyển sang Epic/giai đoạn tiếp theo.
