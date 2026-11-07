-- ============================================================================
-- POS PWA — Lược đồ cơ sở dữ liệu PostgreSQL
-- Kiến trúc: cơ sở dữ liệu dùng chung + schema dùng chung, đa Tenant thông qua tenant_id.
-- Quy ước: tên bảng/cột dạng lower_snake_case; khóa chính BIGSERIAL; khóa ngoại BIGINT;
--         DECIMAL cho tiền tệ; TIMESTAMPTZ cho mốc thời gian.
--
-- LƯU Ý QUAN TRỌNG:
-- 1. Tài liệu được cung cấp chỉ đặc tả đầy đủ một số cột của các bảng
--    sku, "order" và supplier. Các cột/quan hệ khác bên dưới là đề xuất
--    được suy luận từ từ điển dữ liệu và ngữ cảnh nghiệp vụ;
--    cần được nhóm xác nhận trước khi migration lên môi trường thực tế.
-- 2. Đây là schema nền, không phải framework migration production.
-- 3. "order" được đặt trong dấu nháy kép vì ORDER là từ khóa SQL.
-- 4. tenant_id có trong các bảng thuộc Tenant. Bảng Tenant gốc là
--    ngoại lệ. Khóa ngoại được thiết kế có xét Tenant khi phù hợp.
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Tenant, chi nhánh, người dùng và RBAC
-- ---------------------------------------------------------------------------

CREATE TABLE tenant (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(150) NOT NULL,
    code            VARCHAR(50) NOT NULL UNIQUE,
    status          VARCHAR(30) NOT NULL DEFAULT 'active',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE branch (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       BIGINT NOT NULL REFERENCES tenant(id),
    name            VARCHAR(150) NOT NULL,
    code            VARCHAR(50) NOT NULL,
    address         TEXT,
    phone           VARCHAR(20),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (tenant_id, id),
    UNIQUE (tenant_id, code)
);

CREATE TABLE role (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       BIGINT NOT NULL REFERENCES tenant(id),
    name            VARCHAR(100) NOT NULL,
    description     TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (tenant_id, id),
    UNIQUE (tenant_id, name)
);

CREATE TABLE permission (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       BIGINT NOT NULL REFERENCES tenant(id),
    permission_code VARCHAR(100) NOT NULL,
    description     TEXT,
    UNIQUE (tenant_id, id),
    UNIQUE (tenant_id, permission_code)
);

CREATE TABLE role_permission (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       BIGINT NOT NULL REFERENCES tenant(id),
    role_id         BIGINT NOT NULL,
    permission_id   BIGINT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id, role_id) REFERENCES role(tenant_id, id),
    FOREIGN KEY (tenant_id, permission_id) REFERENCES permission(tenant_id, id),
    UNIQUE (tenant_id, role_id, permission_id)
);

CREATE TABLE app_user (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       BIGINT NOT NULL REFERENCES tenant(id),
    branch_id       BIGINT,
    role_id         BIGINT,
    username        VARCHAR(100) NOT NULL,
    email           VARCHAR(255),
    password_hash   TEXT NOT NULL,
    full_name       VARCHAR(150) NOT NULL,
    phone           VARCHAR(20),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    version         INTEGER NOT NULL DEFAULT 1,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (tenant_id, id),
    UNIQUE (tenant_id, username),
    FOREIGN KEY (tenant_id, branch_id) REFERENCES branch(tenant_id, id),
    FOREIGN KEY (tenant_id, role_id) REFERENCES role(tenant_id, id)
);

-- ---------------------------------------------------------------------------
-- 2. Danh mục sản phẩm và giá bán
-- ---------------------------------------------------------------------------

CREATE TABLE category (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       BIGINT NOT NULL REFERENCES tenant(id),
    parent_id       BIGINT,
    name            VARCHAR(150) NOT NULL,
    description     TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (tenant_id, id),
    FOREIGN KEY (tenant_id, parent_id) REFERENCES category(tenant_id, id)
);

CREATE TABLE brand (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       BIGINT NOT NULL REFERENCES tenant(id),
    name            VARCHAR(150) NOT NULL,
    description     TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (tenant_id, id),
    UNIQUE (tenant_id, name)
);

