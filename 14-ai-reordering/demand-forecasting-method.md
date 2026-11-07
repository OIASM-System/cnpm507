# Demand Forecasting Method
## Omnichannel Inventory and Sales Management System (OISM)

---

# 1. Giới thiệu

## 1.1. Mục đích

Demand Forecasting (Dự báo nhu cầu) là mô-đun AI phân tích dữ liệu bán hàng lịch sử để dự đoán nhu cầu tiêu thụ sản phẩm trong tương lai, từ đó hỗ trợ:

- Lập kế hoạch nhập hàng chính xác.
- Giảm nguy cơ hết hàng (Stockout).
- Giảm tồn kho dư thừa (Overstock).
- Tối ưu vốn lưu động.
- Hỗ trợ ra quyết định trong quản lý chuỗi cung ứng.

Trong hệ thống OISM, Demand Forecasting được tích hợp trực tiếp với:

- Inventory Ledger
- Purchase Management
- Inventory Alert System
- Reporting Dashboard
- Reorder Recommendation Engine

---

# 2. Bài toán nghiệp vụ

## 2.1. Hiện trạng

Trong môi trường bán lẻ đa kênh:

- Doanh số phát sinh từ POS.
- Đơn hàng đến từ Shopee.
- Đơn hàng đến từ TikTok Shop.
- Đơn hàng đến từ Lazada.

Mỗi kênh có sự biến động khác nhau theo:

- Ngày trong tuần.
- Mùa vụ.
- Chương trình khuyến mãi.
- Xu hướng thị trường.
- Dịp lễ tết.

Nếu việc nhập hàng chỉ dựa vào kinh nghiệm thủ công sẽ dẫn đến:

### Thiếu hàng

Ví dụ:

- Tồn kho còn 30 sản phẩm.
- Nhu cầu tuần tới thực tế là 150 sản phẩm.

Kết quả:

- Mất doanh thu.
- Giảm trải nghiệm khách hàng.
- Mất thứ hạng trên sàn thương mại điện tử.

### Dư hàng

Ví dụ:

- Nhập 500 sản phẩm.
- Chỉ bán được 100 sản phẩm.

Kết quả:

- Tăng chi phí lưu kho.
- Chiếm dụng vốn.
- Nguy cơ hàng lỗi thời.

---

# 3. Mục tiêu hệ thống

Hệ thống Demand Forecasting phải:

### DF-01

Dự báo nhu cầu bán hàng theo:

- SKU
- Chi nhánh
- Kênh bán

### DF-02

Tự động đề xuất:

- Reorder Point
- Safety Stock
- Recommended Purchase Quantity

### DF-03

Hiển thị xu hướng bán hàng trên Dashboard.

### DF-04

Tự động chạy hằng ngày bằng Hangfire.

### DF-05

Hoạt động được trên mô hình SaaS Multi-Tenant.

---

# 4. Dữ liệu đầu vào

## 4.1. Nguồn dữ liệu

### Orders

Nguồn dữ liệu chính:

```text
Orders
OrderItems
```

Thông tin:

- SKU bán ra
- Số lượng
- Ngày bán
- Kênh bán

---

### Inventory Ledger

```text
InventoryTransactions
```

Thông tin:

- Tồn kho thực tế
- Điều chỉnh kho
- Chuyển kho

---

### Product Master Data

```text
Products
SKUs
Brands
Categories
```

Thông tin sản phẩm.

---

### Promotion Data

Thông tin khuyến mãi:

- Flash Sale
- Voucher
- Campaign

---

### Calendar Events

Các sự kiện ảnh hưởng nhu cầu:

- Tết
- Noel
- Black Friday
- Back To School
- Ngày đôi Shopee

---

# 5. Kiến trúc dự báo

## 5.1. Tổng quan

```text
             Orders
                |
                v
      Data Aggregation Service
                |
                v
        Feature Engineering
                |
                v
         Forecast Engine
                |
                v
      Reorder Recommendation
                |
                v
        Dashboard / Reports
```

---

# 6. Data Aggregation

