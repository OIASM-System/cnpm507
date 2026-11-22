-- ============================================================================
-- OISM — Dữ liệu mẫu thực tế (Seed Data: 30 SKU Thời trang)
-- Tương thích 100% với: 07-database-design/database-schema.sql (PostgreSQL)
-- Phạm vi: 1 Tenant, 2 Chi nhánh, 4 Vai trò, 4 Tài khoản, 8 Danh mục,
--          4 Thương hiệu, 10 Sản phẩm, 30 SKU, 60 Bảng giá chi nhánh,
--          2 Nhà cung cấp, 2 Phiếu nhập kho, Tồn kho, Sổ kho & Đơn hàng mẫu.
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Tenant, Chi nhánh, Vai trò, Phân quyền và Người dùng
-- ---------------------------------------------------------------------------

INSERT INTO tenant (id, name, code, status) VALUES
(1, 'OISM Fashion Studio', 'OISM_FASHION', 'active');

INSERT INTO branch (id, tenant_id, name, code, address, phone, is_active) VALUES
(1, 1, 'Chi nhánh Quận 1 - Flagship', 'HCM-Q1', '128 Nguyễn Trãi, Phường Bến Thành, Quận 1, TP.HCM', '02838221101', TRUE),
(2, 1, 'Chi nhánh Thủ Đức - Kho Tổng', 'HCM-TD', '45 Võ Văn Ngân, Phường Linh Chiểu, TP. Thủ Đức, TP.HCM', '02837229902', TRUE);

INSERT INTO role (id, tenant_id, name, description) VALUES
(1, 1, 'Owner', 'Chủ cửa hàng - Toàn quyền quản trị hệ thống và báo cáo'),
(2, 1, 'Store Manager', 'Quản lý chi nhánh - Quản lý sản phẩm, đơn hàng, nhập/chuyển kho'),
(3, 1, 'Warehouse Staff', 'Nhân viên kho - Nhập kho, kiểm kê, điều chuyển hàng'),
(4, 1, 'Cashier', 'Thu ngân POS - Bán hàng, quét mã vạch, thanh toán và in hóa đơn');

INSERT INTO permission (id, tenant_id, permission_code, description) VALUES
(1, 1, 'PRODUCT_MANAGE', 'Tạo, sửa, ẩn sản phẩm và SKU'),
(2, 1, 'INVENTORY_MANAGE', 'Nhập kho, chuyển kho, kiểm kê và xem sổ kho'),
(3, 1, 'ORDER_MANAGE', 'Xem, xác nhận, hủy đơn hàng đa kênh'),
(4, 1, 'POS_SELL', 'Thực hiện bán hàng và thanh toán trên POS PWA'),
(5, 1, 'REPORT_VIEW', 'Xem báo cáo doanh thu, lợi nhuận và đề xuất nhập hàng AI'),
(6, 1, 'SYSTEM_ADMIN', 'Quản trị người dùng, vai trò và chi nhánh');

INSERT INTO role_permission (tenant_id, role_id, permission_id) VALUES
-- Owner: Full quyền
(1, 1, 1), (1, 1, 2), (1, 1, 3), (1, 1, 4), (1, 1, 5), (1, 1, 6),
-- Store Manager
(1, 2, 1), (1, 2, 2), (1, 2, 3), (1, 2, 4), (1, 2, 5),
-- Warehouse Staff
(1, 3, 2), (1, 3, 3),
-- Cashier
(1, 4, 4);

-- Lưu ý: password_hash sử dụng chuỗi bcrypt mẫu cho mật khẩu demo 'Oism@123'
INSERT INTO app_user (id, tenant_id, branch_id, role_id, username, email, password_hash, full_name, phone, is_active) VALUES
(1, 1, 1, 1, 'owner_oism', 'owner@oismfashion.vn',      '$2a$11$DemoHashValueForOismFashionOwnerAccount000000000000001', 'Nguyễn Tuấn Anh', '0901000001', TRUE),
(2, 1, 1, 2, 'manager_q1', 'manager.q1@oismfashion.vn', '$2a$11$DemoHashValueForOismFashionManagerAccount0000000000002', 'Trần Minh Khôi',  '0901000002', TRUE),
(3, 1, 2, 3, 'kho_thuduc', 'kho.td@oismfashion.vn',     '$2a$11$DemoHashValueForOismFashionStaffAccount000000000000003', 'Lê Hoàng Nam',    '0901000003', TRUE),
(4, 1, 1, 4, 'thungan_q1', 'pos.q1@oismfashion.vn',     '$2a$11$DemoHashValueForOismFashionCashierAccount0000000000004', 'Phạm Thảo Vy',    '0901000004', TRUE);

