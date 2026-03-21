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
    <div style={{ padding: 24, background: "#F8FAFC", minHeight: "100vh" }}>
      <h2 style={{ fontSize: 22, marginBottom: 16 }}>Thêm khách hàng</h2>

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
            <label>Mã khách hàng</label>
            <input value={form.maKH} disabled style={inputStyle} />
          </div>

          {/* Tên KH */}
          <div style={{ marginBottom: 16 }}>
            <label>Tên khách hàng *</label>
            <input
              name="tenKH"
              value={form.tenKH}
              onChange={handleChange}
              placeholder="Nhập tên"
              style={inputStyle}
            />
          </div>

          {/* SĐT */}
          <div style={{ marginBottom: 16 }}>
            <label>Số điện thoại *</label>
            <input
              name="soDienThoai"
              value={form.soDienThoai}
              onChange={handleChange}
              placeholder="Nhập số điện thoại"
              style={inputStyle}
            />
          </div>

          {/* Địa chỉ */}
          <div style={{ marginBottom: 16 }}>
            <label>Địa chỉ</label>
            <input
              name="diaChi"
              value={form.diaChi}
              onChange={handleChange}
              placeholder="Nhập địa chỉ"
              style={inputStyle}
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              background: "#2563EB",
              color: "#fff",
              border: "none",
              padding: "10px 16px",
              borderRadius: 8,
              cursor: "pointer",
              width: "100%",
            }}
          >
            {loading ? "Đang lưu..." : "Lưu"}
          </button>

          {/* Message */}
          {message && (
            <p
              style={{
                marginTop: 12,
                color: isError ? "#EF4444" : "#22C55E",
              }}
            >
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 40,
  border: "1px solid #E5E7EB",
  borderRadius: 8,
  padding: "0 12px",
  marginTop: 4,
};