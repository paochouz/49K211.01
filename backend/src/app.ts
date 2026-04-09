import express from "express";
import cors from "cors";
import path from "path";
import { routes } from "./routes";

const app = express();

const allowedOrigins = new Set([
  "http://localhost:5173",
]);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
  }),
);

app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "backend", "uploads")));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api", routes);

app.use((req, res) => {
  res.status(404).json({ message: "Not found", path: req.path });
});

export default app;
