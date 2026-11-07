# AI Scope Document
# Omnichannel Inventory and Sales Management System (OISM)

## 1. Mục tiêu AI

Hệ thống OISM sử dụng AI nhằm hỗ trợ nhà quản lý đưa ra quyết định tồn kho và vận hành hiệu quả hơn trên môi trường bán lẻ đa kênh.

AI không tham gia vào các nghiệp vụ cốt lõi yêu cầu tính chính xác tuyệt đối như:

- Tính tồn kho
- Chống bán vượt (Anti-Oversell)
- Tính giá vốn (COGS)
- Ghi sổ cái tồn kho (Inventory Ledger)

Các nghiệp vụ trên vẫn được triển khai bằng logic nghiệp vụ truyền thống để đảm bảo tính ACID và khả năng kiểm toán.

AI chỉ đóng vai trò hỗ trợ phân tích, dự báo và đề xuất.

---

# 2. Các chức năng AI dự kiến

## AI-01: Dự báo nhu cầu bán hàng (Demand Forecasting)

### Mục tiêu

Dự báo số lượng bán trong tương lai cho từng SKU nhằm hỗ trợ việc nhập hàng.

### Dữ liệu đầu vào

- Lịch sử đơn hàng
- Lịch sử bán hàng POS
- Dữ liệu doanh thu theo ngày
- SKU
- Chi nhánh
- Mùa vụ

### Dữ liệu đầu ra

Ví dụ:

```json
{
  "sku": "SKU-001",
  "next30DaysForecast": 250,
  "confidence": 87
}
```

### Giá trị mang lại

- Giảm tình trạng hết hàng
- Giảm tồn kho dư thừa
- Hỗ trợ lập kế hoạch nhập hàng

---

## AI-02: Đề xuất điểm đặt hàng lại (Reorder Recommendation)

### Mục tiêu

Tự động đề xuất thời điểm nhập hàng.

### Công thức nền tảng

```text
Reorder Point
=
Average Daily Sales
×
Lead Time
+
Safety Stock
```

### AI cải tiến

AI tự động học:

- Tốc độ bán hàng
- Xu hướng mùa vụ
- Độ biến động nhu cầu

### Kết quả

Ví dụ:

```json
{
  "sku": "SKU-001",
  "currentAvailable": 40,
  "recommendedReorderPoint": 60,
  "recommendedOrderQty": 200
}
```

### Hiển thị

Dashboard:

```text
⚠ SKU-001 sắp hết hàng

Tồn khả dụng: 40
Ngưỡng AI đề xuất: 60

Đề xuất nhập thêm: 200 sản phẩm
```

---

## AI-03: Phát hiện hàng tồn kho chậm luân chuyển

### Mục tiêu

Xác định các SKU bán chậm.

### Dữ liệu đầu vào

- Inventory Ledger
- Order History
- COGS

### Luật phân tích

Ví dụ:

```text
Không phát sinh giao dịch bán
trong 60 ngày
```

hoặc

```text
Inventory Turnover Ratio thấp
```

### Kết quả

```json
{
  "sku":"SKU-030",
  "inventoryAgeDays":95,
  "risk":"HIGH"
}
```

### Lợi ích

- Xả hàng sớm
- Khuyến mại
- Giảm vốn tồn kho

---

## AI-04: Gợi ý sản phẩm bán chạy

### Mục tiêu

Xác định nhóm sản phẩm bán tốt nhất.

### Dữ liệu sử dụng

- Order Items
- Revenue
- Quantity Sold

### Kết quả

```json
[
  {
    "sku":"SKU-001",
    "rank":1
  },
  {
    "sku":"SKU-002",
    "rank":2
  }
]
```

### Ứng dụng

Dashboard:

```text
Top 10 sản phẩm bán chạy
7 ngày gần nhất
```

---

## AI-05: Phân tích lợi nhuận theo SKU

### Mục tiêu

Ưu tiên các SKU mang lợi nhuận cao.

### Dữ liệu

- Revenue
- Cost Price Snapshot
- Quantity Sold

### Tính toán

