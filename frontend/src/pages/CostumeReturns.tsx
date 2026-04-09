import React, { useState, useEffect } from 'react';
import { LayoutDashboard, ClipboardList, Users, Shirt, Settings, LogOut } from 'lucide-react';

// --- COMPONENT MENU (SIDEBAR) ---
function Menu() {
  const userRole = localStorage.getItem("userRole");
  const isOwner = userRole === "chucuahang";

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
        <MenuItem name="Trang chủ" icon={<LayoutDashboard size={20} />} />
        <MenuItem name="Quản lý đơn thuê" icon={<ClipboardList size={20} />} isActive={true} />
        <MenuItem name="Quản lý khách hàng" icon={<Users size={20} />} />

        {isOwner && (
          <>
            <MenuItem name="Quản Lý Trang Phục" icon={<Shirt size={20} />} />
            <MenuItem name="Cấu Hình Phạt" icon={<Settings size={20} />} />
          </>
        )}
      </div>

      <button onClick={handleLogout} style={menuStyles.logoutBtn}>
        <LogOut size={20} />
        <span style={{ fontWeight: '500' }}>Đăng xuất</span>
      </button>
    </nav>
  );
}

function MenuItem({ name, icon, isActive }: any) {
  return (
    <div style={{
      ...menuStyles.menuItem,
      backgroundColor: isActive ? '#2563eb' : 'transparent',
      boxShadow: isActive ? '0 10px 15px -3px rgba(37, 99, 235, 0.2)' : 'none'
    }}>
      <div style={{ color: isActive ? '#fff' : '#64748b', display: 'flex', alignItems: 'center' }}>
        {icon}
      </div>
      <span style={{ 
        fontWeight: 'normal', 
        fontSize: '14px', 
        color: isActive ? '#fff' : '#64748b' 
      }}>
        {name}
      </span>
    </div>
  );
}

