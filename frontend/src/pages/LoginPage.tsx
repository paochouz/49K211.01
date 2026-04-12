import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authStore } from "../services/supabaseStore";

export default function LoginPage() {
  const navigate = useNavigate();
  const [taiKhoan, setTaiKhoan] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const canSubmit = Boolean(taiKhoan.trim() && matKhau.trim() && !loading);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    try {
      setLoading(true);
      const user = await authStore.login(taiKhoan.trim(), matKhau);
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/don-thue");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.root}>
      {/* Bên trái – text */}
      <div style={s.left}>
        <h1 style={s.headline}>Hệ thống quản lý thuê trang phục</h1>
        <p style={s.sub}>Đăng nhập để xem, tạo mới và quản lý dữ liệu một cách nhanh chóng.</p>
      </div>

      {/* Bên phải – card */}
      <div style={s.right}>
        <div style={s.card}>
          <h2 style={s.cardTitle}>Đăng nhập</h2>
          <p style={s.cardSub}>Nhập tài khoản và mật khẩu để tiếp tục</p>

          <form onSubmit={handleSubmit}>
            <div style={s.group}>
              <label style={s.label}>Tài khoản</label>
              <input
                style={s.input}
                value={taiKhoan}
                onChange={(e) => setTaiKhoan(e.target.value)}
                placeholder="Nhập tài khoản"
                autoComplete="username"
              />
            </div>

            <div style={s.group}>
              <label style={s.label}>Mật khẩu</label>
              <div style={{ position: "relative" }}>
                <input
                  style={{ ...s.input, paddingRight: 60 }}
                  type={showPw ? "text" : "password"}
                  value={matKhau}
                  onChange={(e) => setMatKhau(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPw((v) => !v)} style={s.toggleBtn}>
                  {showPw ? "Ẩn" : "Hiện"}
                </button>
              </div>
            </div>

            {message && <p style={s.error}>{message}</p>}

            <button
              type="submit"
              disabled={!canSubmit}
              style={{ ...s.submitBtn, background: canSubmit ? "#2563eb" : "#94a3b8", opacity: canSubmit ? 1 : 0.45, cursor: canSubmit ? "pointer" : "not-allowed" }}
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  root: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    fontFamily: "Inter, sans-serif",
    background: "linear-gradient(135deg, #dde8f5 0%, #e8d9f0 50%, #f5ddd8 100%)",
    padding: "0 6vw",
    gap: 40,
  },
  left: {
    flex: "1 1 40%",
    paddingRight: 32,
  },
  headline: {
    margin: "0 0 16px",
    fontSize: 28,
    fontWeight: 700,
    color: "#1e293b",
    lineHeight: 1.35,
  },
  sub: {
    margin: 0,
    fontSize: 14,
    color: "#475569",
    lineHeight: 1.7,
  },
  right: {
    flex: "0 0 auto",
    display: "flex",
    justifyContent: "center",
    marginRight: "6vw",
  },
  card: {
    width: 440,
    background: "#fff",
    borderRadius: 20,
    padding: "40px 36px",
    boxShadow: "0 12px 48px rgba(0,0,0,0.10)",
  },
  cardTitle: {
    margin: "0 0 4px",
    fontSize: 24,
    fontWeight: 700,
    color: "#0f172a",
  },
  cardSub: {
    margin: "0 0 24px",
    fontSize: 13,
    color: "#64748b",
  },
  group: { marginBottom: 16 },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 500,
    color: "#334155",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    height: 42,
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    padding: "0 14px",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    color: "#0f172a",
    background: "#f8fafc",
  },
  toggleBtn: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    fontSize: 13,
    color: "#64748b",
    cursor: "pointer",
    fontWeight: 500,
  },
  error: {
    margin: "0 0 12px",
    fontSize: 13,
    color: "#ef4444",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: 8,
    padding: "9px 12px",
  },
  submitBtn: {
    width: "100%",
    height: 44,
    background: "#94a3b8",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontWeight: 600,
    fontSize: 14,
    marginTop: 8,
    transition: "opacity 0.2s",
  },
};
