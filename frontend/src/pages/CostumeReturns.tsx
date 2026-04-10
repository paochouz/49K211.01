import { useState, useEffect } from 'react';
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
          hinhThucCoc: order.hinhThucCoc || 'Tiền mặt/chuyển khoản',
          chiTietCoc: order.chiTietCoc || 'Không có',
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
    data.trangPhuc.forEach((item: any) => {
      costumeStore.update(item.id, {
        trangThai: item.status === 'Bình thường' ? 'Sẵn sàng' : item.status === 'Mất' ? 'Ngưng sử dụng' : 'Hư hỏng',
      });
    });
    setAlertMsg('Xử lý trả đồ thành công!');
    setTimeout(() => navigate('/don-thue'), 1500);
  };

  const card = { backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '24px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' };
  const lbl = { color: '#0F172A', fontSize: '13px', marginBottom: '4px', fontWeight: 600 };
  const val = { color: '#0F172A', fontSize: '15px', fontWeight: 400 };
  const title = { marginTop: 0, marginBottom: '16px', fontSize: '16px', color: '#0F172A', fontWeight: 700 };

  if (loading || !data) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <aside style={{ position: 'fixed', top: 0, left: 0, width: '220px', height: '100vh' }}><Menu /></aside>
      <main style={{ marginLeft: '220px', padding: '24px', textAlign: 'center', color: '#64748b' }}>
        {loading ? 'Đang tải...' : 'Không tìm thấy đơn hàng!'}
      </main>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      <aside style={{ position: 'fixed', top: 0, left: 0, width: '220px', height: '100vh' }}>
        <Menu />
      </aside>

      <div style={{ marginLeft: '220px', display: 'flex', justifyContent: 'center', padding: '32px 24px' }}>
        <main style={{ width: '100%', maxWidth: '860px', backgroundColor: '#F8FAFC', borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', border: '1px solid #E5E7EB' }}>

          {/* Header */}
          <div style={{ padding: '20px 32px', borderBottom: '1px solid #E5E7EB', backgroundColor: 'white' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: '#0F172A' }}>Xử lý trả đồ & Quyết toán đơn</h1>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>

            {/* Thông tin đơn */}
            <div style={card}>
              <h3 style={title}>Thông tin đơn hàng</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                {[
                  ['Mã đơn hàng', data.maDon],
                  ['Khách hàng', data.khachHang.ten],
                  ['Số điện thoại', data.khachHang.sdt],
                  ['Hình thức cọc', data.khachHang.hinhThucCoc],
                  ['Chi tiết cọc', data.khachHang.chiTietCoc],
                  ['Hạn trả gốc', formatNgay(data.hanTra)],
                ].map(([l, v]) => (
                  <div key={l}><div style={lbl}>{l}</div><div style={val}>{v}</div></div>
                ))}
              </div>
            </div>

            {/* Kiểm kê */}
            <div style={card}>
              <h3 style={title}>Kiểm kê trang phục trả</h3>
              {data.trangPhuc.map((item: any) => (
                <div key={item.id} style={{ display: 'flex', gap: '20px', padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '12px', marginBottom: '12px', alignItems: 'center', border: '1px solid #E5E7EB' }}>
                  <img src={item.hinh} alt={item.ten} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/80x80?text=TP'; }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, marginBottom: '12px', color: '#0F172A', fontSize: '15px' }}>{item.ten}</div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <select value={item.status} onChange={(e) => handleStatusChange(item.id, e.target.value)} style={{ height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #E5E7EB', backgroundColor: '#fff' }}>
                        <option>Bình thường</option>
                        <option>Hư hỏng</option>
                        <option>Mất</option>
                      </select>
                      <input placeholder="Ghi chú lỗi" value={item.moTaLoi} disabled={item.status === 'Bình thường'} onChange={(e) => handleMoTaLoiChange(item.id, e.target.value)} style={{ height: '40px', flex: 1, padding: '0 12px', borderRadius: '8px', border: '1px solid #E5E7EB' }} />
                      <div style={{ position: 'relative' }}>
                        <input value={item.phiHuHong.toLocaleString()} disabled={item.status === 'Bình thường'} onChange={(e) => handlePhiHuHongChange(item.id, e.target.value)} style={{ height: '40px', width: '130px', textAlign: 'right', padding: '0 45px 0 12px', borderRadius: '8px', border: '1px solid #E5E7EB', fontWeight: 'bold' }} />
                        <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', fontWeight: 'bold', color: '#64748B' }}>VNĐ</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quyết toán */}
            <div style={{ ...card, border: '1px solid #2563EB' }}>
              <h3 style={title}>Quyết toán tài chính</h3>

              {/* Ngày trả thực tế */}
              <div style={{ marginBottom: '16px', padding: '12px 16px', backgroundColor: '#F0F7FF', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, color: '#2563EB', fontSize: '14px' }}>Ngày trả thực tế:</span>
                <div style={{ position: 'relative', width: '180px' }}>
                  <input type="date" value={ngayTraThucTe} onChange={(e) => setNgayTraThucTe(e.target.value)}
                    style={{ height: '36px', width: '100%', padding: '0 8px', borderRadius: '6px', border: '1px solid #2563EB', backgroundColor: 'white', opacity: 0, position: 'absolute', top: 0, left: 0, cursor: 'pointer', zIndex: 1 }} />
                  <div style={{ height: '36px', width: '100%', padding: '0 10px', borderRadius: '6px', border: '1px solid #2563EB', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', pointerEvents: 'none' }}>
                    <span style={{ color: '#0F172A', fontWeight: 600, fontSize: '14px' }}>{formatNgay(ngayTraThucTe)}</span>
                    <span style={{ fontSize: '16px' }}>📅</span>
                  </div>
                </div>
              </div>

              {/* Các dòng tính toán */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { label: 'Tổng giá trị thuê', value: `${data.tongGiaTriDon.toLocaleString()} VNĐ`, color: '#0F172A' },
                  { label: 'Đã đặt cọc', value: `-${data.khachHang.tienCocSo.toLocaleString()} VNĐ`, color: '#22C55E' },
                  { label: 'Phí trả trễ', value: `${phiTraTre.toLocaleString()} VNĐ`, color: phiTraTre > 0 ? '#EF4444' : '#0F172A' },
                  { label: 'Phí hư hỏng', value: `${tongPhiHuHong.toLocaleString()} VNĐ`, color: tongPhiHuHong > 0 ? '#EF4444' : '#0F172A' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#64748B', fontSize: '15px' }}>{label}</span>
                    <b style={{ color, fontSize: '15px' }}>{value}</b>
                  </div>
                ))}

                {/* Tổng phát sinh */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #E5E7EB', paddingTop: '12px' }}>
                  <span style={{ fontWeight: 700, color: '#0F172A', fontSize: '15px' }}>Tổng phát sinh</span>
                  <b style={{ color: '#EF4444', fontSize: '18px' }}>{tongPhatSinh.toLocaleString()} VNĐ</b>
                </div>

                {/* Tiền phải thu/trả */}
                <div style={{ padding: '16px 20px', borderRadius: '12px', backgroundColor: ketQua >= 0 ? '#FFF1F2' : '#F0FDF4', border: `1px solid ${ketQua >= 0 ? '#EF4444' : '#22C55E'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '15px', color: ketQua >= 0 ? '#EF4444' : '#22C55E' }}>
                      {ketQua >= 0 ? 'Tiền khách phải trả thêm' : 'Tiền hoàn lại cho khách'}
                    </span>
                    <span style={{ fontWeight: 900, color: ketQua >= 0 ? '#EF4444' : '#22C55E', fontSize: '22px' }}>
                      {Math.abs(ketQua).toLocaleString()} VNĐ
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Xác nhận giấy tờ - chỉ hiện khi hình thức cọc là giấy tờ */}
            {data.khachHang.hinhThucCoc === 'Giấy tờ tùy thân' && (
              <div style={{ padding: '12px 16px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', border: '1px solid #e2e8f0', borderRadius: '10px', background: '#fff' }} onClick={() => setDaTraGiayTo(!daTraGiayTo)}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: daTraGiayTo ? '6px solid #2563EB' : '2px solid #CBD5E1', backgroundColor: '#fff', transition: 'all 0.2s', flexShrink: 0 }} />
                <span style={{ color: '#0F172A', fontSize: '14px', fontWeight: 500 }}>
                  Đã trả lại giấy tờ cho khách <span style={{ color: '#EF4444' }}>*</span>
                </span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: '16px 32px', borderTop: '1px solid #E5E7EB', backgroundColor: 'white', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button onClick={() => navigate('/don-thue')} style={{ height: '44px', padding: '0 28px', borderRadius: '8px', border: '1px solid #E5E7EB', backgroundColor: '#F8FAFC', fontWeight: 500, cursor: 'pointer', color: '#64748B', fontSize: '14px' }}>
              Hủy
            </button>
            <button
              disabled={data.khachHang.hinhThucCoc === 'Giấy tờ tùy thân' && !daTraGiayTo}
              onClick={handleComplete}
              style={{ height: '44px', padding: '0 40px', borderRadius: '8px', border: 'none', backgroundColor: '#2563EB', color: 'white', fontWeight: 700, fontSize: '14px', opacity: (data.khachHang.hinhThucCoc === 'Giấy tờ tùy thân' && !daTraGiayTo) ? 0.5 : 1, cursor: (data.khachHang.hinhThucCoc === 'Giấy tờ tùy thân' && !daTraGiayTo) ? 'not-allowed' : 'pointer' }}
            >
              Hoàn tất
            </button>
          </div>
        </main>
      </div>

      {alertMsg && <AlertModal message={alertMsg} onClose={() => setAlertMsg('')} />}
    </div>
  );
};

export default CostumeReturns;
