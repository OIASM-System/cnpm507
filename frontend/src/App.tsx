import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Activity, AlertTriangle, ArrowDownUp, Boxes, ClipboardList, LayoutDashboard,
  Package, RefreshCw, Search, ShoppingCart, Warehouse, CheckCircle2, Plus,
  X, History, CircleDollarSign, FileText
} from 'lucide-react';
import {
  adjustInventory, cancelOrder, confirmOrder, createOrder, getBranchInventory,
  getLedger, getOrder, statusName,
  type InventoryItem, type LedgerEntry, type OrderDto
} from './api';

type Page = 'dashboard' | 'inventory' | 'products' | 'orders' | 'ledger' | 'reports';

const money = (value: number) => new Intl.NumberFormat('vi-VN', {
  style: 'currency', currency: 'VND', maximumFractionDigits: 0
}).format(value);

const dateTime = (value: string) => new Date(value).toLocaleString('vi-VN');

function App() {
  const [page, setPage] = useState<Page>('dashboard');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [keyword, setKeyword] = useState('');
  const [adjustTarget, setAdjustTarget] = useState<InventoryItem | null>(null);
  const [newOnHand, setNewOnHand] = useState('');
  const [saving, setSaving] = useState(false);
  const [orderProduct, setOrderProduct] = useState('');
  const [orderQty, setOrderQty] = useState('1');
  const [orderSource, setOrderSource] = useState('POS');
  const [createdOrder, setCreatedOrder] = useState<OrderDto | null>(null);
  const [lookupId, setLookupId] = useState('');
  const [lookedUpOrder, setLookedUpOrder] = useState<OrderDto | null>(null);
  const [orderBusy, setOrderBusy] = useState(false);

  async function loadInventory() {
    setLoading(true);
    setError('');
    try {
      const rows = await getBranchInventory();
      setInventory(Array.isArray(rows) ? rows : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tải được tồn kho.');
    } finally {
      setLoading(false);
    }
  }

  async function loadLedger() {
    setLedgerLoading(true);
    setError('');
    try {
      const rows = await getLedger();
      setLedger(Array.isArray(rows) ? rows : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tải được lịch sử kho.');
    } finally {
      setLedgerLoading(false);
    }
  }

  useEffect(() => { void loadInventory(); }, []);

  const filteredInventory = useMemo(() => {
    const q = keyword.trim().toLocaleLowerCase('vi');
    return inventory.filter(x => `${x.sku} ${x.name}`.toLocaleLowerCase('vi').includes(q));
  }, [inventory, keyword]);

  const totalStock = inventory.reduce((sum, item) => sum + item.onHand, 0);
  const totalAvailable = inventory.reduce((sum, item) => sum + item.available, 0);
  const lowStock = inventory.filter(item => item.available <= 5).length;

  const titles: Record<Page, string> = {
    dashboard: 'Tổng quan', inventory: 'Quản lý tồn kho', products: 'Sản phẩm',
    orders: 'Đơn hàng', ledger: 'Lịch sử kho', reports: 'Báo cáo'
  };

  async function saveAdjustment() {
    if (!adjustTarget) return;
    const value = Number(newOnHand);
    if (!Number.isInteger(value) || value < 0) {
      setError('Tồn kho mới phải là số nguyên không âm.');
      return;
    }
    if (value < adjustTarget.reserved) {
      setError(`Tồn kho mới không được thấp hơn số lượng đã giữ (${adjustTarget.reserved}).`);
      return;
    }
    setSaving(true); setError(''); setNotice('');
    try {
      await adjustInventory(adjustTarget.productId, value);
      setNotice('Đã cập nhật tồn kho trong cơ sở dữ liệu.');
      setAdjustTarget(null);
      await loadInventory();
      if (page === 'ledger') await loadLedger();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Điều chỉnh tồn kho thất bại.');
    } finally { setSaving(false); }
  }

  async function submitOrder() {
    const qty = Number(orderQty);
    if (!orderProduct || !Number.isInteger(qty) || qty <= 0) {
      setError('Hãy chọn sản phẩm và nhập số lượng nguyên lớn hơn 0.');
      return;
    }
    setOrderBusy(true); setError(''); setNotice('');
    try {
      const result = await createOrder({ source: orderSource, items: [{ productId: orderProduct, quantity: qty }] });
      setCreatedOrder(result);
      setLookedUpOrder(result);
      setLookupId(result.id);
      setNotice('Đơn hàng đã được tạo trong cơ sở dữ liệu.');
      await loadInventory();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tạo được đơn hàng.');
    } finally { setOrderBusy(false); }
  }

  async function findOrder() {
    if (!lookupId.trim()) { setError('Nhập Order ID để tra cứu.'); return; }
    setOrderBusy(true); setError('');
    try {
      const result = await getOrder(lookupId.trim());
      setLookedUpOrder(result);
    } catch (e) {
      setLookedUpOrder(null);
      setError(e instanceof Error ? e.message : 'Không tìm thấy đơn hàng.');
    } finally { setOrderBusy(false); }
  }

  async function changeOrderStatus(action: 'confirm' | 'cancel') {
    if (!lookedUpOrder) return;
    setOrderBusy(true); setError(''); setNotice('');
    try {
      if (action === 'confirm') await confirmOrder(lookedUpOrder.id);
      else await cancelOrder(lookedUpOrder.id);
      const refreshed = await getOrder(lookedUpOrder.id);
      setLookedUpOrder(refreshed);
      setNotice(action === 'confirm' ? 'Đã xác nhận đơn hàng.' : 'Đã hủy đơn hàng.');
      await loadInventory();
      await loadLedger();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không cập nhật được đơn hàng.');
    } finally { setOrderBusy(false); }
  }

  function navigate(next: Page) {
    setPage(next); setError(''); setNotice('');
    if (next === 'ledger') void loadLedger();
    if (next === 'inventory' || next === 'products' || next === 'dashboard') void loadInventory();
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><Boxes size={25} /></div>
          <div><strong>OISM</strong><small>INVENTORY & SALES</small></div>
        </div>
        <div className="side-label">WORKSPACE</div>
        <nav className="nav-list">
          <NavButton active={page === 'dashboard'} onClick={() => navigate('dashboard')} icon={<LayoutDashboard size={18}/>} label="Tổng quan"/>
          <NavButton active={page === 'inventory'} onClick={() => navigate('inventory')} icon={<Warehouse size={18}/>} label="Tồn kho"/>
          <NavButton active={page === 'products'} onClick={() => navigate('products')} icon={<Package size={18}/>} label="Sản phẩm"/>
          <NavButton active={page === 'orders'} onClick={() => navigate('orders')} icon={<ShoppingCart size={18}/>} label="Đơn hàng"/>
          <NavButton active={page === 'ledger'} onClick={() => navigate('ledger')} icon={<History size={18}/>} label="Lịch sử kho"/>
          <NavButton active={page === 'reports'} onClick={() => navigate('reports')} icon={<ClipboardList size={18}/>} label="Báo cáo"/>
        </nav>
        <div className="sidebar-footer"><span className="online-dot"/> Backend API <small>React + TypeScript</small></div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div><span className="eyebrow">OMNICHANNEL INVENTORY SYSTEM</span><h1>{titles[page]}</h1></div>
          <button className="button secondary" onClick={() => page === 'ledger' ? void loadLedger() : void loadInventory()} disabled={loading || ledgerLoading}>
            <RefreshCw size={16}/> Làm mới
          </button>
        </header>

        <div className="page-content">
          {error && <div className="alert error"><AlertTriangle size={18}/><span>{error}</span><button onClick={() => setError('')} aria-label="Đóng"><X size={16}/></button></div>}
          {notice && <div className="alert success"><CheckCircle2 size={18}/><span>{notice}</span><button onClick={() => setNotice('')} aria-label="Đóng"><X size={16}/></button></div>}

          {page === 'dashboard' && <Dashboard inventory={inventory} loading={loading} totalStock={totalStock} totalAvailable={totalAvailable} lowStock={lowStock} onInventory={() => navigate('inventory')} onRefresh={() => void loadInventory()}/>}
          {page === 'inventory' && <InventoryPage rows={filteredInventory} loading={loading} keyword={keyword} setKeyword={setKeyword} onAdjust={item => {setAdjustTarget(item);setNewOnHand(String(item.onHand));}}/>}
          {page === 'products' && <ProductsPage rows={filteredInventory} loading={loading} keyword={keyword} setKeyword={setKeyword}/>}
          {page === 'orders' && <OrdersPage inventory={inventory} orderProduct={orderProduct} setOrderProduct={setOrderProduct} orderQty={orderQty} setOrderQty={setOrderQty} orderSource={orderSource} setOrderSource={setOrderSource} onCreate={() => void submitOrder()} busy={orderBusy} lookupId={lookupId} setLookupId={setLookupId} onFind={() => void findOrder()} order={lookedUpOrder} onConfirm={() => void changeOrderStatus('confirm')} onCancel={() => void changeOrderStatus('cancel')}/>}
          {page === 'ledger' && <LedgerPage rows={ledger} loading={ledgerLoading}/>}
          {page === 'reports' && <ReportsPage/>}
        </div>
      </main>

      {adjustTarget && <div className="modal-backdrop" onMouseDown={e => {if(e.target === e.currentTarget) setAdjustTarget(null);}}>
        <div className="modal">
          <div className="modal-head"><div><span className="eyebrow">INVENTORY ADJUSTMENT</span><h2>Điều chỉnh tồn kho</h2></div><button className="icon-button" onClick={() => setAdjustTarget(null)}><X size={18}/></button></div>
          <p className="muted">{adjustTarget.sku} · {adjustTarget.name}</p>
          <label className="field-label">Số lượng tồn kho mới</label>
          <input className="text-input" type="number" min={adjustTarget.reserved} step="1" value={newOnHand} onChange={e => setNewOnHand(e.target.value)}/>
          <p className="hint">Đã giữ: {adjustTarget.reserved}. Tồn kho mới không được thấp hơn số lượng đã giữ.</p>
          <div className="modal-actions"><button className="button secondary" onClick={() => setAdjustTarget(null)}>Hủy</button><button className="button primary" onClick={() => void saveAdjustment()} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</button></div>
        </div>
      </div>}
    </div>
  );
}

function NavButton({active,onClick,icon,label}:{active:boolean;onClick:()=>void;icon:ReactNode;label:string}) {
  return <button className={`nav-button ${active?'active':''}`} onClick={onClick}>{icon}<span>{label}</span></button>;
}

function Dashboard({inventory,loading,totalStock,totalAvailable,lowStock,onInventory,onRefresh}:{inventory:InventoryItem[];loading:boolean;totalStock:number;totalAvailable:number;lowStock:number;onInventory:()=>void;onRefresh:()=>void}) {
  return <>
    <section className="welcome-card"><div><span className="eyebrow light">BRANCH OVERVIEW</span><h2>Chào mừng đến với OISM</h2><p>Số liệu được tải trực tiếp từ Backend và PostgreSQL.</p></div><div className="welcome-icon"><Activity size={42}/></div></section>
    <div className="stats-grid">
      <StatCard icon={<Package/>} label="Mặt hàng trong kho" value={loading?'…':inventory.length} tone="blue"/>
      <StatCard icon={<Boxes/>} label="Tổng số lượng tồn" value={loading?'…':totalStock.toLocaleString('vi-VN')} tone="violet"/>
      <StatCard icon={<ArrowDownUp/>} label="Số lượng có thể bán" value={loading?'…':totalAvailable.toLocaleString('vi-VN')} tone="green"/>
      <StatCard icon={<AlertTriangle/>} label="Mặt hàng sắp hết" value={loading?'…':lowStock} tone="orange"/>
    </div>
    <section className="panel">
      <div className="panel-heading"><div><h3>Tồn kho gần đây</h3><p>Dữ liệu theo chi nhánh đang cấu hình</p></div><button className="button secondary small" onClick={onInventory}>Xem tồn kho</button></div>
      {loading ? <Loading/> : <InventoryTable rows={inventory.slice(0,6)}/>}
    </section>
    <div className="footer-note"><CheckCircle2 size={16}/> Dữ liệu hiển thị là dữ liệu thật từ API. <button onClick={onRefresh}>Tải lại</button></div>
  </>;
}

function StatCard({icon,label,value,tone}:{icon:ReactNode;label:string;value:string|number;tone:string}) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><div><p>{label}</p><strong>{value}</strong></div></div>;
}

function InventoryPage({rows,loading,keyword,setKeyword,onAdjust}:{rows:InventoryItem[];loading:boolean;keyword:string;setKeyword:(v:string)=>void;onAdjust:(item:InventoryItem)=>void}) {
  return <section className="panel">
    <div className="panel-heading"><div><h3>Danh sách tồn kho</h3><p>Điều chỉnh tồn kho sẽ ghi dữ liệu qua API</p></div><span className="count-pill">{rows.length} mặt hàng</span></div>
    <SearchBox value={keyword} onChange={setKeyword}/>
    {loading?<Loading/>:<InventoryTable rows={rows} onAdjust={onAdjust} showAction/>}
  </section>;
}

function ProductsPage({rows,loading,keyword,setKeyword}:{rows:InventoryItem[];loading:boolean;keyword:string;setKeyword:(v:string)=>void}) {
  return <section className="panel"><div className="panel-heading"><div><h3>Sản phẩm</h3><p>Danh sách SKU có phát sinh tồn kho tại chi nhánh</p></div><span className="count-pill">{rows.length} SKU</span></div><SearchBox value={keyword} onChange={setKeyword}/>{loading?<Loading/>:<InventoryTable rows={rows}/>}<p className="hint page-hint">Backend hiện chưa cung cấp API danh mục sản phẩm riêng hoặc tạo/sửa sản phẩm. Danh sách này được lấy từ dữ liệu tồn kho, không tự tạo dữ liệu giả.</p></section>;
}

function SearchBox({value,onChange}:{value:string;onChange:(v:string)=>void}) {
  return <div className="search-row"><Search size={18}/><input value={value} onChange={e=>onChange(e.target.value)} placeholder="Tìm theo SKU hoặc tên sản phẩm..."/></div>;
}

function InventoryTable({rows,onAdjust,showAction=false}:{rows:InventoryItem[];onAdjust?:(item:InventoryItem)=>void;showAction?:boolean}) {
  if(!rows.length) return <div className="empty-state">Không có dữ liệu tồn kho.</div>;
  return <div className="table-wrap"><table><thead><tr><th>SKU</th><th>Sản phẩm</th><th>Tồn kho</th><th>Đã giữ</th><th>Có thể bán</th>{showAction&&<th></th>}</tr></thead><tbody>{rows.map((item,index)=><tr key={`${item.productId}-${index}`}><td><span className="sku">{item.sku||'—'}</span></td><td className="product-name">{item.name||'Chưa xác định'}</td><td>{item.onHand}</td><td>{item.reserved}</td><td><span className={`stock-badge ${item.available<=5?'low':''}`}>{item.available}</span></td>{showAction&&<td><button className="text-action" onClick={()=>onAdjust?.(item)}>Điều chỉnh</button></td>}</tr>)}</tbody></table></div>;
}

function OrdersPage(props:{
 inventory:InventoryItem[];orderProduct:string;setOrderProduct:(v:string)=>void;orderQty:string;setOrderQty:(v:string)=>void;orderSource:string;setOrderSource:(v:string)=>void;onCreate:()=>void;busy:boolean;lookupId:string;setLookupId:(v:string)=>void;onFind:()=>void;order:OrderDto|null;onConfirm:()=>void;onCancel:()=>void;
}) {
 const {inventory,orderProduct,setOrderProduct,orderQty,setOrderQty,orderSource,setOrderSource,onCreate,busy,lookupId,setLookupId,onFind,order,onConfirm,onCancel}=props;
 const canChange=order?.status===1;
 return <div className="two-columns">
  <section className="panel"><div className="panel-heading"><div><h3><Plus size={18}/> Tạo đơn hàng</h3><p>Đơn hàng được tạo qua POST /api/orders</p></div></div>
   <label className="field-label">Nguồn đơn</label><select className="text-input" value={orderSource} onChange={e=>setOrderSource(e.target.value)}><option value="POS">POS</option><option value="ONLINE">ONLINE</option><option value="MANUAL">MANUAL</option></select>
   <label className="field-label">Sản phẩm</label><select className="text-input" value={orderProduct} onChange={e=>setOrderProduct(e.target.value)}><option value="">-- Chọn SKU --</option>{inventory.map((p,i)=><option key={`${p.productId}-${i}`} value={p.productId}>{p.sku} - {p.name} (có thể bán: {p.available})</option>)}</select>
   <label className="field-label">Số lượng</label><input className="text-input" type="number" min="1" step="1" value={orderQty} onChange={e=>setOrderQty(e.target.value)}/>
   <button className="button primary full" onClick={onCreate} disabled={busy||!inventory.length}><ShoppingCart size={17}/>{busy?'Đang xử lý...':'Tạo đơn hàng'}</button>
   <p className="hint">Backend sẽ kiểm tra tồn kho và giá bán. Đơn mới ở trạng thái Pending.</p>
  </section>
  <section className="panel"><div className="panel-heading"><div><h3><FileText size={18}/> Tra cứu đơn hàng</h3><p>Backend chưa có API liệt kê tất cả đơn hàng</p></div></div>
   <label className="field-label">Order ID (GUID)</label><div className="lookup-row"><input className="text-input" value={lookupId} onChange={e=>setLookupId(e.target.value)} placeholder="Nhập ID đơn hàng"/><button className="button secondary" onClick={onFind} disabled={busy}>Tra cứu</button></div>
   {order&&<div className="order-detail"><div className="order-number">{order.orderNumber}</div><span className={`status-pill status-${order.status}`}>{statusName(order.status)}</span><p className="muted">ID: {order.id}</p><p className="muted">Ngày tạo: {dateTime(order.createdAt)}</p><div className="order-lines">{order.items?.map((item,i)=><div key={i}><span>{item.productName} × {item.quantity}</span><strong>{money(item.lineTotal)}</strong></div>)}</div><div className="order-total"><span>Tổng cộng</span><strong>{money(order.totalAmount)}</strong></div>{canChange&&<div className="modal-actions"><button className="button secondary" onClick={onCancel} disabled={busy}>Hủy đơn</button><button className="button primary" onClick={onConfirm} disabled={busy}>Xác nhận đơn</button></div>}</div>}
  </section>
 </div>;
}

function LedgerPage({rows,loading}:{rows:LedgerEntry[];loading:boolean}) {
 return <section className="panel"><div className="panel-heading"><div><h3>Lịch sử biến động kho</h3><p>GET /api/inventory/ledger · Chi nhánh hiện tại</p></div><span className="count-pill">{rows.length} giao dịch</span></div>{loading?<Loading/>:!rows.length?<div className="empty-state">Chưa có giao dịch kho.</div>:<div className="table-wrap"><table><thead><tr><th>Thời gian</th><th>Loại giao dịch</th><th>Product ID</th><th>Số lượng thay đổi</th><th>Tồn sau giao dịch</th><th>Đã giữ</th><th>Order ID</th></tr></thead><tbody>{rows.map(row=><tr key={row.id}><td>{dateTime(row.createdAt)}</td><td>{row.movementType}</td><td className="id-cell">{row.productId}</td><td>{row.quantity}</td><td>{row.onHandAfter}</td><td>{row.reservedAfter}</td><td className="id-cell">{row.orderId||'—'}</td></tr>)}</tbody></table></div>}</section>;
}

function ReportsPage() {
 return <section className="panel empty-feature"><CircleDollarSign size={38}/><h3>Báo cáo chưa khả dụng</h3><p>Backend hiện chưa có endpoint báo cáo doanh thu hoặc thống kê đơn hàng. Màn hình này chưa hiển thị số liệu giả.</p></section>;
}

function Loading() { return <div className="empty-state"><RefreshCw size={18} className="spin"/> Đang tải dữ liệu...</div>; }

export default App;