## 6.1. Tổng hợp doanh số

Ví dụ dữ liệu gốc:

| Date | SKU | Quantity |
|--------|--------|----------|
| 01-01 | SKU001 | 15 |
| 02-01 | SKU001 | 18 |
| 03-01 | SKU001 | 20 |
| 04-01 | SKU001 | 22 |

---

## 6.2. Chuẩn hóa dữ liệu

Loại bỏ:

- Đơn hàng hủy.
- Đơn hàng lỗi.
- Dữ liệu trùng lặp.
- Giá trị âm.

---

## 6.3. Tổng hợp theo chu kỳ

### Daily

```text
SKU001
01/01 : 15
02/01 : 18
03/01 : 20
```

### Weekly

```text
Week 1 : 150
Week 2 : 170
Week 3 : 220
```

### Monthly

```text
Jan : 650
Feb : 720
Mar : 850
```

---

# 7. Feature Engineering

Hệ thống sinh các thuộc tính phục vụ mô hình AI.

## 7.1. Time Features

- DayOfWeek
- WeekOfYear
- Month
- Quarter
- HolidayFlag

Ví dụ:

| Date | Day | Holiday |
|--------|--------|--------|
| 2026-01-01 | Thursday | True |

---

## 7.2. Sales Features

- Last 7 Days Sales
- Last 30 Days Sales
- Moving Average
- Sales Growth Rate

---

## 7.3. Inventory Features

- Current On-Hand
- Reserved Quantity
- Available Quantity

---

## 7.4. Promotion Features

- Promotion Flag
- Discount Percent
- Flash Sale Flag

---

# 8. Thuật toán dự báo

## 8.1. Giai đoạn MVP

### Moving Average

Công thức:

```text
Forecast =
(Sales1 + Sales2 + Sales3) / 3
```

Ví dụ:

```text
100
120
110
```

Forecast:

```text
(100 + 120 + 110)/3
= 110
```

---

## 8.2. Weighted Moving Average

Công thức:

```text
Forecast =
Σ(Demand × Weight)
```

Ví dụ:

| Ngày | Sales | Weight |
|--------|---------|---------|
| T-3 | 80 | 0.2 |
| T-2 | 100 | 0.3 |
| T-1 | 120 | 0.5 |

Kết quả:

```text
80×0.2
+100×0.3
+120×0.5

=106
```

Forecast:

```text
106 đơn vị
```

---

## 8.3. Exponential Smoothing

Công thức:

```text
Ft+1 = αAt +(1−α)Ft
```

Trong đó:

- At = Actual Demand
- Ft = Forecast hiện tại
- α = Smoothing Factor

Thường:

```text
0.1 <= α <= 0.3
```

---

# 9. Thuật toán AI nâng cao

## 9.1. Facebook Prophet

Ưu điểm:

- Xử lý seasonality.
- Dễ huấn luyện.
- Phù hợp SME.

Dự báo:

- Theo ngày
- Theo tuần
- Theo tháng

---

## 9.2. XGBoost

Áp dụng khi:

- Dữ liệu lớn.
- Có nhiều feature.

Ưu điểm:

- Chính xác cao.
- Huấn luyện nhanh.

---

## 9.3. LightGBM

Ưu điểm:

- Tốc độ nhanh.
- Tiết kiệm bộ nhớ.

---

## 9.4. LSTM

Áp dụng:

- Chuỗi thời gian dài.
- Dữ liệu lớn.

Ví dụ:

```text
2-3 năm doanh số
```

---

# 10. Đề xuất nhập hàng

## 10.1. Safety Stock

Công thức đơn giản:

```text
Safety Stock
=
Average Daily Demand
× Safety Days
```

Ví dụ:

```text
20 sản phẩm/ngày
```

và

```text
Safety Days = 5
```

Kết quả:

```text
20 × 5 = 100
```

---

## 10.2. Reorder Point

Công thức:

```text
ROP
=
Average Daily Demand × Lead Time
+
Safety Stock
```

Ví dụ:

