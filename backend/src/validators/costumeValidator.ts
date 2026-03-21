import type { NextFunction, Request, Response } from "express";

export function validateCreateCostume(req: Request, res: Response, next: NextFunction) {
  const { tenTP, loaiTP, giaThue } = req.body;

  if (!tenTP || typeof tenTP !== "string") {
    return res.status(400).json({ message: "tenTP is required" });
  }

  if (!loaiTP || typeof loaiTP !== "string") {
    return res.status(400).json({ message: "loaiTP is required" });
  }

  if (typeof giaThue !== "number" || giaThue <= 0) {
    return res.status(400).json({ message: "giaThue must be > 0" });
  }

  next();
}
