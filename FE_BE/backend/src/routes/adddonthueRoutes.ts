import express from 'express';
const router = express.Router();
// Dùng ngoặc nhọn để bốc đúng 2 hàm này ra
import { createDonThue, createKhachHang } from '../controllers/adddonthueController';

router.post('/', createDonThue);
router.post('/khach-hang', createKhachHang);

export default router;