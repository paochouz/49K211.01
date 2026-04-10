import { useState, type ChangeEvent, type CSSProperties } from "react";
import { costumeStore } from "../mock/mockStore";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddCostumeModal({ onClose, onSuccess }: Props) {
  const [form, setForm] = useState({
    tenTP: "",
    loaiTP: "",
    giaThue: "",
    size: "",
    moTa: "",
    hinhAnh: null as File | null,
    hinhAnhPreview: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const maTP = costumeStore.nextCode();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.tenTP.trim()) e.tenTP = "Tên trang phục bắt buộc";
    else if (/[^a-zA-Z0-9À-ỹ\s]/.test(form.tenTP)) e.tenTP = "Không chứa ký tự đặc biệt";
    if (!form.loaiTP) e.loaiTP = "Loại trang phục bắt buộc";
    if (!form.giaThue) e.giaThue = "Giá thuê bắt buộc";
    else if (Number(form.giaThue) <= 0) e.giaThue = "Giá phải > 0";
    return e;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setForm((p) => ({
      ...p,
      hinhAnh: file,
      hinhAnhPreview: file ? URL.createObjectURL(file) : "",
    }));
  };

  const handleSubmit = () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    costumeStore.create({
      tenTP: form.tenTP,
      loaiTP: form.loaiTP,
      giaThue: Number(form.giaThue),
      size: form.size,
      moTa: form.moTa,
      hinhAnh: form.hinhAnhPreview || "",
      trangThai: "Sẵn sàng",
    });
    onSuccess();
    onClose();
  };

  return (
    <div style={overlay} onMouseDown={onClose}>
      <div style={card} onMouseDown={(e) => e.stopPropagation()}>
        <h2 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 700, color: "#1e293b" }}>Thêm trang phục</h2>

        {/* Mã trang phục - disabled */}
        <div style={group}>
          <label style={lbl}>Mã trang phục</label>
          <input value={maTP} disabled style={{ ...inputStyle, background: "#f1f5f9", cursor: "not-allowed" }} />
        </div>

        {/* Tên */}
        <div style={group}>
          <label style={lbl}>Tên trang phục <span style={{ color: "#ef4444" }}>*</span></label>
          <input name="tenTP" value={form.tenTP} onChange={handleChange} placeholder="Nhập tên trang phục" style={inputStyle} />
          {errors.tenTP && <span style={errStyle}>{errors.tenTP}</span>}
        </div>

        {/* Loại */}
        <div style={group}>
          <label style={lbl}>Loại trang phục <span style={{ color: "#ef4444" }}>*</span></label>
          <select name="loaiTP" value={form.loaiTP} onChange={handleChange} style={inputStyle}>
            <option value="">Chọn loại trang phục</option>
            <option>Váy dạ hội</option>
            <option>Vest</option>
            <option>Áo dài</option>
            <option>Cosplay</option>
          </select>
          {errors.loaiTP && <span style={errStyle}>{errors.loaiTP}</span>}
        </div>

        {/* Giá thuê */}
        <div style={group}>
          <label style={lbl}>Giá thuê <span style={{ color: "#ef4444" }}>*</span></label>
          <input name="giaThue" type="number" value={form.giaThue} onChange={handleChange} placeholder="Nhập giá thuê" style={inputStyle} />
          {errors.giaThue && <span style={errStyle}>{errors.giaThue}</span>}
        </div>

        {/* Size */}
        <div style={group}>
          <label style={lbl}>Size</label>
          <select name="size" value={form.size} onChange={handleChange} style={inputStyle}>
            <option value="">Chọn size</option>
            {["S", "M", "L", "XL", "XXL"].map((v) => <option key={v}>{v}</option>)}
          </select>
        </div>

        {/* Hình ảnh */}
        <div style={group}>
          <label style={lbl}>Hình ảnh</label>
          <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: 8, cursor: "pointer", background: "#f8fafc", fontSize: 13, color: "#64748b" }}>
            <span style={{ fontSize: 18 }}>📎</span>
            <span>{form.hinhAnh ? form.hinhAnh.name : "Chọn ảnh từ máy..."}</span>
            <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
          </label>
          {form.hinhAnhPreview && (
            <img src={form.hinhAnhPreview} alt="preview" style={{ marginTop: 8, width: 80, height: 80, objectFit: "cover", borderRadius: 8, border: "1px solid #e2e8f0" }} />
          )}
        </div>

        {/* Mô tả */}
        <div style={group}>
          <label style={lbl}>Mô tả</label>
          <textarea name="moTa" value={form.moTa} onChange={handleChange} placeholder="Chất liệu, màu sắc..." style={{ ...inputStyle, height: 72, resize: "vertical", paddingTop: 8 }} />
        </div>

        {/* Trạng thái - disabled */}
        <div style={group}>
          <label style={lbl}>Trạng thái</label>
          <input value="Sẵn sàng" disabled style={{ ...inputStyle, background: "#f1f5f9", cursor: "not-allowed" }} />
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={cancelBtn}>Hủy</button>
          <button onClick={handleSubmit} style={saveBtn}>Lưu</button>
        </div>
      </div>
    </div>
  );
}

const overlay: CSSProperties = { position: "fixed", inset: 0, background: "rgba(15,23,42,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 };
const card: CSSProperties = { background: "#fff", borderRadius: 16, padding: 28, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 12px 40px rgba(0,0,0,0.12)" };
const group: CSSProperties = { marginBottom: 14 };
const lbl: CSSProperties = { display: "block", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 5 };
const inputStyle: CSSProperties = { width: "100%", height: 40, border: "1px solid #e2e8f0", borderRadius: 8, padding: "0 12px", fontSize: 14, outline: "none", boxSizing: "border-box" };
const errStyle: CSSProperties = { color: "#ef4444", fontSize: 12, marginTop: 3, display: "block" };
const cancelBtn: CSSProperties = { flex: 1, height: 40, borderRadius: 8, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#64748b", fontWeight: 600, cursor: "pointer", fontSize: 14 };
const saveBtn: CSSProperties = { flex: 1, height: 40, borderRadius: 8, border: "none", background: "#2563eb", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 14 };
