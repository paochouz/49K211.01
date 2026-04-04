import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

const dbConfig: sql.config = {
  user: process.env.DB_USER || 'minhthuhaha',
  password: process.env.DB_PASSWORD || '12345',
  server: process.env.DB_SERVER || 'DESKTOP-T9H4SPL',
  database: process.env.DB_NAME || 'QuanLyChoThueTrangPhuc',
  port: parseInt(process.env.DB_PORT || '1433'),
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
};

let pool: sql.ConnectionPool | null = null;

// Hàm kết nối
export async function connectDb() {
  try {
    pool = await sql.connect(dbConfig);
    console.log('✅ Connected to SQL Server');
    return pool;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

// Hàm lấy pool (Hàm này đang bị báo lỗi ở file controller của bạn)
export function getDb() {
  if (!pool) {
    throw new Error("DB not connected. Call connectDb() at startup.");
  }
  return pool;
}

export default sql;