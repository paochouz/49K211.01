import { useState, type FormEvent } from "react";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";
import * as api from "../services/api";

export default function LoginPage() {
  const [taiKhoan, setTaiKhoan] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const [mode, setMode] = useState<"login" | "forgot">("login");

  const [taiKhoanForgot, setTaiKhoanForgot] = useState("");
  const [matKhauMoi, setMatKhauMoi] = useState("");
  const [matKhauXacNhan, setMatKhauXacNhan] = useState("");

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const canSubmit = Boolean(taiKhoan.trim() && matKhau.trim() && !loading);
  const canForgot = Boolean(
    taiKhoanForgot.trim() && matKhauMoi.trim() && matKhauXacNhan.trim() && !loading
  );

  const handleSubmitLogin = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    try {
      setLoading(true);
      const data = await api.loginApi(taiKhoan.trim(), matKhau);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("userRole", data.user.vaiTro); 
      localStorage.setItem("username", taiKhoan.trim());
      window.location.href = "/dashboard";
      setMessage(`Đăng nhập thành công - ${data.user.vaiTro}`);
    } catch (error) {
      console.log(error);
      setIsError(true);
      setMessage(error instanceof Error ? error.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForgot = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    if (matKhauMoi !== matKhauXacNhan) {
      setIsError(true);
      setMessage("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      setLoading(true);
      await api.forgotPasswordApi(taiKhoanForgot.trim(), matKhauMoi);
      setIsError(false);
      setMessage("Đổi mật khẩu thành công. Vui lòng đăng nhập lại.");

      // Quay về màn đăng nhập
      setMode("login");
      setTaiKhoan(taiKhoanForgot.trim());
      setMatKhau("");
      setTaiKhoanForgot("");
      setMatKhauMoi("");
      setMatKhauXacNhan("");
      setShowLoginPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
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
            {mode === "login" ? (
              <>
                <h1>Đăng nhập</h1>
                <p className="login-form-sub">Nhập tài khoản và mật khẩu để tiếp tục</p>

                <form
                  className="login-form"
                  onSubmit={handleSubmitLogin}
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
                    type={showLoginPassword ? "text" : "password"}
                    value={matKhau}
                    onChange={(e) => setMatKhau(e.target.value)}
                    placeholder="Nhập mật khẩu"
                    rightElement={
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowLoginPassword((v) => !v)}
                        aria-label={showLoginPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      >
                        {showLoginPassword ? "Ẩn" : "Hiện"}
                      </button>
                    }
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

                  <button
                    type="button"
                    className="login-action-link"
                    onClick={() => {
                      setMode("forgot");
                      setMessage("");
                      setIsError(false);
                      setTaiKhoanForgot("");
                      setMatKhauMoi("");
                      setMatKhauXacNhan("");
                      setShowNewPassword(false);
                      setShowConfirmPassword(false);
                    }}
                  >
                    Quên mật khẩu?
                  </button>
                </form>
              </>
            ) : (
              <>
                <h1>Quên mật khẩu</h1>
                <p className="login-form-sub">Nhập tài khoản và mật khẩu mới để tiếp tục</p>

                <form
                  className="login-form"
                  onSubmit={handleSubmitForgot}
                  aria-describedby={message ? "login-message" : undefined}
                >
                  <Input
                    label="Tài khoản"
                    id="taiKhoanForgot"
                    name="taiKhoanForgot"
                    autoComplete="username"
                    value={taiKhoanForgot}
                    onChange={(e) => setTaiKhoanForgot(e.target.value)}
                    placeholder="Nhập tài khoản"
                  />

                  <Input
                    label="Mật khẩu mới"
                    id="matKhauMoi"
                    name="matKhauMoi"
                    autoComplete="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={matKhauMoi}
                    onChange={(e) => setMatKhauMoi(e.target.value)}
                    placeholder="Nhập mật khẩu mới"
                    rightElement={
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowNewPassword((v) => !v)}
                        aria-label={showNewPassword ? "Ẩn mật khẩu mới" : "Hiện mật khẩu mới"}
                      >
                        {showNewPassword ? "Ẩn" : "Hiện"}
                      </button>
                    }
                  />

                  <Input
                    label="Xác nhận mật khẩu mới"
                    id="matKhauXacNhan"
                    name="matKhauXacNhan"
                    autoComplete="new-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={matKhauXacNhan}
                    onChange={(e) => setMatKhauXacNhan(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    rightElement={
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        aria-label={
                          showConfirmPassword ? "Ẩn mật khẩu xác nhận" : "Hiện mật khẩu xác nhận"
                        }
                      >
                        {showConfirmPassword ? "Ẩn" : "Hiện"}
                      </button>
                    }
                  />

                  <Button type="submit" className="login-submit" disabled={!canForgot}>
                    {loading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
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

                  <button
                    type="button"
                    className="login-action-link"
                    onClick={() => {
                      setMode("login");
                      setMessage("");
                      setIsError(false);
                      setTaiKhoanForgot("");
                      setMatKhauMoi("");
                      setMatKhauXacNhan("");
                      setShowNewPassword(false);
                      setShowConfirmPassword(false);
                    }}
                  >
                    Quay lại đăng nhập
                  </button>
                </form>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
