const BASE_URL = "http://localhost:3002/api";

export async function loginApi(taiKhoan: string, matKhau: string) {
  let res: Response;

  try {
    res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ taiKhoan, matKhau }),
    });
  } catch {
    throw new Error("Không kết nối được tới server");
  }

  let data: any = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    throw new Error(data.message || "Đăng nhập thất bại");
  }

  return data;
}

export async function forgotPasswordApi(taiKhoan: string, matKhauMoi: string) {
  let res: Response;

  try {
    res = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ taiKhoan, matKhauMoi }),
    });
  } catch {
    throw new Error("Không kết nối được tới server");
  }

  let data: any = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    throw new Error(data.message || "Đổi mật khẩu thất bại");
  }

  return data;
}
