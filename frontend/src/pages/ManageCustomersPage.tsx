import { useMemo, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";

type Customer = {
  maKH: string;
  tenKH: string;
  soDienThoai: string;
  diaChi: string;
};

const seedCustomers: Customer[] = [
  { maKH: "KH000101", tenKH: "Nguyễn Văn An", soDienThoai: "0912345678", diaChi: "Hải Châu, Đà Nẵng" },
  { maKH: "KH000102", tenKH: "Trần Thị Bình", soDienThoai: "0987654321", diaChi: "Sơn Trà, Đà Nẵng" },
  { maKH: "KH000103", tenKH: "Lê Minh Châu", soDienThoai: "0901122334", diaChi: "Thanh Khê, Đà Nẵng" },
  { maKH: "KH000104", tenKH: "Phạm Ngọc Ánh", soDienThoai: "0933221144", diaChi: "Ngũ Hành Sơn, Đà Nẵng" },
  { maKH: "KH000105", tenKH: "Đặng Hoàng Yến", soDienThoai: "0977556688", diaChi: "Liên Chiểu, Đà Nẵng" },
];

export default function ManageCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(seedCustomers);
  const [keyword, setKeyword] = useState("");

  const filteredCustomers = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    if (!normalizedKeyword) return customers;
    return customers.filter((customer) => {
      return (
        customer.maKH.toLowerCase().includes(normalizedKeyword) ||
        customer.tenKH.toLowerCase().includes(normalizedKeyword) ||
        customer.soDienThoai.includes(normalizedKeyword)
      );
    });
  }, [customers, keyword]);

  const handleDelete = (maKH: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa khách hàng này?")) {
      setCustomers((prev) => prev.filter((item) => item.maKH !== maKH));
    }
  };

  return (
    <div style={layoutStyle}>
      {/* SIDEBAR */}
      <aside style={sidebarStyle}>
        <div style={brandContainerStyle}>
          <div style={brandIconWrapper}>CT</div>
          <span style={brandNameStyle}>Tiệm Cô Thắm</span>
        </div>
        
        <nav style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <MenuItem 
            label="Trang chủ" 
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>} 
          />
          <MenuItem 
            label="Quản lý đơn thuê" 
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>} 
          />
          <MenuItem 
            active
            label="Quản lý khách hàng" 
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>} 
          />
          <MenuItem 
            label="Quản lý Trang phục" 
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.62 1.96V7a2 2 0 0 0 2 2 2 2 0 0 1 2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-8a2 2 0 0 1 2-2 2 2 0 0 0 2-2V5.42a2 2 0 0 0-1.62-1.96Z"/></svg>} 
          />
          <MenuItem 
            label="Cấu hình phạt" 
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>} 
          />
        </nav>

        <button style={logoutButtonStyle}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
          <span style={{ marginLeft: 12 }}>Đăng xuất</span>
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main style={contentStyle}>
        <div style={headerActionStyle}>
          <h2 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#1e293b' }}>Quản lý khách hàng</h2>
          <Link to="/add-khach-hang" style={primaryButtonStyle}>+ Thêm khách hàng</Link>
        </div>

        <div style={statsGridStyle}>
          <div style={statCardStyle}>
            <div style={iconBoxStyle}>👥</div>
            <div>
              <p style={statLabelStyle}>Tổng khách hàng</p>
              <p style={statValueStyle}>{customers.length}</p>
            </div>
          </div>
        </div>

        <div style={tableContainerStyle}>
          <div style={tableHeaderStyle}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Danh sách khách hàng</h3>
            <input
              placeholder="Tìm mã, tên hoặc số điện thoại..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={searchInputStyle}
            />
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={headerCellStyle}>Mã KH</th>
                  <th style={headerCellStyle}>Tên khách hàng</th>
                  <th style={headerCellStyle}>Số điện thoại</th>
                  <th style={headerCellStyle}>Địa chỉ</th>
                  <th style={headerCellStyle}>Trạng thái</th>
                  <th style={headerCellStyle}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.maKH}>
                    <td style={cellStyle}><b>{customer.maKH}</b></td>
                    <td style={cellStyle}>{customer.tenKH}</td>
                    <td style={cellStyle}>{customer.soDienThoai}</td>
                    <td style={cellStyle}>{customer.diaChi || "-"}</td>
                    <td style={cellStyle}><span style={badgeStyle}>Đang hoạt động</span></td>
                    <td style={cellStyle}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button style={editButtonStyle}>Sửa</button>
                        <button onClick={() => handleDelete(customer.maKH)} style={deleteButtonStyle}>Xóa</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

