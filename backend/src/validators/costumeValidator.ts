import type { NextFunction, Request, Response } from "express";

const ALLOWED_STATUSES = new Set([
  "Sẵn sàng",
  "Đang thuê",
  "Hư hỏng",
  "Bảo trì",
  "Ngưng sử dụng",
]);

function pickString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string") {
      return value;
    }
  }

  return undefined;
}

function parsePrice(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") return Number(value);
  return Number.NaN;
}

export function validateCreateCostume(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const tenTP = pickString(req.body.tenTP, req.body.ten);
  const loaiTP = pickString(req.body.loaiTP, req.body.loai);
  const giaThue =
    req.body.giaThue !== undefined ? req.body.giaThue : req.body.gia;
  const trangThai = pickString(req.body.trangThai, req.body.status);

  if (!tenTP || tenTP.trim().length === 0) {
    return res.status(400).json({ message: "Tên trang phục là bắt buộc." });
  }

  if (!loaiTP || loaiTP.trim().length === 0) {
    return res.status(400).json({ message: "Loại trang phục là bắt buộc." });
  }

  const price = parsePrice(giaThue);
  if (!Number.isFinite(price) || price <= 0) {
    return res.status(400).json({ message: "Giá thuê phải lớn hơn 0." });
  }

  if (trangThai !== undefined && !ALLOWED_STATUSES.has(trangThai.trim())) {
    return res.status(400).json({ message: "Trạng thái trang phục không hợp lệ." });
  }

  return next();
}

export function validateUpdateCostume(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const tenTP = pickString(req.body.tenTP, req.body.ten);
  const giaThue =
    req.body.giaThue !== undefined ? req.body.giaThue : req.body.gia;
  const trangThai = pickString(req.body.trangThai, req.body.status);

  if (tenTP !== undefined && tenTP.trim().length === 0) {
    return res.status(400).json({ message: "Tên trang phục không hợp lệ." });
  }

  if (giaThue !== undefined && giaThue !== "") {
    const price = parsePrice(giaThue);
    if (!Number.isFinite(price) || price <= 0) {
      return res.status(400).json({ message: "Giá thuê phải lớn hơn 0." });
    }
  }

  if (trangThai !== undefined && !ALLOWED_STATUSES.has(trangThai.trim())) {
    return res.status(400).json({ message: "Trạng thái trang phục không hợp lệ." });
  }

  return next();
}
