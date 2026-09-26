import express from "express";
import { registerUser, loginUser,refreshAccessToken, logoutUser, logoutAll, getMe } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// POST /api/auth/register
router.post("/register", registerUser);

// POST /api/auth/login
router.post("/login", loginUser);

//POST api/auth/refresh
router.post("/refresh", refreshAccessToken);

//POST api/auth/logout
router.post("/logout", logoutUser);

//POST api/auth/logout-all
router.post("/logout-all", protect, logoutAll, getMe);

//POST api/auth/me
router.get("/me", protect, getMe);

export default router;