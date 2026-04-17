import express from "express";
import cors from "cors";
// Đảm bảo đường dẫn này chính xác với cấu trúc thư mục của bạn
import customerRoutes from "./routes/customerRoutes"; 

const app = express();

// Cấu hình CORS để Frontend (cổng 5173) gọi được Backend (cổng 3002) [cite: 317]
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware để xử lý dữ liệu JSON gửi từ Frontend
app.use(express.json());

// API kiểm tra server
app.get("/health", (_req, res) => {
  res.json({ ok: true, message: "Backend is running" });
});

// Khai báo route khách hàng (US-06) [cite: 311, 317]
// Đường dẫn gọi API sẽ là: http://localhost:3002/api/customers
app.use("/api/customers", customerRoutes);

// Xử lý lỗi 404
app.use((req, res) => {
  res.status(404).json({ 
    message: "API Endpoint không tồn tại", 
    path: req.path 
  });
});

export default app;