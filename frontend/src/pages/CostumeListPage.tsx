import { useState, useMemo, type CSSProperties } from "react";
import Menu from "./Menu";
import { isOwner } from "../hooks/useAuth";
import AlertModal from "../components/AlertModal";
import ConfirmModal from "../components/ConfirmModal";
import AddCostumeModal from "../components/AddCostumeModal";
import { costumeStore } from "../mock/mockStore";

const STATUS = {
  READY: "Sẵn sàng",
  RENTED: "Đang thuê",
  BROKEN: "Hư hỏng",
} as const;

type StatusValue = (typeof STATUS)[keyof typeof STATUS];

type CostumeItem = {
  id: string;
  name: string;
  price: number;
  size: string;
  status: StatusValue;
  image: string;
  renter?: string;
  returnDate?: string;
};

const statusColor: Record<StatusValue, string> = {
  [STATUS.READY]: "#22C55E",
  [STATUS.RENTED]: "#F59E0B",
  [STATUS.BROKEN]: "#EF4444",
};

export default function CostumeListPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusValue | "">("");
  const [selected, setSelected] = useState<CostumeItem | null>(null);
  const [editItem, setEditItem] = useState<CostumeItem | null>(null);
  const [alertMsg, setAlertMsg] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [costumes, setCostumes] = useState<CostumeItem[]>(() =>
    costumeStore.list().map((c) => ({
      id: c.maTP, name: c.tenTP, price: c.giaThue,
      size: c.moTa ? `${c.size} - ${c.moTa}` : c.size,
      status: (c.trangThai === 'Dang thue' ? 'Đang thuê' : c.trangThai) as StatusValue,
      image: c.hinhAnh, renter: undefined, returnDate: undefined,
    }))
  );

  const owner = isOwner();

  const refreshCostumes = () => setCostumes(
    costumeStore.list().map((c) => ({
      id: c.maTP, name: c.tenTP, price: c.giaThue,
      size: c.moTa ? `${c.size} - ${c.moTa}` : c.size,
      status: (c.trangThai === 'Dang thue' ? 'Đang thuê' : c.trangThai) as StatusValue,
      image: c.hinhAnh, renter: undefined, returnDate: undefined,
    }))
  );

  const handleDelete = (id: string) => {
    costumeStore.delete(id);
    setSelected(null);
    setConfirmDelete(null);
    refreshCostumes();
  };

  const filteredData = useMemo(() => {
    return costumes
      .filter((item) => {
        const matchSearch =
          (item.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
          (item.id?.toLowerCase() || "").includes(search.toLowerCase());
        const matchStatus = statusFilter ? item.status === statusFilter : true;
        return matchSearch && matchStatus;
      })
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }, [search, statusFilter, costumes]);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <aside style={{ position: "fixed", top: 0, left: 0, width: "220px", height: "100vh" }}>
        <Menu />
      </aside>

      <main style={{ marginLeft: "220px", padding: "24px" }}>
        <div style={headerActionStyle}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#1e293b" }}>Quản lý trang phục</h1>
          {owner && (
            <button onClick={() => setShowAddModal(true)} style={{ background: '#2563eb', color: '#fff', padding: '10px 20px', borderRadius: '10px', border: 'none', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
              + Thêm trang phục
            </button>
          )}
        </div>

        <div style={toolbarStyle}>
          <input
            placeholder="Tìm theo tên hoặc mã..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={inputStyle}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusValue | "")}
            style={inputStyle}
          >
            <option value="">Tất cả trạng thái</option>
            {Object.values(STATUS).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div style={gridStyle}>
          {filteredData.map((item) => (
            <div
              key={item.id}
              style={cardStyle}
              onClick={() => setSelected(costumes.find(c => c.id === item.id) || item)}
            >
              <img src={item.image} alt="" style={imageStyle} />
              <div>
                <h3 style={{ fontSize: 15, margin: 0, color: "#1e293b", fontWeight: 600 }}>{item.name}</h3>
                <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0" }}>{item.size}</p>
                <span style={{ ...badgeStyle, backgroundColor: statusColor[item.status] || "#94a3b8" }}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {selected && (
          <div style={modalOverlayStyle} onClick={() => setSelected(null)}>
            <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
              <h2 style={{ fontSize: 20, marginBottom: 16, color: "#1e293b" }}>Chi tiết trang phục</h2>
              <img src={selected.image} style={{ width: "100%", borderRadius: 12, marginBottom: 16 }} alt={selected.name} />
              <p><b>Mã:</b> {selected.id}</p>
              <p><b>Tên:</b> {selected.name}</p>
              <p><b>Giá thuê:</b> {selected.price.toLocaleString()} VND</p>
              <p><b>Mô tả:</b> {selected.size}</p>
              <p style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <b>Trạng thái:</b>
                <span style={{ ...badgeStyle, backgroundColor: statusColor[selected.status] || "#94a3b8" }}>
                  {selected.status}
                </span>
              </p>
              {selected.status === "Đang thuê" && (
                <div style={{ backgroundColor: "#fef3c7", padding: "10px", borderRadius: "5px", marginTop: "10px" }}>
                  <p style={{ color: "#b45309", margin: 0 }}>
                    <strong>Lịch đang thuê:</strong> {selected.renter} – Hạn trả: {selected.returnDate}
                  </p>
                </div>
              )}
              {owner && (
                <>
                  <button
                    style={{ marginTop: 16, padding: "10px 16px", borderRadius: 8, border: "1px solid #c7d2fe", background: "#eef2ff", color: "#2563eb", cursor: "pointer", width: "100%", fontWeight: 600 }}
                    onClick={() => { setEditItem(selected); setSelected(null); }}
                  >
                    Cập nhật trang phục
                  </button>
                  <button
                    style={{ marginTop: 8, padding: "10px 16px", borderRadius: 8, border: "1px solid #fecaca", background: "#fef2f2", color: "#ef4444", cursor: "pointer", width: "100%", fontWeight: 600 }}
                    onClick={() => setConfirmDelete(selected.id)}
                  >
                    Xóa trang phục
                  </button>
                </>
              )}
              <button
                style={{ marginTop: 8, padding: "10px 16px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#64748b", cursor: "pointer", width: "100%", fontWeight: 600 }}
                onClick={() => setSelected(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        )}

        {/* Modal cập nhật - chỉ chủ */}
        {owner && editItem && (
          <div style={modalOverlayStyle} onClick={() => setEditItem(null)}>
            <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
              <h2 style={{ fontSize: 20, marginBottom: 16, color: "#1e293b" }}>Cập nhật trang phục</h2>
              {[
                { label: "Tên trang phục", key: "name" },
                { label: "Giá thuê", key: "price" },
                { label: "Size / Mô tả", key: "size" },
              ].map(({ label, key }) => (
                <div key={key} style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#334155", display: "block", marginBottom: 4 }}>{label}</label>
                  <input
                    value={(editItem as any)[key]}
                    onChange={(e) => setEditItem({ ...editItem, [key]: e.target.value })}
                    style={{ width: "100%", height: 38, border: "1px solid #e2e8f0", borderRadius: 8, padding: "0 12px", fontSize: 14, outline: "none", boxSizing: "border-box" }}
                  />
                </div>
              ))}
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#334155", display: "block", marginBottom: 4 }}>Trạng thái</label>
                <select
                  value={editItem.status}
                  onChange={(e) => setEditItem({ ...editItem, status: e.target.value as StatusValue })}
                  style={{ width: "100%", height: 38, border: "1px solid #e2e8f0", borderRadius: 8, padding: "0 12px", fontSize: 14, outline: "none" }}
                >
                  {Object.values(STATUS).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <button
                style={{ marginTop: 8, padding: "10px 16px", borderRadius: 8, border: "none", background: "#2563eb", color: "#fff", cursor: "pointer", width: "100%", fontWeight: 600 }}
                onClick={() => {
                  costumeStore.update(editItem.id, {
                    tenTP: editItem.name,
                    giaThue: editItem.price,
                    size: editItem.size,
                    trangThai: editItem.status,
                  });
                  setEditItem(null);
                  refreshCostumes();
                }}
              >
                Lưu thay đổi
              </button>
              <button
                style={{ marginTop: 8, padding: "10px 16px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", cursor: "pointer", width: "100%", fontWeight: 600 }}
                onClick={() => setEditItem(null)}
              >
                Hủy
              </button>
            </div>
          </div>
        )}
        {alertMsg && <AlertModal message={alertMsg} onClose={() => setAlertMsg('')} />}
        {confirmDelete && (
          <ConfirmModal
            message="Bạn có chắc chắn muốn xóa trang phục này không?"
            onConfirm={() => handleDelete(confirmDelete)}
            onCancel={() => setConfirmDelete(null)}
          />
        )}
        {showAddModal && (
          <AddCostumeModal onClose={() => setShowAddModal(false)} onSuccess={refreshCostumes} />
        )}
      </main>
    </div>
  );
}

const headerActionStyle: CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 };
const toolbarStyle: CSSProperties = { display: "flex", gap: 16, marginBottom: 24, alignItems: "center" };
const inputStyle: CSSProperties = { height: 40, padding: "0 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, outline: "none" };
const gridStyle: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 };
const cardStyle: CSSProperties = { background: "#fff", borderRadius: 12, padding: 16, display: "flex", gap: 12, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" };
const imageStyle: CSSProperties = { width: 80, height: 80, borderRadius: 8, objectFit: "cover" };
const badgeStyle: CSSProperties = { color: "#fff", padding: "4px 8px", borderRadius: 8, fontSize: 12, display: "inline-block" };
const modalOverlayStyle: CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 };
const modalStyle: CSSProperties = { background: "#fff", padding: 24, borderRadius: 16, width: 400, maxHeight: "90vh", overflowY: "auto" };
