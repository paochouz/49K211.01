import { Router } from "express";
import { getPenaltyConfig, updatePenaltyConfig } from "../controllers/penaltyConfigController";

export const penaltyConfigRoutes = Router();

penaltyConfigRoutes.get("/", getPenaltyConfig);
penaltyConfigRoutes.post("/", updatePenaltyConfig); // Đổi từ PUT sang POST ở đây