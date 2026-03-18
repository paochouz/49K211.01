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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    try {
      setLoading(true);
      const data = await loginApi(taiKhoan, matKhau);
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
    <div className="form-page">
      <Card>
        <h1>Đăng nhập hệ thống</h1>
        <form onSubmit={handleSubmit}>
          <Input
            label="Tài khoản"
            value={taiKhoan}
            onChange={(e) => setTaiKhoan(e.target.value)}
            placeholder="Nhập tài khoản"
          />

          <Input
            label="Mật khẩu"
            type="password"
            value={matKhau}
            onChange={(e) => setMatKhau(e.target.value)}
            placeholder="Nhập mật khẩu"
          />

          <Button type="submit" disabled={!taiKhoan || !matKhau || loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>

          {message && (
            <p className={`form-message ${isError ? "form-message--error" : ""}`}>
              {message}
            </p>
          )}
        </form>
      </Card>
    </div>
  );
}