CREATE TABLE product (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       BIGINT NOT NULL REFERENCES tenant(id),
    category_id     BIGINT,
    brand_id        BIGINT,
    name            VARCHAR(200) NOT NULL,
    description     TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    version         INTEGER NOT NULL DEFAULT 1,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (tenant_id, id),
    FOREIGN KEY (tenant_id, category_id) REFERENCES category(tenant_id, id),
    FOREIGN KEY (tenant_id, brand_id) REFERENCES brand(tenant_id, id)
);

CREATE TABLE sku (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       BIGINT NOT NULL REFERENCES tenant(id),
    product_id      BIGINT NOT NULL,
    sku_code        VARCHAR(50) NOT NULL,
    barcode         VARCHAR(100),
    attributes      VARCHAR(255),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (tenant_id, id),
    FOREIGN KEY (tenant_id, product_id) REFERENCES product(tenant_id, id),
    UNIQUE (tenant_id, sku_code)
);

-- A nullable barcode is allowed; PostgreSQL permits multiple NULL values
-- under a UNIQUE constraint. A partial unique index enforces uniqueness
-- for non-NULL barcodes within each tenant.
CREATE UNIQUE INDEX uq_sku_tenant_barcode
    ON sku (tenant_id, barcode)
    WHERE barcode IS NOT NULL;

CREATE TABLE product_price (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       BIGINT NOT NULL REFERENCES tenant(id),
    branch_id       BIGINT NOT NULL,
    sku_id          BIGINT NOT NULL,
    unit_price      DECIMAL(12,2) NOT NULL CHECK (unit_price >= 0),
    effective_from  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    effective_to    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (effective_to IS NULL OR effective_to > effective_from),
    FOREIGN KEY (tenant_id, branch_id) REFERENCES branch(tenant_id, id),
    FOREIGN KEY (tenant_id, sku_id) REFERENCES sku(tenant_id, id)
);

-- ---------------------------------------------------------------------------
-- 3. Nhà cung cấp, tồn kho và hậu cần
-- ---------------------------------------------------------------------------

CREATE TABLE supplier (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       BIGINT NOT NULL REFERENCES tenant(id),
    name            VARCHAR(150) NOT NULL,
    phone           VARCHAR(20),
    address         TEXT,
    email           VARCHAR(255),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (tenant_id, id)
);

CREATE TABLE inventory_balance (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       BIGINT NOT NULL REFERENCES tenant(id),
    branch_id       BIGINT NOT NULL,
    sku_id          BIGINT NOT NULL,
    quantity_on_hand DECIMAL(14,3) NOT NULL DEFAULT 0 CHECK (quantity_on_hand >= 0),
    quantity_reserved DECIMAL(14,3) NOT NULL DEFAULT 0 CHECK (quantity_reserved >= 0),
    version         INTEGER NOT NULL DEFAULT 1,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id, branch_id) REFERENCES branch(tenant_id, id),
    FOREIGN KEY (tenant_id, sku_id) REFERENCES sku(tenant_id, id),
    UNIQUE (tenant_id, branch_id, sku_id)
);

CREATE TABLE inventory_transaction (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       BIGINT NOT NULL REFERENCES tenant(id),
    branch_id       BIGINT NOT NULL,
    sku_id          BIGINT NOT NULL,
    transaction_type VARCHAR(30) NOT NULL,
    quantity_change DECIMAL(14,3) NOT NULL,
    reference_type  VARCHAR(50),
    reference_id    BIGINT,
    note            TEXT,
    created_by      BIGINT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id, branch_id) REFERENCES branch(tenant_id, id),
    FOREIGN KEY (tenant_id, sku_id) REFERENCES sku(tenant_id, id),
    FOREIGN KEY (tenant_id, created_by) REFERENCES app_user(tenant_id, id),
    CHECK (quantity_change <> 0)
);

CREATE TABLE stock_reservation (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       BIGINT NOT NULL REFERENCES tenant(id),
    branch_id       BIGINT NOT NULL,
    sku_id          BIGINT NOT NULL,
    order_id        BIGINT,
    quantity        DECIMAL(14,3) NOT NULL CHECK (quantity > 0),
    status          VARCHAR(30) NOT NULL DEFAULT 'reserved',
    expires_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id, branch_id) REFERENCES branch(tenant_id, id),
    FOREIGN KEY (tenant_id, sku_id) REFERENCES sku(tenant_id, id)
);

