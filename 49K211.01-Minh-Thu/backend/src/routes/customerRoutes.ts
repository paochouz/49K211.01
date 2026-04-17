import { Router } from "express";
import { getAllCustomers, createCustomer } from "../controllers/customerController";
// Import validator nếu bạn đã viết xong, nếu chưa có thể tạm thời comment dòng dưới
// import { createCustomerValidator } from "../validators/customerValidator"; 

const router = Router();

/**
 * @route   GET /api/customers
 * @desc    Lấy danh sách tất cả khách hàng từ SQL Server
 */
router.get("/", getAllCustomers);

/**
 * @route   POST /api/customers
 * @desc    Thêm mới khách hàng với mã KH tự động (US-06) [cite: 219, 311]
 */
router.post("/", createCustomer);

// Xuất bản mặc định (default) để file app.ts không còn báo lỗi đỏ ở dòng import
export default router;