-- ---------------------------------------------------------------------------
-- 2. Danh mục thời trang, Thương hiệu, 10 Sản phẩm & 30 SKU
-- ---------------------------------------------------------------------------

INSERT INTO category (id, tenant_id, parent_id, name, description) VALUES
(1, 1, NULL, 'Thời trang Nam',      'Các dòng sản phẩm áo quần dành cho nam giới'),
(2, 1, NULL, 'Thời trang Nữ',       'Các dòng sản phẩm áo, quần, váy đầm dành cho nữ giới'),
(3, 1, NULL, 'Phụ kiện Thời trang', 'Túi xách, phụ kiện phối đồ hàng ngày'),
(4, 1, 1,    'Áo Nam',              'Áo thun, sơ mi, polo, áo khoác nam/unisex'),
(5, 1, 1,    'Quần Nam',            'Quần jeans, quần tây kaki nam'),
(6, 1, 2,    'Áo & Đầm Nữ',         'Đầm midi, áo croptop thời trang nữ'),
(7, 1, 2,    'Quần Nữ',             'Quần jeans ống rộng, quần cạp cao nữ'),
(8, 1, 3,    'Túi Tote & Phụ kiện', 'Túi vải canvas và phụ kiện đa dụng');

INSERT INTO brand (id, tenant_id, name, description) VALUES
(1, 1, 'OISM Basic',   'Dòng sản phẩm tối giản, chất liệu cotton thoáng mát mặc hàng ngày'),
(2, 1, 'Saigon Denim', 'Chuyên các dòng quần jeans wash hiện đại, form chuẩn dáng người Việt'),
(3, 1, 'Linen & Co.',  'Thời trang vải đũi/linen tự nhiên, thanh lịch và nhẹ nhàng'),
(4, 1, 'Urban Street', 'Phong cách đường phố năng động, trẻ trung cho giới trẻ');

INSERT INTO product (id, tenant_id, category_id, brand_id, name, description, is_active) VALUES
(1,  1, 4, 1, 'Áo Thun Cotton Basic Form Regular', 'Áo thun nam 100% cotton 2 chiều định lượng 220gsm, thấm hút mồ hôi tốt.', TRUE),
(2,  1, 4, 3, 'Áo Sơ Mi Linen Dài Tay Nam',        'Áo sơ mi vải linen pha cotton mềm mịn, ít nhăn, phù hợp công sở và dạo phố.', TRUE),
(3,  1, 4, 1, 'Áo Polo Pique Phối Cổ',             'Áo polo dệt mắt chim thoáng khí, bo cổ dệt sọc tạo điểm nhấn lịch lãm.', TRUE),
(4,  1, 5, 2, 'Quần Jeans Nam Slim-Fit Wash Nhẹ',  'Quần jeans nam form slim-fit tôn dáng, chất denim co giãn nhẹ 2% spandex.', TRUE),
(5,  1, 5, 1, 'Quần Tây Kaki Co Giãn Công Sở',     'Quần kaki ống đứng thanh lịch, chất vải mềm mịn giữ form suốt ngày dài.', TRUE),
(6,  1, 6, 3, 'Đầm Midi Linen Cổ Vuông Nữ',        'Đầm dáng chữ A dài qua gối, cổ vuông tôn dáng, có lớp lót cotton bên trong.', TRUE),
(7,  1, 6, 4, 'Áo Croptop Gân Tăm Nữ',             'Áo croptop chất thun gân co giãn 4 chiều, ôm gọn dáng, dễ phối quần cạp cao.', TRUE),
(8,  1, 7, 2, 'Quần Jeans Nữ Ống Rộng Cạp Cao',    'Quần jeans ống suông rộng che khuyết điểm, cạp cao hack dáng cực tốt.', TRUE),
(9,  1, 4, 4, 'Áo Khoác Hoodie Nỉ Bông Oversize',  'Hoodie form rộng unisex, vải nỉ bông 350gsm dày dặn, mũ 2 lớp đứng form.', TRUE),
(10, 1, 8, 4, 'Túi Tote Canvas Phối Da Cao Cấp',   'Túi tote vải bố canvas dày dặn có khóa kéo và ngăn chống sốc laptop 14 inch.', TRUE);

