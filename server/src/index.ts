import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth";
import portfolioRoutes from "./routes/portfolios";
import exportRoutes from "./routes/export";
import uploadRoutes, { UPLOAD_DIR } from "./routes/uploads";

const app = express();

// credentials: true + an explicit origin (not "*") is required for the browser
// to send/accept the httpOnly auth cookies on cross-origin requests.
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:3000", credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: "5mb" }));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/uploads", express.static(UPLOAD_DIR, { setHeaders: (res) => res.setHeader("X-Content-Type-Options", "nosniff") }));
app.use("/api/auth", authRoutes);
app.use("/api/portfolios", portfolioRoutes);
app.use("/api/portfolios", exportRoutes);
app.use("/api/uploads", uploadRoutes);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server listening on :${port}`));
