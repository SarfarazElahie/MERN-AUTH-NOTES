import express from "express";
import authRoutes from "./routes/auth.routes.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import config from "./config/config.js";
import notesRoutes from "./routes/notes.routes.js";

const app = express();

// ── CORS ─────────────────────────────────────────────
// Allow requests only from the frontend origin
// credentials: true → allows cookies (refresh token) to be sent
app.use(
  cors({
    origin: config.CLIENT_URL,
    credentials: true,
  })
);

// ── Body parsers ─────────────────────────────────────
app.use(express.json());                 // parse JSON bodies
app.use(express.urlencoded({ extended: true })); // parse form bodies

// ── Cookie parser ────────────────────────────────────
// Lets us read cookies via req.cookies (needed for refresh token)
app.use(cookieParser());


//Auth routes 
app.use("/api/auth", authRoutes);

//Notes routes 
app.use("/api/notes", notesRoutes);

// ── Health check route ───────────────────────────────
app.get("/", (req, res) => {
  res.json({ ok: true, message: "API is running" });
});

// ── Error middleware (placeholder for now) ───────────
// We'll plug the real error handler later
// app.use(errorHandler);

// Test route for frontend-backend connectivity
app.get("/api/test", (req, res) => {
  res.json({ ok: true, message: "Backend is reachable 🚀" });
});

export default app;