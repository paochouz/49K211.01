import { useState } from "react";
import type { CSSProperties, ChangeEvent } from "react";
import Menu from "./Menu";
import AlertModal from "../components/AlertModal";
import { costumeStore } from "../mock/mockStore";

export default function CostumeCreatePage() {
  const [form, setForm] = useState({
    tenTP: "",
    loaiTP: "",
    giaThue: "",
    size: "",
    moTa: "",
    hinhAnh: null as File | null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');

  // ================= VALIDATE =================
  const validate = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};

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
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, hinhAnh: e.target.files?.[0] || null });
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

      costumeStore.create({
        tenTP: form.tenTP, loaiTP: form.loaiTP,
        giaThue: Number(form.giaThue), size: form.size,
        moTa: form.moTa, hinhAnh: '', trangThai: 'Sẵn sàng',
      });
      setAlertMsg("Thêm trang phục thành công!");
      setForm({ tenTP: "", loaiTP: "", giaThue: "", size: "", moTa: "", hinhAnh: null });
    } catch (err) {
      console.error(err);
      setAlertMsg("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  // ================= UI =================
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <aside style={{ position: "fixed", top: 0, left: 0, width: "220px", height: "100vh" }}>
        <Menu />
      </aside>
      <main style={{ marginLeft: "220px", padding: "24px" }}>
        <h1 style={{ margin: "0 0 24px", fontSize: 24, fontWeight: 700, color: "#1e293b" }}>Thêm trang phục</h1>
        <div style={styles.card}>

        {/* Mã TP (Disable) */}
        <div style={styles.group}>
          <label style={styles.label}>Mã trang phục</label>
          <input style={styles.input} disabled placeholder="TPXXXXXX (auto)" />
        </div>

        {/* Tên */}
        <div style={styles.group}>
          <label style={styles.label}>
            Tên trang phục <span style={{ color: "#EF4444" }}>*</span>
          </label>
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
          <label style={styles.label}>
            Loại trang phục <span style={{ color: "#EF4444" }}>*</span>
          </label>
          <select
            name="loaiTP"
            value={form.loaiTP}
            onChange={handleChange}
            style={styles.input}
          >
            <option value="">Chọn loại trang phục</option>
            <option value="Váy dạ hội">Váy dạ hội</option>
            <option value="Áo dài">Áo dài</option>
            <option value="Vest">Vest</option>
            <option value="Cách tân">Cách tân</option>
            <option value="Cosplay">Cosplay</option>
          </select>
        </div>

        {/* Giá */}
        <div style={styles.group}>
          <label style={styles.label}>
            Giá thuê <span style={{ color: "#EF4444" }}>*</span>
          </label>
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
            <option value="XL">XL</option>
            <option value="XXL">XXL</option>
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
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleChange(e as any)}
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
        {alertMsg && <AlertModal message={alertMsg} onClose={() => setAlertMsg('')} />}
      </main>
    </div>
  );
}

// ================= STYLE =================
const styles: Record<string, CSSProperties> = {
  card: {
    background: "#fff",
    padding: "24px",
    borderRadius: "12px",
    maxWidth: "600px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    border: "1px solid #e2e8f0",
  },
  group: {
    marginBottom: "16px",
  },
  label: {
    fontSize: "13px",
    fontWeight: 600,
    marginBottom: "4px",
    display: "block",
    color: "#334155",
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