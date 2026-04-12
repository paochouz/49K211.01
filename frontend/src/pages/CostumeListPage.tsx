import { useState, useMemo, useEffect, type CSSProperties } from "react";
import Menu from "./Menu";
import { isOwner } from "../hooks/useAuth";
import AlertModal from "../components/AlertModal";
import ConfirmModal from "../components/ConfirmModal";
import AddCostumeModal from "../components/AddCostumeModal";
import UpdateTrangphuc from "./UpdateTrangphuc";
import { costumeStore, orderStore } from "../services/supabaseStore";

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

const statusColor: Record<string, string> = {
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
  const [rentalInfo, setRentalInfo] = useState<{customer:string;dueDate:string}|null>(null);

  useEffect(() => {
    if (selected && (selected.status === "Đang thuê" || (selected.status as string) === "Trễ hạn")) {
      orderStore.getRentalInfo(selected.name).then(setRentalInfo);
    } else {
      setRentalInfo(null);
    }
  }, [selected]);
  const mapCostume = (c: any) => ({
    id: c.maTP, name: c.tenTP, price: c.giaThue,
    size: c.moTa ? `Size ${c.size} - ${c.moTa}` : `Size ${c.size}`,
    status: c.trangThai as StatusValue,
    image: c.hinhAnh, renter: undefined, returnDate: undefined,
  });

  const [costumes, setCostumes] = useState<CostumeItem[]>([]);

  const owner = isOwner();

  const refreshCostumes = async () => {
    const { supabase } = await import('../services/supabaseClient');

    // Đồng bộ tự động: reset trang phục "Đang thuê" không thuộc đơn active
    const [{ data: orders }, { data: details }, { data: allCostumes }] = await Promise.all([
      supabase.from('donthue').select('madon, trangthaidon'),
      supabase.from('chitietdonthue').select('matp, madon'),
      supabase.from('trangphuc').select('matp, trangthai'),
    ]);

    const activeOrderIds = new Set(
      (orders || [])
        .filter((o: any) => ['Dang thue', 'Tre han'].includes(o.trangthaidon))
        .map((o: any) => o.madon)
    );
    const activeMatps = new Set(
      (details || [])
        .filter((d: any) => activeOrderIds.has(d.madon))
        .map((d: any) => d.matp)
    );
    const toReset = (allCostumes || [])
      .filter((c: any) => c.trangthai === 'Đang thuê' && !activeMatps.has(c.matp))
      .map((c: any) => c.matp);

    if (toReset.length > 0) {
      await supabase.from('trangphuc').update({ trangthai: 'Sẵn sàng' }).in('matp', toReset);
    }

    const data = await costumeStore.list();
    setCostumes(data.map(mapCostume));
  };

  useEffect(() => { refreshCostumes(); }, []);

  const handleDelete = async (id: string) => {
    await costumeStore.delete(id);
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
              + Thêm mới
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
              <img src={item.image || undefined} alt="" style={imageStyle} onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/80x80?text=TP'; }} />
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
            <div style={{ ...modalStyle, width: 560, maxWidth: '95vw' }} onClick={(e) => e.stopPropagation()}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", margin: "0 0 16px" }}>Chi tiết trang phục</h2>

              {/* Layout: hình trái, info phải */}
              <div style={{ display: "flex", gap: 20, marginBottom: 16 }}>
                <img
                  src={selected.image || undefined}
                  alt={selected.name}
                  style={{ width: 140, height: 140, borderRadius: 12, objectFit: "cover", flexShrink: 0, border: "1px solid #e2e8f0" }}
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/140x140?text=TP'; }}
                />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    ['Mã', selected.id],
                    ['Tên', selected.name],
                    ['Giá thuê', `${selected.price.toLocaleString()} VNĐ`],
                    ['Mô tả', selected.size],
                  ].map(([l, v]) => (
                    <div key={l} style={{ fontSize: 14, color: "#334155" }}>
                      <span style={{ fontWeight: 600 }}>{l}: </span>{v}
                    </div>
                  ))}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
                    <span style={{ fontWeight: 600 }}>Trạng thái: </span>
                    <span style={{ ...badgeStyle, backgroundColor: statusColor[selected.status] || "#94a3b8" }}>
                      {selected.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lịch đang thuê */}
              {(selected.status === "Đang thuê" || (selected.status as string) === "Trễ hạn") && rentalInfo && (
                <div style={{ backgroundColor: "#fef3c7", padding: "12px 14px", borderRadius: 10, marginBottom: 16, fontSize: 13, color: "#92400e" }}>
                  <b>Lịch đang thuê:</b> Khách đang thuê: {rentalInfo.customer} – Hạn trả: {rentalInfo.dueDate}
                </div>
              )}

              {/* Buttons */}
              {owner && (
                <>
                  <button
                    style={{ marginBottom: 8, padding: "10px 16px", borderRadius: 8, border: "1px solid #c7d2fe", background: (selected.status === "Đang thuê" || selected.status === "Hư hỏng") ? "#f1f5f9" : "#eef2ff", color: (selected.status === "Đang thuê" || selected.status === "Hư hỏng") ? "#94a3b8" : "#2563eb", cursor: (selected.status === "Đang thuê" || selected.status === "Hư hỏng") ? "not-allowed" : "pointer", width: "100%", fontWeight: 600, fontSize: 14 }}
                    disabled={selected.status === "Đang thuê" || selected.status === "Hư hỏng"}
                    onClick={() => { setEditItem(selected); setSelected(null); }}
                  >
                    C&#7853;p nh&#7853;t trang ph&#7909;c
                  </button>
                </>
              )}
              <button
                style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#64748b", cursor: "pointer", width: "100%", fontWeight: 600, fontSize: 14 }}
                onClick={() => setSelected(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        )}

        {/* Modal cập nhật - chỉ chủ */}
        {owner && editItem && (
          <UpdateTrangphuc
            maTP={editItem.id}
            onClose={() => setEditItem(null)}
            onSuccess={() => { setEditItem(null); refreshCostumes(); }}
          />
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
