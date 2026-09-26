import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // fast lookup by user
    },

    refreshTokenHash: {
      type: String,
      required: true,
    },

    userAgent: {
      type: String,
      default: "unknown",
    },

    ip: {
      type: String,
      default: "unknown",
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // only createdAt
  }
);

// Auto-delete expired sessions (Mongo TTL index)
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Session = mongoose.model("Session", sessionSchema);

export default Session;