import { Router } from "express";
import { login } from "../controllers/authController";
import { validateLogin } from "../validators/authValidator";

export const authRoutes = Router();

authRoutes.post("/login", validateLogin, login);