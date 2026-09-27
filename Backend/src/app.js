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
const allowedOrigins = [
  "http://localhost:5173",
  "https://mern-auth-notes.vercel.app",
  "https://mern-auth-notes-git-main-sarfarazelahies-projects.vercel.app",
  "https://mern-auth-notes-aqnkle64h-sarfarazelahies-projects.vercel.app",
  config.CLIENT_URL,   // keep whatever is in the env var
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (Postman, curl, mobile apps)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
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