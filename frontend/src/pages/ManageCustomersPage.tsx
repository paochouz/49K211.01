import { useMemo, useState, type CSSProperties } from "react";
import Menu from "./Menu";
import AlertModal from "../components/AlertModal";
import { customerStore, type Customer } from "../mock/mockStore";

export default function ManageCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(() => customerStore.list());
  const [keyword, setKeyword] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState<Customer>({ maKH: "", tenKH: "", soDienThoai: "", diaChi: "" });
  const [formMessage, setFormMessage] = useState("");
  const [isFormError, setIsFormError] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');

  const filteredCustomers = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return customers;
    return customers.filter((c) =>
      c.maKH.toLowerCase().includes(kw) ||
      c.tenKH.toLowerCase().includes(kw) ||
      c.soDienThoai.includes(kw)
    );
  }, [customers, keyword]);

  const openAddModal = () => {
    setFormMessage("");
    setIsFormError(false);
    setNewCustomer({ maKH: customerStore.nextCode(), tenKH: "", soDienThoai: "", diaChi: "" });
    setIsAddModalOpen(true);
  };

  const handleCreateCustomer = () => {
    if (!newCustomer.tenKH.trim()) { setIsFormError(true); setFormMessage("Tên không được để trống"); return; }
    if (!/^[a-zA-Z0-9À-ỹ\s,.]+$/.test(newCustomer.tenKH)) { setIsFormError(true); setFormMessage("Tên không được chứa ký tự đặc biệt"); return; }
    if (!/^[0-9]{10}$/.test(newCustomer.soDienThoai)) { setIsFormError(true); setFormMessage("SĐT phải đủ 10 số"); return; }
    customerStore.create(newCustomer);
    setCustomers(customerStore.list());
    setIsAddModalOpen(false);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <aside style={{ position: 'fixed', top: 0, left: 0, width: '220px', height: '100vh' }}>
        <Menu />
      </aside>

      <main style={{ marginLeft: '220px', padding: '24px' }}>
        <div style={headerStyle}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#1e293b' }}>Quản lý khách hàng</h1>
          <button type="button" style={primaryBtnStyle} onClick={openAddModal}>+ Thêm khách hàng</button>
        </div>

        <div style={{ marginBottom: 24 }}>
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200" style={{ display: 'inline-block', minWidth: 180 }}>
            <p className="text-sm text-slate-500">Tổng khách hàng</p>
            <p className="text-3xl font-bold text-slate-900">{customers.length}</p>
          </div>
        </div>

        <div style={tableContainerStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#1e293b' }}>Danh sách khách hàng</h2>
            <input
              placeholder="Tìm mã, tên hoặc số điện thoại..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={searchInputStyle}
            />
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Mã KH', 'Tên khách hàng', 'Số điện thoại', 'Địa chỉ'].map((h) => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length === 0 ? (
                  <tr><td colSpan={4} style={emptyCellStyle}>Không có dữ liệu</td></tr>
                ) : (
                  filteredCustomers.map((c) => (
                    <tr key={c.maKH}>
                      <td style={tdStyle}><b>{c.maKH}</b></td>
                      <td style={tdStyle}>{c.tenKH}</td>
                      <td style={tdStyle}>{c.soDienThoai}</td>
                      <td style={tdStyle}>{c.diaChi || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {isAddModalOpen && (
        <div style={overlayStyle} onMouseDown={() => setIsAddModalOpen(false)}>
          <div style={modalStyle} onMouseDown={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px', fontSize: 20, fontWeight: 700, color: '#1e293b' }}>Thêm khách hàng</h3>
            {[
              { label: 'Mã khách hàng', key: 'maKH', disabled: true },
              { label: 'Tên khách hàng *', key: 'tenKH', placeholder: 'Nhập tên' },
              { label: 'Số điện thoại *', key: 'soDienThoai', placeholder: 'Nhập số điện thoại' },
              { label: 'Địa chỉ', key: 'diaChi', placeholder: 'Nhập địa chỉ' },
            ].map(({ label, key, disabled, placeholder }) => (
              <div key={key} style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>{label}</label>
                <input
                  value={(newCustomer as any)[key]}
                  disabled={disabled}
                  placeholder={placeholder}
                  onChange={(e) => {
                    const val = e.target.value;
                    // Chặn ký tự đặc biệt cho trường tên
                    if (key === 'tenKH' && /[^a-zA-ZÀ-ỹ\s]/.test(val)) return;
                    setNewCustomer((p) => ({ ...p, [key]: val }));
                  }}
                  style={{ ...inputStyle, background: disabled ? '#f1f5f9' : '#fff', cursor: disabled ? 'not-allowed' : 'text' }}
                />
              </div>
            ))}
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button type="button" style={cancelBtnStyle} onClick={() => setIsAddModalOpen(false)}>Đóng</button>
              <button type="button" style={saveBtnStyle} onClick={handleCreateCustomer}>Lưu</button>
            </div>
            {formMessage && (
              <p style={{ marginTop: 10, fontSize: 13, textAlign: 'center', color: isFormError ? '#ef4444' : '#22c55e' }}>
                {formMessage}
              </p>
            )}
          </div>
        </div>
      )}
      {alertMsg && <AlertModal message={alertMsg} onClose={() => setAlertMsg('')} />}
    </div>
  );
}

const headerStyle: CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 };
const primaryBtnStyle: CSSProperties = { background: '#2563eb', color: '#fff', padding: '10px 20px', borderRadius: '10px', border: 'none', fontWeight: 600, fontSize: 14, cursor: 'pointer' };
const tableContainerStyle: CSSProperties = { background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' };
const searchInputStyle: CSSProperties = { padding: '9px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', width: '280px', outline: 'none', fontSize: 13 };
const thStyle: CSSProperties = { textAlign: 'left', padding: '12px', color: '#94a3b8', fontSize: 12, borderBottom: '1px solid #f1f5f9', fontWeight: 600, textTransform: 'uppercase' };
const tdStyle: CSSProperties = { padding: '14px 12px', fontSize: 14, borderBottom: '1px solid #f8fafc', color: '#334155' };
const emptyCellStyle: CSSProperties = { textAlign: 'center', padding: '32px', color: '#94a3b8', fontSize: 14 };
const overlayStyle: CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 100 };
const modalStyle: CSSProperties = { width: '100%', maxWidth: 480, background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 18px 48px rgba(0,0,0,0.15)' };
const inputStyle: CSSProperties = { width: '100%', height: 40, border: '1px solid #e2e8f0', borderRadius: 8, padding: '0 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' };
const cancelBtnStyle: CSSProperties = { flex: 1, height: 40, borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', fontWeight: 600, cursor: 'pointer', fontSize: 14 };
const saveBtnStyle: CSSProperties = { flex: 1, height: 40, borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 14 };
