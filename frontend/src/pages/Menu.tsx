import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ClipboardList, Users, Shirt, Settings, LogOut } from 'lucide-react';
import { isOwner } from '../hooks/useAuth';

const allMenuItems = [
  { name: 'Quản lý đơn thuê', path: '/don-thue', ownerOnly: false },
  { name: 'Quản lý khách hàng', path: '/khach-hang', ownerOnly: false },
  { name: 'Quản lý trang phục', path: '/trang-phuc', ownerOnly: false },
  { name: 'Cấu hình phạt', path: '/cau-hinh-phat', ownerOnly: true },
];

const menuIcons: Record<string, React.ReactNode> = {
  '/don-thue': <ClipboardList size={20} />,
  '/khach-hang': <Users size={20} />,
  '/trang-phuc': <Shirt size={20} />,
  '/cau-hinh-phat': <Settings size={20} />,
};

export default function Menu() {
  const navigate = useNavigate();
  const location = useLocation();
  const owner = isOwner();
  const menuItems = allMenuItems.filter(item => !item.ownerOnly || owner);

  const roleLabel = owner ? 'Chủ cửa hàng' : 'Nhân viên';

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.logoSection}>
        <div style={styles.logoIcon}>CT</div>
        <span style={styles.logoText}>Tiệm Cô Thắm</span>
      </div>

      {/* Role badge */}
      <div style={{ margin: '0 8px 20px', textAlign: 'center' }}>
        <span style={{
          display: 'inline-block',
          padding: '5px 16px',
          borderRadius: '20px',
          fontSize: '13px',
          fontWeight: 600,
          background: owner ? '#eff6ff' : '#f0fdf4',
          color: owner ? '#2563eb' : '#16a34a',
        }}>{roleLabel}</span>
      </div>

      <div style={styles.menuGroups}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <div
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                ...styles.menuItem,
                backgroundColor: isActive ? '#2563eb' : 'transparent',
                color: isActive ? '#fff' : '#64748b',
                boxShadow: isActive ? '0 10px 15px -3px rgba(37, 99, 235, 0.2)' : 'none',
              }}
            >
              {menuIcons[item.path]}
              <span style={{ fontWeight: '500', fontSize: '14px' }}>{item.name}</span>
            </div>
          );
        })}
      </div>

      <button onClick={handleLogout} style={styles.logoutBtn}>
        <LogOut size={20} />
        <span style={{ fontWeight: '500' }}>Đăng xuất</span>
      </button>
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: '#fff',
    borderRight: '1px solid #f1f5f9',
    padding: '24px 16px',
    fontFamily: 'sans-serif',
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '32px',
    padding: '0 8px',
  },
  logoIcon: {
    backgroundColor: '#2563eb',
    color: '#fff',
    padding: '6px 10px',
    borderRadius: '8px',
    fontWeight: 'bold',
  },
  logoText: {
    fontWeight: 'bold',
    fontSize: '15px',
    color: '#1e293b',
    letterSpacing: '-0.5px',
    whiteSpace: 'nowrap',
  },
  menuGroups: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    color: '#ef4444',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    marginTop: 'auto',
    borderRadius: '12px',
    textAlign: 'left',
  },
};
