import { useState } from 'react';
export function LoginPage({ onLoginSuccess }: { onLoginSuccess: (user: any) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const handleLogin = (e: any) => {
    e.preventDefault();
    onLoginSuccess({
      role: email.includes('cashier') ? 'Cashier' : 'Owner',
      email: email || 'owner@oism.vn',
      tenantId: '11111111-1111-1111-1111-111111111111'
    });
  };
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', color: '#fff', fontFamily: 'sans-serif' }}>
      <div style={{ width: '360px', padding: '30px', backgroundColor: '#1e293b', borderRadius: '10px', border: '1px solid #334155' }}>
        <h2 style={{ textAlign: 'center', margin: '0 0 20px 0' }}>OISM ĐĂNG NHẬP</h2>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ fontSize: '13px', color: '#94a3b8' }}>Tài khoản:</label>
            <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="owner@oism.vn" style={{ width: '100%', boxSizing: 'border-box', padding: '10px', marginTop: '5px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff' }} />
          </div>
          <div>
            <label style={{ fontSize: '13px', color: '#94a3b8' }}>Mật khẩu:</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={{ width: '100%', boxSizing: 'border-box', padding: '10px', marginTop: '5px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff' }} />
          </div>
          <button type="submit" style={{ padding: '10px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Đăng Nhập</button>
        </form>
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <button type="button" onClick={() => { setEmail('owner@oism.vn'); setPassword('123456'); }} style={{ flex: 1, padding: '6px', backgroundColor: '#334155', color: '#cbd5e1', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Chủ shop</button>
          <button type="button" onClick={() => { setEmail('cashier@oism.vn'); setPassword('123456'); }} style={{ flex: 1, padding: '6px', backgroundColor: '#334155', color: '#cbd5e1', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Thu ngân</button>
        </div>
      </div>
    </div>
  );
}