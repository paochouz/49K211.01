import { useState, useMemo, useEffect } from "react";
import type { CSSProperties, ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";

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

const sidebarMenu = [
  {
    label: "Trang chủ",
    path: "/",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="7" height="9" x="3" y="3" rx="1" />
        <rect width="7" height="5" x="14" y="3" rx="1" />
        <rect width="7" height="9" x="14" y="12" rx="1" />
        <rect width="7" height="5" x="3" y="16" rx="1" />
      </svg>
    ),
  },
  {
    label: "Quản lý đơn thuê",
    path: "/rentals",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z" />
        <path d="M12 11h4" />
        <path d="M12 16h4" />
        <path d="M8 11h.01" />
        <path d="M8 16h.01" />
      </svg>
    ),
  },
  {
    label: "Quản lý khách hàng",
    path: "/customers/create",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: "Quản lý Trang phục",
    path: "/costumes",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.62 1.96V7a2 2 0 0 0 2 2 2 2 0 0 1 2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-8a2 2 0 0 1 2-2 2 2 0 0 0 2-2V5.42a2 2 0 0 0-1.62-1.96Z" />
      </svg>
    ),
  },
  {
    label: "Cấu hình phạt",
    path: "/settings",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

export default function CostumeListPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusValue | "">("");
  const [selected, setSelected] = useState<CostumeItem | null>(null);
  const [costumes, setCostumes] = useState<CostumeItem[]>([]); 
  
  const navigate = useNavigate();
  const location = useLocation();

  // Gọi API từ Backend chạy ở port 3003
  useEffect(() => {
    fetch("http://localhost:3003/api/costume-list") 
      .then((res) => res.json())
      .then((data) => {
        // CHUẨN HÓA DỮ LIỆU: Đọc đúng tên cột thô từ Database SQL Server
        const mappedData = data.map((item: any) => ({
  id: item.MaTP,
  name: item.TenTP,
  price: item.GiaThue,
  size: item.MoTa 
  ? `${item.Size} - ${item.MoTa}` 
  : item.Size,
  status:
    item.TrangThai === "Dang thue"
      ? "Đang thuê"
      : item.TrangThai,
  image: item.HinhAnh,

  renter: item.TenKH ?? "Chưa có tên",
  returnDate: item.NgayTraDuKien ?? "Chưa có hạn trả",
        }));
        
        
        setCostumes(mappedData); 
      })
      .catch((err) => console.error("Lỗi fetch API:", err));
  }, []);

  const filteredData = useMemo(() => {
    return costumes
      .filter((item) => {
        // Thêm dấu "?" sau item.name và item.id để tránh lỗi sập trang nếu dữ liệu rỗng
        const matchSearch =
          (item.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
          (item.id?.toLowerCase() || "").includes(search.toLowerCase());

        const matchStatus = statusFilter ? item.status === statusFilter : true;

        return matchSearch && matchStatus;
      })
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }, [search, statusFilter, costumes]);

  const isActive = (path: string) => {
    if (path === "/costumes") return location.pathname.startsWith("/costumes");
    return location.pathname === path;
  };

  return (
    <div style={layoutStyle}>
      <aside style={sidebarStyle}>
        <div style={brandContainerStyle}>
          <div style={brandIconWrapper}>CT</div>
          <span style={brandNameStyle}>Tiệm Cô Thắm</span>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {sidebarMenu.map((item) => (
            <MenuItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              active={isActive(item.path)}
              onClick={() => navigate(item.path)}
            />
          ))}
        </nav>

        <button style={logoutButtonStyle} onClick={() => navigate("/")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" x2="9" y1="12" y2="12" />
          </svg>
          <span style={{ marginLeft: 12 }}>Đăng xuất</span>
        </button>
      </aside>

      <main style={contentStyle}>
        <div style={headerActionStyle}>
          <h2 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#1e293b" }}>Quản lý trang phục</h2>
        </div>

        <div style={toolbarStyle}>
          <input
            placeholder="Tìm theo tên hoặc mã..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.input}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusValue | "")}
            style={styles.input}
          >
            <option value="">Tất cả trạng thái</option>
            {Object.values(STATUS).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.grid}>
          {filteredData.map((item) => (
            <div
              key={item.id}
              style={styles.card}
              onClick={() => {
                // Đi tìm dữ liệu chuẩn nhất từ mảng costumes gốc
                const realItem = costumes.find(c => c.id === item.id) || item;
                setSelected(realItem);
              }}
            >
              <img src={item.image} alt="" style={styles.image} />
              <div>
                <h3 style={styles.h3}>{item.name}</h3>
                <p style={styles.sub}>{item.size}</p>
                <span
                  style={{
                    ...styles.badge,
                    backgroundColor: statusColor[item.status] || "#94a3b8",
                  }}
                >
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {selected && (
          <div style={styles.modalOverlay} onClick={() => setSelected(null)}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
              <h2 style={styles.h2}>Chi tiết trang phục</h2>

              <img src={selected.image} style={styles.detailImage} alt={selected.name} />

              <p>
                <b>Mã:</b> {selected.id}
              </p>
              <p>
                <b>Tên:</b> {selected.name}
              </p>
              <p>
                <b>Giá thuê:</b> {selected.price.toLocaleString()} VND
              </p>
              <p>
                <b>Mô tả:</b> {selected.size}
              </p>

              <p style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <b>Trạng thái:</b>{" "}
                <span
                  style={{
                    ...styles.badge,
                    backgroundColor: statusColor[selected.status] || "#94a3b8",
                  }}
                >
                  {selected.status}
                </span>
              </p>

              {/* KIỂM TRA ĐIỀU KIỆN: Nếu trạng thái là "Đang thuê" thì mới hiện khung thông báo này */}
              {selected.status === "Đang thuê" && (
               <div style={{ backgroundColor: '#fef3c7', padding: '10px', borderRadius: '5px', marginTop: '10px' }}>
                <p style={{ color: '#b45309', margin: 0 }}>
                 <strong>Lịch đang thuê:</strong> Khách đang thuê: {selected.renter} – Hạn trả: {selected.returnDate}
                </p>
               </div>
              )}

              <button style={styles.button} onClick={() => setSelected(null)}>
                Đóng
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function MenuItem({ icon, label, active, onClick }: { icon: ReactNode; label: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        width: "100%",
        border: "none",
        borderRadius: "12px",
        padding: "12px 16px",
        cursor: "pointer",
        background: active ? "#4361EE" : "transparent",
        color: active ? "#fff" : "#94a3b8",
        fontWeight: active ? 600 : 500,
        fontSize: 15,
        transition: "0.2s",
        textAlign: "left",
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

const layoutStyle: CSSProperties = { minHeight: "100vh", display: "grid", gridTemplateColumns: "260px 1fr", background: "#f8fafc" };
const sidebarStyle: CSSProperties = { background: "#fff", padding: "24px 16px", display: "flex", flexDirection: "column", borderRight: "1px solid #f1f5f9" };
const brandContainerStyle: CSSProperties = { display: "flex", alignItems: "center", gap: 12, marginBottom: 40, paddingLeft: 8 };
const brandIconWrapper: CSSProperties = { width: 40, height: 40, background: "#4361EE", color: "#fff", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 18 };
const brandNameStyle: CSSProperties = { fontSize: 19, fontWeight: 700, color: "#1e293b" };
const contentStyle: CSSProperties = { padding: "40px" };
const headerActionStyle: CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 };
const toolbarStyle: CSSProperties = { display: "flex", gap: 16, marginBottom: 24, alignItems: "center" };
const logoutButtonStyle: CSSProperties = {
  marginTop: "auto",
  padding: "12px 16px",
  border: "none",
  background: "transparent",
  color: "#EF4444",
  display: "flex",
  alignItems: "center",
  cursor: "pointer",
  fontSize: 15,
  fontWeight: 600,
  transition: "all 0.2s ease",
  borderRadius: "12px",
};

const styles: Record<string, CSSProperties> = {
  input: {
    height: 40,
    padding: "0 12px",
    borderRadius: 8,
    border: "1px solid #E5E7EB",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: 16,
  },
  card: {
    background: "#fff",
    borderRadius: 12,
    padding: 16,
    display: "flex",
    gap: 12,
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  image: { width: 80, height: 80, borderRadius: 8 },
  badge: {
    color: "#fff",
    padding: "4px 8px",
    borderRadius: 8,
    fontSize: 12,
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modal: {
    background: "#fff",
    padding: 24,
    borderRadius: 16,
    width: 400,
  },
  detailImage: {
    width: "100%",
    borderRadius: 12,
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
    padding: "10px 16px",
    borderRadius: 8,
    border: "none",
    background: "#2563EB",
    color: "#fff",
    cursor: "pointer",
    width: "100%",
    fontWeight: "600"
  },
  h1: { fontSize: 26, marginBottom: 16 },
  h2: { fontSize: 22, marginBottom: 16 },
  h3: { fontSize: 18, margin: 0 },
  sub: { fontSize: 14, color: "#64748B" },
};