import express from "express";
import cors from "cors";
import { routes } from "./routes";

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
}));

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api", routes);

app.use((req, res) => {
  res.status(404).json({ message: "Not found", path: req.path });
});

export default app;