INSERT INTO sku (id, tenant_id, product_id, sku_code, barcode, attributes, is_active) VALUES
-- Product 1: Áo Thun Cotton Basic Form Regular
(1,  1, 1,  'ATB-TRG-M',  '8938507000011', 'Màu: Trắng | Size: M | Chất liệu: 100% Cotton', TRUE),
(2,  1, 1,  'ATB-DEN-L',  '8938507000028', 'Màu: Đen | Size: L | Chất liệu: 100% Cotton', TRUE),
(3,  1, 1,  'ATB-NVY-XL', '8938507000035', 'Màu: Xanh Navy | Size: XL | Chất liệu: 100% Cotton', TRUE),
-- Product 2: Áo Sơ Mi Linen Dài Tay Nam
(4,  1, 2,  'SML-KEM-M',  '8938507000042', 'Màu: Trắng Kem | Size: M | Chất liệu: Linen Cotton', TRUE),
(5,  1, 2,  'SML-XDG-L',  '8938507000059', 'Màu: Xanh Dương | Size: L | Chất liệu: Linen Cotton', TRUE),
(6,  1, 2,  'SML-BEG-XL', '8938507000066', 'Màu: Be | Size: XL | Chất liệu: Linen Cotton', TRUE),
-- Product 3: Áo Polo Pique Phối Cổ
(7,  1, 3,  'APL-DEN-M',  '8938507000073', 'Màu: Đen | Size: M | Chất liệu: Cotton Pique', TRUE),
(8,  1, 3,  'APL-XAM-L',  '8938507000080', 'Màu: Xám Tiêu | Size: L | Chất liệu: Cotton Pique', TRUE),
(9,  1, 3,  'APL-REU-XL', '8938507000097', 'Màu: Xanh Rêu | Size: XL | Chất liệu: Cotton Pique', TRUE),
-- Product 4: Quần Jeans Nam Slim-Fit Wash Nhẹ
(10, 1, 4,  'QJN-XDM-30', '8938507000103', 'Màu: Xanh Đậm | Size: 30 | Chất liệu: Denim Stretch', TRUE),
(11, 1, 4,  'QJN-XNH-32', '8938507000110', 'Màu: Xanh Nhạt | Size: 32 | Chất liệu: Denim Stretch', TRUE),
(12, 1, 4,  'QJN-DEN-34', '8938507000127', 'Màu: Đen | Size: 34 | Chất liệu: Denim Stretch', TRUE),
-- Product 5: Quần Tây Kaki Co Giãn Công Sở
(13, 1, 5,  'QKK-DEN-30', '8938507000134', 'Màu: Đen | Size: 30 | Chất liệu: Kaki Cotton', TRUE),
(14, 1, 5,  'QKK-BES-31', '8938507000141', 'Màu: Be Sáng | Size: 31 | Chất liệu: Kaki Cotton', TRUE),
(15, 1, 5,  'QKK-THN-32', '8938507000158', 'Màu: Xanh Than | Size: 32 | Chất liệu: Kaki Cotton', TRUE),
-- Product 6: Đầm Midi Linen Cổ Vuông Nữ
(16, 1, 6,  'DML-TRS-S',  '8938507000165', 'Màu: Trắng Sữa | Size: S | Chất liệu: Linen Tự Nhiên', TRUE),
(17, 1, 6,  'DML-VBO-M',  '8938507000172', 'Màu: Vàng Bơ | Size: M | Chất liệu: Linen Tự Nhiên', TRUE),
(18, 1, 6,  'DML-MNT-L',  '8938507000189', 'Màu: Xanh Mint | Size: L | Chất liệu: Linen Tự Nhiên', TRUE),
-- Product 7: Áo Croptop Gân Tăm Nữ
(19, 1, 7,  'ACT-DEN-S',  '8938507000196', 'Màu: Đen | Size: S | Chất liệu: Thun Gân Tăm', TRUE),
(20, 1, 7,  'ACT-TRG-M',  '8938507000202', 'Màu: Trắng | Size: M | Chất liệu: Thun Gân Tăm', TRUE),
(21, 1, 7,  'ACT-HPA-M',  '8938507000219', 'Màu: Hồng Pastel | Size: M | Chất liệu: Thun Gân Tăm', TRUE),
-- Product 8: Quần Jeans Nữ Ống Rộng Cạp Cao
(22, 1, 8,  'QJW-XCD-26', '8938507000226', 'Màu: Xanh Cổ Điển | Size: 26 | Chất liệu: Denim 100% Cotton', TRUE),
(23, 1, 8,  'QJW-XNH-27', '8938507000233', 'Màu: Xanh Nhạt | Size: 27 | Chất liệu: Denim 100% Cotton', TRUE),
(24, 1, 8,  'QJW-KHO-28', '8938507000240', 'Màu: Đen Khói | Size: 28 | Chất liệu: Denim 100% Cotton', TRUE),
-- Product 9: Áo Khoác Hoodie Nỉ Bông Oversize
(25, 1, 9,  'HDN-XDM-M',  '8938507000257', 'Màu: Xám Đậm | Size: M | Chất liệu: Nỉ Bông 350gsm', TRUE),
(26, 1, 9,  'HDN-DEN-L',  '8938507000264', 'Màu: Đen | Size: L | Chất liệu: Nỉ Bông 350gsm', TRUE),
(27, 1, 9,  'HDN-NAU-XL', '8938507000271', 'Màu: Nâu Cafe | Size: XL | Chất liệu: Nỉ Bông 350gsm', TRUE),
-- Product 10: Túi Tote Canvas Phối Da Cao Cấp
(28, 1, 10, 'TTC-KEM-FS', '8938507000288', 'Màu: Kem | Size: Freesize | Chất liệu: Canvas 16oz', TRUE),
(29, 1, 10, 'TTC-DEN-FS', '8938507000295', 'Màu: Đen | Size: Freesize | Chất liệu: Canvas 16oz', TRUE),
(30, 1, 10, 'TTC-REU-FS', '8938507000301', 'Màu: Xanh Rêu | Size: Freesize | Chất liệu: Canvas 16oz', TRUE);

