import User from "../models/user.model.js";
import { verifyAccessToken } from "../utils/jwt.js";

/**
 * protect middleware
 * Requires: Authorization: Bearer <accessToken>
 * On success: attaches req.user (full user doc, no passwordHash)
 * On failure: 401
 */
export const protect = async (req, res, next) => {
  try {
    // 1. Read Authorization header
    const authHeader = req.headers.authorization;

    // 2. Check header exists and is Bearer
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access token missing",
      });
    }

    // 3. Extract token
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token missing",
      });
    }

    // 4. Verify signature + expiry
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      // Only handle JWT errors here — let real bugs bubble up
      if (
        err.name === "TokenExpiredError" ||
        err.name === "JsonWebTokenError"
      ) {
        return res.status(401).json({
          success: false,
          message: "Invalid or expired access token",
        });
      }
      return next(err); // unexpected error → 500
    }

    // 5. Find the user by decoded userId
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists",
      });
    }

    // 6. Attach user to request (passwordHash not selected by schema)
    req.user = user;

    // 7. Continue
    next();
  } catch (error) {
    next(error);
  }
};