import type { NextFunction, Request, Response } from "express";

export function validateCreateCustomer(req: Request, res: Response, next: NextFunction) {
  const { name, phone } = req.body as { name?: unknown; phone?: unknown };

  if (typeof name !== "string" || name.trim().length === 0) {
    return res.status(400).json({ message: "name is required" });
  }

  if (typeof phone !== "string" || phone.trim().length === 0) {
    return res.status(400).json({ message: "phone is required" });
  }

  return next();
}

