# AI Limitations

## Dự án
**Omnichannel Inventory and Sales Management System (OISM)**

## Phiên bản tài liệu
| Thuộc tính | Giá trị |
|------------|----------|
| Tài liệu | AI Limitations |
| Dự án | Omnichannel Inventory and Sales Management System (OISM) |
| Phiên bản | 1.0 |
| Ngày tạo | 2026 |
| Mục đích | Mô tả các giới hạn, rủi ro và phạm vi sử dụng của các thành phần AI trong hệ thống |

---

# 1. Giới thiệu

Tài liệu này mô tả các giới hạn của các chức năng trí tuệ nhân tạo (Artificial Intelligence - AI) được tích hợp trong hệ thống OISM. AI được sử dụng nhằm hỗ trợ phân tích dữ liệu kinh doanh, dự báo nhu cầu hàng hóa, đề xuất mức đặt hàng lại và hỗ trợ ra quyết định cho chủ cửa hàng.

AI trong hệ thống OISM chỉ đóng vai trò hỗ trợ (Decision Support System) và không thay thế vai trò đánh giá, kiểm tra và phê duyệt của người dùng.

---

# 2. Phạm vi sử dụng AI

Trong phạm vi dự án OISM, AI có thể được sử dụng cho các chức năng sau:

## 2.1 Dự báo nhu cầu tồn kho

- Dự đoán số lượng bán ra của từng SKU trong tương lai.
- Dự báo lượng hàng cần nhập bổ sung.
- Phân tích xu hướng bán hàng theo thời gian.

## 2.2 Đề xuất điểm đặt hàng lại (Reorder Point)

- Ước tính tồn kho an toàn.
- Đưa ra cảnh báo sớm khi hàng hóa có nguy cơ thiếu hụt.
- Đề xuất số lượng nhập hàng phù hợp.

## 2.3 Phân tích kinh doanh

- Xác định các SKU bán chạy.
- Đánh giá tốc độ luân chuyển hàng hóa.
- Hỗ trợ nhận diện các sản phẩm tồn kho lâu ngày.

## 2.4 Phân tích báo cáo

- Đưa ra các nhận xét tự động về doanh thu.
- Tóm tắt xu hướng lợi nhuận.
- Gợi ý các chỉ số cần theo dõi.

---

# 3. Giới hạn về dữ liệu

## 3.1 Chất lượng dữ liệu đầu vào

AI phụ thuộc hoàn toàn vào chất lượng dữ liệu của hệ thống.

Những trường hợp sau có thể làm giảm độ chính xác của dự báo:

- Dữ liệu bán hàng không đầy đủ.
- Dữ liệu bị nhập sai.
- SKU bị trùng lặp.
- Thiếu dữ liệu giá vốn.
- Sai lệch tồn kho thực tế.
- Các giao dịch chưa được ghi nhận vào Inventory Ledger.

### Ví dụ

Nếu kho thực tế còn 50 sản phẩm nhưng hệ thống ghi nhận còn 100 sản phẩm thì kết quả dự báo và đề xuất nhập hàng có thể hoàn toàn sai lệch.

---

## 3.2 Thiếu dữ liệu lịch sử

Các mô hình dự báo cần dữ liệu lịch sử đủ lớn để đưa ra kết quả đáng tin cậy.

Độ chính xác sẽ giảm đối với:

- Sản phẩm mới.
- SKU mới phát sinh.
- Chi nhánh mới mở.
- Các mặt hàng bán rất ít.

### Ví dụ

Một SKU vừa được tạo và chỉ có dữ liệu bán hàng trong 3 ngày gần nhất thường không đủ cơ sở để AI dự báo nhu cầu dài hạn.

---

## 3.3 Dữ liệu lịch sử không phản ánh tương lai

AI chủ yếu học từ dữ liệu quá khứ.

Do đó mô hình có thể dự báo sai khi xuất hiện:

- Xu hướng tiêu dùng mới.
- Khủng hoảng kinh tế.
- Thiên tai.
- Dịch bệnh.
- Chiến dịch marketing đột biến.
- Chương trình Flash Sale.
- Chính sách giá mới.

