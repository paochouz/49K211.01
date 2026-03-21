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

    if (!normalizedKeyword) {
      return customers;
    }

    return customers.filter((customer) => {
      return (
        customer.maKH.toLowerCase().includes(normalizedKeyword) ||
        customer.tenKH.toLowerCase().includes(normalizedKeyword) ||
        customer.soDienThoai.includes(normalizedKeyword)
      );
    });
  }, [customers, keyword]);

  const handleDelete = (maKH: string) => {
    const confirmed = window.confirm("Bạn có chắc chắn muốn xóa khách hàng này?");

    if (!confirmed) {
      return;
    }

    setCustomers((prev) => prev.filter((item) => item.maKH !== maKH));
  };

  const totalCustomers = customers.length;

  return (
    <div style={layoutStyle}>
      <aside style={sidebarStyle}>
        <h3 style={{ margin: "0 0 24px", fontSize: 24, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={brandIconStyle}>🎯</span>
          <span>CRMS</span>
        </h3>
        <nav style={{ display: "grid", gap: 8 }}>
          <MenuItem icon="🏠" label="Dashboard" />
          <MenuItem icon="🧾" label="Đơn thuê" />
          <MenuItem icon="👥" label="Khách hàng" active />
          <MenuItem icon="👗" label="Trang phục" />
          <MenuItem icon="💳" label="Thanh toán" />
          <MenuItem icon="📊" label="Báo cáo" />
        </nav>
      </aside>

      <main style={contentStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>Quản lý khách hàng</h2>
          <Link to="/add-khach-hang" className="app-button app-button--primary" style={linkButtonStyle}>
            + Thêm mới
          </Link>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(220px, 320px)",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div className="app-card" style={{ padding: 16 }}>
            <p style={cardTitleStyle}>Tổng khách hàng</p>
            <p style={cardValueStyle}>{totalCustomers}</p>
          </div>
        </div>

        <div className="app-card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 14,
            }}
          >
            <h3 style={{ margin: 0 }}>Danh sách khách hàng</h3>
            <input
              className="form-input"
              placeholder="Tìm mã, tên hoặc số điện thoại..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={{ maxWidth: 320 }}
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
                    <td style={cellStyle}>{customer.maKH}</td>
                    <td style={cellStyle}>{customer.tenKH}</td>
                    <td style={cellStyle}>{customer.soDienThoai}</td>
                    <td style={cellStyle}>{customer.diaChi || "-"}</td>
                    <td style={cellStyle}>
                      <span style={badgeStyle}>Đang hoạt động</span>
                    </td>
                    <td style={cellStyle}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button type="button" className="app-button app-button--secondary">
                          Sửa
                        </button>
                        <button
                          type="button"
                          className="app-button app-button--danger"
                          onClick={() => handleDelete(customer.maKH)}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ ...cellStyle, textAlign: "center", color: "#64748B" }}>
                      Không tìm thấy khách hàng phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function MenuItem({ icon, label, active }: { icon: string; label: string; active?: boolean }) {
  return (
    <button
      type="button"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        textAlign: "left",
        border: "none",
        borderRadius: 10,
        padding: "10px 12px",
        color: active ? "#fff" : "#D6E3F0",
        background: active ? "#34495E" : "transparent",
        cursor: "pointer",
        fontSize: 18,
      }}
    >
      <span style={{ width: 24, display: "inline-flex", justifyContent: "center" }}>{icon}</span>
      {label}
    </button>
  );
}

const layoutStyle: CSSProperties = {
  minHeight: "100vh",
  display: "grid",
  gridTemplateColumns: "220px 1fr",
  background: "#F3F5F9",
};

const sidebarStyle: CSSProperties = {
  background: "#2B3F52",
  color: "#fff",
  padding: "20px 16px",
};

const brandIconStyle: CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: 8,
  background: "#2E4155",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 16,
};

const contentStyle: CSSProperties = {
  padding: "20px 16px",
};

const linkButtonStyle: CSSProperties = {
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 40,
};

const tableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: 760,
};

const headerCellStyle: CSSProperties = {
  textAlign: "left",
  fontWeight: 600,
  fontSize: 14,
  borderBottom: "1px solid #E5E7EB",
  padding: "12px 10px",
};

const cellStyle: CSSProperties = {
  borderBottom: "1px solid #E5E7EB",
  padding: "12px 10px",
  fontSize: 14,
};

const badgeStyle: CSSProperties = {
  background: "#DCFCE7",
  color: "#166534",
  borderRadius: 999,
  padding: "4px 10px",
  fontSize: 12,
  fontWeight: 600,
};

const cardTitleStyle: CSSProperties = {
  margin: 0,
  color: "#64748B",
  fontSize: 13,
};

const cardValueStyle: CSSProperties = {
  margin: "8px 0 0",
  fontSize: 28,
  fontWeight: 700,
};
