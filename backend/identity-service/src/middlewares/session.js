"use strict";

const { verifyToken } = require("../utils/jwt");
const { UnauthorizedError } = require("../utils/errors");

const COOKIE_NAME = "hrm-session";

function extractToken(req) {
  if (req.cookies && req.cookies[COOKIE_NAME]) return req.cookies[COOKIE_NAME];
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) return header.slice(7);
  return null;
}

// Bắt buộc cho GET /api/auth/me. Các service khác (B/D/E) tự verify JWT bằng JWT_SECRET dùng chung.
function sessionMiddleware(req, _res, next) {
  try {
    const token = extractToken(req);
    if (!token) throw new UnauthorizedError("Thiếu phiên đăng nhập");
    const decoded = verifyToken(token);
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      branchSlug: decoded.branchSlug || null,
    };
    return next();
  } catch (e) {
    if (e.name === "TokenExpiredError" || e.name === "JsonWebTokenError") {
      return next(new UnauthorizedError("Phiên đăng nhập hết hạn"));
    }
    return next(e);
  }
}

module.exports = { sessionMiddleware, COOKIE_NAME, extractToken };
