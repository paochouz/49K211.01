import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

const dbConfig: sql.config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER || "localhost",
  database: process.env.DB_NAME,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

let pool: sql.ConnectionPool | null = null;

export async function connectDb() {
  try {
    pool = await sql.connect(dbConfig);
    console.log("Connected to SQL Server");
    return pool;
  } catch (error) {
    console.error("Database connection failed:", error);
    throw error;
  }
}

export function getDb() {
  if (!pool) {
    throw new Error("DB not connected. Call connectDb() at startup.");
  }
  return pool;
}

export default sql;