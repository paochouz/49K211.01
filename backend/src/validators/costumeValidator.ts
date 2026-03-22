import type { NextFunction, Request, Response } from "express";

export function validateCreateCostume(req: Request, res: Response, next: NextFunction) {
  const { tenTP, giaThue } = req.body;

  if (typeof tenTP !== "string" || tenTP.trim().length === 0) {
    return res.status(400).json({ message: "tenTP is required" });
  }

  if (typeof giaThue !== "number" || !Number.isFinite(giaThue) || giaThue < 0) {
    return res.status(400).json({ message: "giaThue must be a non-negative number" });
  }

  return next();
}

