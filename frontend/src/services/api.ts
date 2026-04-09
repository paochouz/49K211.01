const BASE_URL = "http://localhost:3003/api";

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

export async function getPenaltyConfigApi() {
  let res: Response;

  try {
    res = await fetch(`${BASE_URL}/penalty-config`);
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
    throw new Error(data.message || "Lấy cấu hình phạt thất bại");
  }

  return data.data;
}

export async function updatePenaltyConfigApi(config: {
  tyLePhatQuaHan: number;
  moTaQuyDinh: string;
  trangThaiApDung: boolean;
}) {
  let res: Response;

  try {
    res = await fetch(`${BASE_URL}/penalty-config`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(config),
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
    throw new Error(data.message || "Cập nhật cấu hình phạt thất bại");
  }

  return data;
}

