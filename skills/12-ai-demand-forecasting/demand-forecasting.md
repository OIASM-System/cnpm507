# 📈 Multi-Tier Demand Forecasting Models - POS PWA Project

Tài liệu này quy định kiến trúc lựa chọn và kết hợp các **Mô hình Dự báo Nhu cầu Chuỗi thời gian (Time-Series Forecasting Models)** cho hệ thống **POS PWA (Point of Sale Progressive Web App)**. Trong một cửa hàng bán lẻ hoặc F&B thực tế, danh mục sản phẩm có độ dài lịch sử dữ liệu rất không đồng đều: có những mặt hàng chủ lực đã bán suốt 1 năm, nhưng cũng có những món mới vừa thêm vào thực đơn cách đây 5 ngày. Vì vậy, hệ thống áp dụng chiến lược **Phân tầng Mô hình Thích ứng (Adaptive Multi-Tier Model Selection)** thay vì ép buộc một thuật toán duy nhất cho mọi sản phẩm.

---

## 🎯 1. Chiến lược Phân tầng Thuật toán theo Độ dài Dữ liệu (Cold-Start to Mature)

| Phân tầng sản phẩm (`Product Tier`) | Điều kiện lịch sử bán hàng ($N$ ngày) | Thuật toán áp dụng | Lý do lựa chọn & Đặc tính kỹ thuật |
| :--- | :---: | :--- | :--- |
| **Tier 1: Sản phẩm Mới (`Cold-Start`)** | **$N < 14\text{ ngày}$** | **Weighted Moving Average (WMA)** theo nhóm danh mục (`Category Baseline`) | Dữ liệu quá ngắn để học máy hội tụ; sử dụng trung bình có trọng số những ngày đã bán kết hợp hệ số ngày cuối tuần của danh mục. |
| **Tier 2: Sản phẩm Đang tăng trưởng (`Developing`)** | **$14 \le N < 60\text{ ngày}$** | **Holt-Winters Triple Exponential Smoothing** (Chu kỳ mùa vụ tuần $m = 7$) | Nắm bắt tốt cả xu hướng tăng/giảm (**Trend**) lẫn chu kỳ lặp lại 7 ngày trong tuần (**Weekly Seasonality**) với chi phí tính toán cực thấp. |
| **Tier 3: Sản phẩm Chủ lực (`Mature SKU`)** | **$N \ge 60\text{ ngày}$** | **Global LightGBM Regressor** (Multi-Series Gradient Boosted Trees) | Huấn luyện một mô hình **LightGBM** chung cho toàn bộ các sản phẩm trưởng thành trong cùng một `Tenant`, khai thác đồng thời `Lag Features`, `Rolling Stats`, ngày lễ và biến động giá. |

---

## 🧮 2. Chi tiết Mô hình Dự báo Chính (LightGBM & Quantile Prediction)

### 2.1. Dự báo Đa phân vị (Multi-Quantile Forecasting)
Thay vì chỉ dự báo một con số trung bình điểm (**Point Forecast** $\hat{y}_{t+h}$), mô hình **LightGBM** được cấu hình huấn luyện với hàm mất mát **Pinball Loss (`objective='quantile'`)** để xuất ra đồng thời **3 mức dự báo** cho chân trời $H = 7\text{ ngày}$ tới:
* **$\hat{y}^{(0.50)}$ (`P50 - Median Forecast`):** Mức tiêu thụ kỳ vọng trung bình (dùng để lên kế hoạch nhập hàng tiêu chuẩn).
* **$\hat{y}^{(0.10)}$ (`P10 - Lower Bound`):** Kịch bản sức mua thấp (dùng để cảnh báo nguy cơ tồn đọng hàng tươi sống/hạn sử dụng ngắn).
* **$\hat{y}^{(0.90)}$ (`P90 - Upper Bound`):** Kịch bản sức mua cao điểm (dùng để tính lượng đệm an toàn cho các mặt hàng bán chạy).

### 2.2. Dự báo Cuốn chiếu Đa bước (`Recursive Multi-Step Forecasting`)
Để dự báo tổng nhu cầu cho **7 ngày tiếp theo** ($\hat{D}_{1..7} = \sum_{h=1}^{7} \hat{y}_{t+h}$):
1. Mô hình dự báo ngày $t+1$ dựa trên dữ liệu thực tế đến ngày $t$.
2. Giá trị dự báo $\hat{y}_{t+1}$ được đưa ngược lại vào chuỗi để tính các đặc trưng `lag_1`, `rolling_mean_7d` cho ngày $t+2$, lặp lại tuần tự cho đến ngày $t+7$.
3. Cuối cùng cộng dồn nhu cầu dự báo của 7 ngày tới làm cơ sở tính toán **Điểm đặt hàng lại (Reorder Point)**.

---

## 💻 3. Triển khai Dịch vụ Suy luận Python (`forecast_engine.py`)

```python
import numpy as np
import pandas as pd
import lightgbm as lgb
from statsmodels.tsa.holtwinters import ExponentialSmoothing

def forecast_product_demand(df_product: pd.DataFrame, horizon_days: int = 7) -> dict:
    """
    Dự báo nhu cầu tiêu thụ cho từng sản phẩm dựa trên độ dài lịch sử dữ liệu (Tier 1 -> Tier 3).
    """
    history_days = len(df_product)
    demand_series = df_product["demand_qty"].values

    # TIER 1: Cold-Start (< 14 ngày) -> Trung bình động có trọng số (ưu tiên 7 ngày gần nhất)
    if history_days < 14:
        recent = demand_series[-7:] if history_days >= 7 else demand_series
        weights = np.arange(1, len(recent) + 1)
        daily_avg = float(np.average(recent, weights=weights))
        daily_std = float(np.std(recent)) if len(recent) > 1 else daily_avg * 0.25

        return {
            "model_used": "WMA_ColdStart",
            "daily_forecast": [round(daily_avg, 2)] * horizon_days,
            "total_7d_p50": round(daily_avg * horizon_days, 1),
            "daily_std_dev": round(daily_std, 2),
        }

    # TIER 2: Developing (14 - 59 ngày) -> Holt-Winters Seasonal (Chu kỳ 7 ngày)
    if history_days < 60:
        hw_model = ExponentialSmoothing(
            demand_series,
            trend="add",
            seasonal="add",
            seasonal_periods=7,
            initialization_method="estimated",
        ).fit(optimized=True)

        preds = np.maximum(0, hw_model.forecast(horizon_days))
        residuals = demand_series - hw_model.fittedvalues
        daily_std = float(np.std(residuals))

        return {
            "model_used": "HoltWinters_Seasonal7",
            "daily_forecast": [round(float(x), 2) for x in preds],
            "total_7d_p50": round(float(np.sum(preds)), 1),
            "daily_std_dev": round(daily_std, 2),
        }

    # TIER 3: Mature (>= 60 ngày) -> Sử dụng mô hình Global LightGBM đã huấn luyện cho Tenant
    return predict_with_tenant_lgbm(df_product, horizon_days)
```

---
