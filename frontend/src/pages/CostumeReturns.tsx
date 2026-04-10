import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Menu from './Menu';
import AlertModal from '../components/AlertModal';
import { orderStore, costumeStore } from '../mock/mockStore';

const CostumeReturns = () => {
  const { maDon } = useParams<{ maDon: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [ngayTraThucTe, setNgayTraThucTe] = useState(new Date().toISOString().split('T')[0]);
  const [daTraGiayTo, setDaTraGiayTo] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');

  useEffect(() => {
    if (!maDon) return;
    const order = orderStore.list().find((o) => o.invoiceNo === maDon);
    if (order) {
      setData({
        maDon: order.invoiceNo,
        khachHang: {
          ten: order.customer,
          sdt: order.phone,
          hinhThucCoc: 'Tiền mặt/chuyển khoản',
          chiTietCoc: 'Không có',
          tienCocSo: Number(order.deposit.replace(/[^\d]/g, '')) || 0,
        },
        tongGiaTriDon: Number(order.total.replace(/[^\d]/g, '')) || 0,
        hanTra: (() => {
          const [d, m, y] = order.dueDate.split('/');
          return `${y}-${m}-${d}`;
        })(),
        trangPhuc: order.item.split(', ').map((name, idx) => {
          const c = costumeStore.list().find((c) => c.tenTP === name.trim());
          return { id: c?.maTP || String(idx), ten: name.trim(), hinh: c?.hinhAnh || '', status: 'Bình thường', moTaLoi: '', phiHuHong: 0 };
        }),
      });
    }
    setLoading(false);
  }, [maDon]);

  const formatNgay = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    setData((prev: any) => ({
      ...prev,
      trangPhuc: prev.trangPhuc.map((item: any) =>
        item.id === id ? { ...item, status: newStatus, phiHuHong: newStatus === 'Bình thường' ? 0 : item.phiHuHong } : item
      ),
    }));
  };

  const handlePhiHuHongChange = (id: string, value: string) => {
    const price = parseInt(value.replace(/\D/g, '')) || 0;
    setData((prev: any) => ({
      ...prev,
      trangPhuc: prev.trangPhuc.map((item: any) => item.id === id ? { ...item, phiHuHong: price } : item),
    }));
  };

  const handleMoTaLoiChange = (id: string, value: string) => {
    setData((prev: any) => ({
      ...prev,
      trangPhuc: prev.trangPhuc.map((item: any) => item.id === id ? { ...item, moTaLoi: value } : item),
    }));
  };

  const tinhPhiTraTre = () => {
    if (!data) return 0;
    const han = new Date(data.hanTra);
    const thuc = new Date(ngayTraThucTe);
    const diffDays = Math.ceil((thuc.getTime() - han.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays * (data.tongGiaTriDon * 0.1) : 0;
  };

  const phiTraTre = tinhPhiTraTre();
  const tongPhiHuHong = data?.trangPhuc.reduce((sum: number, i: any) => sum + i.phiHuHong, 0) || 0;
  const tongPhatSinh = tongPhiHuHong + phiTraTre;
  const ketQua = data ? data.tongGiaTriDon + tongPhatSinh - data.khachHang.tienCocSo : 0;

  const handleComplete = () => {
    orderStore.updateStatus(data.maDon, 'Đã trả');
    // Cập nhật trạng thái trang phục về Sẵn sàng
    data.trangPhuc.forEach((item: any) => {
      costumeStore.update(item.id, {
        trangThai: item.status === 'Bình thường' ? 'Sẵn sàng' : item.status === 'Mất' ? 'Ngưng sử dụng' : 'Hư hỏng',
      });
    });
    setAlertMsg('✅ Xử lý trả đồ thành công!');
    setTimeout(() => navigate('/don-thue'), 1500);
  };

  const card: React.CSSProperties = { backgroundColor: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', marginBottom: '20px' };
  const label: React.CSSProperties = { color: '#334155', fontSize: '13px', marginBottom: '4px', fontWeight: 600 };
  const value: React.CSSProperties = { color: '#0f172a', fontSize: '14px' };
  const sectionTitle: React.CSSProperties = { marginTop: 0, marginBottom: '20px', fontSize: '16px', color: '#0f172a', fontWeight: 700 };

  if (loading) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <aside style={{ position: 'fixed', top: 0, left: 0, width: '220px', height: '100vh' }}><Menu /></aside>
      <main style={{ marginLeft: '220px', padding: '24px', textAlign: 'center', color: '#64748b' }}>Đang tải dữ liệu...</main>
    </div>
  );

  if (!data) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <aside style={{ position: 'fixed', top: 0, left: 0, width: '220px', height: '100vh' }}><Menu /></aside>
      <main style={{ marginLeft: '220px', padding: '24px', textAlign: 'center', color: '#ef4444' }}>Không tìm thấy đơn hàng!</main>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      <aside style={{ position: 'fixed', top: 0, left: 0, width: '220px', height: '100vh' }}>
        <Menu />
      </aside>

      <main style={{ marginLeft: '220px', padding: '24px', overflowY: 'auto', fontFamily: 'sans-serif' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px', color: '#1e293b' }}>
          Xử lý trả đồ & Quyết toán đơn
        </h1>

        {/* Thông tin đơn */}
        <div style={card}>
          <h3 style={sectionTitle}>Thông tin đơn hàng</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {[
              ['Mã đơn hàng', data.maDon],
              ['Khách hàng', data.khachHang.ten],
              ['Số điện thoại', data.khachHang.sdt],
              ['Hình thức cọc', data.khachHang.hinhThucCoc],
              ['Chi tiết cọc', data.khachHang.chiTietCoc],
              ['Hạn trả gốc', formatNgay(data.hanTra)],
            ].map(([l, v]) => (
              <div key={l}><div style={label}>{l}</div><div style={value}>{v}</div></div>
            ))}
          </div>
        </div>

        {/* Kiểm kê */}
        <div style={card}>
          <h3 style={sectionTitle}>Kiểm kê trang phục trả</h3>
          {data.trangPhuc.map((item: any) => (
            <div key={item.id} style={{ display: 'flex', gap: '20px', padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '12px', marginBottom: '12px', alignItems: 'center', border: '1px solid #f1f5f9' }}>
              <img src={item.hinh} alt={item.ten} style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, marginBottom: '10px', color: '#1e293b' }}>{item.ten}</div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <select value={item.status} onChange={(e) => handleStatusChange(item.id, e.target.value)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #CBD5E1' }}>
                    <option>Bình thường</option>
                    <option>Hư hỏng</option>
                    <option>Mất</option>
                  </select>
                  <input placeholder="Ghi chú lỗi..." value={item.moTaLoi} disabled={item.status === 'Bình thường'} onChange={(e) => handleMoTaLoiChange(item.id, e.target.value)} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
                  <div style={{ position: 'relative' }}>
                    <input value={item.phiHuHong.toLocaleString()} disabled={item.status === 'Bình thường'} onChange={(e) => handlePhiHuHongChange(item.id, e.target.value)} style={{ width: '140px', textAlign: 'right', padding: '8px 45px 8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontWeight: 'bold' }} />
                    <span style={{ position: 'absolute', right: '12px', top: '9px', fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>VNĐ</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quyết toán */}
        <div style={{ ...card, border: '2px solid #2563EB' }}>
          <h3 style={sectionTitle}>Quyết toán tài chính</h3>
          <div style={{ marginBottom: '20px', padding: '14px', backgroundColor: '#F0F7FF', borderRadius: '12px' }}>
            <label style={{ fontWeight: 600, marginRight: '12px', color: '#334155', fontSize: 13 }}>Ngày trả thực tế:</label>
            <input type="date" value={ngayTraThucTe} onChange={(e) => setNgayTraThucTe(e.target.value)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              ['Tổng giá trị thuê', `${data.tongGiaTriDon.toLocaleString()} VNĐ`],
              ['Đã đặt cọc', `-${data.khachHang.tienCocSo.toLocaleString()} VNĐ`],
              ['Phí phạt trả trễ', `${phiTraTre.toLocaleString()} VNĐ`],
              ['Phí phạt hư hỏng', `${tongPhiHuHong.toLocaleString()} VNĐ`],
            ].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}><span>{l}:</span><b>{v}</b></div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #CBD5E1', paddingTop: '12px' }}>
              <span style={{ fontWeight: 700 }}>Tổng chi phí phát sinh:</span>
              <b style={{ color: '#E11D48', fontSize: '18px' }}>{tongPhatSinh.toLocaleString()} VNĐ</b>
            </div>
            <div style={{ padding: '20px', borderRadius: '14px', backgroundColor: ketQua >= 0 ? '#FFF1F2' : '#F0FDF4' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: ketQua >= 0 ? '#BE123C' : '#166534', fontSize: 14 }}>
                  {ketQua >= 0 ? 'SỐ TIỀN KHÁCH THANH TOÁN THÊM' : 'SỐ TIỀN TRẢ LẠI CHO KHÁCH'}
                </span>
                <span style={{ fontSize: '24px', fontWeight: 900, color: ketQua >= 0 ? '#BE123C' : '#15803d' }}>
                  {Math.abs(ketQua).toLocaleString()} VNĐ
                </span>
              </div>
            </div>
          </div>
        </div>

        {data.khachHang.hinhThucCoc === 'Giấy tờ tùy thân' && (
          <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setDaTraGiayTo(!daTraGiayTo)}>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: daTraGiayTo ? '6px solid #2563EB' : '2px solid #CBD5E1', backgroundColor: '#fff', transition: 'all 0.2s', flexShrink: 0 }} />
            <span style={{ fontSize: '14px', color: '#334155' }}>Đã trả lại giấy tờ tùy thân cho khách hàng <span style={{ color: 'red' }}>*</span></span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button onClick={() => navigate('/don-thue')} style={{ padding: '10px 24px', borderRadius: '10px', border: '1px solid #CBD5E1', backgroundColor: 'white', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>Hủy bỏ</button>
          <button
            disabled={data.khachHang.hinhThucCoc === 'Giấy tờ tùy thân' && !daTraGiayTo}
            onClick={handleComplete}
            style={{ padding: '10px 32px', borderRadius: '10px', border: 'none', backgroundColor: '#2563EB', color: 'white', fontWeight: 600, fontSize: 14, opacity: (data.khachHang.hinhThucCoc === 'Giấy tờ tùy thân' && !daTraGiayTo) ? 0.5 : 1, cursor: (data.khachHang.hinhThucCoc === 'Giấy tờ tùy thân' && !daTraGiayTo) ? 'not-allowed' : 'pointer' }}
          >
            HOÀN TẤT
          </button>
        </div>
        {alertMsg && <AlertModal message={alertMsg} onClose={() => setAlertMsg('')} />}
      </main>
    </div>
  );
};

export default CostumeReturns;
