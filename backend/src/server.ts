import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import feedRoutes from "./routes/feed.js";
import projectRoutes from "./routes/projects.js";
import profileRoutes from "./routes/profiles.js";
import recruiterRoutes from "./routes/recruiter.js";
import collaborationRoutes from "./routes/collaboration.js";
import challengeRoutes from "./routes/challenges.js";
import aiRoutes from "./routes/ai.js";
import notificationRoutes from "./routes/notifications.js";
import metaRoutes from "./routes/meta.js";
import searchRoutes from "./routes/search.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
    credentials: true
  })
);
app.use(express.json({ limit: "4mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "BuildSpace AI API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/feed", feedRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/recruiter", recruiterRoutes);
app.use("/api/collaboration", collaborationRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/meta", metaRoutes);
app.use("/api/search", searchRoutes);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`BuildSpace AI backend running on http://localhost:${port}`);
});
