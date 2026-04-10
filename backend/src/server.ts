<<<<<<< HEAD
import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { connectDb, getDb } from "./config/db";
import sql from "mssql";

const PORT = process.env.PORT || 3002;

async function syncTrangPhucStatus() {
  try {
    const pool = getDb();
    await pool.request().query(`
      UPDATE TrangPhuc
      SET TrangThai = N'Dang thue'
      WHERE MaTP IN (
        SELECT DISTINCT ct.MaTP
        FROM ChiTietDonThue ct
        JOIN DonThue dt ON ct.MaDon = dt.MaDon
        WHERE dt.TrangThaiDon IN (N'Dang thue', N'Chua coc don')
      )
    `);
    console.log("✅ Đồng bộ trạng thái trang phục thành công");
  } catch (err) {
    console.error("⚠️ Sync trang phục lỗi:", err);
  }
}

async function startServer() {
  try {
    await connectDb();
    console.log("✅ Database connection established.");

    await syncTrangPhucStatus();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🔗 API Health Check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error("❌ Cannot start server due to DB error:", error);
    process.exit(1);
  }
}

console.log("------------------------------------");
console.log("DB_USER:", process.env.DB_USER || "Not found");
console.log("DB_NAME:", process.env.DB_NAME || "Not found");
console.log("------------------------------------");

=======
import dotenv from "dotenv";
dotenv.config();
import app from "./app";
import { connectDb } from "./config/db";

const PORT = process.env.PORT || 3003;

async function startServer() {
  try {
    await connectDb();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Cannot start server:", error);
  }
}
console.log("DB_USER:", process.env.DB_USER);

>>>>>>> ffd36726ff37faff37c8a5913a30a64839736ecb
startServer();