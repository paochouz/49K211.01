import { Router } from "express";
import { createCostume, listCostumes } from "../controllers/costumeController";
import { validateCreateCostume } from "../validators/costumeValidator";

export const costumeRoutes = Router();

costumeRoutes.get("/", listCostumes);
costumeRoutes.post("/", validateCreateCostume, createCostume);

