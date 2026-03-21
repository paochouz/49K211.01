import { Router } from "express";
import { createTrangPhuc } from "../controllers/trangPhucController";

const router = Router();

router.get("/", (_req, res) => {
  res.send("Trang phục API OK");
});

router.post("/", createTrangPhuc);

export default router;