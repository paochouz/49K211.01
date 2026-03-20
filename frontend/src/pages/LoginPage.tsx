import { useState, type FormEvent } from "react";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";
import { loginApi } from "../services/api";

export default function LoginPage() {
  const [taiKhoan, setTaiKhoan] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const canSubmit = Boolean(taiKhoan.trim() && matKhau.trim() && !loading);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    try {
      setLoading(true);
      const data = await loginApi(taiKhoan.trim(), matKhau);
      localStorage.setItem("user", JSON.stringify(data.user));
      setMessage(`Đăng nhập thành công - ${data.user.vaiTro}`);
    } catch (error) {
      console.log(error);
      setIsError(true);
      setMessage(error instanceof Error ? error.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      <div className="login-layout">
        <section className="login-brand" aria-label="Giới thiệu hệ thống">
          <h2>Hệ thống quản lý thuê trang phục</h2>
          <p className="login-brand__subtitle">
            Đăng nhập để xem, tạo mới và quản lý dữ liệu một cách nhanh chóng.
          </p>
        </section>

        <div className="login-form-wrapper">
          <Card className="login-card">
            <h1>Đăng nhập</h1>
            <p className="login-form-sub">Nhập tài khoản và mật khẩu để tiếp tục</p>

            <form
              className="login-form"
              onSubmit={handleSubmit}
              aria-describedby={message ? "login-message" : undefined}
            >
          <Input
            label="Tài khoản"
            id="taiKhoan"
            name="taiKhoan"
            autoComplete="username"
            value={taiKhoan}
            onChange={(e) => setTaiKhoan(e.target.value)}
            placeholder="Nhập tài khoản"
          />

          <Input
            label="Mật khẩu"
            id="matKhau"
            name="matKhau"
            autoComplete="current-password"
            type="password"
            value={matKhau}
            onChange={(e) => setMatKhau(e.target.value)}
            placeholder="Nhập mật khẩu"
          />

            <Button type="submit" className="login-submit" disabled={!canSubmit}>
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>

            {message && (
              <p
                id="login-message"
                className={`form-message ${isError ? "form-message--error" : ""} login-message`}
                role="alert"
                aria-live="polite"
              >
                {message}
              </p>
            )}
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
