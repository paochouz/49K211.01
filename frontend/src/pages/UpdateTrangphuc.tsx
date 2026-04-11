import React, { useState, useRef } from 'react';
import { Upload, ChevronDown, Trash2 } from 'lucide-react';

const UpdateTrangphuc: React.FC = () => {
  const [VaiTro] = useState<string>("N'ChuCuaHang'"); 
  
  if (VaiTro !== "N'ChuCuaHang'") {
    return null; 
  }

  const [formData, setFormData] = useState<any>({
    ma: 'TP000001',
    ten: 'Váy nude dài ren nổi phối lớp lót màu da MUST HAVE',
    size: 'M',
    giaThue: '610000',
    moTa: '',
    trangThai: 'Sẵn sàng'
  });

  const [errors, setErrors] = useState<{ ten?: string; giaThue?: string; trangThai?: string }>({});
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [previewImage, setPreviewImage] = useState<string>("https://cdn.hstatic.net/products/200000719085/35_0249c1a440f245718bd0ef3bf70c483a_master.jpg");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const newErrors: { ten?: string; giaThue?: string; trangThai?: string } = {};
    setSuccessMsg(""); 

    if (!formData.ten.trim()) {
      newErrors.ten = "Tên trang phục không được để trống!";
    }
    
    if (!formData.giaThue || formData.giaThue.toString().trim() === "") {
      newErrors.giaThue = "Giá thuê không được để trống!";
    }

    if (formData.trangThai === "Đang thuê") {
      newErrors.trangThai = "Không thể chọn trạng thái này!";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSuccessMsg("Lưu thay đổi thành công");
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>Chỉnh sửa trang phục</h2>
        </div>

        <div style={styles.content}>
          <div style={styles.imageCol}>
            <div 
              style={styles.imageContainer} 
              onClick={() => fileInputRef.current?.click()}
            >
              <img src={previewImage} alt="Costume" style={styles.image} />
              <div style={styles.uploadOverlay}>
                <Upload size={24} color="white" />
                <span style={{ color: 'white', marginTop: '8px', fontWeight: '500', fontSize: '14px' }}>Thay đổi ảnh</span>
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
              style={{ display: 'none' }} 
              accept="image/*" 
            />
          </div>

          <div style={styles.formCol}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Mã trang phục</label>
              <input type="text" value={formData.ma} disabled style={styles.inputDisabled} />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Tên trang phục*</label>
              <input 
                type="text" 
                value={formData.ten} 
                placeholder="Nhập tên trang phục"
                style={{
                  ...styles.input,
                  border: errors.ten ? '1px solid #EF4444' : '1px solid #E5E7EB'
                }}
                onChange={(e) => {
                  setFormData({...formData, ten: e.target.value});
                  if (errors.ten) setErrors({...errors, ten: undefined});
                }}
              />
              {errors.ten && <span style={styles.errorText}>{errors.ten}</span>}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Size</label>
              <input 
                type="text" 
                value={formData.size} 
                placeholder="Nhập kích cỡ"
                style={styles.input}
                onChange={(e) => setFormData({...formData, size: e.target.value})}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Giá thuê*</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  value={formData.giaThue} 
                  placeholder="Nhập giá thuê"
                  style={{
                    ...styles.input, 
                    paddingRight: '50px',
                    border: errors.giaThue ? '1px solid #EF4444' : '1px solid #E5E7EB'
                  }}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setFormData({...formData, giaThue: value});
                    if (errors.giaThue) setErrors({...errors, giaThue: undefined});
                  }}
                />
                <span style={styles.unitIcon}>VNĐ</span>
              </div>
              {errors.giaThue && <span style={styles.errorText}>{errors.giaThue}</span>}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Mô tả</label>
              <textarea 
                value={formData.moTa}
                placeholder="Nhập mô tả trang phục"
                style={styles.textarea}
                onChange={(e) => setFormData({...formData, moTa: e.target.value})}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Trạng thái</label>
              <div style={{ position: 'relative' }}>
                <select 
                  style={{
                    ...styles.selectInput,
                    border: errors.trangThai ? '1px solid #EF4444' : '1px solid #E5E7EB'
                  }}
                  value={formData.trangThai}
                  onChange={(e) => {
                    setFormData({...formData, trangThai: e.target.value});
                    if (errors.trangThai) setErrors({...errors, trangThai: undefined});
                  }}
                >
                  <option value="Sẵn sàng">Sẵn sàng</option>
                  <option value="Đang thuê">Đang thuê</option>
                  <option value="Hư hỏng">Hư hỏng</option>
                  <option value="Bảo trì">Bảo trì</option>
                  <option value="Ngưng sử dụng">Ngưng sử dụng</option>
                </select>
                <ChevronDown style={styles.inputIcon} size={18} color="#64748B" />
              </div>
              {errors.trangThai && <span style={styles.errorText}>{errors.trangThai}</span>}
            </div>
          </div>
        </div>

        <div style={styles.footerContainer}>
          <div style={styles.footer}>
            <button style={styles.deleteBtn}>
              <Trash2 size={18} />
              <span>Xóa</span>
            </button>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button style={styles.cancelBtn}>Hủy</button>
              <button style={styles.saveBtn} onClick={handleSave}>Lưu thay đổi</button>
            </div>
          </div>
          {successMsg && <div style={styles.successText}>{successMsg}</div>}
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: { 
    position: 'fixed', 
    inset: 0, 
    backgroundColor: 'rgba(15, 23, 42, 0.4)', 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    zIndex: 1000, 
    backdropFilter: 'blur(4px)' 
  },
  modal: { 
    backgroundColor: '#FFFFFF',
    borderRadius: '16px', 
    width: '850px', 
    padding: '32px', 
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    fontFamily: "'Inter', sans-serif",
    maxHeight: '90vh', 
    overflowY: 'auto', 
    position: 'relative'
  },
  header: { marginBottom: '24px' }, 
  title: { 
    fontSize: '22px', 
    fontWeight: 'bold', 
    margin: 0, 
    color: '#0F172A' 
  },
  content: { display: 'flex', gap: '32px', alignItems: 'flex-start' }, 
  imageCol: { width: '320px', flexShrink: 0, paddingTop: '8px' },
  imageContainer: { 
    position: 'relative', 
    borderRadius: '12px', 
    overflow: 'hidden', 
    aspectRatio: '3/4', 
    border: '1px solid #E5E7EB', 
    cursor: 'pointer' 
  },
  image: { width: '100%', height: '100%', objectFit: 'cover' },
  uploadOverlay: { 
    position: 'absolute', 
    inset: 0, 
    backgroundColor: 'rgba(15, 23, 42, 0.4)', 
    display: 'flex', 
    flexDirection: 'column', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  formCol: { flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }, 
  inputGroup: { display: 'flex', flexDirection: 'column' },
  label: { 
    fontWeight: '600', 
    fontSize: '14px', 
    color: '#0F172A', 
    marginBottom: '6px' 
  },
  input: { 
    width: '100%', 
    height: '42px', 
    padding: '0 16px', 
    borderRadius: '8px', 
    border: '1px solid #E5E7EB', 
    outline: 'none', 
    fontSize: '14px', 
    color: '#0F172A' 
  },
  inputDisabled: { 
    width: '100%', 
    height: '42px', 
    padding: '0 16px', 
    borderRadius: '8px', 
    border: '1px solid #E5E7EB', 
    backgroundColor: '#F8FAFC', 
    color: '#64748B' 
  },
  textarea: { 
    width: '100%', 
    height: '80px', 
    padding: '12px 16px', 
    borderRadius: '8px', 
    border: '1px solid #E5E7EB', 
    outline: 'none', 
    fontSize: '14px', 
    color: '#0F172A', 
    resize: 'none', 
    fontFamily: 'inherit' 
  },
  selectInput: { 
    width: '100%', 
    height: '42px', 
    padding: '0 16px', 
    borderRadius: '8px', 
    border: '1px solid #E5E7EB', 
    outline: 'none', 
    fontSize: '14px', 
    appearance: 'none', 
    backgroundColor: 'white' 
  },
  inputIcon: { position: 'absolute', right: '12px', top: '12px', pointerEvents: 'none' },
  unitIcon: { 
    position: 'absolute', 
    right: '16px', 
    top: '11px', 
    fontSize: '12px', 
    fontWeight: 'bold', 
    color: '#64748B' 
  },
  footerContainer: { marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '12px' },
  footer: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    borderTop: '1px solid #E5E7EB', 
    paddingTop: '24px' 
  },
  deleteBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    color: 'white', 
    backgroundColor: '#EF4444', 
    border: 'none', 
    padding: '10px 20px', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontWeight: '500', 
    fontSize: '14px' 
  },
  cancelBtn: { 
    padding: '10px 24px', 
    borderRadius: '8px', 
    border: '1px solid #E5E7EB', 
    backgroundColor: '#F1F5F9', 
    fontWeight: '500', 
    color: '#0F172A', 
    cursor: 'pointer', 
    fontSize: '14px' 
  },
  saveBtn: { 
    padding: '10px 32px', 
    borderRadius: '8px', 
    border: 'none', 
    backgroundColor: '#2563EB', 
    color: 'white', 
    fontWeight: '500', 
    cursor: 'pointer', 
    fontSize: '14px' 
  },
  errorText: { color: '#EF4444', fontSize: '12px', marginTop: '4px', fontWeight: '500' },
  successText: { 
    color: '#22C55E', 
    fontSize: '14px', 
    fontWeight: 'bold', 
    textAlign: 'left', 
    width: '100%' 
  }
};

export default UpdateTrangphuc;