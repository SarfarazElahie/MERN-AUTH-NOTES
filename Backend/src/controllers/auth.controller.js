import User from "../models/user.model.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import Session from "../models/session.model.js";
import {signAccessToken, signRefreshToken, verifyRefreshToken, verifyAccessToken} from "../utils/jwt.js";
import { setRefreshTokenCookie, REFRESH_COOKIE_NAME, clearRefreshTokenCookie } from "../utils/cookies.js";
import { hashRefreshToken } from "../utils/session.js";

/**
 * POST /api/auth/register
 * Body: { name, email, password }
 */
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // 1. Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // 2. Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // 3. Hash password
    const passwordHash = await hashPassword(password);

    // 4. Save user
    const user = await User.create({
      name,
      email,
      passwordHash,
    });

    // 5. Return success (NO auto-login, NO tokens)
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error); // forward to error middleware
  }
};

/**
 * POST /api/auth/login  (simplified — no tokens yet)
 * Body: { email, password }
 */
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // 2. Find user (+passwordHash)
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+passwordHash"
    );
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 3. Compare password
    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 4. Create session first (need its _id for the refresh token)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const session = await Session.create({
      userId: user._id,
      refreshTokenHash: "pending", // temporary — replaced below
      userAgent: req.headers["user-agent"] || "unknown",
      ip: req.ip || "unknown",
      expiresAt,
    });

    // 5. Sign tokens
    const accessToken = signAccessToken(user._id.toString());
    const refreshToken = signRefreshToken(
      user._id.toString(),
      session._id.toString()
    );

    // 6. Store the refresh token HASH (not raw)
    session.refreshTokenHash = hashRefreshToken(refreshToken);
    await session.save();

    // 7. Set refresh token as HttpOnly cookie
    setRefreshTokenCookie(res, refreshToken);

    // 8. Return access token + safe user data
    return res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/refresh
 * Reads refresh token from HttpOnly cookie → issues new access token
 */
export const refreshAccessToken = async (req, res, next) => {
  try {
    // 1. Read refresh token from cookie
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token missing",
      });
    }

    // 2. Verify token signature + expiry
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
    return res.status(401).json({
    success: false,
    message: "Invalid or expired refresh token",
  });
     return next(err);
    }

    // 3. Hash it and find matching session in DB
    const refreshTokenHash = hashRefreshToken(refreshToken);

    const session = await Session.findOne({
      _id: decoded.sessionId,
      refreshTokenHash,
    });

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Session not found or revoked",
      });
    }

    // 4. Extra safety: session must not be past its expiry
    if (session.expiresAt < new Date()) {
      await Session.deleteOne({ _id: session._id });
      return res.status(401).json({
        success: false,
        message: "Session expired",
      });
    }

    // 5. Issue new access token
    const newAccessToken = signAccessToken(session.userId.toString());

    // 6. Return it
    return res.status(200).json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    next(error);
  }
};


/**
 * POST /api/auth/logout
 * Deletes the CURRENT session + clears the refresh cookie
 */
export const logoutUser = async (req, res, next) => {
  try {
    // 1. Read refresh token from cookie
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

    // 2. If cookie exists → try to find & delete the session
    if (refreshToken) {
      try {
        const decoded = verifyRefreshToken(refreshToken);
        const refreshTokenHash = hashRefreshToken(refreshToken);

        await Session.deleteOne({
          _id: decoded.sessionId,
          refreshTokenHash, // only delete if it's the SAME token
        });
      } catch (err) {
        // Token invalid/expired → session is useless anyway, ignore
      }
    }

    // 3. Clear the cookie (in both cases)
    clearRefreshTokenCookie(res);

    // 4. Always return success — logout should be idempotent
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/logout-all
 * Deletes ALL sessions for the current user + clears the cookie
 * Requires: protect middleware (req.userId)
 */
export const logoutAll = async (req, res, next) => {
  try {
    // 1. Delete every session belonging to this user
    await Session.deleteMany({ userId: req.user._id });

    // 2. Clear the refresh cookie on THIS device too
    clearRefreshTokenCookie(res);

    // 3. Respond
    return res.status(200).json({
      success: true,
      message: "Logged out from all devices",
    });
  } catch (error) {
    next(error);
  }
};


/**
 * GET /api/auth/me
 * Returns the current authenticated user's safe data
 * Requires: protect middleware (req.userId)
 */
export const getMe = async (req, res, next) => {
  try {
    // Already fetched by middleware — just return it
    return res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        createdAt: req.user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};