CREATE TABLE goods_receipt (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       BIGINT NOT NULL REFERENCES tenant(id),
    branch_id       BIGINT NOT NULL,
    supplier_id     BIGINT NOT NULL,
    receipt_code    VARCHAR(60) NOT NULL,
    status          VARCHAR(30) NOT NULL DEFAULT 'draft',
    received_at     TIMESTAMPTZ,
    created_by      BIGINT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id, branch_id) REFERENCES branch(tenant_id, id),
    FOREIGN KEY (tenant_id, supplier_id) REFERENCES supplier(tenant_id, id),
    FOREIGN KEY (tenant_id, created_by) REFERENCES app_user(tenant_id, id),
    UNIQUE (tenant_id, receipt_code)
);

-- Bảng chi tiết hỗ trợ: được đề xuất vì phiếu nhập cần các dòng SKU.
CREATE TABLE goods_receipt_item (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       BIGINT NOT NULL REFERENCES tenant(id),
    goods_receipt_id BIGINT NOT NULL,
    sku_id          BIGINT NOT NULL,
    quantity        DECIMAL(14,3) NOT NULL CHECK (quantity > 0),
    unit_cost       DECIMAL(12,2) NOT NULL CHECK (unit_cost >= 0),
    FOREIGN KEY (tenant_id, goods_receipt_id) REFERENCES goods_receipt(tenant_id, id),
    FOREIGN KEY (tenant_id, sku_id) REFERENCES sku(tenant_id, id)
);

CREATE TABLE stock_transfer (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       BIGINT NOT NULL REFERENCES tenant(id),
    source_branch_id BIGINT NOT NULL,
    destination_branch_id BIGINT NOT NULL,
    transfer_code   VARCHAR(60) NOT NULL,
    status          VARCHAR(30) NOT NULL DEFAULT 'draft',
    created_by      BIGINT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at    TIMESTAMPTZ,
    CHECK (source_branch_id <> destination_branch_id),
    FOREIGN KEY (tenant_id, source_branch_id) REFERENCES branch(tenant_id, id),
    FOREIGN KEY (tenant_id, destination_branch_id) REFERENCES branch(tenant_id, id),
    FOREIGN KEY (tenant_id, created_by) REFERENCES app_user(tenant_id, id),
    UNIQUE (tenant_id, transfer_code)
);

-- Bảng chi tiết hỗ trợ: được đề xuất vì phiếu chuyển kho cần số lượng SKU.
CREATE TABLE stock_transfer_item (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       BIGINT NOT NULL REFERENCES tenant(id),
    stock_transfer_id BIGINT NOT NULL,
    sku_id          BIGINT NOT NULL,
    quantity        DECIMAL(14,3) NOT NULL CHECK (quantity > 0),
    FOREIGN KEY (tenant_id, stock_transfer_id) REFERENCES stock_transfer(tenant_id, id),
    FOREIGN KEY (tenant_id, sku_id) REFERENCES sku(tenant_id, id)
);

CREATE TABLE stocktake (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       BIGINT NOT NULL REFERENCES tenant(id),
    branch_id       BIGINT NOT NULL,
    stocktake_code  VARCHAR(60) NOT NULL,
    status          VARCHAR(30) NOT NULL DEFAULT 'draft',
    counted_at      TIMESTAMPTZ,
    created_by      BIGINT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id, branch_id) REFERENCES branch(tenant_id, id),
    FOREIGN KEY (tenant_id, created_by) REFERENCES app_user(tenant_id, id),
    UNIQUE (tenant_id, stocktake_code)
);

-- Bảng chi tiết hỗ trợ: được đề xuất vì phiếu kiểm kê chứa số lượng theo SKU.
CREATE TABLE stocktake_item (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       BIGINT NOT NULL REFERENCES tenant(id),
    stocktake_id    BIGINT NOT NULL,
    sku_id          BIGINT NOT NULL,
    system_quantity DECIMAL(14,3) NOT NULL,
    counted_quantity DECIMAL(14,3) NOT NULL,
    FOREIGN KEY (tenant_id, stocktake_id) REFERENCES stocktake(tenant_id, id),
    FOREIGN KEY (tenant_id, sku_id) REFERENCES sku(tenant_id, id),
    UNIQUE (tenant_id, stocktake_id, sku_id)
);

-- ---------------------------------------------------------------------------
-- 4. Khách hàng, đơn hàng và thanh toán
-- ---------------------------------------------------------------------------

