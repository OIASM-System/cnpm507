# 📦 Safety Stock & Reorder Point (ROP) Optimization - POS PWA Project

Tài liệu này quy định các công thức quản trị tồn kho khoa học (**Inventory Optimization Formulas**) nhằm chuyển đổi kết quả dự báo nhu cầu từ mô hình AI thành **Đề xuất Đặt hàng Lại (Automated Reorder Suggestions)** cụ thể cho từng sản phẩm trong hệ thống **POS PWA (Point of Sale Progressive Web App)**. Thay vì chỉ đưa ra con số dự báo thô, hệ thống kết hợp **Thời gian giao hàng của nhà cung cấp (Lead Time)**, **Độ biến động sức mua ($\sigma_D$)** và **Mức độ dịch vụ mục tiêu (Service Level)** để giúp quản lý cửa hàng biết chính xác *khi nào cần nhập hàng* và *nên nhập bao nhiêu đơn vị* nhằm tránh cả hai thái cực: đứt hàng (**Stockout**) và đọng vốn tồn kho (**Overstock**).

---

## 📐 1. Hệ thống Công thức Tính toán Tồn kho Tối ưu

### 1.1. Tồn kho An toàn Động (`Dynamic Safety Stock` — $SS$)
Lượng hàng dự phòng để chống đỡ rủi ro sức mua tăng đột biến hoặc nhà cung cấp giao hàng trễ trong khoảng thời gian chờ hàng về ($L$ ngày):

$$SS = Z \times \sigma_D \times \sqrt{L}$$

* **Trong đó:**
  * **$Z$ (Service Level Factor):** Hệ số phân vị chuẩn tương ứng với mức độ phục vụ mong muốn của nhóm sản phẩm (phân loại theo **ABC Analysis**):
    * **Nhóm A** (Sản phẩm chủ lực chiếm 80% doanh thu): Mức phục vụ **$98\%$** $\rightarrow Z = 2.05$.
    * **Nhóm B** (Sản phẩm bán chạy trung bình, 15% doanh thu): Mức phục vụ **$95\%$** $\rightarrow Z = 1.65$.
    * **Nhóm C** (Sản phẩm phụ / tiêu thụ chậm, 5% doanh thu): Mức phục vụ **$90\%$** $\rightarrow Z = 1.28$.
  * **$\sigma_D$ (`Daily Forecast Error StdDev`):** Độ lệch chuẩn sai số dự báo theo ngày của sản phẩm (trích xuất từ độ lệch chuẩn phần dư của mô hình AI).
  * **$L$ (`Supplier Lead Time`):** Số ngày trung bình tính từ lúc đặt hàng đến khi hàng nhập vào kho của cửa hàng (mặc định $L = 2\text{ ngày}$ nếu quản lý chưa cấu hình riêng cho sản phẩm).

### 1.2. Điểm Đặt Hàng Lại (`Reorder Point` — $ROP$)
Mức tồn kho cảnh báo mà ngay khi số lượng khả dụng chạm hoặc giảm xuống dưới ngưỡng này, hệ thống sẽ bật cảnh báo **"Cần nhập hàng ngay"**:

$$ROP = \left(\sum_{h=1}^{L} \hat{y}_{t+h}\right) + SS$$

* Với $\sum_{h=1}^{L} \hat{y}_{t+h}$ là tổng nhu cầu dự báo của AI trong suốt $L$ ngày chờ nhà cung cấp giao hàng.

### 1.3. Số lượng Đề xuất Nhập Kho (`Suggested Order Quantity` — $Q_{\text{order}}$)
Khi tồn kho hiện tại (`AvailableQuantity`) nhỏ hơn hoặc bằng $ROP$, hệ thống tính lượng hàng cần nhập để đủ bán cho chu kỳ phủ hàng mục tiêu $T_{\text{cover}}$ (mặc định $7\text{ ngày}$) cộng thêm phần tồn kho an toàn:

$$Q_{\text{order}} = \max\left(0,\ \left\lceil \sum_{h=1}^{L + T_{\text{cover}}} \hat{y}_{t+h} + SS - \text{AvailableQuantity} \right\rceil \right)$$

---

## 📊 2. Ví dụ Minh họa Tính toán Thực tế tại Quầy POS

Giả sử sản phẩm **Sữa tươi thanh trùng Dalatmilk 1L** (thuộc **Nhóm A**, $Z = 2.05$) có thông số sau:
* Nhu cầu dự báo trung bình của AI: **$\hat{y} = 12\text{ hộp/ngày}$**, độ lệch chuẩn $\sigma_D = 3.0\text{ hộp/ngày}$.
* Thời gian nhà cung cấp giao hàng: **$L = 2\text{ ngày}$**; Chu kỳ nhập hàng mong muốn: **$T_{\text{cover}} = 7\text{ ngày}$**.
* Tồn kho khả dụng hiện tại trên POS: **`25 hộp`**.

**Các bước tính toán của hệ thống:**
1. **Tồn kho an toàn ($SS$):** $2.05 \times 3.0 \times \sqrt{2} \approx \mathbf{9\text{ hộp}}$.
2. **Điểm đặt hàng lại ($ROP$):** $(12 \times 2) + 9 = \mathbf{33\text{ hộp}}$.
3. **Đánh giá trạng thái:** Vì tồn kho hiện tại (`25 hộp`) $\le ROP$ (`33 hộp`), hệ thống đánh dấu trạng thái **`LOW_STOCK_REORDER` (Cần đặt hàng ngay)**.
4. **Số lượng đề xuất nhập ($Q_{\text{order}}$):** $\lceil (12 \times 9) + 9 - 25 \rceil = \mathbf{92\text{ hộp}}$.

---

## 🚦 3. Phân loại Mức độ Cảnh báo Tồn kho trên Dashboard

| Trạng thái cảnh báo | Điều kiện kích hoạt | Màu hiển thị UI | Hành động gợi ý cho Quản lý |
| :--- | :--- | :---: | :--- |
| **`CRITICAL_STOCKOUT`** | `AvailableQuantity == 0` hoặc nhỏ hơn nhu cầu dự báo 1 ngày tới | 🔴 Đỏ đậm | Khẩn cấp nhập hàng ngay trong ngày để tránh mất doanh thu. |
| **`REORDER_NEEDED`** | `AvailableQuantity <= ROP` | 🟠 Cam | Tạo phiếu nhập kho theo số lượng đề xuất $Q_{\text{order}}$. |
| **`OPTIMAL`** | `ROP < AvailableQuantity <= 2.5 * ROP` | 🟢 Xanh lá | Tồn kho đang ở vùng an toàn tối ưu, chưa cần nhập thêm. |
| **`OVERSTOCK_RISK`** | `AvailableQuantity > 21 ngày nhu cầu dự báo` (với hàng có hạn sử dụng) | 🟣 Tím | Gợi ý chạy chương trình khuyến mãi / giảm giá để giải phóng hàng tồn. |

---
