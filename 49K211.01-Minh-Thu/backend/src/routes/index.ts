import { Router } from "express";
import { authRoutes } from "./authRoutes";
import { customerRoutes } from "./customerRoutes";
import { costumeRoutes } from "./costumeRoutes";

export const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/customers", customerRoutes);
routes.use("/costumes", costumeRoutes);

