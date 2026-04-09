import { Router } from "express";
import { uploadCostume } from "../controllers/upload";
import {
  createCostume,
  deleteCostume,
  getCostumeById,
  listCostumes,
  updateCostume,
} from "../controllers/costumeController";
import {
  validateCreateCostume,
  validateUpdateCostume,
} from "../validators/costumeValidator";

export const costumeRoutes = Router();

costumeRoutes.get("/", listCostumes);
costumeRoutes.get("/:maTP", getCostumeById);
costumeRoutes.post(
  "/",
  uploadCostume.single("hinhAnh"),
  validateCreateCostume,
  createCostume,
);
costumeRoutes.put(
  "/:maTP",
  uploadCostume.single("hinhAnh"),
  validateUpdateCostume,
  updateCostume,
);
costumeRoutes.patch(
  "/:maTP",
  uploadCostume.single("hinhAnh"),
  validateUpdateCostume,
  updateCostume,
);
costumeRoutes.delete("/:maTP", deleteCostume);