```text
Gross Profit
=
Revenue
-
COGS
```

### Kết quả

```json
{
  "sku":"SKU-001",
  "grossProfit":15000000,
  "profitMargin":35
}
```

---

## AI-06: Trợ lý AI hỏi đáp dữ liệu doanh nghiệp

### Mục tiêu

Cho phép chủ cửa hàng hỏi bằng ngôn ngữ tự nhiên.

### Ví dụ

Người dùng hỏi:

```text
Sản phẩm nào bán chạy nhất tháng này?
```

AI trả lời:

```text
SKU-001 là sản phẩm bán chạy nhất
với 1.250 đơn hàng.
```

---

Người dùng hỏi:

```text
Những mặt hàng nào nên nhập thêm?
```

AI trả lời:

```text
5 SKU đang thấp hơn ngưỡng đặt hàng lại.
```

### Công nghệ

- Azure OpenAI
- OpenAI API
- Semantic Kernel

---

# 3. Các chức năng ngoài phạm vi AI

Các chức năng dưới đây KHÔNG sử dụng AI và được xử lý bằng Business Logic:

## Inventory Ledger

- Nhập kho
- Xuất kho
- Điều chỉnh kho
- Chuyển kho

## Anti-Oversell Engine

- Reserve Stock
- Available Stock
- Deduct Stock
- Release Reservation

## COGS Engine

- Weighted Average Cost
- Cost Snapshot

## Order State Machine

- Draft
- Reserved
- Confirmed
- Completed
- Cancelled

---

# 4. Kiến trúc AI

```text
+------------------+
| PostgreSQL       |
+------------------+
         |
         v
+------------------+
| Reporting Data   |
| Aggregation      |
+------------------+
         |
         v
+------------------+
| AI Service       |
| Forecast Engine  |
| Recommendation   |
+------------------+
         |
         v
+------------------+
| Admin Dashboard  |
+------------------+
```

---

# 5. Công nghệ đề xuất

## Backend

- .NET 8
- ASP.NET Core Web API

## Database

- PostgreSQL

## Background Jobs

- Hangfire

## AI Layer

### Giai đoạn MVP

- ML.NET Time Series Forecasting

hoặc

- Python Forecast Service

### Giai đoạn mở rộng

- Azure OpenAI
- OpenAI GPT-4o / GPT-5
- Semantic Kernel

---

# 6. Chỉ số đánh giá AI

## Forecast Accuracy

MAPE (Mean Absolute Percentage Error)

Mục tiêu:

```text
MAPE < 20%
```

## Reorder Recommendation

Mục tiêu:

```text
Giảm 20% số lần hết hàng
```

## Inventory Turnover

Mục tiêu:

```text
Tăng vòng quay tồn kho
ít nhất 10%
```

---

# 7. Deliverables

## Mã nguồn

- Inventory Forecast Service
- Recommendation Service
- AI Chat Assistant

## API

- GET /api/ai/forecast
- GET /api/ai/reorder-suggestions
- GET /api/ai/slow-moving-items
- POST /api/ai/chat

## Dashboard

- Sales Forecast
- Reorder Suggestions
- Slow Moving Inventory
- AI Business Assistant

## Tài liệu

- AI Architecture Design
- AI Model Training Guide
- AI API Specification
- AI Test Cases

---

# Kết luận

AI trong OISM đóng vai trò hỗ trợ phân tích và ra quyết định, không tham gia xử lý các nghiệp vụ tồn kho trọng yếu. Phạm vi AI tập trung vào:

1. Dự báo nhu cầu bán hàng.
2. Đề xuất nhập hàng.
3. Phát hiện hàng tồn chậm luân chuyển.
4. Phân tích doanh thu và lợi nhuận.
5. Trợ lý AI hỏi đáp dữ liệu kinh doanh.

Cách tiếp cận này đảm bảo hệ thống vẫn duy trì tính chính xác, khả năng kiểm toán và chống bán vượt tuyệt đối, đồng thời tận dụng AI để nâng cao hiệu quả vận hành cho doanh nghiệp bán lẻ đa kênh.
