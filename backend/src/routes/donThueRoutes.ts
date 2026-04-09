import { Router } from "express";
import { createDonThue } from "../controllers/adddonthueController";
import {
  confirmDonThueDeposit,
  listDonThue,
  patchDonThue,
} from "../controllers/DonThue";
import { validateDonThueUpdate } from "../validators/donThueValidator";

export const donThueRoutes = Router();

donThueRoutes.get("/", listDonThue);
donThueRoutes.post("/", createDonThue);
donThueRoutes.patch("/:maDon/confirm-deposit", confirmDonThueDeposit);
donThueRoutes.patch("/:maDon", validateDonThueUpdate, patchDonThue);
