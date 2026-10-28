1. Chỉ số Đánh giá Hiệu năng Dự báo (Evaluation Metrics)
MAE (Mean Absolute Error - Sai số tuyệt đối trung bình):
Đo lường độ lệch tuyệt đối trung bình giữa nhu cầu dự báo và thực tế.
Công thức: MAE = (1 / n) * Sum(|y_i - y_hat_i|)
Trong đó:
n: Số lượng mẫu quan sát
y_i: Giá trị nhu cầu thực tế
y_hat_i: Giá trị nhu cầu do AI dự báo
RMSE (Root Mean Squared Error - Căn bậc hai sai số bình phương trung bình):
Đánh giá mức độ sai số lớn, giúp phạt nặng các dự báo chênh lệch quá xa.
Công thức: RMSE = Sqrt((1 / n) * Sum((y_i - y_hat_i)^2))
MAPE (Mean Absolute Percentage Error - Tỷ lệ sai số phần trăm trung bình):
Cho cái nhìn trực quan về phần trăm độ chính xác của dự báo.
Công thức: MAPE = (100% / n) * Sum(|(y_i - y_hat_i) / y_i|)
2. Chỉ số Đánh giá Hiệu quả Vận hành Kho (Business Metrics)
Tỷ lệ Đứt hàng (Stockout Rate): % thời gian/sản phẩm bị thiếu hụt gây mất doanh thu.
Tỷ lệ Tồn kho Vượt ngưỡng (Overstock Rate): % nguyên liệu thừa quá dư dung lượng an toàn dẫn đến nguy cơ hết hạn / lãng phí.
Tỷ lệ Đáp ứng Đơn hàng (Order Fill Rate): Tỷ lệ phần trăm đơn hàng bán ra được đáp ứng đầy đủ ngay lập tức từ kho.
3. Chiến lược Kiểm thử & Tái huấn luyện (Retraining Strategy)
Cross-Validation (Time-Series Split): Kiểm thử mô hình bằng phương pháp phân tách chuỗi thời gian liên tục (tránh lộ dữ liệu tương lai).
Lịch Tái huấn luyện (Retraining Schedule):
Huấn luyện lại định kỳ theo tuần (Weekly Retraining) với dữ liệu bán hàng mới nhất.
Kích hoạt huấn luyện lại đột xuất (Triggered Retraining) khi MAPE vượt ngưỡng cho phép (>15%).
