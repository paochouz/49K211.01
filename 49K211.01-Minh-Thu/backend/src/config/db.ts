import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

const dbConfig: sql.config = {
  user: process.env.DB_USER, // minhthuhaha
  password: process.env.DB_PASSWORD, // 12345
  server: process.env.DB_SERVER || "localhost",
  database: process.env.DB_NAME, // QuanLyChoThueTrangPhuc
  options: {
    encrypt: false, 
    trustServerCertificate: true, //
  },
};

// Khởi tạo kết nối dùng chung cho toàn dự án
export const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then(pool => {
    console.log("✅ Connected to SQL Server: " + process.env.DB_NAME);
    return pool;
  })
  .catch(err => {
    console.error("❌ Database connection failed:", err);
    throw err;
  });

export default sql;