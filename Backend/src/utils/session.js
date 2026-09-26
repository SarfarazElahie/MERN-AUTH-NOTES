import crypto from "crypto";

/**
 * SHA-256 hash of a refresh token (for DB storage)
 * Fast — refresh tokens are already high-entropy, no need for bcrypt
 */
export const hashRefreshToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};