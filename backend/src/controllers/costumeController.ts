import type { Request, Response } from "express";
import { generateCode } from "../utils/generateCode";

export async function listCostumes(_req: Request, res: Response) {
  return res.json({ data: [] });
}

export async function createCostume(req: Request, res: Response) {
  const { name, pricePerDay } = req.body as { name: string; pricePerDay: number };

  return res.status(201).json({
    message: "created",
    data: {
      id: generateCode("COS"),
      name,
      pricePerDay,
    },
  });
}

