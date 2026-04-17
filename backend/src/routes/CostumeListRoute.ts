import { Router } from "express";
import { getCostumes } from "../controllers/CostumeListController";

const router = Router();

// Đường dẫn: GET /api/costumes
router.get("/", getCostumes);

export default router;