-- ---------------------------------------------------------------------------
-- 3. Bảng giá bán lẻ theo chi nhánh (60 bản ghi = 30 SKU x 2 chi nhánh)
-- ---------------------------------------------------------------------------

INSERT INTO product_price (tenant_id, branch_id, sku_id, unit_price, effective_from) VALUES
(1, 1, 1,  250000.00, '2026-11-01 00:00:00+07'),
(1, 1, 2,  250000.00, '2026-11-01 00:00:00+07'),
(1, 1, 3,  260000.00, '2026-11-01 00:00:00+07'),
(1, 1, 4,  450000.00, '2026-11-01 00:00:00+07'),
(1, 1, 5,  450000.00, '2026-11-01 00:00:00+07'),
(1, 1, 6,  460000.00, '2026-11-01 00:00:00+07'),
(1, 1, 7,  360000.00, '2026-11-01 00:00:00+07'),
(1, 1, 8,  360000.00, '2026-11-01 00:00:00+07'),
(1, 1, 9,  370000.00, '2026-11-01 00:00:00+07'),
(1, 1, 10, 590000.00, '2026-11-01 00:00:00+07'),
(1, 1, 11, 590000.00, '2026-11-01 00:00:00+07'),
(1, 1, 12, 610000.00, '2026-11-01 00:00:00+07'),
(1, 1, 13, 490000.00, '2026-11-01 00:00:00+07'),
(1, 1, 14, 490000.00, '2026-11-01 00:00:00+07'),
(1, 1, 15, 490000.00, '2026-11-01 00:00:00+07'),
(1, 1, 16, 650000.00, '2026-11-01 00:00:00+07'),
(1, 1, 17, 650000.00, '2026-11-01 00:00:00+07'),
(1, 1, 18, 650000.00, '2026-11-01 00:00:00+07'),
(1, 1, 19, 220000.00, '2026-11-01 00:00:00+07'),
(1, 1, 20, 220000.00, '2026-11-01 00:00:00+07'),
(1, 1, 21, 230000.00, '2026-11-01 00:00:00+07'),
(1, 1, 22, 550000.00, '2026-11-01 00:00:00+07'),
(1, 1, 23, 550000.00, '2026-11-01 00:00:00+07'),
(1, 1, 24, 570000.00, '2026-11-01 00:00:00+07'),
(1, 1, 25, 540000.00, '2026-11-01 00:00:00+07'),
(1, 1, 26, 540000.00, '2026-11-01 00:00:00+07'),
(1, 1, 27, 550000.00, '2026-11-01 00:00:00+07'),
(1, 1, 28, 190000.00, '2026-11-01 00:00:00+07'),
(1, 1, 29, 190000.00, '2026-11-01 00:00:00+07'),
(1, 1, 30, 190000.00, '2026-11-01 00:00:00+07');

