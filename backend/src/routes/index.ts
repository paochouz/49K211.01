import { Router } from "express";
import { createKhachHang } from "../controllers/adddonthueController";
import { authRoutes } from "./authRoutes";
import { costumeRoutes } from "./costumeRoutes";
import { customerRoutes } from "./customerRoutes";
import { dashboardRoutes } from "./dashboardRoutes";
import { donThueRoutes } from "./donThueRoutes";
import { returnRoutes } from "./returnRoutes";

export const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/customers", customerRoutes);
routes.use("/costumes", costumeRoutes);
routes.use("/dashboard", dashboardRoutes);
routes.use("/don-thue", donThueRoutes);
routes.post("/khach-hang/don-thue", createKhachHang);
routes.use("/returns", returnRoutes);
