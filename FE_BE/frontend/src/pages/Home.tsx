
import React, { useEffect, useState } from 'react';
import { ShoppingCart, Banknote, Clock3, AlertTriangle, PlusCircle, CalendarDays, CheckCircle2, UserPlus } from 'lucide-react';
import axios from 'axios';

// 1. Định nghĩa kiểu dữ liệu
interface DashboardData {
  donThueHomNay: number;
  doanhThuHomNay: number;
  donDangThue: number;
  donQuaHan: number;
}

export default function Home() {
  const username = localStorage.getItem("username") || "Bạn"; 
  const userRole = localStorage.getItem("userRole");
  const isOwner = userRole === "chucuahang";

  const [data, setData] = useState<DashboardData>({
    donThueHomNay: 0,
    doanhThuHomNay: 0,
    donDangThue: 0,
    donQuaHan: 0
  });

  // 2. Gọi API từ Backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('http://localhost:3002/api/dashboard/summary');
        if (response.data) {
          setData(response.data);
        }
      } catch (error) {
        console.error("Lỗi kết nối Backend:", error);
      }
    };

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (value: number) => {
    if (!value) return "0 VNĐ";
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M VNĐ`;
    return `${value.toLocaleString('vi-VN')} VNĐ`;
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Chào mừng, {username}!</h1>
        <div style={{
            ...styles.badge,
            backgroundColor: isOwner ? '#eff6ff' : '#f0fdf4', 
            color: isOwner ? '#2563eb' : '#16a34a',
            border: isOwner ? '1px solid #dbeafe' : '1px solid #dcfce7'
          }}>
            {isOwner ? "Chủ cửa hàng" : "Nhân viên"}
          </div>
      </div>

      <div style={styles.statGrid}>
        <StatCard 
          icon={<ShoppingCart size={24} />} 
          label="Đơn thuê hôm nay" 
          value={(data?.donThueHomNay || 0).toString()} 
          iconBgColor="#e0f2fe" 
          iconColor="#0ea5e9"
        />
        <StatCard 
          icon={<Banknote size={24} />} 
          label="Doanh thu hôm nay" 
          value={formatCurrency(data?.doanhThuHomNay || 0)} 
          iconBgColor="#d1fae5" 
          iconColor="#10b981"
        />
        <StatCard 
          icon={<Clock3 size={24} />} 
          label="Đơn đang thuê" 
          value={(data?.donDangThue || 0).toString()} 
          iconBgColor="#fef3c7" 
          iconColor="#f59e0b"
        />
        <StatCard 
          icon={<AlertTriangle size={24} />} 
          label="Đơn quá hạn" 
          value={(data?.donQuaHan || 0).toString()} 
          iconBgColor="#fee2e2" 
          iconColor="#ef4444"
        />
      </div>

      <div style={styles.quickActionSection}>
        <h2 style={styles.sectionTitle}>Thao tác nhanh</h2>
        <div style={styles.actionGrid}>
          <ActionButton icon={<PlusCircle size={24} />} label="Tạo đơn nhanh" color="#007bff" bgColor="#e0f2fe" />
          <ActionButton icon={<CalendarDays size={24} />} label="Danh sách đơn trễ" color="#ef4444" bgColor="#fee2e2" />
          <ActionButton icon={<CheckCircle2 size={24} />} label="Xác nhận trả hàng" color="#10b981" bgColor="#d1fae5" />
          <ActionButton icon={<UserPlus size={24} />} label="Thêm khách hàng" color="#8b5cf6" bgColor="#ede9fe" />
        </div>
      </div>
    </div>
  );
}

// 3. Component phụ
function StatCard({ icon, label, value, iconBgColor, iconColor }: any) {
  return (
    <div style={styles.statCard}>
      <div style={{ ...styles.statIconContainer, backgroundColor: iconBgColor, color: iconColor }}>{icon}</div>
      <div style={styles.statContent}>
        <p style={styles.statLabel}>{label}</p>
        <p style={styles.statValue}>{value}</p>
      </div>
    </div>
  );
}

function ActionButton({ icon, label, color, bgColor }: any) {
  return (
    <div style={styles.actionCard} onClick={() => alert(`Đang mở: ${label}`)}>
      <div style={{ ...styles.actionIcon, color: color, backgroundColor: bgColor }}>{icon}</div>
      <p style={styles.actionLabel}>{label}</p>
    </div>
  );
}

// 4. PHẦN STYLES (CỰC KỲ QUAN TRỌNG - KHÔNG ĐƯỢC THIẾU)
const styles: Record<string, React.CSSProperties> = {
  container: { padding: '24px', fontFamily: 'sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { fontSize: '26px', fontWeight: 'bold', color: '#111827' },
  badge: { padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: '600' },
  statGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '32px' },
  statCard: { backgroundColor: '#fff', padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #f1f5f9', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
  statIconContainer: { padding: '10px', borderRadius: '12px' },
  statContent: { flex: 1 },
  statLabel: { fontSize: '13px', color: '#64748b', margin: 0 },
  statValue: { fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: 0 },
  quickActionSection: { marginTop: '10px' },
  sectionTitle: { fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '16px' },
  actionGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' },
  actionCard: { backgroundColor: '#fff', padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', border: '1px solid #f1f5f9', cursor: 'pointer' },
  actionIcon: { padding: '12px', borderRadius: '16px' },
  actionLabel: { fontSize: '14px', fontWeight: '500', color: '#475569', margin: 0 }
};