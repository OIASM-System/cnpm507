export function StockAlertTable() {
  const lowStock = [
    { sku: 'AO-PHONG-DEN-L', name: 'Áo phông đen trơn Size L', available: 3, min: 10 },
    { sku: 'QUAN-JEAN-32', name: 'Quần Jean Slimfit Size 32', available: 5, min: 10 },
    { sku: 'SO-MI-TRANG-XL', name: 'Áo sơ mi Oxford Trắng XL', available: 1, min: 8 },
  ];
  return (
    <div style={{ backgroundColor: '#1e293b', borderRadius: '8px', border: '1px solid #334155', overflow: 'hidden' }}>
      <div style={{ padding: '16px', borderBottom: '1px solid #334155', fontWeight: 'bold', color: '#f87171' }}>
        ⚠️ Cảnh Báo Tồn Kho Dưới Ngưỡng (FR-REP-03)
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
        <thead>
          <tr style={{ backgroundColor: '#0f172a', color: '#94a3b8' }}>
            <th style={{ padding: '10px 16px' }}>SKU</th>
            <th style={{ padding: '10px 16px' }}>Sản phẩm</th>
            <th style={{ padding: '10px 16px', textAlign: 'center' }}>Tồn khả dụng</th>
            <th style={{ padding: '10px 16px', textAlign: 'right' }}>Khuyến nghị</th>
          </tr>
        </thead>
        <tbody>
          {lowStock.map((i) => (
            <tr key={i.sku} style={{ borderBottom: '1px solid #334155' }}>
              <td style={{ padding: '12px 16px', color: '#a5b4fc', fontFamily: 'monospace' }}>{i.sku}</td>
              <td style={{ padding: '12px 16px', color: '#fff' }}>{i.name}</td>
              <td style={{ padding: '12px 16px', textAlign: 'center', color: '#f87171', fontWeight: 'bold' }}>{i.available} cái</td>
              <td style={{ padding: '12px 16px', textAlign: 'right', color: '#fbbf24' }}>Cần lập phiếu nhập</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}