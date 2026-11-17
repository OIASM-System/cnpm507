# ✍️ Technical Writing Standards & Architecture Decision Records - POS PWA Project

Tài liệu này quy định tiêu chuẩn biên soạn tài liệu kỹ thuật (**Technical Writing Style Guide**) cho toàn bộ kho lưu trữ tài liệu của dự án **POS PWA (Point of Sale Progressive Web App)**. Tài liệu kỹ thuật chất lượng cao phải đảm bảo tính **chính xác, súc tích, có cấu trúc rõ ràng** và luôn đồng bộ với mã nguồn thực tế (**Docs-as-Code**), giúp người đọc nắm bắt được *kiến trúc hệ thống hoạt động như thế nào* và *tại sao đội ngũ phát triển lại lựa chọn giải pháp đó*.

---

## 📏 1. Nguyên tắc Biên soạn Tài liệu Kỹ thuật (Core Writing Principles)

| Nguyên tắc | Quy chuẩn áp dụng trong POS PWA | Ví dụ minh họa |
| :--- | :--- | :--- |
| **1. Thuật ngữ nhất quán (Ubiquitous Language)** | Sử dụng thống nhất bộ từ vựng nghiệp vụ xuyên suốt từ tài liệu, sơ đồ đến tên lớp C# và TypeScript. | Dùng thống nhất `Tenant` (Cửa hàng), `InventoryTransaction` (Bút toán sổ cái kho), `Weighted Average Cost - WAC` (Giá vốn bình quân gia quyền). |
| **2. Trực quan hóa trước, giải thích sau** | Mỗi tài liệu kiến trúc đều mở đầu bằng sơ đồ luồng (`Mermaid` / `Draw.io`) hoặc bảng tóm tắt trước khi đi vào chi tiết mã nguồn. | Dùng bảng so sánh lựa chọn công nghệ và `sequenceDiagram` cho các luồng thanh toán, đồng bộ Offline. |
| **3. Mã nguồn minh họa có thể biên dịch** | Mọi đoạn code ví dụ (`C#`, `TypeScript`, `SQL`, `YAML`) phải phản ánh đúng cấu trúc thực tế của dự án, tránh dùng `foo/bar` vô nghĩa. | Sử dụng trực tiếp các lớp thực tế như `Product.ReceiveStock()`, `Order.CompletePayment()`, `useCartStore`. |
| **4. Định dạng Markdown chuẩn hóa** | Sử dụng phân cấp tiêu đề logic (`H1` $\rightarrow$ `H2` $\rightarrow$ `H3`), bảng biểu căn lề rõ ràng và công thức toán học chuẩn LaTeX (`$...$`, `$$...$$`). | Đảm bảo hiển thị đẹp trên cả GitHub, VS Code Preview và khi xuất sang PDF. |

---

## 🏛️ 2. Mẫu Ghi nhận Quyết định Kiến trúc (`ADR - Architecture Decision Record`)

Đối với các quyết định kỹ thuật mang tính nền tảng ảnh hưởng đến toàn hệ thống, nhóm dự án lưu lại lý do lựa chọn theo mẫu **ADR** ngắn gọn gồm 4 phần:

1. **Bối cảnh (Context):** Vấn đề kỹ thuật hoặc bài toán nghiệp vụ cần giải quyết là gì?
2. **Các phương án cân nhắc (Options Considered):** Liệt kê 2–3 giải pháp khả thi kèm ưu/nhược điểm.
3. **Quyết định lựa chọn (Decision):** Chốt phương án được chọn cho hệ thống POS PWA.
4. **Hệ quả & Đánh đổi (Consequences):** Lợi ích đạt được và những ràng buộc kỹ thuật phải tuân thủ theo sau quyết định đó.

### Các ADR tiêu biểu đã áp dụng trong dự án POS PWA:
* **ADR-001:** Chọn mô hình **Shared Database, Shared Schema với cột `tenant_id`** + **EF Core Global Query Filters** thay vì tách Database riêng cho từng cửa hàng (tối ưu chi phí hạ tầng cho mô hình SaaS vừa và nhỏ).
* **ADR-002:** Chọn **PostgreSQL 16** làm cơ sở dữ liệu trung tâm đồng thời đảm nhận luôn vai trò lưu trữ hàng đợi **Hangfire** (giảm độ phức tạp vận hành khi không phải duy trì thêm Redis/RabbitMQ).
* **ADR-003:** Chọn **Sổ cái Tồn kho Bất biến (`Append-Only Inventory Ledger`)** kết hợp khóa dòng bi quan `SELECT ... FOR UPDATE` để chống âm kho và đảm bảo tính kiểm toán tài chính.
* **ADR-004:** Chọn **Zustand + TanStack Query + IndexedDB (Dexie.js)** để hỗ trợ bán hàng ngoại tuyến (**Offline-First PWA**) thay vì lưu trữ toàn bộ trong Redux.

---
