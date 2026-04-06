import { useState, type FormEvent } from "react";

export default function AddKhachHang() {
  const [form, setForm] = useState({
    maKH: "Hệ thống tự tạo", // SỬA: Không sinh mã ngẫu nhiên ở đây nữa
    tenKH: "",
    soDienThoai: "",
    diaChi: "",
  });

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    // Regex chặn ký tự đặc biệt theo yêu cầu E6.2
    const regexNoSpecial = /^[a-zA-Z0-9À-ỹ\s,.]+$/;

    if (!form.tenKH.trim()) {
      setIsError(true);
      setMessage("Tên khách hàng không được để trống");
      return false;
    }
    if (!regexNoSpecial.test(form.tenKH)) {
      setIsError(true);
      setMessage("Tên khách hàng không được chứa ký tự đặc biệt");
      return false;
    }
    if (!/^[0-9]{10}$/.test(form.soDienThoai)) {
      setIsError(true);
      setMessage("SĐT phải đủ 10 chữ số");
      return false;
    }
    if (form.diaChi && !regexNoSpecial.test(form.diaChi)) {
      setIsError(true);
      setMessage("Địa chỉ không được chứa ký tự đặc biệt");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    if (!validate()) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3003/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenKH: form.tenKH,
          soDienThoai: form.soDienThoai,
          diaChi: form.diaChi,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Lỗi server');
      }

      // HIỂN THỊ MÃ KH THẬT TỪ BACKEND TRẢ VỀ (KH00000x)
      setIsError(false);
      setMessage(`Thêm thành công! Mã KH: ${data.data.maKH}`);
      
      // Reset form
      setForm({
        maKH: "Hệ thống tự tạo",
        tenKH: "",
        soDienThoai: "",
        diaChi: "",
      });
    } catch (error: any) {
      setIsError(true);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={titleStyle}>Thêm khách hàng</h2>
        <form onSubmit={handleSubmit}>
          <div style={groupStyle}>
            <label style={labelStyle}>Mã khách hàng</label>
            <input 
              value={form.maKH} 
              disabled 
              style={{ ...inputStyle, background: "#f8fafc", color: "#64748b" }} 
            />
          </div>

          <div style={groupStyle}>
            <label style={labelStyle}>Tên khách hàng *</label>
            <input
              name="tenKH"
              value={form.tenKH}
              onChange={handleChange}
              placeholder="Nhập tên khách hàng"
              style={inputStyle}
            />
          </div>

          <div style={groupStyle}>
            <label style={labelStyle}>Số điện thoại *</label>
            <input
              name="soDienThoai"
              value={form.soDienThoai}
              onChange={handleChange}
              placeholder="Nhập 10 số điện thoại"
              style={inputStyle}
            />
          </div>

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

          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? "Đang lưu..." : "Lưu"}
          </button>

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

// Giữ nguyên các biến Style bên dưới...
const containerStyle: React.CSSProperties = { minHeight: "100vh", background: "#F1F5F9", display: "flex", justifyContent: "center", paddingTop: 40 };
const cardStyle: React.CSSProperties = { width: "100%", maxWidth: 420, background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 6px 16px rgba(0,0,0,0.08)" };
const titleStyle: React.CSSProperties = { fontSize: 18, fontWeight: 600, marginBottom: 16 };
const groupStyle: React.CSSProperties = { marginBottom: 12 };
const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 500, color: "#334155" };
const inputStyle: React.CSSProperties = { width: "100%", height: 36, border: "1px solid #E2E8F0", borderRadius: 8, padding: "0 10px", marginTop: 4, outline: "none", fontSize: 14 };
const buttonStyle: React.CSSProperties = { width: "100%", height: 38, background: "#2563EB", color: "#fff", border: "none", borderRadius: 8, fontWeight: 500, cursor: "pointer", marginTop: 16 };
const messageStyle: React.CSSProperties = { marginTop: 10, fontSize: 13 };