import { useEffect, useMemo, useState } from 'react';
import {
  Activity, AlertTriangle, ArrowDownToLine, ArrowLeftRight, ArrowUpRight, BarChart3, Bell, Boxes,
  Building2, CalendarDays, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, CircleHelp,
  ClipboardList, Clock3, CreditCard, Download, Ellipsis, FileText, Filter, Grid2X2, LayoutDashboard,
  LogOut, Menu, Minus, MoreHorizontal, Package, Plus, Printer, Search, Settings, ShoppingBag,
  ShoppingCart, SlidersHorizontal, Sparkles, Store, Tag, TrendingDown, TrendingUp, Truck, Users,
  Wallet, Wifi, WifiOff, X, ScanBarcode, Banknote, Trash2, Receipt, RefreshCw, CircleDollarSign
} from 'lucide-react';
import { apiBase, branchId, checkBackend, getBranchInventory, getLedger, adjustInventory, createOrder, confirmOrder, cancelOrder, getOrder, isGuid, loadOrders, saveOrders, loadPrices, savePrice, statusName, type OrderDto, type LedgerEntry } from './api';

type Mode = 'admin' | 'pos';
type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;

  // Thông tin tồn kho từ Backend
  onHand: number;
  reserved: number;
  available: number;

  // Số lượng khả dụng dùng cho giao diện hiện tại
  stock: number;

  color: string;
  icon: string;
};
type CartLine = Product & { qty: number };
const money = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
const productsSeed: Product[] = [
  {
  id: '1',
  name: 'Cà phê sữa',
  sku: 'CF-001',
  category: 'Cà phê',
  price: 25000,

  onHand: 0,
  reserved: 0,
  available: 0,

  stock: 0,
  color: 'coffee',
  icon: '☕'
},
  { id:'p2',name:'Bạc xỉu',sku:'CF-002',category:'Cà phê',price:32000,onHand: 0,reserved: 0,available: 0,stock:86,color:'latte',icon:'🥤' },
  { id:'p3',name:'Trà đào cam sả',sku:'TE-001',category:'Trà',price:39000,onHand: 0,reserved: 0,available: 0,stock:64,color:'tea',icon:'🍹' },
  { id:'p4',name:'Trà vải',sku:'TE-002',category:'Trà',price:35000,onHand: 0,reserved: 0,available: 0,stock:52,color:'berry',icon:'🧋' },
  { id:'p5',name:'Matcha latte',sku:'MT-001',category:'Đá xay',price:45000,onHand: 0,reserved: 0,available: 0,stock:38,color:'matcha',icon:'🍵' },
  { id:'p6',name:'Chocolate đá xay',sku:'MT-002',category:'Đá xay',price:49000,onHand: 0,reserved: 0,available: 0,stock:9,color:'choco',icon:'🍫' },
  { id:'p7',name:'Croissant bơ',sku:'BK-001',category:'Bánh',price:28000,onHand: 0,reserved: 0,available: 0,stock:24,color:'bread',icon:'🥐' },
  { id:'p8',name:'Tiramisu',sku:'BK-002',category:'Bánh',price:42000,onHand: 0,reserved: 0,available: 0,stock:6,color:'cake',icon:'🍰' }
];
const navAdmin = [
  { title:'TỔNG QUAN', items:[['Tổng quan',LayoutDashboard],['Báo cáo',BarChart3]] },
  { title:'VẬN HÀNH', items:[['Sản phẩm',Package],['Kho hàng',Boxes],['Đơn hàng',ShoppingBag],['Chi nhánh',Building2]] },
  { title:'HỆ THỐNG', items:[['Nhân viên & quyền',Users],['Cài đặt',Settings]] }
] as const;
const adminTitles: Record<string,string> = { 'Tổng quan':'Tổng quan hoạt động','Báo cáo':'Báo cáo & phân tích','Sản phẩm':'Quản lý sản phẩm','Kho hàng':'Quản lý kho hàng','Đơn hàng':'Quản lý đơn hàng','Chi nhánh':'Quản lý chi nhánh','Nhân viên & quyền':'Nhân viên & phân quyền','Cài đặt':'Cài đặt hệ thống' };
function App(){
  const [mode,setMode]=useState<Mode>(()=>location.pathname.startsWith('/pos')?'pos':'admin');
  const [page,setPage]=useState('Tổng quan'); const [mobileNav,setMobileNav]=useState(false);
  const [products,setProducts]=useState<Product[]>(productsSeed); const [cart,setCart]=useState<CartLine[]>(()=>{try{return JSON.parse(localStorage.getItem('oism.pos.cart')||'[]')}catch{return []}});
  const [category,setCategory]=useState('Tất cả'); const [search,setSearch]=useState(''); const [toast,setToast]=useState('');
  const [payment,setPayment]=useState('Tiền mặt'); const [cash,setCash]=useState(''); const [discount,setDiscount]=useState(0);
  const [showCheckout,setShowCheckout]=useState(false); const [showAddProduct,setShowAddProduct]=useState(false); const [online,setOnline]=useState(navigator.onLine);
  const [apiStatus,setApiStatus]=useState<'unknown'|'connected'|'offline'>('unknown'); const [apiNote,setApiNote]=useState('');
  const [orders,setOrders]=useState<OrderDto[]>(loadOrders);const [ledger,setLedger]=useState<LedgerEntry[]>([]);const [busy,setBusy]=useState(false);
  const [queryResult,setQueryResult]=useState('');
  useEffect(()=>{const up=()=>setOnline(true),down=()=>setOnline(false);window.addEventListener('online',up);window.addEventListener('offline',down);return()=>{window.removeEventListener('online',up);window.removeEventListener('offline',down)}},[]);
  useEffect(()=>{localStorage.setItem('oism.pos.cart',JSON.stringify(cart))},[cart]);
  useEffect(()=>{saveOrders(orders)},[orders]);
  useEffect(()=>{if(toast){const t=setTimeout(()=>setToast(''),3500);return()=>clearTimeout(t)}},[toast]);
  useEffect(()=>{const path=mode==='pos'?'/pos':'/admin'; if(location.pathname!==path)history.replaceState({},'',path)},[mode]);
  const subtotal=cart.reduce((s,p)=>s+p.price*p.qty,0), total=Math.max(0,subtotal-discount), change=Math.max(0,(Number(cash)||0)-total);
  const filtered=useMemo(()=>products.filter(p=>(category==='Tất cả'||p.category===category)&&`${p.name} ${p.sku}`.toLowerCase().includes(search.toLowerCase())),[products,category,search]);
  const categories=['Tất cả',...Array.from(new Set(products.map(p=>p.category)))];
  function addToCart(p:Product){setCart(old=>{const found=old.find(x=>x.id===p.id);return found?old.map(x=>x.id===p.id?{...x,qty:x.qty+1}:x):[...old,{...p,qty:1}]});setToast(`Đã thêm ${p.name} vào giỏ hàng`)}
  function updateQty(id:string,delta:number){setCart(old=>old.map(x=>x.id===id?{...x,qty:x.qty+delta}:x).filter(x=>x.qty>0))}
async function checkApi() {
  try {
    const message = await checkBackend();

    setApiStatus('connected');
    setApiNote(message);

    await loadProducts();

    setToast('Kết nối Backend thành công!');
  } catch (e) {
    setApiStatus('offline');

    const errorMessage =
      e instanceof Error
        ? e.message
        : 'Không thể kết nối API';

    setApiNote(errorMessage);
    setToast(errorMessage);
  }
}
}  async function login(){setToast('Backend hiện chưa có AuthController hoặc endpoint đăng nhập. Chưa thể xác thực tài khoản từ giao diện.');setShowCheckout(false)}
async function loadProducts() {
  try {
    // 1. Lấy tồn kho từ Backend
    const rows = await getBranchInventory();

    // 2. Lấy giá bán đang lưu ở giao diện
    const prices = loadPrices();

    // 3. Chuyển dữ liệu Backend thành Product
    const productsFromApi: Product[] = rows
      // Bỏ dòng dữ liệu không có SKU hoặc tên sản phẩm
      .filter(row => row.sku && row.name)
      .map(row => {
        // Tìm sản phẩm mẫu có cùng SKU để lấy danh mục,
        // màu sắc và biểu tượng nếu có
        const oldProduct = productsSeed.find(
          p => p.sku.toLowerCase() === row.sku.toLowerCase()
        );

        return {
          id: row.productId,
          name: row.name,
          sku: row.sku,

          category: oldProduct?.category ?? 'Khác',

          price:
            prices[row.sku.toLowerCase()] ??
            oldProduct?.price ??
            0,

          // Dữ liệu tồn kho thật từ Backend
          onHand: row.onHand,
          reserved: row.reserved,
          available: row.available,

          // Giữ tương thích với những phần giao diện đang dùng stock
          stock: row.available,

          color: oldProduct?.color ?? 'coffee',
          icon: oldProduct?.icon ?? '📦'
        };
      });

    // 4. Cập nhật danh sách sản phẩm
    setProducts(productsFromApi);

    // 5. Cập nhật trạng thái kết nối
    setApiStatus('connected');

    setApiNote(
      `Đã đồng bộ ${productsFromApi.length} sản phẩm từ Backend.`
    );

    setToast(
      `Đã đồng bộ ${productsFromApi.length} sản phẩm từ Backend.`
    );

  } catch (e) {
    setApiStatus('offline');

    const message =
      e instanceof Error
        ? e.message
        : 'Không tải được tồn kho từ API';

    setApiNote(message);
    setToast(message);
  }
}  async function checkout(){
    if(!cart.length||busy)return;
    if(discount>0){setToast('Backend chưa hỗ trợ giảm giá nên chưa thể ghi nhận đơn. Hãy bỏ giảm giá rồi thanh toán lại.');return}
    if(cart.some(l=>!isGuid(l.id))){setToast('Giỏ có sản phẩm chưa có ProductId thật. Bấm nút đồng bộ (góc trên) rồi thêm lại sản phẩm.');return}
    setBusy(true);setToast('Đang tạo đơn...');
    let created:OrderDto|undefined;
    try{
      created=await createOrder({branchId,source:'POS',items:cart.map(l=>({productId:l.id,quantity:l.qty}))});
      await confirmOrder(created.id);
      const final=await getOrder(created.id);
      setOrders(old=>[final,...old.filter(o=>o.id!==final.id)]);
      learnPrices(final);setCart([]);setCash('');setDiscount(0);
      await loadProducts();
      setToast(`Đã xác nhận đơn ${final.orderNumber}. Tổng theo server: ${money(final.totalAmount)}`);
    }catch(e){
      const msg=e instanceof Error?e.message:'Không thể thanh toán';
      if(created){const c=created;setOrders(old=>[c,...old.filter(o=>o.id!==c.id)]);setToast(`Đơn ${c.orderNumber} đã tạo nhưng chưa xác nhận: ${msg}. Vào Admin > Đơn hàng để xác nhận hoặc hủy.`)}
      else setToast(msg);
    }finally{setBusy(false)}
  }
  function learnPrices(o:OrderDto){o.items.forEach(i=>savePrice(i.sku,i.unitPrice));setProducts(cur=>cur.map(p=>{const it=o.items.find(i=>i.productId===p.id);return it?{...p,price:it.unitPrice}:p}))}
  function editPrice(p:Product){const v=prompt(`Giá hiển thị của ${p.name} (₫). Giá thật do server tính khi tạo đơn.`,String(p.price));if(v===null)return;const n=Number(v);if(!Number.isFinite(n)||n<0){setToast('Giá không hợp lệ');return}savePrice(p.sku,n);setProducts(cur=>cur.map(x=>x.id===p.id?{...x,price:n}:x))}
  async function refreshOrders(){try{const fresh=await Promise.all(orders.map(o=>getOrder(o.id).catch(()=>o)));setOrders(fresh);setToast('Đã làm mới trạng thái đơn từ server')}catch(e){setToast(e instanceof Error?e.message:'Không làm mới được đơn hàng')}}
  async function orderAction(o:OrderDto,kind:'confirm'|'cancel'){try{await(kind==='confirm'?confirmOrder(o.id):cancelOrder(o.id));const fresh=await getOrder(o.id);setOrders(old=>old.map(x=>x.id===o.id?fresh:x));setToast(kind==='confirm'?`Đã xác nhận ${o.orderNumber}`:`Đã hủy ${o.orderNumber}`);loadProducts()}catch(e){setToast(e instanceof Error?e.message:'Thao tác thất bại')}}
  async function loadLedger(){try{setLedger(await getLedger())}catch(e){setToast(e instanceof Error?e.message:'Không tải được sổ kho')}}
  async function adjustStock(p:Product){if(!isGuid(p.id)){setToast('Sản phẩm chưa có ProductId thật. Hãy đồng bộ tồn kho từ backend trước.');return}const v=prompt(`Nhập tồn thực tế (on-hand) mới cho ${p.name}. Khả dụng hiện tại: ${p.stock}`);if(v===null)return;const n=Number(v);if(!Number.isInteger(n)||n<0){setToast('Số lượng phải là số nguyên không âm');return}try{await adjustInventory(p.id,n);setToast(`Đã điều chỉnh ${p.name} → ${n}`);await loadProducts();await loadLedger()}catch(e){setToast(e instanceof Error?e.message:'Điều chỉnh thất bại')}}
  function addProduct(e:React.FormEvent<HTMLFormElement>){e.preventDefault();const d=new FormData(e.currentTarget);const p:Product={id:`p${Date.now()}`,name:String(d.get('name')),sku:String(d.get('sku')),category:String(d.get('category')),price:Number(d.get('price')),stock:Number(d.get('stock')),color:'coffee',icon:'📦'};setProducts(old=>[p,...old]);setShowAddProduct(false);setToast('Đã thêm sản phẩm vào danh mục')}function addProduct(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();

  const d = new FormData(e.currentTarget);

  // Lấy số lượng tồn kho từ form
  const stock = Number(d.get('stock'));

  // Tạo sản phẩm mới
  const p: Product = {
    id: `p${Date.now()}`,
    name: String(d.get('name')),
    sku: String(d.get('sku')),
    category: String(d.get('category')),
    price: Number(d.get('price')),

    // Thông tin tồn kho
    onHand: stock,
    reserved: 0,
    available: stock,

    // Tương thích với giao diện cũ
    stock: stock,

    color: 'coffee',
    icon: '📦'
  };

  // Thêm sản phẩm vào danh sách
  setProducts(old => [p, ...old]);

  setShowAddProduct(false);
  setToast('Đã thêm sản phẩm vào danh mục');
}
  const switchMode=(m:Mode)=>{setMode(m);setMobileNav(false);setPage(m==='admin'?'Tổng quan':'Bán hàng')};
  return <div className={`app-shell ${mode==='pos'?'pos-shell':''}`}>
    {mode==='admin'?<>
      <aside className={`sidebar ${mobileNav?'open':''}`}><div className="brand"><div className="brand-mark"><Store size={21}/></div><div><b>OISM</b><small>RETAIL MANAGEMENT</small></div><button className="icon-btn sidebar-close" onClick={()=>setMobileNav(false)}><X size={18}/></button></div>
        <div className="tenant-switch"><div className="tenant-logo">M</div><div><b>May Coffee</b><small>Workspace · HCM</small></div><ChevronDown size={15}/></div>
        {navAdmin.map(group=><div className="nav-group" key={group.title}><div className="nav-label">{group.title}</div>{group.items.map(([label,Icon])=><button key={label} className={`nav-item ${page===label?'active':''}`} onClick={()=>{setPage(label);setMobileNav(false)}}><Icon size={18}/><span>{label}</span>{label==='Kho hàng'&&<i className="nav-count">3</i>}</button>)}</div>)}
        <div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><CircleHelp size={17}/></div><b>Cần trợ giúp?</b><p>Xem hướng dẫn sử dụng OISM</p><button onClick={()=>setToast('Trung tâm trợ giúp đang được cập nhật')}>Trung tâm trợ giúp <ArrowUpRight size={13}/></button></div><div className="profile-row"><div className="avatar">AD</div><div><b>Admin Nguyễn</b><small>Quản trị viên</small></div><MoreHorizontal size={18}/></div></div>
      </aside><div className="sidebar-backdrop" onClick={()=>setMobileNav(false)}></div>
      <main className="main-area"><header className="topbar"><div className="top-left"><button className="icon-btn menu-toggle" onClick={()=>setMobileNav(true)}><Menu/></button><div className="breadcrumb">Workspace <ChevronRight size={14}/> <b>{page}</b></div></div><div className="top-actions"><div className="date-chip"><CalendarDays size={15}/> {new Date().toLocaleDateString('vi-VN',{weekday:'long',day:'2-digit',month:'2-digit',year:'numeric'})}</div><button className="icon-btn notification" onClick={()=>setToast('Bạn không có thông báo mới')}><Bell size={18}/><i/></button><div className="top-avatar">AD</div></div></header>
      <div className="page-content"><div className="page-heading"><div><div className="eyebrow">MAY COFFEE <span>•</span> OVERVIEW</div><h1>{adminTitles[page]||page}</h1><p>{page==='Tổng quan'?'Theo dõi tình hình kinh doanh và vận hành cửa hàng của bạn.':`Theo dõi và quản lý ${page.toLowerCase()} trong hệ thống OISM.`}</p></div><div className="heading-actions"><button className="btn btn-outline" onClick={()=>setShowCheckout(true)}>Đăng nhập API</button><button className="btn btn-outline" onClick={checkApi}><RefreshCw size={15}/> Kiểm tra API</button><button className="btn btn-primary" onClick={()=>page==='Sản phẩm'?setShowAddProduct(true):setToast('Đã cập nhật dữ liệu mới nhất')}><Plus size={16}/>{page==='Sản phẩm'?'Thêm sản phẩm':'Xuất báo cáo'}</button></div></div>
      {page==='Tổng quan'?<Dashboard orders={orders} products={products} setPage={setPage}/>:page==='Sản phẩm'?<ProductsPage products={products} setShowAddProduct={setShowAddProduct} editPrice={editPrice}/>:page==='Kho hàng'?<InventoryPage products={products} ledger={ledger} loadLedger={loadLedger} adjust={adjustStock} reload={loadProducts}/>:page==='Đơn hàng'?<OrdersPage orders={orders} refresh={refreshOrders} onConfirm={o=>orderAction(o,'confirm')} onCancel={o=>orderAction(o,'cancel')}/>:page==='Báo cáo'?<ReportsPage/>:page==='Chi nhánh'?<BranchesPage/>:page==='Nhân viên & quyền'?<UsersPage/>:<SettingsPage apiStatus={apiStatus} apiNote={apiNote} checkApi={checkApi}/>}
      <footer className="app-footer"><span>© 2026 OISM · Omnichannel Inventory & Sales Management</span><span>Version 1.0.0 <i/> Hệ thống hoạt động ổn định</span></footer></div></main>
    </>:<PosApp products={products} filtered={filtered} categories={categories} category={category} setCategory={setCategory} search={search} setSearch={setSearch} cart={cart} addToCart={addToCart} updateQty={updateQty} subtotal={subtotal} total={total} discount={discount} setDiscount={setDiscount} payment={payment} setPayment={setPayment} cash={cash} setCash={setCash} change={change} checkout={checkout} online={online} setToast={setToast} loadProducts={loadProducts}/>}
    <div className="mode-switch"><button className={mode==='admin'?'selected':''} onClick={()=>switchMode('admin')}><LayoutDashboard size={14}/> Admin</button><button className={mode==='pos'?'selected':''} onClick={()=>switchMode('pos')}><ShoppingCart size={14}/> POS</button></div>
    {showAddProduct&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setShowAddProduct(false)}}><form className="modal" onSubmit={addProduct}><div className="modal-head"><div><h2>Thêm sản phẩm mới</h2><p>Nhập thông tin cơ bản của sản phẩm.</p></div><button type="button" className="icon-btn" onClick={()=>setShowAddProduct(false)}><X/></button></div><div className="form-grid"><label className="field full">Tên sản phẩm<input name="name" required placeholder="VD: Cà phê đen đá"/></label><label className="field">Mã SKU<input name="sku" required placeholder="CF-003"/></label><label className="field">Danh mục<select name="category"><option>Cà phê</option><option>Trà</option><option>Đá xay</option><option>Bánh</option><option>Khác</option></select></label><label className="field">Giá bán (₫)<input name="price" type="number" min="0" required placeholder="35000"/></label><label className="field">Tồn kho<input name="stock" type="number" min="0" required placeholder="50"/></label></div><div className="modal-actions"><button type="button" className="btn btn-outline" onClick={()=>setShowAddProduct(false)}>Hủy</button><button className="btn btn-primary"><Plus size={16}/> Lưu sản phẩm</button></div></form></div>}
    {showCheckout&&<div className="modal-backdrop"><div className="modal checkout-modal"><div className="modal-head"><div><h2>Tích hợp Backend</h2><p>Trạng thái thực tế theo source code hiện tại.</p></div><button className="icon-btn" onClick={()=>setShowCheckout(false)}><X/></button></div><div className="hint-box"><AlertTriangle size={16}/> Backend hiện có OrdersController và InventoryController, nhưng chưa có AuthController, ProductsController hoặc API danh sách đơn/báo cáo. Các chức năng đó chỉ là giao diện, không giả lập việc lưu dữ liệu.</div><div className="api-url">API Base URL: {apiBase}</div><div className="modal-actions"><button className="btn btn-outline" onClick={()=>setShowCheckout(false)}>Đóng</button><button className="btn btn-primary" onClick={()=>{setShowCheckout(false);checkApi()}}>Kiểm tra Backend</button></div></div></div>}
    {toast&&<div className="toast"><CheckCircle2 size={17}/>{toast}<button onClick={()=>setToast('')}><X size={14}/></button></div>}
  </div>
}
function Dashboard({orders,products,setPage}:{orders:any[],products:Product[],setPage:(s:string)=>void}){const low=products.filter(p=>p.stock<15);return <>
  <div className="stats-grid"><StatCard label="Doanh thu hôm nay" value="24.580.000 ₫" change="12,8%" positive icon={Wallet} tint="blue" note="So với hôm qua"/><StatCard label="Tổng đơn hàng" value="186" change="8,2%" positive icon={ShoppingBag} tint="purple" note="So với hôm qua"/><StatCard label="Sản phẩm đang bán" value={String(products.length).padStart(2,'0')} change="3 mới" positive icon={Package} tint="orange" note="Trong danh mục"/><StatCard label="Nhân viên hoạt động" value="12" change="2 ca" positive icon={Users} tint="green" note="Đang làm việc"/></div>
  <div className="dashboard-grid"><section className="panel revenue-panel"><div className="panel-head"><div><h3>Doanh thu bán hàng</h3><p>Hiệu suất kinh doanh theo thời gian</p></div><select className="select-small" defaultValue="7 ngày qua"><option>7 ngày qua</option><option>30 ngày qua</option><option>Hôm nay</option></select></div><div className="revenue-summary"><strong>168.420.000 ₫</strong><span className="trend-up"><TrendingUp size={14}/> 18,6%</span><small>Doanh thu trong 7 ngày</small></div><RevenueChart/></section><section className="panel channel-panel"><div className="panel-head"><div><h3>Kênh bán hàng</h3><p>Tỷ trọng doanh thu theo kênh</p></div><button className="icon-btn"><Ellipsis/></button></div><div className="donut-wrap"><div className="donut"><div><b>186</b><small>Đơn hàng</small></div></div></div><div className="legend-list"><div><i className="dot dot-blue"/><span>Tại cửa hàng</span><b>68%</b></div><div><i className="dot dot-purple"/><span>Online</span><b>24%</b></div><div><i className="dot dot-orange"/><span>Đối tác</span><b>8%</b></div></div></section></div>
  <div className="dashboard-grid lower-grid"><section className="panel"><div className="panel-head"><div><h3>Đơn hàng gần đây</h3><p>Các giao dịch mới nhất trong hệ thống</p></div><button className="text-link" onClick={()=>setPage('Đơn hàng')}>Xem tất cả <ChevronRight size={15}/></button></div><OrdersTable orders={orders.slice(0,4)}/></section><section className="panel stock-panel"><div className="panel-head"><div><h3>Cảnh báo tồn kho</h3><p>Sản phẩm sắp hết hàng</p></div><span className="warning-pill">{low.length} cảnh báo</span></div>{low.length?low.slice(0,4).map(p=><div className="stock-alert" key={p.id}><div className="stock-product"><div className="mini-product">{p.icon}</div><div><b>{p.name}</b><small>{p.sku}</small></div></div><div className="stock-level"><b>{p.stock}</b><small>Còn lại</small></div></div>):<div className="empty-state">Tất cả sản phẩm đang đủ tồn kho.</div>}<button className="text-link stock-link" onClick={()=>setPage('Kho hàng')}>Đi đến quản lý kho <ChevronRight size={15}/></button></section></div>
  </>}
