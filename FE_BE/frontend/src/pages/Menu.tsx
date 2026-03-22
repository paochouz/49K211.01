import React from 'react';
import { LayoutDashboard, ClipboardList, Users, Shirt, Settings, LogOut } from 'lucide-react';

export default function Menu() {
  const userRole = localStorage.getItem("userRole"); 
  const isOwner = userRole === "chucuahang";

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <nav style={styles.nav}>
      {/* Logo Section */}
       <div style={styles.logoSection}>
       <div style={styles.logoIcon}>CT</div>
       <span style={styles.logoText}>Tiệm Cô Thắm</span> 
      </div>

      <div style={styles.menuGroups}>
        <MenuItem name="Trang chủ" icon={<LayoutDashboard size={20} />} isActive />
        <MenuItem name="Quản lý đơn thuê" icon={<ClipboardList size={20} />} />
        <MenuItem name="Quản lý khách hàng" icon={<Users size={20} />} />
       
        {isOwner && (
          <div style={styles.ownerSection}>
            <MenuItem name="Quản Lý Trang Phục" icon={<Shirt size={20} />} />
            <MenuItem name="Cấu Hình Phạt" icon={<Settings size={20} />} />
          </div>
        )}
      </div>

      <button onClick={handleLogout} style={styles.logoutBtn}>
        <LogOut size={20} />
        <span style={{ fontWeight: '500' }}>Đăng xuất</span>
      </button>
    </nav>
  );
}

function MenuItem({ name, icon, isActive }: any) {
  return (
    <div style={{
      ...styles.menuItem,
      backgroundColor: isActive ? '#2563eb' : 'transparent',
      color: isActive ? '#fff' : '#64748b',
      boxShadow: isActive ? '0 10px 15px -3px rgba(37, 99, 235, 0.2)' : 'none'
    }}>
      {icon}
      <span style={{ fontWeight: '500', fontSize: '14px' }}>{name}</span>
    </div>
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
    fontFamily: 'sans-serif'
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '32px',
    padding: '0 8px'
  },
  logoIcon: {
    backgroundColor: '#2563eb',
    color: '#fff',
    padding: '6px 10px',
    borderRadius: '8px',
    fontWeight: 'bold'
  },
  logoText: {
    fontWeight: 'bold',
    fontSize: '18px',
    color: '#1e293b',
    letterSpacing: '-0.5px'
  },
  menuGroups: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  ownerSection: {
    marginTop: '4px',
    paddingTop: '4px',
    borderTop: '1px solid #f1f5f9',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  sectionTitle: {
    fontSize: '10px',
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    padding: '0 12px',
    marginBottom: '8px'
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
    textAlign: 'left'
  }
};