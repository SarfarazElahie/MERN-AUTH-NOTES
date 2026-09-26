import express from "express";
import {
  createNote,
  getNotes,
  getNote,
  updateNote,
  deleteNote,
} from "../controllers/notes.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// All notes routes are protected
router.use(protect);

router.post("/", createNote);
router.get("/", getNotes);
router.get("/:id", getNote);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);

export default router;