-- Áp dụng đồng bộ bảng giá niêm yết cho Chi nhánh 2 (Kho Tổng Thủ Đức)
INSERT INTO product_price (tenant_id, branch_id, sku_id, unit_price, effective_from)
SELECT tenant_id, 2, sku_id, unit_price, effective_from
FROM product_price
WHERE tenant_id = 1 AND branch_id = 1;

-- ---------------------------------------------------------------------------
-- 4. Nhà cung cấp & Phiếu nhập kho đầu kỳ (Khớp số liệu giá vốn)
-- ---------------------------------------------------------------------------

INSERT INTO supplier (id, tenant_id, name, phone, address, email) VALUES
(1, 1, 'Công ty TNHH May Mặc Việt Tiến Phát', '02839104567', 'KCN Tân Bình, Quận Tân Phú, TP.HCM', 'sales@viettienphat.vn'),
(2, 1, 'Xưởng Dệt Kim & Denim Sài Gòn',       '02837558899', '102 Đường số 7, Quận Bình Tân, TP.HCM', 'order@saigondenim.vn');

INSERT INTO goods_receipt (id, tenant_id, branch_id, supplier_id, receipt_code, status, received_at, created_by) VALUES
(1, 1, 1, 1, 'GR-Q1-20261101-001', 'completed', '2026-11-01 09:00:00+07', 2),
(2, 1, 2, 2, 'GR-TD-20261101-002', 'completed', '2026-11-01 10:30:00+07', 3);

-- Chi tiết phiếu nhập đầu kỳ tại Chi nhánh 1 (29 SKU; không nhập SKU 21 để test hết hàng tại Q1)
INSERT INTO goods_receipt_item (tenant_id, goods_receipt_id, sku_id, quantity, unit_cost) VALUES
(1, 1, 1,  32.000, 135000.00), (1, 1, 2,  25.000, 135000.00), (1, 1, 3,  3.000,  140000.00),
(1, 1, 4,  18.000, 240000.00), (1, 1, 5,  15.000, 240000.00), (1, 1, 6,  12.000, 245000.00),
(1, 1, 7,  20.000, 190000.00), (1, 1, 8,  16.000, 190000.00), (1, 1, 9,  10.000, 195000.00),
(1, 1, 10, 16.000, 310000.00), (1, 1, 11, 14.000, 310000.00), (1, 1, 12, 2.000,  320000.00),
(1, 1, 13, 20.000, 260000.00), (1, 1, 14, 18.000, 260000.00), (1, 1, 15, 15.000, 260000.00),
(1, 1, 16, 5.000,  340000.00), (1, 1, 17, 12.000, 340000.00), (1, 1, 18, 10.000, 340000.00),
(1, 1, 19, 28.000, 110000.00), (1, 1, 20, 24.000, 110000.00),
(1, 1, 22, 16.000, 290000.00), (1, 1, 23, 18.000, 290000.00), (1, 1, 24, 12.000, 300000.00),
(1, 1, 25, 14.000, 280000.00), (1, 1, 26, 16.000, 280000.00), (1, 1, 27, 2.000,  285000.00),
(1, 1, 28, 35.000, 95000.00),  (1, 1, 29, 30.000, 95000.00),  (1, 1, 30, 22.000, 95000.00);

