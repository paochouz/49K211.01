import dotenv from "dotenv";
// Nạp biến môi trường trước khi import các file khác
dotenv.config();

import app from "./app";
import { poolPromise } from "./config/db"; 

const PORT = process.env.PORT || 3002;

async function startServer() {
  try {
    // Đợi kết nối Database thành công từ poolPromise
    await poolPromise;
    console.log("✅ Database connection established.");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🔗 API Health Check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error("❌ Cannot start server due to DB error:", error);
    process.exit(1); // Thoát chương trình nếu không kết nối được DB
  }
}

// Kiểm tra nhanh biến môi trường trong Terminal
console.log("---------------------------------");
console.log("DB_USER:", process.env.DB_USER || "Not found");
console.log("DB_NAME:", process.env.DB_NAME || "Not found");
console.log("---------------------------------");

startServer();