// --- MENU ITEM COMPONENT ---
function MenuItem({ icon, label, active }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <button style={{
      display: "flex", alignItems: "center", gap: 12, width: "100%", border: "none", borderRadius: "12px",
      padding: "12px 16px", cursor: "pointer", background: active ? "#4361EE" : "transparent",
      color: active ? "#fff" : "#94a3b8", fontWeight: active ? 600 : 500, fontSize: 15, transition: "0.2s"
    }}>
      {icon} <span>{label}</span>
    </button>
  );
}

// --- STYLES ---
const layoutStyle: CSSProperties = { minHeight: "100vh", display: "grid", gridTemplateColumns: "260px 1fr", background: "#f8fafc" };
const sidebarStyle: CSSProperties = { background: "#fff", padding: "24px 16px", display: "flex", flexDirection: "column", borderRight: "1px solid #f1f5f9" };
const brandContainerStyle: CSSProperties = { display: "flex", alignItems: "center", gap: 12, marginBottom: 40, paddingLeft: 8 };
const brandIconWrapper: CSSProperties = { width: 40, height: 40, background: "#4361EE", color: "#fff", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 18 };
const brandNameStyle: CSSProperties = { fontSize: 19, fontWeight: 700, color: "#1e293b" };
const contentStyle: CSSProperties = { padding: "40px" };
const headerActionStyle: CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 };
const primaryButtonStyle: CSSProperties = { background: "#4361EE", color: "#fff", padding: "12px 24px", borderRadius: "12px", textDecoration: "none", fontWeight: 600, fontSize: 14 };
const statsGridStyle: CSSProperties = { marginBottom: 32 };
const statCardStyle: CSSProperties = { background: "#fff", padding: "20px", borderRadius: "20px", display: "inline-flex", alignItems: "center", gap: 16, minWidth: "240px", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" };
const iconBoxStyle: CSSProperties = { width: 52, height: 52, backgroundColor: "#f0f3ff", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 };
const statLabelStyle: CSSProperties = { margin: 0, color: "#64748b", fontSize: 14 };
const statValueStyle: CSSProperties = { margin: 0, fontSize: 26, fontWeight: 700, color: "#1e293b" };
const tableContainerStyle: CSSProperties = { background: "#fff", borderRadius: "24px", padding: "28px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" };
const tableHeaderStyle: CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 };
const searchInputStyle: CSSProperties = { padding: "10px 16px", borderRadius: "10px", border: "1px solid #e2e8f0", width: "320px", outline: "none", fontSize: 14 };
const tableStyle: CSSProperties = { width: "100%", borderCollapse: "collapse" };
const headerCellStyle: CSSProperties = { textAlign: "left", padding: "16px 12px", color: "#94a3b8", fontSize: 13, borderBottom: "1px solid #f1f5f9", fontWeight: 600 };
const cellStyle: CSSProperties = { padding: "16px 12px", fontSize: 15, borderBottom: "1px solid #f1f5f9", color: "#334155" };
const badgeStyle: CSSProperties = { background: "#ecfdf5", color: "#10b981", padding: "4px 12px", borderRadius: "20px", fontSize: 12, fontWeight: 600 };
const editButtonStyle: CSSProperties = { background: "#f1f5f9", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: 13, fontWeight: 500 };
const deleteButtonStyle: CSSProperties = { background: "#fef2f2", color: "#ef4444", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: 13, fontWeight: 500 };
const logoutButtonStyle: CSSProperties = {
  marginTop: "auto",
  padding: "12px 16px",
  border: "none",
  background: "transparent",
  
  // Đổi màu xám thành màu đỏ chủ đạo
  color: "#EF4444", 
  
  display: "flex",
  alignItems: "center",
  cursor: "pointer",
  fontSize: 15,
  fontWeight: 600, // Làm đậm chữ một chút để nổi bật
  transition: "all 0.2s ease",
  borderRadius: "12px",
};