-- Chi tiết phiếu nhập đầu kỳ tại Chi nhánh 2 (Đủ cả 30 SKU)
INSERT INTO goods_receipt_item (tenant_id, goods_receipt_id, sku_id, quantity, unit_cost) VALUES
(1, 2, 1,  80.000, 135000.00), (1, 2, 2,  70.000, 135000.00), (1, 2, 3,  40.000, 140000.00),
(1, 2, 4,  50.000, 240000.00), (1, 2, 5,  45.000, 240000.00), (1, 2, 6,  35.000, 245000.00),
(1, 2, 7,  60.000, 190000.00), (1, 2, 8,  55.000, 190000.00), (1, 2, 9,  40.000, 195000.00),
(1, 2, 10, 45.000, 310000.00), (1, 2, 11, 40.000, 310000.00), (1, 2, 12, 25.000, 320000.00),
(1, 2, 13, 50.000, 260000.00), (1, 2, 14, 45.000, 260000.00), (1, 2, 15, 40.000, 260000.00),
(1, 2, 16, 30.000, 340000.00), (1, 2, 17, 35.000, 340000.00), (1, 2, 18, 30.000, 340000.00),
(1, 2, 19, 70.000, 110000.00), (1, 2, 20, 65.000, 110000.00), (1, 2, 21, 20.000, 115000.00),
(1, 2, 22, 45.000, 290000.00), (1, 2, 23, 50.000, 290000.00), (1, 2, 24, 35.000, 300000.00),
(1, 2, 25, 40.000, 280000.00), (1, 2, 26, 45.000, 280000.00), (1, 2, 27, 30.000, 285000.00),
(1, 2, 28, 90.000, 95000.00),  (1, 2, 29, 85.000, 95000.00),  (1, 2, 30, 60.000, 95000.00);

-- ---------------------------------------------------------------------------
-- 5. Sổ kho (Inventory Transaction) cho các phiếu nhập đầu kỳ
-- ---------------------------------------------------------------------------

INSERT INTO inventory_transaction (tenant_id, branch_id, sku_id, transaction_type, quantity_change, reference_type, reference_id, note, created_by)
SELECT
    gri.tenant_id,
    gr.branch_id,
    gri.sku_id,
    'GOODS_RECEIPT',
    gri.quantity,
    'goods_receipt',
    gr.id,
    'Nhập kho khởi tạo kỳ đầu theo phiếu ' || gr.receipt_code,
    gr.created_by
FROM goods_receipt_item gri
JOIN goods_receipt gr ON gr.tenant_id = gri.tenant_id AND gr.id = gri.goods_receipt_id
WHERE gri.tenant_id = 1;

-- ---------------------------------------------------------------------------
-- 6. Khách hàng, Đơn hàng POS mẫu, Thanh toán & Giữ chỗ (Stock Reservation)
-- ---------------------------------------------------------------------------

INSERT INTO customer (id, tenant_id, full_name, phone, email, points_balance) VALUES
(1, 1, 'Nguyễn Minh Châu', '0912345678', 'minhchau.nguyen@gmail.com', 105),
(2, 1, 'Võ Quốc Bảo',      '0987654321', 'quocbao.vo@gmail.com',      40);

-- Đơn hàng 1: Đã hoàn tất tại quầy POS Quận 1 (Tổng = 2*250,000 + (590,000 - 40,000) = 1,050,000)
INSERT INTO "order" (id, tenant_id, branch_id, user_id, customer_id, total_amount, status) VALUES
(1, 1, 1, 4, 1, 1050000.00, 'completed');

INSERT INTO order_item (tenant_id, order_id, sku_id, quantity, unit_price, discount_amount, line_total) VALUES
(1, 1, 1,  2.000, 250000.00, 0.00,     500000.00),
(1, 1, 10, 1.000, 590000.00, 40000.00, 550000.00);

INSERT INTO payment (tenant_id, order_id, payment_method, amount, status, transaction_ref, paid_at) VALUES
(1, 1, 'qr_transfer', 1050000.00, 'paid', 'VIETQR-OISM-20261115-0001', '2026-11-15 14:22:00+07');

-- Ghi nhận xuất kho cho Đơn hàng 1 vào sổ kho
INSERT INTO inventory_transaction (tenant_id, branch_id, sku_id, transaction_type, quantity_change, reference_type, reference_id, note, created_by) VALUES
(1, 1, 1,  'POS_SALE', -2.000, 'order', 1, 'Xuất bán POS đơn hàng #1', 4),
(1, 1, 10, 'POS_SALE', -1.000, 'order', 1, 'Xuất bán POS đơn hàng #1', 4);

-- Đơn hàng 2: Đơn Online đang chờ xác nhận, giữ chỗ 3 chiếc Đầm Midi (SKU 16) tại Q1
INSERT INTO "order" (id, tenant_id, branch_id, user_id, customer_id, total_amount, status) VALUES
(2, 1, 1, 2, 2, 1950000.00, 'pending');

INSERT INTO order_item (tenant_id, order_id, sku_id, quantity, unit_price, discount_amount, line_total) VALUES
(1, 2, 16, 3.000, 650000.00, 0.00, 1950000.00);

