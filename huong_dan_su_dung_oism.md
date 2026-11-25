# HƯỚNG DẪN SỬ DỤNG GIAO DIỆN OISM -- QUẢN LÝ TỒN KHO

## 1. Mục đích

Tài liệu hướng dẫn người dùng xác định đúng chi nhánh, Tenant và sản
phẩm khi thao tác trên giao diện quản lý tồn kho OISM.

## 2. Thông tin định danh

### TenantID và BranchID

  ---------------------------------------------------------------------------------------------------------
  Nhóm dữ liệu            TenantID                                 BranchID
  ----------------------- ---------------------------------------- ----------------------------------------
  Nhóm sản phẩm BK, TE,   `11111111-1111-1111-1111-111111111111`   `11111111-1111-1111-1111-111111111111`
  CF                                                               

  Nhóm sản phẩm SP        `00000000-0000-0000-0000-000000000001`   `00000000-0000-0000-0000-000000000001`
  ---------------------------------------------------------------------------------------------------------

**Lưu ý:** Các giá trị trên được ghi lại theo thứ tự hai cột định danh
cuối trong dữ liệu được cung cấp. Nếu hệ thống của bạn xuất thứ tự cột
khác, hãy đối chiếu tên cột `TenantId` và `BranchId` trong PostgreSQL
trước khi sử dụng.

### ProductID

  SKU      Tên sản phẩm     ProductID
  -------- ---------------- ----------------------------------------
  BK-001   Croissant bơ     `937c1433-3d4e-41cf-9a16-2d8553156c7b`
  TE-001   Trà đào cam sả   `adc9a6c1-5d57-4faa-82ac-423b6caae460`
  CF-002   Bạc xỉu          `851b47ed-fb56-44ce-8928-5c3412ed8fbe`
  CF-001   Cà phê sữa đá    `436db638-c4b8-4203-ada3-044dde843032`
  SP001    Coca             `25d00b0f-a91f-4542-a375-7a1a57cf70ea`
  SP002    7Up              `91e8ce07-6905-4810-a375-284e713ee32d`
  SP003    Sprite           `aacf2496-10e3-4530-9e81-e59d8581a8fa`
  SP004    Pepsi            `79925918-d51f-4393-a13f-eb01469de138`
  SP005    Khô gà           `19616768-bd39-486d-8fa7-64d46b014a61`
  SP006    Khô bò           `a0dd60f0-cc0d-46dd-854c-16eefcf32771`
  SP007    Lạp xưởng        `38909253-2cfc-4946-8969-d3c48bf424d8`
  SP008    Xúc xích         `ea0cdaae-a9a0-4677-b482-3882cdd939f7`
  SP009    Hảo Hảo          `03d3d905-680c-4dfd-a12f-0c5b219a5956`
  SP010    Omachi           `f89d0fb8-569b-4c22-a2bc-c6afedaea2b3`

## 3. Hướng dẫn sử dụng giao diện tồn kho

1.  Đăng nhập vào hệ thống OISM bằng tài khoản được cấp.
2.  Mở chức năng **Inventory / Quản lý tồn kho**.
3.  Chọn đúng chi nhánh cần xem hoặc quản lý.
4.  Xác định Tenant đang đăng nhập. TenantID phải thuộc đúng nhóm dữ
    liệu cần thao tác ở mục 2.
5.  Tìm sản phẩm theo SKU hoặc tên sản phẩm trong danh sách.
6.  Khi cần đối chiếu dữ liệu hoặc gọi API, sử dụng ProductID tương ứng
    trong bảng ProductID.
7.  Kiểm tra các thông tin tồn kho:
    -   **On Hand:** số lượng hàng hiện có trong kho.
    -   **Reserved:** số lượng đã được giữ cho đơn hàng.
    -   **Available:** số lượng còn có thể bán, được tính bằng
        `On Hand - Reserved`.
8.  Nếu cần điều chỉnh tồn kho, mở chức năng điều chỉnh, chọn đúng sản
    phẩm và chi nhánh, nhập số lượng tồn kho mới rồi xác nhận.
9.  Tải lại danh sách hoặc xem lại chi tiết sản phẩm để kiểm tra kết quả
    cập nhật.

## 4. Lưu ý khi thao tác

-   Luôn kiểm tra TenantID và BranchID trước khi xem hoặc điều chỉnh tồn
    kho.
-   ProductID phải khớp với sản phẩm cần thao tác; không dùng SKU thay
    cho ProductID khi API yêu cầu GUID.
-   Không sử dụng ID của nhóm Tenant này để thao tác trên dữ liệu của
    Tenant khác.
-   Khi điều chỉnh tồn kho, nhập **số lượng mới** theo yêu cầu của giao
    diện; không tự hiểu đó là số lượng cần cộng thêm.
-   Nếu sản phẩm không hiển thị hoặc tên/SKU bị trống, kiểm tra lại
    TenantID, BranchID, ProductID và dữ liệu trả về từ API.
