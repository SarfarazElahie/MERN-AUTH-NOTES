import jwt from "jsonwebtoken";
import config from "../config/config.js";

/* ─────────────────────────────────────────────
   ACCESS TOKEN  (short-lived, e.g. 15m)
   Payload: { userId }
───────────────────────────────────────────── */

export const signAccessToken = (userId) => {
  return jwt.sign(
    { userId },
    config.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, config.ACCESS_TOKEN_SECRET);
};

/* ─────────────────────────────────────────────
   REFRESH TOKEN  (long-lived, e.g. 7d)
   Payload: { userId, sessionId }
───────────────────────────────────────────── */

export const signRefreshToken = (userId, sessionId) => {
  return jwt.sign(
    { userId, sessionId },
    config.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, config.REFRESH_TOKEN_SECRET);
};