CREATE TABLE customer (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       BIGINT NOT NULL REFERENCES tenant(id),
    full_name       VARCHAR(150) NOT NULL,
    phone           VARCHAR(20),
    email           VARCHAR(255),
    points_balance  BIGINT NOT NULL DEFAULT 0 CHECK (points_balance >= 0),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (tenant_id, id)
);

CREATE TABLE "order" (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       BIGINT NOT NULL REFERENCES tenant(id),
    branch_id       BIGINT NOT NULL,
    user_id         BIGINT NOT NULL,
    customer_id     BIGINT,
    total_amount    DECIMAL(12,2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
    status          VARCHAR(30) NOT NULL DEFAULT 'pending',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id, branch_id) REFERENCES branch(tenant_id, id),
    FOREIGN KEY (tenant_id, user_id) REFERENCES app_user(tenant_id, id),
    FOREIGN KEY (tenant_id, customer_id) REFERENCES customer(tenant_id, id),
    UNIQUE (tenant_id, id)
);

-- Bảng chi tiết hỗ trợ: được đề xuất vì tổng đơn hàng được xác định là
-- tổng các dòng hàng trong đặc tả bảng được cung cấp.
CREATE TABLE order_item (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       BIGINT NOT NULL REFERENCES tenant(id),
    order_id        BIGINT NOT NULL,
    sku_id          BIGINT NOT NULL,
    quantity        DECIMAL(14,3) NOT NULL CHECK (quantity > 0),
    unit_price      DECIMAL(12,2) NOT NULL CHECK (unit_price >= 0),
    discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    line_total      DECIMAL(12,2) NOT NULL CHECK (line_total >= 0),
    FOREIGN KEY (tenant_id, order_id) REFERENCES "order"(tenant_id, id),
    FOREIGN KEY (tenant_id, sku_id) REFERENCES sku(tenant_id, id)
);

CREATE TABLE payment (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       BIGINT NOT NULL REFERENCES tenant(id),
    order_id        BIGINT NOT NULL,
    payment_method  VARCHAR(30) NOT NULL,
    amount          DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    status          VARCHAR(30) NOT NULL DEFAULT 'pending',
    transaction_ref VARCHAR(150),
    paid_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id, order_id) REFERENCES "order"(tenant_id, id)
);

-- ---------------------------------------------------------------------------
-- 5. Thông báo
-- ---------------------------------------------------------------------------

CREATE TABLE notification (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       BIGINT NOT NULL REFERENCES tenant(id),
    user_id         BIGINT,
    branch_id       BIGINT,
    title           VARCHAR(200) NOT NULL,
    message         TEXT NOT NULL,
    notification_type VARCHAR(50),
    is_read         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id, user_id) REFERENCES app_user(tenant_id, id),
    FOREIGN KEY (tenant_id, branch_id) REFERENCES branch(tenant_id, id)
);

-- ---------------------------------------------------------------------------
-- 6. Các chỉ mục
-- Khóa chính và ràng buộc UNIQUE tự động tạo chỉ mục.
-- Tạo thêm chỉ mục tường minh cho khóa ngoại và bộ lọc Tenant/chi nhánh thường dùng.
-- ---------------------------------------------------------------------------

CREATE INDEX idx_branch_tenant ON branch (tenant_id);
CREATE INDEX idx_role_tenant ON role (tenant_id);
CREATE INDEX idx_permission_tenant ON permission (tenant_id);
CREATE INDEX idx_role_permission_role_permission
    ON role_permission (tenant_id, role_id, permission_id);

CREATE INDEX idx_app_user_username ON app_user (tenant_id, username);
CREATE INDEX idx_app_user_email ON app_user (tenant_id, email);
CREATE INDEX idx_app_user_branch ON app_user (tenant_id, branch_id);

CREATE INDEX idx_category_parent ON category (tenant_id, parent_id);
CREATE INDEX idx_product_category_name ON product (tenant_id, category_id, name);
CREATE INDEX idx_product_brand ON product (tenant_id, brand_id);
CREATE INDEX idx_sku_product ON sku (tenant_id, product_id);
CREATE INDEX idx_product_price_branch_sku
    ON product_price (tenant_id, branch_id, sku_id);