// --- COMPONENT CHÍNH ---
const CostumeReturns = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [ngayTraThucTe, setNgayTraThucTe] = useState(new Date().toISOString().split('T')[0]);
  const [daTraGiayTo, setDaTraGiayTo] = useState(false);

  // 1. LẤY DỮ LIỆU TỪ SQL KHI VÀO TRANG
  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        // Gọi API lấy thông tin đơn hàng cụ thể (Ví dụ: HDT000001)
        const response = await fetch('http://localhost:3003/api/returns/HDT000001');
        const resData = await response.json();

        if (response.ok) {
          setData({
            maDon: resData.order.MaDon,
            khachHang: {
              ten: resData.order.TenKH,
              sdt: resData.order.SoDienThoai,
              hinhThucCoc: resData.order.HinhThucCoc === 'GiayTo' ? 'Giấy tờ tùy thân' : 'Tiền',
              chiTietCoc: resData.order.GhiChuGiayTo || "Không có",
              tienCocSo: resData.order.TienCoc
            },
            tongGiaTriDon: resData.order.TongTienThue,
            hanTra: "2026-04-01", // Mặc định hoặc lấy từ Chi tiết đơn nếu có cột riêng
            trangPhuc: resData.items.map((item: any) => ({
              id: item.MaTP,
              ten: item.TenTP,
              hinh: item.HinhAnh,
              status: 'Bình thường',
              moTaLoi: '',
              phiHuHong: 0
            }))
          });
        }
      } catch (error) {
        console.error("Lỗi tải đơn hàng từ SQL:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, []);

  const formatNgay = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleStatusChange = (id: string, newStatus: any) => {
    const newItems = data.trangPhuc.map((item: any) =>
      item.id === id ? { ...item, status: newStatus, phiHuHong: newStatus === 'Bình thường' ? 0 : item.phiHuHong } : item
    );
    setData({ ...data, trangPhuc: newItems });
  };

  const handlePhiHuHongChange = (id: string, value: string) => {
    const price = parseInt(value.replace(/\D/g, '')) || 0;
    const newItems = data.trangPhuc.map((item: any) => item.id === id ? { ...item, phiHuHong: price } : item);
    setData({ ...data, trangPhuc: newItems });
  };

  const handleMoTaLoiChange = (id: string, value: string) => {
    const newItems = data.trangPhuc.map((item: any) => item.id === id ? { ...item, moTaLoi: value } : item);
    setData({ ...data, trangPhuc: newItems });
  };

  const tinhPhiTraTre = () => {
    if (!data) return 0;
    const han = new Date(data.hanTra);
    const thuc = new Date(ngayTraThucTe);
    const diffTime = thuc.getTime() - han.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays * (data.tongGiaTriDon * 0.1) : 0;
  };

  const phiTraTre = tinhPhiTraTre();
  const tongPhiHuHong = data?.trangPhuc.reduce((sum: number, i: any) => sum + i.phiHuHong, 0) || 0;
  const tongPhatSinh = tongPhiHuHong + phiTraTre;
  const ketQua = data ? (data.tongGiaTriDon + tongPhatSinh - data.khachHang.tienCocSo) : 0;

  // 2. HÀM GỬI DỮ LIỆU QUYẾT TOÁN VỀ SQL
  const handleComplete = async () => {
    const payload = {
      maDon: data.maDon,
      ngayTraThucTe,
      phiTraTre,
      tongPhatSinh,
      ketQua,
      trangPhuc: data.trangPhuc
    };

    try {
      const response = await fetch('http://localhost:3003/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (response.ok) {
        alert("✅ " + result.message);
      } else {
        alert("❌ Lỗi: " + result.message);
      }
    } catch (error) {
      alert("❌ Không thể kết nối tới Backend (Port 3003)!");
    }
  };

  const contentStyles = {
    card: { backgroundColor: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', marginBottom: '20px' },
    label: { color: '#000000', fontSize: '14px', marginBottom: '4px', fontWeight: 'bold' as const },
    value: { fontWeight: 'normal' as const, color: '#000000', fontSize: '16px' },
    title: { marginTop: 0, marginBottom: '20px', fontSize: '18px', color: '#000000', fontWeight: 'bold' as const }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Đang tải dữ liệu từ Database...</div>;
  if (!data) return <div style={{ padding: '40px', textAlign: 'center' }}>Không tìm thấy đơn hàng trong hệ thống!</div>;

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#F8FAFC' }}>
      <aside style={{ width: '280px', flexShrink: 0 }}><Menu /></aside>

      <main style={{ flex: 1, padding: '32px', overflowY: 'auto', fontFamily: 'sans-serif' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: '#1e293b' }}>
          Xử lý trả đồ & Quyết toán đơn
        </h1>

        <div style={contentStyles.card}>
          <h3 style={contentStyles.title}>Thông tin đơn hàng</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            <div><div style={contentStyles.label}>Mã đơn hàng</div><div style={contentStyles.value}>#{data.maDon}</div></div>
            <div><div style={contentStyles.label}>Khách hàng</div><div style={contentStyles.value}>{data.khachHang.ten}</div></div>
            <div><div style={contentStyles.label}>Số điện thoại</div><div style={contentStyles.value}>{data.khachHang.sdt}</div></div>
            <div><div style={contentStyles.label}>Hình thức cọc</div><div style={contentStyles.value}>{data.khachHang.hinhThucCoc}</div></div>
            <div><div style={contentStyles.label}>Chi tiết cọc</div><div style={contentStyles.value}>{data.khachHang.chiTietCoc}</div></div>
            <div><div style={contentStyles.label}>Hạn trả gốc</div><div style={contentStyles.value}>{formatNgay(data.hanTra)}</div></div>
          </div>
        </div>

        <div style={contentStyles.card}>
          <h3 style={contentStyles.title}>Kiểm kê trang phục trả</h3>
          {data.trangPhuc.map((item: any) => (
            <div key={item.id} style={{ display: 'flex', gap: '20px', padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '12px', marginBottom: '12px', alignItems: 'center', border: '1px solid #f1f5f9' }}>
              <img src={item.hinh} alt={item.ten} style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '700', marginBottom: '10px', color: '#1e293b' }}>{item.ten}</div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <select value={item.status} onChange={(e) => handleStatusChange(item.id, e.target.value)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #CBD5E1', cursor: 'pointer' }}>
                    <option value="Bình thường">Bình thường</option>
                    <option value="Hư hỏng">Hư hỏng</option>
                    <option value="Mất">Mất</option>
                  </select>
                  <input type="text" placeholder="Ghi chú lỗi nếu có..." value={item.moTaLoi} disabled={item.status === 'Bình thường'} onChange={(e) => handleMoTaLoiChange(item.id, e.target.value)} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
                  <div style={{ position: 'relative' }}>
                    <input type="text" value={item.phiHuHong.toLocaleString()} disabled={item.status === 'Bình thường'} onChange={(e) => handlePhiHuHongChange(item.id, e.target.value)} style={{ width: '140px', textAlign: 'right', padding: '8px 45px 8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontWeight: 'bold', color: '#000000' }} />
                    <span style={{ position: 'absolute', right: '12px', top: '9px', fontSize: '12px', fontWeight: 'bold', color: '#000000' }}>VNĐ</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ ...contentStyles.card, border: '2px solid #2563EB' }}>
          <h3 style={contentStyles.title}>Quyết toán tài chính</h3>
          <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#F0F7FF', borderRadius: '12px' }}>
            <label style={{ fontWeight: 'bold', marginRight: '16px', color: '#000' }}>Ngày trả thực tế:</label>
            <input type="date" value={ngayTraThucTe} onChange={(e) => setNgayTraThucTe(e.target.value)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Tổng giá trị thuê:</span><b>{data.tongGiaTriDon.toLocaleString()} VNĐ</b></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Đã đặt cọc:</span><b>-{data.khachHang.tienCocSo.toLocaleString()} VNĐ</b></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Phí phạt trả trễ:</span><b>{phiTraTre.toLocaleString()} VNĐ</b></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Phí phạt hư hỏng:</span><b>{tongPhiHuHong.toLocaleString()} VNĐ</b></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #CBD5E1', paddingTop: '12px' }}>
              <span style={{ fontWeight: 'bold' }}>Tổng chi phí phát sinh:</span>
              <b style={{ color: '#E11D48', fontSize: '20px' }}>{tongPhatSinh.toLocaleString()} VNĐ</b>
            </div>
            <div style={{ marginTop: '10px', padding: '24px', borderRadius: '16px', backgroundColor: ketQua >= 0 ? '#FFF1F2' : '#F0FDF4' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', color: ketQua >= 0 ? '#BE123C' : '#166534' }}>
                  {ketQua >= 0 ? "SỐ TIỀN KHÁCH THANH TOÁN THÊM" : "SỐ TIỀN TRẢ LẠI CHO KHÁCH"}
                </span>
                <span style={{ fontSize: '28px', fontWeight: '900', color: ketQua >= 0 ? '#BE123C' : '#15803d' }}>
                  {Math.abs(ketQua).toLocaleString()} VNĐ
                </span>
              </div>
            </div>
          </div>
        </div>

        {data.khachHang.hinhThucCoc === "Giấy tờ tùy thân" && (
          <div style={{ padding: '8px 8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setDaTraGiayTo(!daTraGiayTo)}>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: daTraGiayTo ? '6px solid #2563EB' : '2px solid #CBD5E1', backgroundColor: '#fff', transition: 'all 0.2s' }} />
            <span style={{ color: '#000000', fontSize: '15px' }}>
              Đã trả lại giấy tờ tùy thân cho khách hàng <span style={{ color: 'red' }}>*</span>
            </span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
          <button style={{ padding: '12px 28px', borderRadius: '10px', border: '1px solid #CBD5E1', backgroundColor: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Hủy bỏ</button>
          <button 
            disabled={data.khachHang.hinhThucCoc === "Giấy tờ tùy thân" && !daTraGiayTo} 
            style={{ 
              padding: '12px 40px', borderRadius: '10px', border: 'none', backgroundColor: '#2563EB', color: 'white', fontWeight: 'bold', 
              opacity: (data.khachHang.hinhThucCoc === "Giấy tờ tùy thân" && !daTraGiayTo) ? 0.5 : 1, 
              cursor: (data.khachHang.hinhThucCoc === "Giấy tờ tùy thân" && !daTraGiayTo) ? 'not-allowed' : 'pointer', transition: 'all 0.2s' 
            }}
            onClick={handleComplete}
          >
            HOÀN TẤT
          </button>
        </div>
      </main>
    </div>
  );
};

const menuStyles: Record<string, React.CSSProperties> = {
  nav: { display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#fff', borderRight: '1px solid #f1f5f9', padding: '24px 16px' },
  logoSection: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', padding: '0 8px' },
  logoIcon: { backgroundColor: '#2563eb', color: '#fff', padding: '6px 10px', borderRadius: '8px', fontWeight: 'bold' },
  logoText: { fontWeight: 'bold', fontSize: '18px', color: '#1e293b' },
  menuGroups: { flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' },
  menuItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' },
  logoutBtn: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', color: '#ef4444', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', marginTop: 'auto', borderRadius: '12px' }
};

export default CostumeReturns;