---

# 4. Giới hạn của mô hình AI

## 4.1 Không đảm bảo độ chính xác 100%

Mọi kết quả do AI sinh ra đều là dự đoán thống kê.

Hệ thống không bảo đảm:

- Dự báo chính xác tuyệt đối.
- Đề xuất nhập hàng luôn tối ưu.
- Không xảy ra hết hàng.
- Không xảy ra tồn kho dư thừa.

Kết quả thực tế có thể khác biệt đáng kể so với dự báo.

---

## 4.2 Sai số dự báo

Sai số là đặc tính tự nhiên của mọi mô hình học máy.

Những hiện tượng có thể xảy ra:

### Under Forecast

AI dự báo nhu cầu thấp hơn thực tế.

Hệ quả:

- Thiếu hàng.
- Mất doanh thu.
- Tăng nguy cơ hết hàng.

### Over Forecast

AI dự báo nhu cầu cao hơn thực tế.

Hệ quả:

- Tồn kho tăng cao.
- Tăng chi phí lưu kho.
- Giảm hiệu quả sử dụng vốn.

---

## 4.3 Mô hình có thể bị lỗi hoặc suy giảm hiệu năng

Khi dữ liệu vận hành thay đổi theo thời gian, mô hình có thể gặp hiện tượng:

### Model Drift

Hành vi khách hàng thay đổi khiến mô hình dần mất độ chính xác.

### Data Drift

Phân phối dữ liệu mới khác biệt đáng kể so với dữ liệu huấn luyện ban đầu.

Trong các trường hợp này cần tái huấn luyện mô hình định kỳ.

---

# 5. Giới hạn trong vận hành hệ thống

## 5.1 AI không thay thế nghiệp vụ cốt lõi

Các cơ chế quan trọng sau không phụ thuộc vào AI:

- Inventory Ledger.
- Anti-Oversell Engine.
- Stock Reservation.
- Order State Machine.
- COGS Engine.
- RBAC Authorization.
- Multi-Tenant Isolation.

Các thành phần trên phải luôn hoạt động ngay cả khi AI không khả dụng.

---

## 5.2 AI không được phép tự động thay đổi dữ liệu tồn kho

AI không có quyền:

- Trừ kho.
- Cộng kho.
- Hủy đơn hàng.
- Xác nhận đơn hàng.
- Sửa giá vốn.
- Cập nhật Inventory Ledger.

Mọi thay đổi dữ liệu phải được thực hiện thông qua các quy trình nghiệp vụ chính thức của hệ thống.

---

## 5.3 AI không được phép ghi trực tiếp vào Inventory Ledger

Để đảm bảo khả năng kiểm toán:

- Inventory Ledger là append-only.
- Không cho phép UPDATE.
- Không cho phép DELETE.

AI chỉ có thể đọc dữ liệu được cấp quyền.

AI không được quyền tạo giao dịch kho trực tiếp.

---

## 5.4 AI không can thiệp vào giao dịch ACID

Các giao dịch:

```
Create Order
      ↓
Reserve Stock
      ↓
Confirm Order
      ↓
Deduct Stock
```

phải được thực hiện thông qua transaction của cơ sở dữ liệu.

AI không được tham gia vào quy trình xử lý transaction này nhằm tránh phát sinh lỗi dữ liệu.

---

# 6. Giới hạn về bảo mật và quyền riêng tư

## 6.1 Giới hạn truy cập dữ liệu

AI phải tuân thủ kiến trúc Multi-Tenant.

Nguyên tắc:

- Tenant chỉ được truy cập dữ liệu của chính mình.
- Không được đọc dữ liệu Tenant khác.
- Không được sử dụng dữ liệu Tenant khác để huấn luyện.

---

## 6.2 Dữ liệu nhạy cảm

Các dữ liệu sau phải được bảo vệ:

- Email người dùng.
- Số điện thoại.
- Thông tin thanh toán.
- Token xác thực.
- Thông tin khách hàng.
- Dữ liệu kinh doanh riêng.

AI không được tiết lộ hoặc suy luận thông tin ngoài phạm vi được cấp quyền.

---

