import { Router } from "express";
import {
  createCostume,
  getCostumeById,
  updateCostume,
  deleteCostume,
} from "../controllers/costumeController";
import { getCostumes } from "../controllers/CostumeListController";
import { validateCreateCostume } from "../validators/costumeValidator";

export const costumeRoutes = Router();

// Danh sách trang phục
costumeRoutes.get("/", getCostumes);

// Thêm mới trang phục
costumeRoutes.post("/", validateCreateCostume, createCostume);

// Lấy chi tiết 1 trang phục
costumeRoutes.get("/:id", getCostumeById);

// Cập nhật trang phục
costumeRoutes.put("/:id", updateCostume);

// Xóa trang phục
costumeRoutes.delete("/:id", deleteCostume);