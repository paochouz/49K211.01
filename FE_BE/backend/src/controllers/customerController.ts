import type { Request, Response } from "express";
import { generateCode } from "../utils/generateCode";

export async function listCustomers(_req: Request, res: Response) {
  return res.json({ data: [] });
}

export async function createCustomer(req: Request, res: Response) {
  const { name, phone } = req.body as { name: string; phone: string };

  return res.status(201).json({
    message: "created",
    data: {
      id: generateCode("CUS"),
      name,
      phone,
    },
  });
}

