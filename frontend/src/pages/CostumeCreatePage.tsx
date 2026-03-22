import React, { useState } from "react";

export default function CostumeCreatePage() {
  const [form, setForm] = useState({
    tenTP: "",
    loaiTP: "",
    giaThue: "",
    size: "",
    moTa: "",
    hinhAnh: null as File | null,
  });

  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  // ================= VALIDATE =================
  const validate = () => {
    let newErrors: any = {};

    if (!form.tenTP.trim()) {
      newErrors.tenTP = "Tên trang phục bắt buộc";
    } else if (/[^a-zA-Z0-9À-ỹ\s]/.test(form.tenTP)) {
      newErrors.tenTP = "Không chứa ký tự đặc biệt";
    }

    if (!form.loaiTP.trim()) {
      newErrors.loaiTP = "Loại trang phục bắt buộc";
    }

    if (!form.giaThue) {
      newErrors.giaThue = "Giá thuê bắt buộc";
    } else if (Number(form.giaThue) <= 0) {
      newErrors.giaThue = "Giá phải > 0";
    }

    return newErrors;
  };

  // ================= HANDLE CHANGE =================
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e: any) => {
    setForm({ ...form, hinhAnh: e.target.files[0] });
  };

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    const validateErrors = validate();
    setErrors(validateErrors);

    if (Object.keys(validateErrors).length > 0) return;

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("tenTP", form.tenTP);
      formData.append("loaiTP", form.loaiTP);
      formData.append("giaThue", form.giaThue);
      formData.append("size", form.size);
      formData.append("moTa", form.moTa);
      if (form.hinhAnh) {
        formData.append("hinhAnh", form.hinhAnh);
      }

      const res = await fetch("http://localhost:3002/api/costumes", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        alert("✅ Thêm thành công");
        setForm({
          tenTP: "",
          loaiTP: "",
          giaThue: "",
          size: "",
          moTa: "",
          hinhAnh: null,
        });
      } else {
        alert("❌ Lỗi khi thêm");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi server");
    } finally {
      setLoading(false);
    }
  };

  // ================= UI =================
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Thêm trang phục</h2>

        {/* Mã TP (Disable) */}
        <div style={styles.group}>
          <label style={styles.label}>Mã trang phục</label>
          <input style={styles.input} disabled placeholder="TPXXXXXX (auto)" />
        </div>

        {/* Tên */}
        <div style={styles.group}>
          <label style={styles.label}>Tên trang phục *</label>
          <input
            name="tenTP"
            value={form.tenTP}
            onChange={handleChange}
            style={styles.input}
          />
          {errors.tenTP && <span style={styles.error}>{errors.tenTP}</span>}
        </div>

        {/* Loại */}
        <div style={styles.group}>
          <label style={styles.label}>Loại trang phục *</label>
          <input
            name="loaiTP"
            value={form.loaiTP}
            onChange={handleChange}
            style={styles.input}
          />
        </div>

        {/* Giá */}
        <div style={styles.group}>
          <label style={styles.label}>Giá thuê *</label>
          <input
            name="giaThue"
            type="number"
            value={form.giaThue}
            onChange={handleChange}
            style={styles.input}
          />
          {errors.giaThue && (
            <span style={styles.error}>{errors.giaThue}</span>
          )}
        </div>

        {/* Size */}
        <div style={styles.group}>
          <label style={styles.label}>Size</label>
          <select
            name="size"
            value={form.size}
            onChange={handleChange}
            style={styles.input}
          >
            <option value="">Chọn size</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
          </select>
        </div>

        {/* Ảnh */}
        <div style={styles.group}>
          <label style={styles.label}>Hình ảnh</label>
          <input type="file" onChange={handleFileChange} />
        </div>

        {/* Mô tả */}
        <div style={styles.group}>
          <label style={styles.label}>Mô tả</label>
          <textarea
            name="moTa"
            value={form.moTa}
            onChange={handleChange}
            style={styles.textarea}
          />
        </div>

        {/* Trạng thái */}
        <div style={styles.group}>
          <label style={styles.label}>Trạng thái</label>
          <input value="Sẵn sàng" disabled style={styles.input} />
        </div>

        {/* Button */}
        <div style={styles.buttonRow}>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={styles.primaryBtn}
          >
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ================= STYLE =================
const styles: any = {
  container: {
    fontFamily: "Inter, sans-serif",
    background: "#F8FAFC",
    minHeight: "100vh",
    padding: "32px",
  },
  card: {
    background: "#fff",
    padding: "24px",
    borderRadius: "12px",
    maxWidth: "600px",
    margin: "0 auto",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  title: {
    fontSize: "22px",
    marginBottom: "16px",
    color: "#0F172A",
  },
  group: {
    marginBottom: "16px",
  },
  label: {
    fontSize: "14px",
    marginBottom: "4px",
    display: "block",
  },
  input: {
    width: "100%",
    height: "42px",
    border: "1px solid #E5E7EB",
    borderRadius: "8px",
    padding: "8px",
  },
  textarea: {
    width: "100%",
    height: "80px",
    border: "1px solid #E5E7EB",
    borderRadius: "8px",
    padding: "8px",
  },
  error: {
    color: "#EF4444",
    fontSize: "12px",
  },
  buttonRow: {
    marginTop: "16px",
  },
  primaryBtn: {
    background: "#2563EB",
    color: "#fff",
    padding: "10px 16px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
  },
};
