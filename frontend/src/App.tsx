import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Warehouse,
  Package,
  ShoppingCart,
  BarChart3,
  Search,
  RefreshCw,
  Boxes,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

import {
  getBranchInventory,
  type InventoryItem,
} from './api';

import './styles.css';

// Các trang trong ứng dụng
type Page =
  | 'dashboard'
  | 'inventory'
  | 'products'
  | 'orders'
  | 'reports';

function App() {
  const [currentPage, setCurrentPage] =
    useState<Page>('dashboard');

  const [inventory, setInventory] =
    useState<InventoryItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');

  // Lấy dữ liệu tồn kho từ Backend
  async function loadInventory() {
    try {
      setLoading(true);
      setError('');

      const data = await getBranchInventory();

      setInventory(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Không thể tải dữ liệu tồn kho'
      );
    } finally {
      setLoading(false);
    }
  }

  // Tự động tải dữ liệu khi mở ứng dụng
  useEffect(() => {
    loadInventory();
  }, []);

  // Lọc sản phẩm theo tên hoặc mã SKU
  const filteredInventory = inventory.filter((item) => {
    const keyword = search.toLowerCase();

    return (
      item.name.toLowerCase().includes(keyword) ||
      item.sku.toLowerCase().includes(keyword)
    );
  });

  // Tính toán số liệu từ dữ liệu thật
  const totalProducts = inventory.filter(
    (item) => item.sku && item.name
  ).length;

  const totalStock = inventory.reduce(
    (sum, item) => sum + item.onHand,
    0
  );

  const lowStock = inventory.filter(
    (item) => item.onHand <= 5
  ).length;

  // Tiêu đề trang
  const pageTitles: Record<Page, string> = {
    dashboard: 'Dashboard',
    inventory: 'Quản lý tồn kho',
    products: 'Sản phẩm',
    orders: 'Đơn hàng',
    reports: 'Báo cáo',
  };

  return (
    <div className="app">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="brand">
          <div className="brand-icon">
            <Boxes size={24} />
          </div>

          <div>
            <h2>OISM</h2>
            <span>INVENTORY SYSTEM</span>
          </div>
        </div>

        <p className="menu-title">MENU</p>

        <nav className="navigation">

          <button
            className={
              currentPage === 'dashboard'
                ? 'nav-item active'
                : 'nav-item'
            }
            onClick={() => setCurrentPage('dashboard')}
          >
            <LayoutDashboard size={19} />
            Dashboard
          </button>

          <button
            className={
              currentPage === 'inventory'
                ? 'nav-item active'
                : 'nav-item'
            }
            onClick={() => setCurrentPage('inventory')}
          >
            <Warehouse size={19} />
            Inventory
          </button>

          <button
            className={
              currentPage === 'products'
                ? 'nav-item active'
                : 'nav-item'
            }
            onClick={() => setCurrentPage('products')}
          >
            <Package size={19} />
            Products
          </button>

          <button
            className={
              currentPage === 'orders'
                ? 'nav-item active'
                : 'nav-item'
            }
            onClick={() => setCurrentPage('orders')}
          >
            <ShoppingCart size={19} />
            Orders
          </button>

          <button
            className={
              currentPage === 'reports'
                ? 'nav-item active'
                : 'nav-item'
            }
            onClick={() => setCurrentPage('reports')}
          >
            <BarChart3 size={19} />
            Reports
          </button>

        </nav>

        <div className="sidebar-bottom">
          <span>OISM Project</span>
          <small>React + TypeScript</small>
        </div>

      </aside>

      {/* MAIN CONTENT */}
      <main className="main">

        <header className="header">
          <div>
            <h2>{pageTitles[currentPage]}</h2>
            <p>Omnichannel Inventory and Sales Management</p>
          </div>

          <button
            className="refresh-button"
            onClick={loadInventory}
            disabled={loading}
          >
            <RefreshCw size={17} />
            Làm mới
          </button>
        </header>

        <section className="content">

          {/* HIỂN THỊ LỖI */}
          {error && (
            <div className="error-message">
              <AlertTriangle size={18} />
              {error}
            </div>
          )}

          {/* DASHBOARD */}
          {currentPage === 'dashboard' && (
            <>
              <div className="welcome">
                <h1>Tổng quan hệ thống</h1>
                <p>
                  Theo dõi tình trạng tồn kho của chi nhánh.
                </p>
              </div>

              {loading ? (
                <p>Đang tải dữ liệu...</p>
              ) : (
                <div className="stats-grid">

                  <div className="stat-card">
                    <div className="stat-icon blue">
                      <Package size={22} />
                    </div>

                    <p>Tổng sản phẩm</p>
                    <h2>{totalProducts}</h2>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon green">
                      <Boxes size={22} />
                    </div>

                    <p>Tổng tồn kho</p>
                    <h2>{totalStock}</h2>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon orange">
                      <AlertTriangle size={22} />
                    </div>

                    <p>Sản phẩm tồn thấp</p>
                    <h2>{lowStock}</h2>
                  </div>

                </div>
              )}

              <div className="panel">
                <div className="panel-heading">
                  <div>
                    <h3>Tình trạng kết nối</h3>
                    <p>Trạng thái dữ liệu từ Backend</p>
                  </div>

                  {error ? (
                    <span className="connection-error">
                      Chưa kết nối
                    </span>
                  ) : loading ? (
                    <span>Đang kiểm tra...</span>
                  ) : (
                    <span className="connection-success">
                      <CheckCircle2 size={16} />
                      Đã kết nối
                    </span>
                  )}
                </div>
              </div>

              <div className="panel">
                <div className="panel-heading">
                  <h3>Sản phẩm tồn kho</h3>

                  <button
                    className="text-button"
                    onClick={() => setCurrentPage('inventory')}
                  >
                    Xem tất cả
                  </button>
                </div>

                <InventoryTable
                  items={inventory.slice(0, 5)}
                  loading={loading}
                />
              </div>
            </>
          )}

          {/* INVENTORY */}
          {currentPage === 'inventory' && (
            <>
              <div className="welcome">
                <h1>Quản lý tồn kho</h1>
                <p>
                  Danh sách tồn kho được lấy từ Backend.
                </p>
              </div>

              <div className="panel">

                <div className="toolbar">
                  <div className="search-box">
                    <Search size={18} />

                    <input
                      type="text"
                      placeholder="Tìm theo tên hoặc SKU..."
                      value={search}
                      onChange={(e) =>
                        setSearch(e.target.value)
                      }
                    />
                  </div>

                  <span>
                    {filteredInventory.length} dòng dữ liệu
                  </span>
                </div>

                <InventoryTable
                  items={filteredInventory}
                  loading={loading}
                />

              </div>
            </>
          )}

          {/* CÁC TRANG CHƯA TRIỂN KHAI */}
          {currentPage !== 'dashboard' &&
            currentPage !== 'inventory' && (
              <div className="panel coming-soon">
                <Package size={40} />

                <h2>{pageTitles[currentPage]}</h2>

                <p>
                  Chức năng này sẽ được triển khai ở bước tiếp theo.
                </p>
              </div>
            )}

        </section>

      </main>

    </div>
  );
}

// Component hiển thị bảng tồn kho
type InventoryTableProps = {
  items: InventoryItem[];
  loading: boolean;
};

function InventoryTable({
  items,
  loading,
}: InventoryTableProps) {

  if (loading) {
    return <p className="empty">Đang tải dữ liệu...</p>;
  }

  if (items.length === 0) {
    return <p className="empty">Không có dữ liệu.</p>;
  }

  return (
    <div className="table-container">

      <table>
        <thead>
          <tr>
            <th>SKU</th>
            <th>Tên sản phẩm</th>
            <th>Tồn kho</th>
            <th>Đã giữ</th>
            <th>Có thể bán</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => (
            <tr key={item.productId}>

              <td>
                <strong>{item.sku || 'N/A'}</strong>
              </td>

              <td>{item.name || 'Chưa xác định'}</td>

              <td>{item.onHand}</td>

              <td>{item.reserved}</td>

              <td>
                <span
                  className={
                    item.available <= 5
                      ? 'stock-low'
                      : 'stock-normal'
                  }
                >
                  {item.available}
                </span>
              </td>

            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}

export default App;