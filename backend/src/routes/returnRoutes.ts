import { Router } from "express";
import { processReturn, getReturnDetails } from "../controllers/returnController";

export const returnRoutes = Router();

/**
 * LẤY DỮ LIỆU ĐƠN HÀNG (Dùng khi vừa mở trang Trả đồ)
 * Endpoint: GET http://localhost:3003/api/returns/:maDon
 */
returnRoutes.get("/:maDon", getReturnDetails);

/**
 * LƯU DỮ LIỆU QUYẾT TOÁN (Dùng khi nhấn nút HOÀN TẤT)
 * Endpoint: POST http://localhost:3003/api/returns
 */
returnRoutes.post("/", processReturn);