const isProd = process.env.NODE_ENV === "production";

const REFRESH_COOKIE_NAME = "refreshToken";
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

/**
 * Set the refresh token as an HttpOnly cookie
 */
export const setRefreshTokenCookie = (res, token) => {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,                          // JS can't read it (XSS-safe)
    secure: isProd,                          // HTTPS only in production
    sameSite: isProd ? "strict" : "lax",     // CSRF protection
    maxAge: REFRESH_COOKIE_MAX_AGE,
    path: "/",                               // available on all routes
  });
};

/**
 * Clear the refresh token cookie (logout)
 */
export const clearRefreshTokenCookie = (res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "strict" : "lax",
    path: "/",
  });
};

export { REFRESH_COOKIE_NAME };