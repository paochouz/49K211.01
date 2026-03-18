import type { NextFunction, Request, Response } from "express";

export function validateCreateCostume(req: Request, res: Response, next: NextFunction) {
  const { name, pricePerDay } = req.body as { name?: unknown; pricePerDay?: unknown };

  if (typeof name !== "string" || name.trim().length === 0) {
    return res.status(400).json({ message: "name is required" });
  }

  if (typeof pricePerDay !== "number" || !Number.isFinite(pricePerDay) || pricePerDay < 0) {
    return res.status(400).json({ message: "pricePerDay must be a non-negative number" });
  }

  return next();
}

