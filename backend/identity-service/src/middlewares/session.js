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

/**
 * Middleware phân quyền theo 3 cấp độ: admin, manager, staff.
 * Sử dụng sau sessionMiddleware.
 * Trả về HTTP 403 nếu role người dùng không nằm trong danh sách cho phép.
 */
function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError("Chưa xác thực"));
    }
    if (!roles.includes(req.user.role)) {
      const err = new Error("Bạn không có quyền thực hiện thao tác này");
      err.code = "FORBIDDEN";
      err.status = 403;
      return next(err);
    }
    return next();
  };
}

module.exports = { sessionMiddleware, requireRole, COOKIE_NAME, extractToken };