function StatCard({label,value,change,positive,icon:Icon,tint,note}:{label:string,value:string,change:string,positive:boolean,icon:any,tint:string,note:string}){return <div className="stat-card"><div className="stat-top"><span>{label}</span><div className={`stat-icon ${tint}`}><Icon size={19}/></div></div><div className="stat-value">{value}</div><div className="stat-bottom"><span className={positive?'trend-up':'trend-down'}>{positive?<TrendingUp size={13}/>:<TrendingDown size={13}/>} {change}</span><small>{note}</small></div></div>}
function RevenueChart(){const vals=[35,48,40,65,54,78,60,86,72,92,68,82];return <div className="chart-area"><div className="chart-y"><span>30tr</span><span>20tr</span><span>10tr</span><span>0</span></div><div className="chart-content"><div className="chart-gridlines"><i/><i/><i/><i/></div><svg viewBox="0 0 660 190" preserveAspectRatio="none" className="line-chart"><defs><linearGradient id="fillRevenue" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#2563eb" stopOpacity=".18"/><stop offset="1" stopColor="#2563eb" stopOpacity="0"/></linearGradient></defs><path d={`M ${vals.map((v,i)=>`${i*60},${175-v*1.65}`).join(' L ')} L 660,190 L 0,190 Z`} fill="url(#fillRevenue)"/><polyline points={vals.map((v,i)=>`${i*60},${175-v*1.65}`).join(' ')} fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>{vals.map((v,i)=><circle key={i} cx={i*60} cy={175-v*1.65} r="3.5" fill="white" stroke="#2563eb" strokeWidth="2"/>)}</svg><div className="chart-x"><span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span></div></div></div>}
function OrdersTable({orders,onConfirm,onCancel}:{orders:OrderDto[],onConfirm?:(o:OrderDto)=>void,onCancel?:(o:OrderDto)=>void}){
  const label:Record<string,string>={Draft:'Nháp',Pending:'Chờ xác nhận',Confirmed:'Đã xác nhận',Cancelled:'Đã hủy',Rejected:'Bị từ chối'};
  const cls=(s:string)=>s==='Confirmed'?'success':s==='Pending'||s==='Draft'?'pending':'danger';
  if(!orders.length)return <div className="empty-state">Chưa có đơn nào trên thiết bị này. Đơn tạo từ POS sẽ hiện ở đây.</div>;
  return <div className="table-wrap"><table><thead><tr><th>MÃ ĐƠN HÀNG</th><th>KÊNH</th><th>THỜI GIAN</th><th>TỔNG TIỀN</th><th>TRẠNG THÁI</th>{onConfirm&&<th></th>}</tr></thead><tbody>{orders.map(o=>{const s=statusName(o.status);return <tr key={o.id}><td><b className="order-code">{o.orderNumber}</b></td><td>{o.source}</td><td className="muted-cell">{new Date(o.createdAt).toLocaleString('vi-VN')}</td><td><b>{money(o.totalAmount)}</b></td><td><span className={`status ${cls(s)}`}>{label[s]??s}</span></td>{onConfirm&&<td>{s==='Pending'&&<div className="row-actions"><button className="btn btn-primary" onClick={()=>onConfirm(o)}>Xác nhận</button><button className="btn btn-outline" onClick={()=>onCancel?.(o)}>Hủy</button></div>}</td>}</tr>})}</tbody></table></div>}
function ProductsPage({products,setShowAddProduct,editPrice}:{products:Product[],setShowAddProduct:(v:boolean)=>void,editPrice:(p:Product)=>void}){const [q,setQ]=useState('');return <section className="panel page-panel"><div className="toolbar"><div className="search-box"><Search size={17}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Tìm theo tên sản phẩm, SKU..."/></div><button className="btn btn-outline"><Filter size={15}/> Bộ lọc</button><button className="btn btn-outline"><Download size={15}/> Xuất file</button><button className="btn btn-primary" onClick={()=>setShowAddProduct(true)}><Plus size={16}/> Thêm sản phẩm</button></div><div className="table-wrap"><table><thead><tr><th>SẢN PHẨM</th><th>MÃ SKU</th><th>DANH MỤC</th><th>GIÁ BÁN</th><th>TỒN KHO</th><th>TRẠNG THÁI</th><th></th></tr></thead><tbody>{products.filter(p=>(p.name+p.sku).toLowerCase().includes(q.toLowerCase())).map(p=><tr key={p.id}><td><div className="table-product"><div className="mini-product">{p.icon}</div><b>{p.name}</b></div></td><td className="muted-cell">{p.sku}</td><td>{p.category}</td><td><button className="price-btn" title="Sửa giá hiển thị" onClick={()=>editPrice(p)}>{p.price?money(p.price):'Đặt giá'}</button></td><td><b>{p.stock}</b></td><td><span className={`status ${p.stock<10?'danger':p.stock<20?'pending':'success'}`}>{p.stock<10?'Sắp hết hàng':p.stock<20?'Sắp hết':'Đang bán'}</span></td><td><button className="icon-btn"><MoreHorizontal size={17}/></button></td></tr>)}</tbody></table></div><div className="table-foot">Hiển thị {products.length} sản phẩm <span>Trang 1 / 1 <button className="icon-btn"><ChevronLeft/></button><button className="icon-btn"><ChevronRight/></button></span></div></section>}

function InventoryPage({
  products,
  ledger,
  loadLedger,
  adjust,
  reload
}: {
  products: Product[];
  ledger: LedgerEntry[];
  loadLedger: () => void;
  adjust: (p: Product) => void;
  reload: () => void;
}) {
  const mv: Record<string, string> = {
    Reservation: 'Giữ hàng',
    Sale: 'Xuất bán',
    Release: 'Hoàn giữ hàng',
    Adjustment: 'Điều chỉnh tồn'
  };

  const rows = [...ledger]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 30);

  return (
    <>
      <div className="stats-grid three-stats">
        <StatCard
          label="Tổng SKU"
          value={String(products.length)}
          change="Đang quản lý"
          positive
          icon={Package}
          tint="blue"
          note="Chi nhánh hiện tại"
        />

        <StatCard
          label="Sắp hết hàng"
          value={String(products.filter(p => p.available < 15).length)}
          change="Cần nhập thêm"
          positive={false}
          icon={AlertTriangle}
          tint="orange"
          note="Ngưỡng cảnh báo 15"
        />

        <StatCard
          label="Tổng khả dụng"
          value={String(products.reduce((s, p) => s + p.available, 0))}
          change="Đơn vị"
          positive
          icon={Boxes}
          tint="green"
          note="On-hand − đã giữ"
        />
      </div>

      <section className="panel page-panel">
        <div className="panel-head">
          <div>
            <h3>Tồn kho theo sản phẩm</h3>
            <p>
              Số liệu từ GET /api/inventory/all của chi nhánh cấu hình trong .env
            </p>
          </div>

          <button className="btn btn-outline" onClick={reload}>
            <RefreshCw size={15} />
            Đồng bộ tồn kho
          </button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>SẢN PHẨM</th>
                <th>SKU</th>
                <th>TỒN THỰC TẾ</th>
                <th>ĐÃ GIỮ</th>
                <th>KHẢ DỤNG</th>
                <th>TRẠNG THÁI</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>
                    <div className="table-product">
                      <div className="mini-product">{p.icon}</div>
                      <b>{p.name}</b>
                    </div>
                  </td>

                  <td>{p.sku}</td>

                  <td>{p.onHand}</td>

                  <td>{p.reserved}</td>

                  <td>
                    <b>{p.available}</b>
                  </td>

                  <td>
                    <span
                      className={`status ${
                        p.available < 10
                          ? 'danger'
                          : p.available < 20
                          ? 'pending'
                          : 'success'
                      }`}
                    >
                      {p.available < 10
                        ? 'Sắp hết hàng'
                        : p.available < 20
                        ? 'Cần nhập'
                        : 'Ổn định'}
                    </span>
                  </td>

                  <td>
                    <button
                      className="btn btn-outline"
                      onClick={() => adjust(p)}
                    >
                      Điều chỉnh
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel ledger-panel">
        <div className="panel-head">
          <div>
            <h3>Nhật ký biến động kho</h3>
            <p>
              Ledger chỉ ghi nối tiếp, điều chỉnh bằng bút toán bù trừ
            </p>
          </div>

          <button className="btn btn-outline" onClick={loadLedger}>
            <RefreshCw size={15} />
            Tải sổ kho
          </button>
        </div>

        {rows.length ? (
          rows.map(l => (
            <div className="ledger-row" key={l.id}>
              <span
                className={`ledger-mark ${
                  l.movementType === 'Release' ? 'green' : 'blue'
                }`}
              >
                <ArrowLeftRight />
              </span>

              <div>
                <b>
                  {mv[l.movementType] ?? l.movementType}
                  {' · '}
                  {products.find(p => p.id === l.productId)?.name ??
                    l.productId.slice(0, 8)}
                </b>

                <small>
                  {l.orderId ? `Đơn ${l.orderId.slice(0, 8)} · ` : ''}
                  {new Date(l.createdAt).toLocaleString('vi-VN')}
                  {' · '}
                  tồn sau: {l.onHandAfter}, đã giữ: {l.reservedAfter}
                </small>
              </div>

              <strong>{l.quantity} đơn vị</strong>
            </div>
          ))
        ) : (
          <div className="empty-state">
            Chưa tải dữ liệu. Bấm "Tải sổ kho" để lấy từ backend.
          </div>
        )}
      </section>
    </>
  );
}
function OrdersPage({orders,refresh,onConfirm,onCancel}:{orders:OrderDto[],refresh:()=>void,onConfirm:(o:OrderDto)=>void,onCancel:(o:OrderDto)=>void}){return <section className="panel page-panel"><div className="toolbar"><button className="btn btn-outline" onClick={refresh}><RefreshCw size={15}/> Làm mới từ server</button><span className="muted-cell">Backend chưa có API danh sách đơn: trang này theo dõi các đơn tạo trên thiết bị này.</span></div><OrdersTable orders={orders} onConfirm={onConfirm} onCancel={onCancel}/><div className="table-foot">Tổng cộng {orders.length} đơn hàng</div></section>}
function ReportsPage(){return <><div className="stats-grid three-stats"><StatCard label="Doanh thu tháng" value="684.250.000 ₫" change="14,2%" positive icon={Wallet} tint="blue" note="So với tháng trước"/><StatCard label="Giá trị đơn trung bình" value="132.500 ₫" change="5,4%" positive icon={Receipt} tint="purple" note="AOV"/><StatCard label="Tỷ lệ hoàn tất" value="96,8%" change="2,1%" positive icon={Activity} tint="green" note="Trên tổng đơn hàng"/></div><div className="dashboard-grid"><section className="panel revenue-panel"><div className="panel-head"><div><h3>Xu hướng doanh thu</h3><p>Thống kê theo ngày trong tháng</p></div><button className="btn btn-outline">Tháng này <ChevronDown size={14}/></button></div><div className="revenue-summary"><strong>684.250.000 ₫</strong><span className="trend-up"><TrendingUp size={14}/> 14,2%</span></div><RevenueChart/></section><section className="panel"><div className="panel-head"><div><h3>Hiệu suất kênh</h3><p>Phân bổ doanh thu</p></div></div><div className="report-bars">{[['Tại cửa hàng',68],['Online',24],['Đối tác',8]].map(([n,v])=><div className="report-bar" key={String(n)}><div><span>{n}</span><b>{v}%</b></div><i><em style={{width:`${v}%`}}/></i></div>)}</div></section></div></>}
function BranchesPage(){return <section className="panel page-panel"><div className="panel-head"><div><h3>Danh sách chi nhánh</h3><p>Quản lý hoạt động của các cửa hàng trong tenant</p></div><button className="btn btn-primary"><Plus size={16}/> Thêm chi nhánh</button></div>{[['May Coffee · Quận 1','12 Nguyễn Huệ, Quận 1, TP.HCM','Đang hoạt động','08 nhân viên'],['May Coffee · Bình Thạnh','25 Điện Biên Phủ, Bình Thạnh, TP.HCM','Đang hoạt động','04 nhân viên'],['May Coffee · Thủ Đức','18 Võ Văn Ngân, TP. Thủ Đức','Tạm ngưng','—']].map((b,i)=><div className="branch-row" key={b[0]}><div className="branch-icon"><Store/></div><div className="branch-info"><b>{b[0]}</b><small>{b[1]}</small></div><span className={`status ${i===2?'pending':'success'}`}>{b[2]}</span><span className="muted-cell">{b[3]}</span><button className="icon-btn"><MoreHorizontal/></button></div>)}</section>}
function UsersPage(){return <section className="panel page-panel"><div className="panel-head"><div><h3>Tài khoản nhân viên</h3><p>Phân quyền theo vai trò và phạm vi chi nhánh</p></div><button className="btn btn-primary"><Plus size={16}/> Thêm nhân viên</button></div><div className="table-wrap"><table><thead><tr><th>NHÂN VIÊN</th><th>VAI TRÒ</th><th>CHI NHÁNH</th><th>TRẠNG THÁI</th></tr></thead><tbody>{[['Nguyễn Minh Anh','Quản lý','Quận 1','Đang hoạt động'],['Trần Hoàng','Thu ngân','Bình Thạnh','Đang hoạt động'],['Lê Thu Hà','Kho','Quận 1','Đang hoạt động'],['Phạm Quốc Bảo','Thu ngân','Thủ Đức','Tạm khóa']].map((u,i)=><tr key={u[0]}><td><div className="table-product"><div className="avatar small-avatar">{u[0].split(' ').slice(-2).map(x=>x[0]).join('')}</div><b>{u[0]}</b></div></td><td>{u[1]}</td><td>{u[2]}</td><td><span className={`status ${i===3?'pending':'success'}`}>{u[3]}</span></td></tr>)}</tbody></table></div><div className="hint-box"><AlertTriangle size={16}/> Danh sách minh họa UI. Dữ liệu nhân viên và quyền RBAC cần kết nối API tương ứng.</div></section>}
function SettingsPage({apiStatus,apiNote,checkApi}:{apiStatus:string,apiNote:string,checkApi:()=>void}){return <div className="settings-grid"><section className="panel settings-panel"><h3>Thông tin doanh nghiệp</h3><p>Cấu hình tenant và thông tin hiển thị trên hóa đơn.</p><label className="field">Tên doanh nghiệp<input defaultValue="May Coffee"/></label><label className="field">Múi giờ<select defaultValue="Asia/Ho_Chi_Minh"><option value="Asia/Ho_Chi_Minh">(GMT+7) Hồ Chí Minh</option></select></label><label className="field">Đơn vị tiền tệ<input defaultValue="VND · Việt Nam Đồng" disabled/></label><button className="btn btn-primary" onClick={()=>alert('Cấu hình mẫu chưa được lưu qua API.')}>Lưu thay đổi</button></section><section className="panel settings-panel"><h3>Kết nối hệ thống</h3><p>Trạng thái API và cấu hình môi trường.</p><div className="connection-row"><span>Backend API</span><span className={`status ${apiStatus==='connected'?'success':apiStatus==='offline'?'danger':'pending'}`}>{apiStatus==='connected'?'Đã kết nối':apiStatus==='offline'?'Chưa kết nối':'Chưa kiểm tra'}</span></div><div className="api-url">{apiBase}</div>{apiNote&&<small className="muted-cell">{apiNote}</small>}<button className="btn btn-outline" onClick={checkApi}><RefreshCw size={15}/> Kiểm tra kết nối</button><div className="hint-box"><AlertTriangle size={16}/> Thiết lập VITE_API_BASE_URL trong file .env để trỏ tới backend của bạn.</div></section></div>}
function PosApp({products,filtered,categories,category,setCategory,search,setSearch,cart,addToCart,updateQty,subtotal,total,discount,setDiscount,payment,setPayment,cash,setCash,change,checkout,online,setToast,loadProducts}:{products:Product[],filtered:Product[],categories:string[],category:string,setCategory:(s:string)=>void,search:string,setSearch:(s:string)=>void,cart:CartLine[],addToCart:(p:Product)=>void,updateQty:(id:string,d:number)=>void,subtotal:number,total:number,discount:number,setDiscount:(n:number)=>void,payment:string,setPayment:(s:string)=>void,cash:string,setCash:(s:string)=>void,change:number,checkout:()=>void,online:boolean,setToast:(s:string)=>void,loadProducts:()=>void}){
 const [posPage,setPosPage]=useState('Bán hàng');const [cartOpen,setCartOpen]=useState(false);const [scan,setScan]=useState(false);const [customer,setCustomer]=useState('Khách lẻ');const [cashInput,setCashInput]=useState(false);
 const payOptions=[{name:'Tiền mặt',Icon:Banknote},{name:'Chuyển khoản',Icon:ArrowLeftRight},{name:'Thẻ ATM',Icon:CreditCard}];
 return <div className="pos-layout"><aside className="pos-sidebar"><div className="pos-brand"><div className="brand-mark"><ShoppingCart size={20}/></div><div><b>OISM POS</b><small>POINT OF SALE</small></div></div><div className="pos-branch"><div className="branch-icon"><Store size={17}/></div><div><b>May Coffee</b><small>Chi nhánh Quận 1</small></div><ChevronDown size={14}/></div><div className="pos-nav-title">MENU CHÍNH</div>{[['Trang chủ',LayoutDashboard],['Bán hàng',ShoppingCart],['Sản phẩm',Package],['Khách hàng',Users],['Báo cáo',BarChart3],['Đồng bộ dữ liệu',RefreshCw]].map(([n,I]:any)=><button key={n} className={`pos-nav-item ${posPage===n?'active':''}`} onClick={()=>{setPosPage(n);if(n!=='Bán hàng')setToast(`${n}: màn hình đang ở chế độ giao diện nền tảng`)}}><I size={18}/>{n}{n==='Đồng bộ dữ liệu'&&<span className="sync-dot"/>}</button>)}<div className="pos-sidebar-bottom"><div className="shift-card"><div><span>CA LÀM VIỆC</span><b>Ca sáng · 08:00 – 16:00</b></div><Clock3 size={17}/><small>POS-01 · Thu ngân</small></div><div className="profile-row"><div className="avatar">TH</div><div><b>Trần Hoàng</b><small>Thu ngân</small></div><MoreHorizontal size={17}/></div></div></aside>
 <main className="pos-main"><header className="pos-topbar"><div className="pos-title"><div><h1>{posPage==='Bán hàng'?'Bán hàng':posPage}</h1><p>Đơn hàng mới <span>•</span> {new Date().toLocaleDateString('vi-VN')}</p></div></div><div className="pos-top-actions"><span className={`network-pill ${online?'online':'offline'}`}>{online?<Wifi size={14}/>:<WifiOff size={14}/>} {online?'Đang trực tuyến':'Ngoại tuyến'}</span><button className="icon-btn" onClick={loadProducts}><RefreshCw size={17}/></button><button className="icon-btn"><Bell size={17}/></button><div className="top-avatar">TH</div></div></header>
 <div className="pos-workspace"><section className="catalog-area"><div className="catalog-tools"><div className="pos-search"><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm tên sản phẩm hoặc quét mã SKU..."/><button title="Quét mã vạch" onClick={()=>setScan(!scan)}><ScanBarcode size={19}/></button></div><button className="icon-btn filter-btn" onClick={()=>setToast('Bộ lọc nâng cao đang được cập nhật')}><SlidersHorizontal size={18}/></button></div>{scan&&<div className="scan-notice"><ScanBarcode size={18}/> Chế độ nhập mã SKU: nhập mã vào ô tìm kiếm để tìm nhanh sản phẩm. <button onClick={()=>setScan(false)}><X size={15}/></button></div>}<div className="category-row">{categories.map(c=><button key={c} onClick={()=>setCategory(c)} className={category===c?'selected':''}>{c}</button>)}</div><div className="catalog-heading"><div><h3>Danh sách sản phẩm</h3><span>{filtered.length} sản phẩm</span></div><button className="text-link" onClick={()=>setToast('Đang hiển thị toàn bộ sản phẩm')}>Xem tất cả <ChevronRight size={14}/></button></div><div className="pos-product-grid">{filtered.map(p=><article className="pos-product-card" key={p.id}><div className={`product-art ${p.color}`}><span>{p.icon}</span><small>{p.category}</small></div><div className="product-card-info"><div><b>{p.name}</b><small>{p.sku}</small></div><div className="product-card-bottom"><strong>{p.price?money(p.price):'Chưa có giá'}</strong><span className={p.stock<10?'stock-low':''}>Kho: {p.stock}</span></div><button className="get-btn" disabled={p.stock<=0} onClick={()=>addToCart(p)}><Plus size={15}/> THÊM</button></div></article>)}</div>{filtered.length===0&&<div className="empty-state">Không tìm thấy sản phẩm phù hợp.</div>}</section>
 <aside className={`cart-panel ${cartOpen?'cart-open':''}`}><div className="cart-header"><div><h3>Đơn hàng hiện tại</h3><span>#{`ORD-${new Date().getTime().toString().slice(-6)}`}</span></div><button className="icon-btn cart-close" onClick={()=>setCartOpen(false)}><X/></button><button className="icon-btn" onClick={()=>{if(confirm('Xóa toàn bộ giỏ hàng?'))cart.forEach(x=>updateQty(x.id,-x.qty))}}><Trash2 size={17}/></button></div><label className="customer-select"><Users size={16}/><select value={customer} onChange={e=>setCustomer(e.target.value)}><option>Khách lẻ</option><option>Khách thành viên</option></select><ChevronDown size={14}/></label><div className="cart-items">{cart.length?cart.map(p=><div className="cart-item" key={p.id}><div className="cart-thumb">{p.icon}</div><div className="cart-item-main"><b>{p.name}</b><small>{money(p.price)}</small><div className="qty-control"><button onClick={()=>updateQty(p.id,-1)}><Minus size={13}/></button><span>{p.qty}</span><button onClick={()=>updateQty(p.id,1)}><Plus size={13}/></button></div></div><strong>{money(p.price*p.qty)}</strong></div>):<div className="cart-empty"><div><ShoppingCart size={27}/></div><b>Chưa có sản phẩm</b><span>Chọn sản phẩm để thêm vào đơn hàng</span></div>}</div><div className="cart-summary"><div className="summary-line"><span>Tạm tính ({cart.reduce((s,p)=>s+p.qty,0)} sản phẩm)</span><b>{money(subtotal)}</b></div><div className="summary-line"><span>Giảm giá</span><button className="discount-btn" onClick={()=>setDiscount(discount?0:10000)}>{discount?`-${money(discount)}`:'Thêm giảm giá'}</button></div><div className="summary-line"><span>Thuế</span><span>Đã bao gồm</span></div><div className="summary-total"><b>Tổng thanh toán</b><strong>{money(total)}</strong></div></div><div className="payment-area"><div className="payment-label">PHƯƠNG THỨC THANH TOÁN</div><div className="payment-options">{payOptions.map(({name,Icon})=><button key={name} className={payment===name?'active':''} onClick={()=>setPayment(name)}><Icon size={17}/><span>{name}</span></button>)}</div>{payment==='Tiền mặt'&&<div className="cash-area"><div className="cash-label"><span>Tiền khách đưa</span><button onClick={()=>setCash('')}>Xóa</button></div><input type="number" value={cash} onChange={e=>setCash(e.target.value)} placeholder="Nhập số tiền khách đưa"/><div className="cash-presets">{[50000,100000,200000,500000].map(n=><button key={n} onClick={()=>setCash(String(n))}>{n/1000}k</button>)}</div>{Number(cash)>0&&<div className="change-row"><span>Tiền thừa trả khách</span><b>{money(change)}</b></div>}</div>}{payment==='Chuyển khoản'&&<div className="qr-hint"><div className="qr-fake">▦</div><span>QR thanh toán sẽ được tạo khi tích hợp cổng thanh toán.</span></div>}<button className="checkout-btn" disabled={!cart.length||(payment==='Tiền mặt'&&Number(cash)>0&&Number(cash)<total)} onClick={checkout}><CreditCard size={18}/> THANH TOÁN <span>{money(total)}</span></button><div className="checkout-note"><CheckCircle2 size={13}/> Giao dịch được xác nhận sau khi API phản hồi</div></div></aside></div><div className="pos-bottom"><span><span className="sync-dot"/> Dữ liệu sản phẩm hiển thị {products.length} SKU</span><span>OISM POS · Phiên bản 1.0.0</span></div></main><button className="mobile-cart-fab" onClick={()=>setCartOpen(true)}><ShoppingCart size={19}/> Giỏ hàng <b>{cart.reduce((s,p)=>s+p.qty,0)}</b><strong>{money(total)}</strong></button></div>
}
export default App;