INSERT INTO stock_reservation (tenant_id, branch_id, sku_id, order_id, quantity, status, expires_at) VALUES
(1, 1, 16, 2, 3.000, 'reserved', CURRENT_TIMESTAMP + INTERVAL '24 hours');

-- ---------------------------------------------------------------------------
-- 7. Số dư tồn kho hiện tại (Inventory Balance) - Đối soát 100% với Sổ kho
-- ---------------------------------------------------------------------------

INSERT INTO inventory_balance (tenant_id, branch_id, sku_id, quantity_on_hand, quantity_reserved)
SELECT
    it.tenant_id,
    it.branch_id,
    it.sku_id,
    SUM(it.quantity_change) AS quantity_on_hand,
    COALESCE((
        SELECT SUM(sr.quantity)
        FROM stock_reservation sr
        WHERE sr.tenant_id = it.tenant_id
          AND sr.branch_id = it.branch_id
          AND sr.sku_id = it.sku_id
          AND sr.status = 'reserved'
    ), 0) AS quantity_reserved
FROM inventory_transaction it
WHERE it.tenant_id = 1
GROUP BY it.tenant_id, it.branch_id, it.sku_id;

-- Thêm dòng tồn kho = 0 cho SKU 21 tại Chi nhánh 1 để POS hiển thị rõ trạng thái Hết hàng
INSERT INTO inventory_balance (tenant_id, branch_id, sku_id, quantity_on_hand, quantity_reserved) VALUES
(1, 1, 21, 0.000, 0.000);

-- ---------------------------------------------------------------------------
-- 8. Thông báo cảnh báo tồn kho mẫu
-- ---------------------------------------------------------------------------

INSERT INTO notification (tenant_id, user_id, branch_id, title, message, notification_type, is_read) VALUES
(1, 1, 1, 'Cảnh báo hết hàng tại HCM-Q1', 'SKU ACT-HPA-M (Áo Croptop Gân Tăm - Hồng Pastel M) đã hết tồn kho tại Chi nhánh Quận 1. Đề xuất chuyển kho từ HCM-TD.', 'LOW_STOCK', FALSE),
(1, 2, 1, 'Cảnh báo tồn kho thấp', '3 SKU (ATB-NVY-XL, QJN-DEN-34, HDN-NAU-XL) tại HCM-Q1 còn dưới 5 sản phẩm.', 'LOW_STOCK', FALSE);

-- ---------------------------------------------------------------------------
-- 9. Đồng bộ lại PostgreSQL Sequences sau khi chèn ID tường minh
-- ---------------------------------------------------------------------------

SELECT setval(pg_get_serial_sequence('tenant', 'id'),        COALESCE((SELECT MAX(id) FROM tenant), 1), true);
SELECT setval(pg_get_serial_sequence('branch', 'id'),        COALESCE((SELECT MAX(id) FROM branch), 1), true);
SELECT setval(pg_get_serial_sequence('role', 'id'),          COALESCE((SELECT MAX(id) FROM role), 1), true);
SELECT setval(pg_get_serial_sequence('permission', 'id'),    COALESCE((SELECT MAX(id) FROM permission), 1), true);
SELECT setval(pg_get_serial_sequence('app_user', 'id'),      COALESCE((SELECT MAX(id) FROM app_user), 1), true);
SELECT setval(pg_get_serial_sequence('category', 'id'),      COALESCE((SELECT MAX(id) FROM category), 1), true);
SELECT setval(pg_get_serial_sequence('brand', 'id'),         COALESCE((SELECT MAX(id) FROM brand), 1), true);
SELECT setval(pg_get_serial_sequence('product', 'id'),       COALESCE((SELECT MAX(id) FROM product), 1), true);
SELECT setval(pg_get_serial_sequence('sku', 'id'),           COALESCE((SELECT MAX(id) FROM sku), 1), true);
SELECT setval(pg_get_serial_sequence('supplier', 'id'),      COALESCE((SELECT MAX(id) FROM supplier), 1), true);
SELECT setval(pg_get_serial_sequence('goods_receipt', 'id'), COALESCE((SELECT MAX(id) FROM goods_receipt), 1), true);
SELECT setval(pg_get_serial_sequence('customer', 'id'),      COALESCE((SELECT MAX(id) FROM customer), 1), true);
SELECT setval(pg_get_serial_sequence('"order"', 'id'),       COALESCE((SELECT MAX(id) FROM "order"), 1), true);

COMMIT;
