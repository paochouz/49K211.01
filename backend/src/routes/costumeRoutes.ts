import { Router } from "express";
import { createCostume, listCostumes, updateCostume, deleteCostume } from "../controllers/costumeController";
import { validateCreateCostume } from "../validators/costumeValidator";

export const costumeRoutes = Router();

costumeRoutes.get("/", listCostumes);
costumeRoutes.post("/", validateCreateCostume, createCostume);
costumeRoutes.put("/:maTP", updateCostume);
costumeRoutes.delete("/:maTP", deleteCostume);

