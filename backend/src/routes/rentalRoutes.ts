import express from "express";
import { updateRental } from "../controllers/rentalController";

const router = express.Router();

// US-04: Cập nhật đơn thuê
router.put("/:maDon", updateRental);

export default router;