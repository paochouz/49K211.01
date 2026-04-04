import { Router } from "express";
import { authRoutes } from "./authRoutes";
import { customerRoutes } from "./customerRoutes";
import { costumeRoutes } from "./costumeRoutes";
import costumeListRoutes from "./CostumeListRoute"; 
// 1. Import route trả đồ mới
import { returnRoutes } from "./returnRoutes"; 

export const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/customers", customerRoutes);
routes.use("/costumes", costumeRoutes);
routes.use("/costume-list", costumeListRoutes);

// 2. Đăng ký route trả đồ
// Đường dẫn gọi từ Frontend sẽ là: /api/returns
routes.use("/returns", returnRoutes);