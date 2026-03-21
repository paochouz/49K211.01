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

startServer();