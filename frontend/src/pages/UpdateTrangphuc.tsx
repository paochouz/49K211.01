import React, { useRef, useState } from "react";
import { ChevronDown, Trash2, Upload } from "lucide-react";

type VaiTro = "ChuCuaHang" | "NhanVien";

type TrangThaiChinhSua = "Sẵn sàng" | "Bảo trì" | "Ngưng sử dụng";

type TrangPhucForm = {
  ma: string;
  ten: string;
  loai: string;
  size: string;
  giaThue: string;
  moTa: string;
  trangThai: TrangThaiChinhSua;
  hinhAnh: string;
};

type FormErrors = {
  ten?: string;
  loai?: string;
  giaThue?: string;
};

const UpdateTrangPhuc: React.FC = () => {
  // Mock role: thực tế nên lấy từ auth / localStorage / context / redux
  const vaiTro: VaiTro = "ChuCuaHang";

  // Mock điều kiện xóa theo US12
  // true = cho xóa, false = không cho xóa
  const [canDelete] = useState<boolean>(true);

  const [formData, setFormData] = useState<TrangPhucForm>({
    ma: "TP000001",
    ten: "Váy nude dài ren nổi phối lớp lót màu da MUST HAVE",
    loai: "Váy dạ hội",
    size: "M",
    giaThue: "610000",
    moTa: "Chất liệu ren, màu nude, phù hợp dự tiệc.",
    trangThai: "Sẵn sàng",
    hinhAnh:
      "https://cdn.hstatic.net/products/200000719085/35_0249c1a440f245718bd0ef3bf70c483a_master.jpg",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [deleteMsg, setDeleteMsg] = useState<string>("");
  const [previewImage, setPreviewImage] = useState<string>(formData.hinhAnh);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (vaiTro !== "ChuCuaHang") {
    return (
      <div style={styles.permissionWrap}>
        <div style={styles.permissionBox}>
          Bạn không có quyền truy cập chức năng này.
        </div>
      </div>
    );
  }

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    if (!formData.ten.trim()) {
      newErrors.ten = "Tên trang phục không được để trống.";
    }

    if (!formData.loai.trim()) {
      newErrors.loai = "Loại trang phục không được để trống.";
    }

    if (!formData.giaThue.trim()) {
      newErrors.giaThue = "Giá thuê không được để trống.";
    } else if (Number(formData.giaThue) <= 0) {
      newErrors.giaThue = "Giá thuê phải lớn hơn 0.";
    }

    return newErrors;
  };

  const handleInputChange = (
    field: keyof TrangPhucForm,
    value: string
  ): void => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Xóa lỗi của field đang sửa
    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));

    setSuccessMsg("");
    setDeleteMsg("");
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const imageResult = reader.result as string;
      setPreviewImage(imageResult);
      setFormData((prev) => ({
        ...prev,
        hinhAnh: imageResult,
      }));
    };
    reader.readAsDataURL(file);

    setSuccessMsg("");
    setDeleteMsg("");
  };

  const handleSave = async (): Promise<void> => {
    setSuccessMsg("");
    setDeleteMsg("");

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    try {
      // TODO: gọi API update thật ở đây
      // await updateCostumeApi(formData.ma, formData);

      console.log("Dữ liệu cập nhật:", formData);
      setSuccessMsg("Lưu thay đổi thành công.");
    } catch (error) {
      console.error(error);
      setSuccessMsg("Có lỗi xảy ra khi lưu thay đổi.");
    }
  };

  const handleDelete = async (): Promise<void> => {
    setSuccessMsg("");
    setDeleteMsg("");

    if (!canDelete) return;

    const confirmed = window.confirm(
      "Bạn có chắc muốn xóa trang phục này không?"
    );
    if (!confirmed) return;

    try {
      // TODO: gọi API xóa thật ở đây
      // await deleteCostumeApi(formData.ma);

      console.log("Đã xóa trang phục:", formData.ma);
      setDeleteMsg("Xóa trang phục thành công.");

      // TODO: điều hướng sau khi xóa
      // navigate("/costumes");
    } catch (error) {
      console.error(error);
      setDeleteMsg("Không thể xóa trang phục.");
    }
  };

  const handleCancel = (): void => {
    // TODO: điều hướng về trang trước hoặc danh sách
    console.log("Hủy chỉnh sửa");
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>Chỉnh sửa trang phục</h2>
          <p style={styles.subTitle}>
            Cập nhật thông tin trang phục theo US11 và xóa theo US12.
          </p>
        </div>

        <div style={styles.content}>
          <div style={styles.imageCol}>
            <div
              style={styles.imageContainer}
              onClick={() => fileInputRef.current?.click()}
              title="Nhấn để thay đổi ảnh"
            >
              <img src={previewImage} alt="Trang phục" style={styles.image} />
              <div style={styles.uploadOverlay}>
                <Upload size={22} color="#FFFFFF" />
                <span style={styles.uploadText}>Thay đổi ảnh</span>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
          </div>

          <div style={styles.formCol}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Mã trang phục</label>
              <input
                type="text"
                value={formData.ma}
                disabled
                style={styles.inputDisabled}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Tên trang phục *</label>
              <input
                type="text"
                value={formData.ten}
                placeholder="Nhập tên trang phục"
                style={{
                  ...styles.input,
                  border: errors.ten ? "1px solid #EF4444" : "1px solid #E5E7EB",
                }}
                onChange={(e) => handleInputChange("ten", e.target.value)}
              />
              {errors.ten && <span style={styles.errorText}>{errors.ten}</span>}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Loại trang phục *</label>
              <div style={{ position: "relative" }}>
                <select
                  value={formData.loai}
                  style={{
                    ...styles.selectInput,
                    border: errors.loai
                      ? "1px solid #EF4444"
                      : "1px solid #E5E7EB",
                  }}
                  onChange={(e) => handleInputChange("loai", e.target.value)}
                >
                  <option value="">Chọn loại trang phục</option>
                  <option value="Váy dạ hội">Váy dạ hội</option>
                  <option value="Áo dài">Áo dài</option>
                  <option value="Vest">Vest</option>
                  <option value="Yếm">Yếm</option>
                  <option value="Cổ phục">Cổ phục</option>
                </select>
                <ChevronDown style={styles.inputIcon} size={18} color="#64748B" />
              </div>
              {errors.loai && <span style={styles.errorText}>{errors.loai}</span>}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Size</label>
              <input
                type="text"
                value={formData.size}
                placeholder="Nhập size"
                style={styles.input}
                onChange={(e) => handleInputChange("size", e.target.value)}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Giá thuê *</label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  value={formData.giaThue}
                  placeholder="Nhập giá thuê"
                  style={{
                    ...styles.input,
                    paddingRight: "56px",
                    border: errors.giaThue
                      ? "1px solid #EF4444"
                      : "1px solid #E5E7EB",
                  }}
                  onChange={(e) => {
                    const onlyNumber = e.target.value.replace(/[^0-9]/g, "");
                    handleInputChange("giaThue", onlyNumber);
                  }}
                />
                <span style={styles.unitIcon}>VNĐ</span>
              </div>
              {errors.giaThue && (
                <span style={styles.errorText}>{errors.giaThue}</span>
              )}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Mô tả</label>
              <textarea
                value={formData.moTa}
                placeholder="Nhập mô tả trang phục"
                style={styles.textarea}
                onChange={(e) => handleInputChange("moTa", e.target.value)}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Trạng thái</label>
              <div style={{ position: "relative" }}>
                <select
                  value={formData.trangThai}
                  style={styles.selectInput}
                  onChange={(e) =>
                    handleInputChange(
                      "trangThai",
                      e.target.value as TrangThaiChinhSua
                    )
                  }
                >
                  <option value="Sẵn sàng">Sẵn sàng</option>
                  <option value="Bảo trì">Bảo trì</option>
                  <option value="Ngưng sử dụng">Ngưng sử dụng</option>
                </select>
                <ChevronDown style={styles.inputIcon} size={18} color="#64748B" />
              </div>
            </div>
          </div>
        </div>

        <div style={styles.footerContainer}>
          <div style={styles.footer}>
            <button
              style={{
                ...styles.deleteBtn,
                opacity: canDelete ? 1 : 0.55,
                cursor: canDelete ? "pointer" : "not-allowed",
              }}
              onClick={handleDelete}
              disabled={!canDelete}
              title={
                canDelete
                  ? "Xóa trang phục"
                  : "Không thể xóa trang phục đang nằm trong đơn thuê hoạt động"
              }
            >
              <Trash2 size={18} />
              <span>Xóa</span>
            </button>

            <div style={styles.rightButtons}>
              <button style={styles.cancelBtn} onClick={handleCancel}>
                Hủy
              </button>
              <button style={styles.saveBtn} onClick={handleSave}>
                Lưu thay đổi
              </button>
            </div>
          </div>

          {successMsg && <div style={styles.successText}>{successMsg}</div>}
          {deleteMsg && <div style={styles.deleteText}>{deleteMsg}</div>}

          {!canDelete && (
            <div style={styles.noteText}>
              Không thể xóa vì trang phục đang thuộc đơn thuê đang hoạt động.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(15, 23, 42, 0.35)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    backdropFilter: "blur(4px)",
    padding: "20px",
  },
  modal: {
    width: "880px",
    maxWidth: "100%",
    maxHeight: "92vh",
    overflowY: "auto",
    backgroundColor: "#FFFFFF",
    borderRadius: "18px",
    padding: "30px",
    boxShadow: "0 8px 30px rgba(15, 23, 42, 0.12)",
    fontFamily: "Inter, sans-serif",
  },
  header: {
    marginBottom: "24px",
  },
  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: 700,
    color: "#0F172A",
  },
  subTitle: {
    marginTop: "8px",
    marginBottom: 0,
    fontSize: "14px",
    color: "#64748B",
  },
  content: {
    display: "flex",
    gap: "32px",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  imageCol: {
    width: "320px",
    flexShrink: 0,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    aspectRatio: "3/4",
    borderRadius: "14px",
    overflow: "hidden",
    border: "1px solid #E5E7EB",
    cursor: "pointer",
    backgroundColor: "#F8FAFC",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  uploadOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(15, 23, 42, 0.35)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  uploadText: {
    color: "#FFFFFF",
    marginTop: "8px",
    fontWeight: 600,
    fontSize: "14px",
  },
  formCol: {
    flex: 1,
    minWidth: "320px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    marginBottom: "6px",
    fontWeight: 600,
    fontSize: "14px",
    color: "#0F172A",
  },
  input: {
    width: "100%",
    height: "44px",
    padding: "0 14px",
    borderRadius: "10px",
    border: "1px solid #E5E7EB",
    outline: "none",
    fontSize: "14px",
    color: "#0F172A",
    boxSizing: "border-box",
  },
  inputDisabled: {
    width: "100%",
    height: "44px",
    padding: "0 14px",
    borderRadius: "10px",
    border: "1px solid #E5E7EB",
    backgroundColor: "#F8FAFC",
    color: "#64748B",
    fontSize: "14px",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    minHeight: "90px",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #E5E7EB",
    outline: "none",
    resize: "vertical",
    fontSize: "14px",
    color: "#0F172A",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  selectInput: {
    width: "100%",
    height: "44px",
    padding: "0 14px",
    borderRadius: "10px",
    border: "1px solid #E5E7EB",
    outline: "none",
    appearance: "none",
    backgroundColor: "#FFFFFF",
    fontSize: "14px",
    color: "#0F172A",
    boxSizing: "border-box",
  },
  inputIcon: {
    position: "absolute",
    right: "12px",
    top: "13px",
    pointerEvents: "none",
  },
  unitIcon: {
    position: "absolute",
    right: "14px",
    top: "13px",
    fontSize: "12px",
    fontWeight: 700,
    color: "#64748B",
  },
  footerContainer: {
    marginTop: "30px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    borderTop: "1px solid #E5E7EB",
    paddingTop: "24px",
    flexWrap: "wrap",
  },
  rightButtons: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  deleteBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#EF4444",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "10px",
    padding: "11px 20px",
    fontSize: "14px",
    fontWeight: 600,
  },
  cancelBtn: {
    padding: "11px 22px",
    borderRadius: "10px",
    border: "1px solid #CBD5E1",
    backgroundColor: "#F8FAFC",
    color: "#0F172A",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },
  saveBtn: {
    padding: "11px 26px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#2563EB",
    color: "#FFFFFF",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },
  errorText: {
    marginTop: "5px",
    color: "#EF4444",
    fontSize: "12px",
    fontWeight: 500,
  },
  successText: {
    color: "#16A34A",
    fontSize: "14px",
    fontWeight: 600,
  },
  deleteText: {
    color: "#DC2626",
    fontSize: "14px",
    fontWeight: 600,
  },
  noteText: {
    color: "#92400E",
    backgroundColor: "#FEF3C7",
    border: "1px solid #FDE68A",
    borderRadius: "10px",
    padding: "10px 12px",
    fontSize: "13px",
  },
  permissionWrap: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    fontFamily: "Inter, sans-serif",
  },
  permissionBox: {
    backgroundColor: "#FFFFFF",
    padding: "20px 24px",
    borderRadius: "12px",
    boxShadow: "0 6px 20px rgba(15, 23, 42, 0.08)",
    color: "#0F172A",
    fontWeight: 600,
  },
};

export default UpdateTrangPhuc;