CREATE INDEX idx_supplier_name ON supplier (tenant_id, name);
CREATE INDEX idx_inventory_balance_branch_sku
    ON inventory_balance (tenant_id, branch_id, sku_id);
CREATE INDEX idx_inventory_transaction_branch_created
    ON inventory_transaction (tenant_id, branch_id, created_at DESC);
CREATE INDEX idx_inventory_transaction_sku
    ON inventory_transaction (tenant_id, sku_id, created_at DESC);
CREATE INDEX idx_stock_reservation_branch_sku
    ON stock_reservation (tenant_id, branch_id, sku_id, status);
CREATE INDEX idx_goods_receipt_branch_created
    ON goods_receipt (tenant_id, branch_id, created_at DESC);
CREATE INDEX idx_goods_receipt_item_receipt
    ON goods_receipt_item (tenant_id, goods_receipt_id);
CREATE INDEX idx_stock_transfer_source_created
    ON stock_transfer (tenant_id, source_branch_id, created_at DESC);
CREATE INDEX idx_stock_transfer_destination_created
    ON stock_transfer (tenant_id, destination_branch_id, created_at DESC);
CREATE INDEX idx_stock_transfer_item_transfer
    ON stock_transfer_item (tenant_id, stock_transfer_id);
CREATE INDEX idx_stocktake_branch_created
    ON stocktake (tenant_id, branch_id, created_at DESC);
CREATE INDEX idx_stocktake_item_stocktake
    ON stocktake_item (tenant_id, stocktake_id);

CREATE INDEX idx_customer_phone ON customer (tenant_id, phone);
CREATE INDEX idx_order_tenant_branch_created
    ON "order" (tenant_id, branch_id, created_at DESC);
CREATE INDEX idx_order_user ON "order" (tenant_id, user_id);
CREATE INDEX idx_order_customer ON "order" (tenant_id, customer_id);
CREATE INDEX idx_order_item_order ON order_item (tenant_id, order_id);
CREATE INDEX idx_order_item_sku ON order_item (tenant_id, sku_id);
CREATE INDEX idx_payment_order ON payment (tenant_id, order_id);
CREATE INDEX idx_notification_user_read_created
    ON notification (tenant_id, user_id, is_read, created_at DESC);

COMMIT;

-- ============================================================================
-- Ghi chú vận hành
-- ============================================================================
-- 1. Ứng dụng phải xác định tenant_id từ danh tính đã xác thực
--    và đưa điều kiện này vào mọi truy vấn dữ liệu thuộc Tenant. Không được chỉ tin
--    tenant_id do máy khách gửi lên như cơ chế kiểm tra quyền duy nhất.
-- 2. Phân quyền chi nhánh là bước kiểm tra bổ sung; chỉ lọc Tenant là chưa đủ
--    để kiểm soát quyền của thu ngân/quản lý chi nhánh.
-- 3. Khi thanh toán và thay đổi tồn kho, khóa các dòng tồn kho bằng
--    SELECT ... FOR UPDATE trong transaction. Tuân thủ thứ tự khóa nhất quán
--    và cấu hình lock_timeout = '15s' theo chiến lược đã đặc tả.
-- 4. Dùng Read Committed cho truy vấn đọc thông thường; cân nhắc Repeatable Read
--    hoặc Serializable cho thanh toán, nhập kho, chuyển kho và thanh toán đơn. Xử lý
--    lỗi serialization bằng cơ chế thử lại an toàn.
-- 5. Schema chưa triển khai quy tắc kiểm tra liên dòng
--    order.total_amount = SUM(order_item.line_total). Cần kiểm tra trong
--    transaction ứng dụng hoặc bằng deferred trigger được thiết kế cẩn thận.
-- 6. Có thể cân nhắc PostgreSQL Row-Level Security (RLS) như lớp bảo vệ bổ sung, nhưng
--    phải cấu hình policy và ngữ cảnh Tenant của connection pool trước khi bật.
-- 7. Chưa có trigger tự động cập nhật updated_at; mã ứng dụng hoặc
--    trigger dùng chung phải đảm bảo updated_at luôn được cập nhật nhất quán.
-- 8. Tệp này đặt tính duy nhất của mã SKU và barcode trong phạm vi Tenant. Nếu
--    nghiệp vụ yêu cầu duy nhất trên toàn bộ Tenant, cần điều chỉnh lại chỉ mục.
