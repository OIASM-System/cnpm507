
1. Công thức Điểm đặt hàng lại (Reorder Point - ROP)

Công thức này xác định khi nào bạn cần bấm nút đặt hàng. Khi lượng hàng tồn thực tế chạm mốc này, POS sẽ tự động đưa sản phẩm vào danh sách đề xuất.
\(\mathbf{ROP=(V\times LT)+SS}\)
• V (Sales Velocity / Lead Time Demand): Tốc độ bán hàng trung bình ngày (Số lượng bán ra / Số ngày theo dõi).
• LT (Lead Time): Thời gian chờ hàng (Số ngày từ lúc gửi đơn đặt hàng đến khi hàng về kho).
• SS (Safety Stock): Lượng hàng dự phòng an toàn (Dùng để bù đắp nếu nhà cung cấp giao trễ hoặc sức mua tăng đột biến).

2. Công thức tính Hàng dự phòng an toàn (Safety Stock - SS)

Để tính chính xác lượng hàng dự phòng, các hệ thống POS nâng cao thường áp dụng công thức dựa trên sự biến động:
\(\mathbf{SS=(Max\_Sales\times Max\_LT)-(Avg\_Sales\times Avg\_LT)}\)
• Max_Sales: Số lượng bán ra nhiều nhất trong một ngày.
• Max_LT: Thời gian giao hàng lâu nhất của nhà cung cấp (ngày).
• Avg_Sales: Số lượng bán ra trung bình mỗi ngày (\(V\)).
• Avg_LT: Thời gian giao hàng trung bình của nhà cung cấp (\(LT\)).

3. Công thức tính Số lượng đặt hàng đề xuất (Recommended Order Quantity - ROQ)

Công thức này xác định đặt bao nhiêu là tối ưu nhất để vừa đủ dùng, vừa tối ưu chi phí lưu kho.
\(\mathbf{ROQ=Max\_Level-Available\_Stock}\)
• Max_Level (Mức tồn kho tối đa mong muốn): Được tính bằng \(ROP + EOQ\) (Số lượng đặt hàng kinh tế) hoặc dựa trên số ngày phủ sóng kho mong muốn (ví dụ: muốn kho luôn đủ hàng trong 30 ngày tiếp theo).
• Available_Stock (Lượng hàng sẵn có thực tế):
\(\text{Available\_Stock}=\text{Hàng đang có trong kho}+\text{Hàng đang trên đường về (On Order)}-\text{Hàng đã được khách đặt trước (Committed)}\)

Ví dụ minh họa trực quan

Cửa hàng của bạn bán Sữa bột:
• Mỗi ngày bán trung bình: 10 hộp (\(V = 10\))
• Nhà cung cấp giao hàng mất: 5 ngày (\(LT = 5\))
• Lượng hàng an toàn dự phòng: 20 hộp (\(SS = 20\))
• Mức tồn kho tối đa thiết lập: 100 hộp (\(Max\_Level = 100\))
Tính toán từ hệ thống POS:
1. Điểm đặt hàng lại (ROP): \((10 \times 5) + 20 = \mathbf{70}\) hộp. Khi kho giảm xuống còn 70 hộp, POS sẽ phát tín hiệu cảnh báo/đề xuất.
2. Số lượng đề xuất mua (ROQ): Nếu lúc đó hàng sẵn có trong kho là 70 hộp, hệ thống sẽ đề xuất bạn đặt mua thêm: \(100 - 70 = \mathbf{30}\) hộp.



