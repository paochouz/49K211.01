import { useEffect, useState, type FormEvent } from "react";

export default function AddKhachHang() {
  const [form, setForm] = useState({
    maKH: "",
    tenKH: "",
    soDienThoai: "",
    diaChi: "",
  });

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Auto mã KH
  useEffect(() => {
    const id = "KH" + Date.now().toString().slice(-6);
    setForm((prev) => ({ ...prev, maKH: id }));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!form.tenKH.trim()) {
      setIsError(true);
      setMessage("Tên khách hàng không được để trống");
      return false;
    }

    if (!/^[0-9]{10}$/.test(form.soDienThoai)) {
      setIsError(true);
      setMessage("SĐT phải đủ 10 số");
      return false;
    }

    return true;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    if (!validate()) return;

    setLoading(true);

    setTimeout(() => {
      console.log(form);

      setMessage("Thêm khách hàng thành công!");
      setLoading(false);

      setForm({
        maKH: "KH" + Date.now().toString().slice(-6),
        tenKH: "",
        soDienThoai: "",
        diaChi: "",
      });
    }, 800);
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={titleStyle}>Thêm khách hàng</h2>

        <form onSubmit={handleSubmit}>
          {/* Mã KH */}
          <div style={groupStyle}>
            <label style={labelStyle}>Mã khách hàng</label>
            <input value={form.maKH} disabled style={inputStyle} />
          </div>

          {/* Tên */}
          <div style={groupStyle}>
            <label style={labelStyle}>Tên khách hàng *</label>
            <input
              name="tenKH"
              value={form.tenKH}
              onChange={handleChange}
              placeholder="Nhập tên"
              style={inputStyle}
            />
          </div>

          {/* SĐT */}
          <div style={groupStyle}>
            <label style={labelStyle}>Số điện thoại *</label>
            <input
              name="soDienThoai"
              value={form.soDienThoai}
              onChange={handleChange}
              placeholder="Nhập số điện thoại"
              style={inputStyle}
            />
          </div>

          {/* Địa chỉ */}
          <div style={groupStyle}>
            <label style={labelStyle}>Địa chỉ</label>
            <input
              name="diaChi"
              value={form.diaChi}
              onChange={handleChange}
              placeholder="Nhập địa chỉ"
              style={inputStyle}
            />
          </div>

          {/* Button */}
          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? "Đang lưu..." : "Lưu"}
          </button>

          {/* Message */}
          {message && (
            <p style={{ ...messageStyle, color: isError ? "#EF4444" : "#22C55E" }}>
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

/* ================= STYLE ================= */

const containerStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#F1F5F9",
  display: "flex",
  justifyContent: "center", // căn giữa ngang
  alignItems: "flex-start", // 👈 đẩy lên trên
  paddingTop: 40,           // 👈 tạo khoảng cách phía trên
};

const cardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 420, // 👈 nhỏ lại giống hình bạn
  background: "#fff",
  padding: 20,
  borderRadius: 12,
  boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
};

const titleStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 600,
  marginBottom: 16,
};

const groupStyle: React.CSSProperties = {
  marginBottom: 12,
};

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 500,
  color: "#334155",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 36,
  border: "1px solid #E2E8F0",
  borderRadius: 8,
  padding: "0 10px",
  marginTop: 4,
  outline: "none",
  fontSize: 14,
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  height: 38,
  background: "#2563EB",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  fontWeight: 500,
  cursor: "pointer",
  marginTop: 8,
};

const messageStyle: React.CSSProperties = {
  marginTop: 10,
  fontSize: 13,
};