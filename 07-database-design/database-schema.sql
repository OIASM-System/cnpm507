-- ============================================================================
-- POS PWA — PostgreSQL database schema
-- Architecture: shared database + shared schema, multi-tenant via tenant_id.
-- Naming: lower_snake_case table/column names; BIGSERIAL PK; BIGINT FK;
--         DECIMAL for money; TIMESTAMPTZ for timestamps.
--
-- IMPORTANT:
-- 1. The supplied documentation fully specifies only selected columns for
--    sku, "order", and supplier. Other columns/relations below are proposed
--    implementation fields inferred from the data dictionary and business
--    context; confirm them with the team before production migration.
-- 2. This is a baseline schema, not a production migration framework.
-- 3. "order" is quoted because ORDER is a SQL keyword.
-- 4. tenant_id is included on tenant-owned tables. The tenant root table is
--    the exception. Foreign keys are tenant-aware where practical.
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Tenant, branch, users and RBAC
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
-- 2. Product catalog and pricing
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
-- 3. Suppliers, inventory and logistics
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

-- Supporting detail table: inferred because a receipt header needs SKU lines.
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

-- Supporting detail table: inferred because a transfer requires SKU quantities.
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

-- Supporting detail table: inferred because a stocktake contains SKU counts.
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
-- 4. Customers, orders and payments
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

-- Supporting detail table: inferred because order totals are defined as the
-- sum of order lines in the supplied table specification.
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
-- 5. Notifications
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
-- 6. Indexes
-- Primary keys and UNIQUE constraints create indexes automatically.
-- Add explicit indexes for foreign keys and common tenant/branch filters.
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
-- Operational notes
-- ============================================================================
-- 1. The application must derive tenant_id from the authenticated identity
--    and include it in every tenant-owned query. Never trust a client-supplied
--    tenant_id as the sole authorization check.
-- 2. Branch authorization is an additional check; tenant filtering alone is
--    not sufficient for cashier/branch-manager access.
-- 3. For checkout and stock mutation, lock inventory rows using
--    SELECT ... FOR UPDATE inside a transaction. Follow a consistent lock
--    order and configure lock_timeout = '15s' as specified in the strategy.
-- 4. Use Read Committed for ordinary reads; evaluate Repeatable Read or
--    Serializable for checkout, receiving, transfers, and payments. Handle
--    serialization failures with safe retries.
-- 5. The schema does not implement the cross-row rule
--    order.total_amount = SUM(order_item.line_total). Enforce it in the
--    application transaction or with a carefully designed deferred trigger.
-- 6. Consider PostgreSQL Row-Level Security (RLS) as defense in depth, but
--    configure policies and connection-pool tenant context before enabling it.
-- 7. No automatic updated_at trigger is included; application code or a
--    shared trigger must maintain updated_at consistently.
-- 8. This file uses tenant-scoped unique SKU codes and barcodes. If the
--    business requires global uniqueness across all tenants, revise indexes.
