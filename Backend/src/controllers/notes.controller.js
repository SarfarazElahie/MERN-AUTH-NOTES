import Note from "../models/note.model.js";

/* ─────────────────────────────────────────────
   POST /api/notes
   Create a new note for the current user
───────────────────────────────────────────── */
export const createNote = async (req, res, next) => {
  try {
    const { title, content } = req.body;

    // 1. Validate input (backend is the authority)
    if (!title || typeof title !== "string" || title.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    // 2. Create note — userId comes from req.user, NEVER from body
    const note = await Note.create({
      userId: req.user._id,     // ⬅ ownership enforced here
      title: title.trim(),
      content: typeof content === "string" ? content.trim() : "",
    });

    // 3. Return created note
    return res.status(201).json({
      success: true,
      message: "Note created",
      note,
    });
  } catch (error) {
    next(error);
  }
};

/* ─────────────────────────────────────────────
   GET /api/notes
   List all notes belonging to the current user
───────────────────────────────────────────── */
export const getNotes = async (req, res, next) => {
  try {
    const notes = await Note.find({ userId: req.user._id }).sort({
      createdAt: -1, // newest first
    });

    return res.status(200).json({
      success: true,
      count: notes.length,
      notes,
    });
  } catch (error) {
    next(error);
  }
};

/* ─────────────────────────────────────────────
   GET /api/notes/:id
   Get a single note — must belong to current user
───────────────────────────────────────────── */
export const getNote = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Ownership check baked into the query
    const note = await Note.findOne({
      _id: id,
      userId: req.user._id,     // ⬅ cannot fetch another user's note
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    return res.status(200).json({
      success: true,
      note,
    });
  } catch (error) {
    // Invalid ObjectId format → Mongoose CastError
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid note ID",
      });
    }
    next(error);
  }
};

/* ─────────────────────────────────────────────
   PUT /api/notes/:id
   Update a note — must belong to current user
───────────────────────────────────────────── */
export const updateNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    // 1. Build update object with only provided fields
    const updates = {};

    if (title !== undefined) {
      if (typeof title !== "string" || title.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Title cannot be empty",
        });
      }
      updates.title = title.trim();
    }

    if (content !== undefined) {
      if (typeof content !== "string") {
        return res.status(400).json({
          success: false,
          message: "Content must be a string",
        });
      }
      updates.content = content.trim();
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Nothing to update",
      });
    }

    // 2. Find by _id + userId, then update (ownership + update in one hit)
    const note = await Note.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      updates,
      { new: true, runValidators: true } // return the updated doc, run schema validation
    );

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Note updated",
      note,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid note ID",
      });
    }
    next(error);
  }
};

/* ─────────────────────────────────────────────
   DELETE /api/notes/:id
   Delete a note — must belong to current user
───────────────────────────────────────────── */
export const deleteNote = async (req, res, next) => {
  try {
    const { id } = req.params;

    const note = await Note.findOneAndDelete({
      _id: id,
      userId: req.user._id,     // ⬅ cannot delete another user's note
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Note deleted",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid note ID",
      });
    }
    next(error);
  }
};