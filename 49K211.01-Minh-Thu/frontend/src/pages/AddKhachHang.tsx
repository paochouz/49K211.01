import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

export default function AddKhachHang() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    maKH: "",
    tenKH: "",
    soDienThoai: "",
    diaChi: "",
  });

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Hiển thị trạng thái mã sẽ do hệ thống tự tạo từ Database
  useEffect(() => {
    setForm((prev) => ({ ...prev, maKH: "Hệ thống tự tạo (KHXXXXXX)" }));
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

    // Kiểm tra định dạng 10 số [cite: 234]
    if (!/^[0-9]{10}$/.test(form.soDienThoai)) {
      setIsError(true);
      setMessage("Số điện thoại phải bao gồm đúng 10 chữ số");
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
      // Gọi API đến Backend đã cấu hình (Port 3002)
      const response = await fetch("http://localhost:3002/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tenKH: form.tenKH,
          soDienThoai: form.soDienThoai,
          diaChi: form.diaChi,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ Thêm thành công! Mã khách hàng: ${data.maKH}`);
        // Chuyển hướng về trang quản lý khách hàng
        navigate("/customers/manage");
      } else {
        setIsError(true);
        setMessage(data.message || "Lỗi khi lưu thông tin");
      }
    } catch (err) {
      setIsError(true);
      setMessage("Lỗi kết nối: Hãy đảm bảo Backend đang chạy ở cổng 3002");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, background: "#F8FAFC", minHeight: "100vh" }}>
      <h2 style={{ fontSize: 22, marginBottom: 16 }}>Thêm khách hàng mới</h2>

      <div
        style={{
          background: "#fff",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          maxWidth: 500,
        }}
      >
        <form onSubmit={handleSubmit}>
          {/* Mã KH */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Mã khách hàng</label>
            <input value={form.maKH} disabled style={inputStyle} />
          </div>

          {/* Tên KH */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Tên khách hàng *</label>
            <input
              name="tenKH"
              value={form.tenKH}
              onChange={handleChange}
              placeholder="Nhập tên khách hàng"
              style={inputStyle}
            />
          </div>

          {/* SĐT */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Số điện thoại *</label>
            <input
              name="soDienThoai"
              value={form.soDienThoai}
              onChange={handleChange}
              placeholder="Ví dụ: 0973729452"
              style={inputStyle}
            />
          </div>

          {/* Địa chỉ */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Địa chỉ</label>
            <input
              name="diaChi"
              value={form.diaChi}
              onChange={handleChange}
              placeholder="Nhập địa chỉ"
              style={inputStyle}
            />
          </div>

          {/* Button Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? "#94A3B8" : "#2563EB",
              color: "#fff",
              border: "none",
              padding: "12px 16px",
              borderRadius: 8,
              cursor: loading ? "not-allowed" : "pointer",
              width: "100%",
              fontWeight: 600,
              fontSize: 16,
              transition: "background 0.2s"
            }}
          >
            {loading ? "Đang xử lý..." : "Lưu khách hàng"}
          </button>

          {/* Message Thông báo */}
          {message && (
            <div
              style={{
                marginTop: 16,
                padding: "10px 12px",
                borderRadius: 6,
                fontSize: 14,
                background: isError ? "#FEF2F2" : "#F0FDF4",
                color: isError ? "#EF4444" : "#16A34A",
                border: `1px solid ${isError ? "#FCA5A5" : "#86EFAC"}`
              }}
            >
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 500,
  color: "#475569",
  display: "block",
  marginBottom: 4
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 42,
  border: "1px solid #E5E7EB",
  borderRadius: 8,
  padding: "0 12px",
  fontSize: 15,
  outline: "none",
  boxSizing: "border-box"
};