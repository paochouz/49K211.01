import type { Request, Response, NextFunction } from "express";

export function validateLogin(req: Request, res: Response, next: NextFunction) {
  const { taiKhoan, matKhau } = req.body as {
    taiKhoan?: string;
    matKhau?: string;
  };

  if (!taiKhoan) {
    return res.status(400).json({
      message: "taiKhoan is required",
    });
  }

  if (!matKhau) {
    return res.status(400).json({
      message: "matKhau is required",
    });
  }

  next();
}

export function validateForgotPassword(req: Request, res: Response, next: NextFunction) {
  const { taiKhoan, matKhauMoi } = req.body as {
    taiKhoan?: string;
    matKhauMoi?: string;
  };

  if (!taiKhoan) {
    return res.status(400).json({
      message: "taiKhoan is required",
    });
  }

  if (!matKhauMoi) {
    return res.status(400).json({
      message: "matKhauMoi is required",
    });
  }

  if (matKhauMoi.length < 6) {
    return res.status(400).json({
      message: "Mật khẩu mới phải có ít nhất 6 ký tự",
    });
  }

  next();
}