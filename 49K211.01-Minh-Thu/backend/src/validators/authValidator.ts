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