## 6.3 Tuân thủ phân quyền (RBAC)

AI phải kế thừa quyền của người dùng hiện tại.

Ví dụ:

### Owner

Có thể xem:

- Tất cả báo cáo.
- Tất cả chi nhánh.
- Dữ liệu lợi nhuận.

### Staff

Chỉ xem được:

- Tồn kho.
- Đơn hàng.
- Dữ liệu được cấp phép.

### Cashier

Chỉ truy cập:

- POS.
- Thông tin bán hàng cần thiết.

AI không được vượt quá phạm vi quyền của người dùng.

---

# 7. Giới hạn hiệu năng

## 7.1 Tài nguyên tính toán

Các mô hình AI có thể tiêu tốn:

- CPU.
- RAM.
- Dung lượng lưu trữ.
- Tài nguyên GPU (nếu có).

Khi số lượng SKU tăng lên hàng chục nghìn sản phẩm:

- Thời gian huấn luyện tăng.
- Chi phí tính toán tăng.
- Thời gian sinh dự báo tăng.

---

## 7.2 Tính thời gian thực

Dự báo AI không phải lúc nào cũng được cập nhật theo thời gian thực.

Một số mô hình có thể:

- Chạy mỗi giờ.
- Chạy mỗi ngày.
- Chạy ban đêm thông qua Hangfire.

Do đó kết quả AI có thể không phản ánh ngay lập tức các giao dịch vừa phát sinh.

---

# 8. Rủi ro kinh doanh

Các khuyến nghị của AI có thể bị ảnh hưởng bởi:

- Chiến dịch quảng cáo.
- Đối thủ cạnh tranh.
- Biến động thị trường.
- Thay đổi giá nhập.
- Xu hướng mạng xã hội.
- Chính sách kinh tế.
- Hành vi tiêu dùng mới.

Những yếu tố này đôi khi không xuất hiện trong dữ liệu lịch sử nên AI không thể dự báo chính xác.

---

# 9. Biện pháp giảm thiểu

Để giảm rủi ro khi sử dụng AI, hệ thống cần áp dụng:

## 9.1 Giám sát độ chính xác

- Theo dõi Forecast Accuracy.
- Theo dõi MAPE.
- Theo dõi RMSE.
- Đánh giá định kỳ hàng tháng.

---

## 9.2 Tái huấn luyện mô hình

- Huấn luyện lại khi có dữ liệu mới.
- Huấn luyện lại khi phát hiện Model Drift.
- Huấn luyện lại theo lịch định kỳ.

---

## 9.3 Human-in-the-Loop

Mọi quyết định quan trọng cần có sự phê duyệt của con người:

- Nhập hàng.
- Điều chỉnh tồn kho.
- Thay đổi giá bán.
- Phân tích kinh doanh.

---

## 9.4 Nhật ký kiểm toán

Hệ thống cần lưu:

- Thời điểm tạo dự báo.
- Dữ liệu sử dụng.
- Phiên bản mô hình.
- Người thực hiện.
- Kết quả được đề xuất.

Nhằm phục vụ:

- Kiểm toán.
- Truy vết.
- Điều tra sự cố.

---

# 10. Tuyên bố miễn trừ trách nhiệm

Hệ thống AI trong OISM chỉ đóng vai trò hỗ trợ phân tích và ra quyết định. Các dự báo, khuyến nghị và nhận xét được tạo ra bởi AI không phải là cam kết hoặc bảo đảm về kết quả kinh doanh trong tương lai.

Chủ cửa hàng, nhân viên vận hành và doanh nghiệp sử dụng hệ thống chịu trách nhiệm cuối cùng đối với mọi quyết định nhập hàng, điều chỉnh tồn kho, định giá sản phẩm và các hoạt động kinh doanh phát sinh từ việc tham khảo các khuyến nghị của AI.

Mọi cơ chế nghiệp vụ trọng yếu bao gồm Inventory Ledger, Anti-Oversell Engine, Stock Reservation, COGS Calculation và Order Processing vẫn được vận hành dựa trên các quy tắc nghiệp vụ xác định và không phụ thuộc vào kết quả dự báo của AI.
