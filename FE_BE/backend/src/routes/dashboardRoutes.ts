import { Router } from "express";
import { getDashboardSummary } from "../controllers/dashboardController";

const router = Router();

// Đường dẫn: GET /api/dashboard/summary
router.get("/summary", getDashboardSummary);

// Chú ý: Export tên dashboardRoutes để bên index.ts import cho đúng
export { router as dashboardRoutes };