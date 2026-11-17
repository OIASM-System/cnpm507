# 🔄 Sequence Diagram (Sơ đồ tuần tự) - POS PWA Project

Tài liệu này mô tả chi tiết luồng thông điệp tương tác theo thời gian giữa các thành phần trong hệ thống **POS PWA (Point of Sale Progressive Web App)**, tập trung vào hai kịch bản nghiệp vụ cốt lõi: **Tìm kiếm/Quản lý giỏ hàng** và **Thanh toán/Trừ kho chống bán quá mức (Anti-oversell)/In hóa đơn**.

---

## 🏛️ 1. Sơ đồ Tuần tự (Biểu đồ dạng Mermaid)

Bạn có thể sử dụng đoạn mã Mermaid dưới đây để hiển thị trực quan sơ đồ tuần tự trên các nền tảng hỗ trợ (như GitHub, Notion, hoặc VS Code Extension):

```mermaid
sequenceDiagram
    autonumber
    actor Cashier as Thu ngân
    participant UI as Frontend PWA (React)
    participant SW as Service Worker / Cache
    participant API as .NET Web API (Clean Arch)
    participant DB as PostgreSQL DB
    participant Hub as SignalR Hub

    Note over Cashier, Hub: Luồng 1: Tìm kiếm & Thêm sản phẩm vào giỏ hàng
    Cashier->>UI: Gõ từ khóa hoặc chọn danh mục ([Tất cả], [Sản phẩm],...)
    UI->>SW: Kiểm tra dữ liệu cache nội bộ
    alt Có mạng (Online)
        UI->>API: GET /api/products?search=...&category=...
        API->>DB: Truy vấn bảng Products & Categories
        DB-->>API: Trả về danh sách sản phẩm khớp
        API-->>UI: 200 OK (JSON Product List)
        UI->>SW: Cập nhật dữ liệu sản phẩm mới nhất vào Cache
    else Mất mạng (Offline)
        SW-->>UI: Trả về danh sách sản phẩm từ IndexedDB / Cache
    end
    UI-->>Cashier: Hiển thị lưới sản phẩm với nút [GET]

    Cashier->>UI: Bấm nút [GET] trên thẻ sản phẩm
    UI->>UI: Thêm sản phẩm vào "Shopping Cart" (Tính tạm tính & số lượng +, -)

    Note over Cashier, Hub: Luồng 2: Thanh toán, Chống bán quá mức & In hóa đơn
    Cashier->>UI: Bấm nút "Thanh Toán" (Checkout)
    UI-->>Cashier: Hiển thị màn hình "Receipt Preview" (Mã ORD#, Tạm tính, Tổng tiền)
    Cashier->>UI: Chọn phương thức thanh toán (Tiền mặt / Chuyển khoản / Thẻ) & Xác nhận

    UI->>API: POST /api/orders (Payload: CartItems, PaymentMethod)
    activate API
    API->>DB: Begin Transaction & Lock dòng sản phẩm (Anti-oversell)
    DB-->>API: Trả về số lượng tồn kho hiện tại

    alt Tồn kho hợp lệ (Đủ hàng)
        API->>DB: Tạo Order (Completed), OrderDetails, Payment & Ghi sổ cái trừ kho
        DB-->>API: Commit Transaction thành công
        API->>Hub: Phát sự kiện Broadcast "StockUpdated" & "NewOrderCreated"
        Hub-->>UI: Cập nhật tồn kho real-time cho các máy thu ngân khác
        API-->>UI: 201 Created (OrderNumber: ORD#..., ReceiptData)
        UI-->>Cashier: Hiển thị thông báo thành công & Bật nút "Print Invoice"
        Cashier->>UI: Bấm "Print Invoice"
        UI->>UI: Gọi Browser Print API kích hoạt máy in nhiệt POS
    else Hết hàng / Xung đột tồn kho
        API->>DB: Rollback Transaction
        API-->>UI: 409 Conflict (Thông báo sản phẩm không đủ số lượng)
        UI-->>Cashier: Hiển thị cảnh báo để điều chỉnh lại giỏ hàng
    end
    deactivate API
```

---

## 📋 2. Diễn giải chi tiết các bước trong Luồng Tuần tự

### 2.1. Giai đoạn 1: Truy xuất danh mục & Thao tác giỏ hàng (Bước 1 – 11)
* **Tối ưu PWA (Bước 2 – 9):** Khi thu ngân tìm kiếm hoặc lọc danh mục, ứng dụng ưu tiên lấy dữ liệu mới nhất từ `.NET Web API` và đồng bộ ngầm vào `Service Worker / IndexedDB`. Trong trường hợp mất kết nối mạng đột ngột, hệ thống vẫn lấy dữ liệu từ bộ nhớ đệm để đảm bảo việc bán hàng không bị gián đoạn.
* **Xử lý State tại Client (Bước 10 – 11):** Thao tác bấm nút `GET` và tăng/giảm số lượng (`+`, `-`) được xử lý trực tiếp trên State của React giúp giao diện phản hồi tức thì ($< 200\text{ms}$) mà không cần gọi API liên tục.

### 2.2. Giai đoạn 2: Xem trước hóa đơn & Giao dịch thanh toán (Bước 12 – 26)
* **Receipt Preview (Bước 12 – 13):** Hệ thống hiển thị màn hình xem trước hóa đơn để thu ngân đối chiếu mã đơn (`ORD#...`), danh sách món và tổng tiền với khách hàng trước khi chốt.
* **Cơ chế Anti-oversell (Bước 15 – 19):** Tại tầng Backend, hệ thống mở một Database Transaction và áp dụng khóa dữ liệu (Optimistic/Pessimistic Locking) trên các bản ghi sản phẩm tương ứng. Nếu hai thu ngân cùng thanh toán món cuối cùng trong kho, chỉ một giao dịch được phép `Commit`, giao dịch còn lại sẽ `Rollback` và trả về mã lỗi `409 Conflict`.
* **Đồng bộ thời gian thực & In ấn (Bước 20 – 25):** Ngay sau khi đơn hàng được ghi nhận, `SignalR Hub` đẩy thông báo cập nhật tồn kho tới toàn bộ các thiết bị thu ngân đang kết nối, đồng thời Frontend kích hoạt lệnh in hóa đơn nhiệt trực tiếp từ trình duyệt.

---