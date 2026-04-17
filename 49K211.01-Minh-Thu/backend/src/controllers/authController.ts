import type { Request, Response } from "express";
import sql from "../config/db";
import { getDb } from "../config/db";

export async function login(req: Request, res: Response) {
  try {
    const { taiKhoan, matKhau } = req.body as {
      taiKhoan: string;
      matKhau: string;
    };

    const db = getDb();

    const result = await db
      .request()
      .input("taiKhoan", sql.VarChar, taiKhoan)
      .query(`
        SELECT TaiKhoan, MatKhau, VaiTro
        FROM NguoiDung
        WHERE TaiKhoan = @taiKhoan
      `);

    if (result.recordset.length === 0) {
      return res.status(401).json({
        message: "Tài khoản không tồn tại",
      });
    }

    const user = result.recordset[0];

    if (user.MatKhau !== matKhau) {
      return res.status(401).json({
        message: "Sai mật khẩu",
      });
    }

    return res.json({
      message: "Đăng nhập thành công",
      user: {
        taiKhoan: user.TaiKhoan,
        vaiTro: user.VaiTro,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Lỗi server",
    });
  }
}