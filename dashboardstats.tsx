export function DashboardStats() {
  const stats = {
    revenue: 15450000,
    cogs: 9200000,
    profit: 6250000,
    orders: 28,
  };
  const formatVND = (n: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
      <div style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '8px', border: '1px solid #334155' }}>
        <span style={{ color: '#94a3b8', fontSize: '13px' }}>Doanh Thu Thuần</span>
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#34d399', marginTop: '6px' }}>{formatVND(stats.revenue)}</div>
      </div>
      <div style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '8px', border: '1px solid #334155' }}>
        <span style={{ color: '#94a3b8', fontSize: '13px' }}>Tổng Giá Vốn (COGS WAC)</span>
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fbbf24', marginTop: '6px' }}>{formatVND(stats.cogs)}</div>
      </div>
      <div style={{ backgroundColor: '#1e1b4b', padding: '16px', borderRadius: '8px', border: '1px solid #6366f1' }}>
        <span style={{ color: '#c7d2fe', fontSize: '13px' }}>Lợi Nhuận Gộp</span>
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#a5b4fc', marginTop: '6px' }}>{formatVND(stats.profit)}</div>
      </div>
      <div style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '8px', border: '1px solid #334155' }}>
        <span style={{ color: '#94a3b8', fontSize: '13px' }}>Đơn Hoàn Tất</span>
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff', marginTop: '6px' }}>{stats.orders}</div>
      </div>
    </div>
  );
}