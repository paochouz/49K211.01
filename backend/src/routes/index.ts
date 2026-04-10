import { Router } from "express";
import { authRoutes } from "./authRoutes";
import { customerRoutes } from "./customerRoutes";
import { costumeRoutes } from "./costumeRoutes";
import costumeListRoutes from "./CostumeListRoute";
import { penaltyConfigRoutes } from "./penaltyConfigRoutes";
import { returnRoutes } from "./returnRoutes";
import { donThueRoutes } from "./donThueRoutes";

export const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/customers", customerRoutes);
routes.use("/costumes", costumeRoutes);
routes.use("/costume-list", costumeListRoutes);
routes.use("/penalty-config", penaltyConfigRoutes);
routes.use("/returns", returnRoutes);
routes.use("/don-thue", donThueRoutes);