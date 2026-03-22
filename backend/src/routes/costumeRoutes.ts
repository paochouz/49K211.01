import { Router } from "express";
import { createCostume, listCostumes } from "../controllers/costumeController";
import { validateCreateCostume } from "../validators/costumeValidator";
import multer from "multer";

export const costumeRoutes = Router();

const upload = multer({ dest: "uploads/" });

// GET danh sách
costumeRoutes.get("/", listCostumes);

// ✅ POST duy nhất (gộp tất cả lại)
costumeRoutes.post(
  "/",
  upload.single("hinhAnh"),
  createCostume
);