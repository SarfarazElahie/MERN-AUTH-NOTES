import { verifyAccessToken } from "../utils/jwt.js";

/**
 * Protects routes — requires a valid access token in Authorization header
 * On success: attaches req.userId
 */
export const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access token missing",
      });
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired access token",
      });
    }

    req.userId = decoded.userId;
    next();
  } catch (error) {
    next(error);
  }
};