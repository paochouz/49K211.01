import React, { useState, useEffect } from 'react';
import { LayoutDashboard, ClipboardList, Users, Shirt, Settings, LogOut, Save, AlertCircle, CheckCircle2 } from 'lucide-react';

interface CauHinhPhat {
  tyLePhatQuaHan: number;
  moTaQuyDinh: string;
  trangThaiApDung: boolean;
}

// --- Sidebar Menu (Đã sửa size và màu khớp màn Khách hàng) ---
function Menu() {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <nav style={menuStyles.nav}>
      <div style={menuStyles.logoSection}>
        <div style={menuStyles.logoIcon}>CT</div>
        <span style={menuStyles.logoText}>Tiệm Cô Thắm</span>
      </div>

      <div style={menuStyles.menuGroups}>
        <MenuItem name="Trang chủ" icon={<LayoutDashboard size={20} />} link="/" />
        <MenuItem name="Quản lý đơn thuê" icon={<ClipboardList size={20} />} link="/tra-do" />
        <MenuItem name="Quản lý khách hàng" icon={<Users size={20} />} link="/quan-ly-khach-hang" />
        <MenuItem name="Quản lý Trang phục" icon={<Shirt size={20} />} link="/costumes" />
        <MenuItem name="Cấu hình phạt" icon={<Settings size={20} />} link="/admin/cau-hinh-phat" isActive={true} />
      </div>

      <button onClick={handleLogout} style={menuStyles.logoutBtn}>
        <LogOut size={20} />
        <span style={{ fontWeight: '600', fontSize: '15px', marginLeft: '12px' }}>Đăng xuất</span>
      </button>
    </nav>
  );
}

function MenuItem({ name, icon, isActive, link }: any) {
  return (
    <a href={link} style={{
      ...menuStyles.menuItem,
      backgroundColor: isActive ? '#4361EE' : 'transparent',
      textDecoration: 'none'
    }}>
      <div style={{ color: isActive ? '#fff' : '#94a3b8', display: 'flex', alignItems: 'center' }}>
        {icon}
      </div>
      <span style={{ fontWeight: isActive ? '600' : '500', fontSize: '15px', color: isActive ? '#fff' : '#94a3b8' }}>
        {name}
      </span>
    </a>
  );
}

