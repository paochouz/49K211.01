import { Router } from "express";
import { listDonThue, getNextDonThueCode, createDonThue, syncTrangPhucStatus } from "../controllers/donThueController";

export const donThueRoutes = Router();

donThueRoutes.get("/", listDonThue);
donThueRoutes.get("/next-code", getNextDonThueCode);
donThueRoutes.post("/", createDonThue);
donThueRoutes.post("/sync-trang-phuc", syncTrangPhucStatus);