```text
Average Demand = 20
Lead Time = 5
Safety Stock = 30
```

=>

```text
ROP = (20×5)+30
ROP = 130
```

Khi:

```text
Available <= 130
```

Hệ thống phát cảnh báo.

---

## 10.3. Recommended Order Quantity

```text
ROQ
=
Forecast Demand
+
Safety Stock
-
Available Stock
```

Ví dụ:

```text
Forecast Demand = 500

Safety Stock = 100

Available = 220
```

Kết quả:

```text
500 + 100 - 220

= 380
```

Đề xuất nhập:

```text
380 sản phẩm
```

---

# 11. Tích hợp vào OISM

## 11.1. Tích hợp Hangfire

Mỗi đêm:

```text
01:00 AM
```

Hangfire Job:

```text
DemandForecastJob
```

Thực hiện:

1. Lấy dữ liệu 365 ngày.
2. Huấn luyện mô hình.
3. Sinh dự báo.
4. Cập nhật Dashboard.

---

## 11.2. Dashboard

Hiển thị:

- Forecast Demand
- Available Inventory
- Recommended Stock
- Reorder Alert

---

## 11.3. Inventory Alert

Khi:

```text
Available <= Reorder Point
```

Hệ thống:

- Push Notification
- Dashboard Alert
- SignalR Popup

---

# 12. Thiết kế cơ sở dữ liệu

## 12.1. ForecastResults

| Field | Type |
|---------|---------|
| Id | UUID |
| TenantId | UUID |
| SKUId | UUID |
| ForecastDate | Date |
| PredictedDemand | Decimal |
| ConfidenceScore | Decimal |
| RecommendedOrderQty | Decimal |
| ModelVersion | Text |
| CreatedAt | Timestamp |

---

## 12.2. ForecastTrainingLog

| Field | Type |
|---------|---------|
| Id | UUID |
| TenantId | UUID |
| ModelName | Text |
| MAE | Decimal |
| RMSE | Decimal |
| MAPE | Decimal |
| TrainedAt | Timestamp |

---

# 13. API Design

## Forecast API

### Generate Forecast

```http
POST /api/forecast/generate
```

### Get Forecast

```http
GET /api/forecast/sku/{skuId}
```

### Get Reorder Suggestions

```http
GET /api/forecast/reorder
```

### Dashboard Summary

```http
GET /api/forecast/dashboard
```

---

# 14. KPI Đánh giá

## MAE

Mean Absolute Error

```text
MAE = Σ|Actual-Forecast| / n
```

---

## RMSE

```text
RMSE =
√(Σ(Actual-Forecast)²/n)
```

---

## MAPE

```text
MAPE =
Σ(|Actual-Forecast|/Actual)
×100
```

---

## Mục tiêu

| KPI | Mục tiêu |
|--------|--------|
| MAPE | < 20% |
| MAE | Tối thiểu |
| RMSE | Tối thiểu |
| Forecast Time | < 5 giây |
| Processing | 10.000 SKU |

---

# 15. Luồng nghiệp vụ hoàn chỉnh

```text
Orders
    ↓
Inventory Ledger
    ↓
Data Aggregation
    ↓
Feature Engineering
    ↓
Forecast Engine
    ↓
Forecast Results
    ↓
Reorder Recommendation
    ↓
Dashboard Alert
    ↓
Purchase Decision
```

---

# 16. Kết quả mong đợi

Sau khi triển khai Demand Forecasting, hệ thống OISM sẽ:

- Dự báo nhu cầu theo SKU, chi nhánh và kênh bán.
- Tự động đề xuất số lượng cần nhập.
- Giảm tỷ lệ hết hàng.
- Giảm tồn kho dư thừa.
- Tối ưu vòng quay tồn kho.
- Tăng độ chính xác kế hoạch mua hàng.
- Hỗ trợ vận hành hàng triệu giao dịch trên kiến trúc SaaS Multi-Tenant.
- Tăng hiệu quả quản lý chuỗi cung ứng cho doanh nghiệp bán lẻ đa kênh.