// --- Main Page Component (GIỮ NGUYÊN HOÀN TOÀN LOGIC VÀ UI GỐC) ---
const PenaltyConfigPage = () => {
  const [config, setConfig] = useState<CauHinhPhat>({
    tyLePhatQuaHan: 0,
    moTaQuyDinh: '',
    trangThaiApDung: false
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch('http://localhost:3003/api/penalty-config');
      const result = await res.json();
      if (res.ok && result.data) {
        setConfig(result.data);
      }
    } catch (err) {
      console.error("Lỗi tải API");
    }
  };

  const handleSave = async () => {
    if (config.tyLePhatQuaHan < 0 || config.tyLePhatQuaHan > 100) {
      setMessage({ text: 'Tỷ lệ phạt phải từ 0% đến 100%', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:3003/api/penalty-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const result = await res.json();
      if (res.ok) {
        setMessage({ text: 'Lưu cấu hình thành công!', type: 'success' });
        setConfig(result.data);
      } else {
        setMessage({ text: result.message || 'Lỗi lưu dữ liệu', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Lỗi kết nối server (3003)!', type: 'error' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#F8FAFC', boxSizing: 'border-box', overflow: 'hidden' }}>
      <style>{`
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
        * { font-family: 'Inter', sans-serif !important; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
      `}</style>

      {/* Sửa width aside thành 260px cho khớp màn khách hàng */}
      <aside style={{ width: '260px', flexShrink: 0 }}><Menu /></aside>

      <main style={{ flex: 1, padding: '40px 60px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '100%' }}> 
          <header style={{ marginBottom: '40px' }}>
            <h1 style={{ fontSize: '36px', fontWeight: '800', color: '#0F172A', margin: 0 }}>Cấu hình phạt</h1>
            <p style={{ fontSize: '18px', color: '#64748B', marginTop: '8px' }}>Thiết lập quy định phí phạt trả trễ hạn cho hệ thống </p>
          </header>

          <section style={cardStyle}>
            <label style={labelStyle}>Tỷ lệ phạt quá hạn (%/ngày) <span style={{ color: '#EF4444' }}>*</span></label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                value={config.tyLePhatQuaHan === 0 ? '' : config.tyLePhatQuaHan}
                onChange={(e) => setConfig({ ...config, tyLePhatQuaHan: e.target.value === '' ? 0 : Number(e.target.value) })}
                style={inputStyle}
                placeholder="0"
              />
              <span style={{ position: 'absolute', right: '24px', top: '16px', fontWeight: '700', color: '#64748B', fontSize: '20px' }}>%</span>
            </div>
          </section>

          <section style={cardStyle}>
            <label style={labelStyle}>Mô tả quy định (Hiển thị trên hóa đơn)</label>
            <textarea
              value={config.moTaQuyDinh}
              onChange={(e) => setConfig({ ...config, moTaQuyDinh: e.target.value })}
              style={textareaStyle}
              placeholder="Ví dụ: Quý khách trả trễ sẽ bị tính phí 10%/ngày..."
            />
          </section>

          <section 
            style={{
              ...cardStyle,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              backgroundColor: config.trangThaiApDung ? '#F0FDF4' : '#F8FAFC',
              borderColor: config.trangThaiApDung ? '#22C55E' : '#E5E7EB',
              cursor: 'pointer',
              padding: '30px'
            }}
            onClick={() => setConfig({ ...config, trangThaiApDung: !config.trangThaiApDung })}
          >
            <div>
              <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '20px' }}>Trạng thái áp dụng</div>
              <div style={{ fontSize: '16px', color: '#64748B', marginTop: '6px' }}>
                {config.trangThaiApDung ? 'BẬT - Hệ thống tự động tính phạt' : 'TẮT - Phí trễ mặc định = 0'}
              </div>
            </div>
            <div style={{ 
              width: '60px', height: '32px', borderRadius: '16px', padding: '4px', 
              backgroundColor: config.trangThaiApDung ? '#22C55E' : '#CBD5E1', 
              transition: 'all 0.3s ease', position: 'relative'
            }}>
              <div style={{ 
                width: '24px', height: '24px', backgroundColor: '#fff', borderRadius: '50%', 
                transform: config.trangThaiApDung ? 'translateX(28px)' : 'translateX(0)', 
                transition: 'all 0.3s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }} />
            </div>
          </section>

          <div style={{ marginTop: '40px' }}>
            {message && (
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 24px', borderRadius: '12px', marginBottom: '20px',
                backgroundColor: message.type === 'success' ? '#DCFCE7' : '#FEE2E2',
                color: message.type === 'success' ? '#166534' : '#991B1B',
                border: `1px solid ${message.type === 'success' ? '#22C55E' : '#EF4444'}`,
                fontSize: '16px'
              }}>
                {message.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                <span style={{ fontWeight: '700' }}>{message.text}</span>
              </div>
            )}

            <button 
              onClick={handleSave} 
              disabled={loading}
              style={{ 
                width: '100%', height: '64px', backgroundColor: '#2563EB', color: '#fff', border: 'none', 
                borderRadius: '16px', fontWeight: '800', fontSize: '20px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                opacity: loading ? 0.7 : 1, transition: '0.2s',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
              }}
            >
              <Save size={28} />
              Lưu cấu hình phạt
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

// --- Styles cho Card và Input (GIỮ NGUYÊN NHƯ FILE GỐC CỦA BẠN) ---
const cardStyle: React.CSSProperties = { 
  backgroundColor: '#FFFFFF', padding: '32px', borderRadius: '20px', 
  border: '1px solid #E5E7EB', marginBottom: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', 
  boxSizing: 'border-box', width: '100%' 
};

const labelStyle: React.CSSProperties = { display: 'block', fontSize: '18px', fontWeight: '800', color: '#0F172A', marginBottom: '16px' };
const inputStyle: React.CSSProperties = { width: '100%', height: '64px', borderRadius: '12px', border: '2px solid #E5E7EB', padding: '0 24px', fontSize: '22px', fontWeight: '700', outline: 'none', boxSizing: 'border-box', color: '#2563EB' };
const textareaStyle: React.CSSProperties = { width: '100%', minHeight: '140px', borderRadius: '12px', border: '2px solid #E5E7EB', padding: '20px 24px', fontSize: '18px', fontFamily: 'Inter, sans-serif', resize: 'none', boxSizing: 'border-box', outline: 'none', lineHeight: '1.5', color: '#1E293B' };

// --- Menu Styles (Cập nhật thông số từ màn Khách hàng) ---
const menuStyles: Record<string, React.CSSProperties> = {
  nav: { 
    display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#fff', 
    borderRight: '1px solid #f1f5f9', padding: '24px 16px', boxSizing: 'border-box' 
  },
  logoSection: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', paddingLeft: '8px' },
  logoIcon: { 
    backgroundColor: '#4361EE', color: '#fff', width: '40px', height: '40px', 
    borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
    fontWeight: 'bold', fontSize: '18px' 
  },
  logoText: { fontWeight: '700', fontSize: '19px', color: '#1E293B' },
  menuGroups: { flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' },
  menuItem: { 
    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', 
    borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' 
  },
  logoutBtn: { 
    display: 'flex', alignItems: 'center', color: '#EF4444', backgroundColor: 'transparent', 
    border: 'none', cursor: 'pointer', marginTop: 'auto', padding: '12px 16px', 
    fontSize: '15px', fontWeight: '600', borderRadius: '12px' 
  }
};

export default PenaltyConfigPage;