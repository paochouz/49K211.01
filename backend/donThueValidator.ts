import { Request, Response, NextFunction } from "express";

export function validateDonThueUpdate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { customer, phone, item, status, dueDate } = req.body;

  if (customer !== undefined && typeof customer !== "string") {
    return res.status(400).json({ message: "Tên khách hàng không hợp lệ." });
  }

  if (phone !== undefined && typeof phone !== "string") {
    return res.status(400).json({ message: "Số điện thoại không hợp lệ." });
  }

  if (item !== undefined && typeof item !== "string") {
    return res.status(400).json({ message: "Trang phục không hợp lệ." });
  }

  if (status !== undefined && typeof status !== "string") {
    return res.status(400).json({ message: "Trạng thái không hợp lệ." });
  }

  if (dueDate !== undefined && typeof dueDate !== "string") {
    return res.status(400).json({ message: "Hạn trả không hợp lệ." });
  }

  next();
}