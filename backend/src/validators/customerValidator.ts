import type { NextFunction, Request, Response } from "express";

export function validateCreateCustomer(req: Request, res: Response, next: NextFunction) {
const { tenKH, soDienThoai } = req.body as { tenKH?: unknown; soDienThoai?: unknown };

if (typeof tenKH !== "string" || tenKH.trim().length === 0) {
return res.status(400).json({ message: "Tên khách hàng bắt buộc" });
  }

if (typeof soDienThoai !== "string" || soDienThoai.trim().length === 0 || !/^\d{10}$/.test(soDienThoai)) {
return res.status(400).json({ message: "SĐT phải đúng 10 số" });
  }

  return next();
}

