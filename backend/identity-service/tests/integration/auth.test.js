"use strict";

const assert = require("node:assert/strict");
const { test, describe, before, after } = require("node:test");
const express = require("express");
const app = require("../../src/app");
const database = require("../../src/config/database");
const AuthService = require("../../src/services/AuthService");
const { sessionMiddleware, requireRole } = require("../../src/middlewares/session");

describe("Identity Service — 7 Core Tasks Integration", () => {
  let server;
  let baseUrl;
  let adminCookie;
  let managerCookie;
  let staffCookie;

  let rbacServer;
  let rbacUrl;

  before(async () => {
    process.env.NODE_ENV = "test";
    process.env.ALLOW_MEMORY_FALLBACK = "true";
    await database.connect().catch(() => {});
    await AuthService.ensureSeeded().catch(() => {});

    server = app.listen(0);
    await new Promise((r) => server.on("listening", r));
    baseUrl = `http://localhost:${server.address().port}`;

    const rbacApp = express();
    rbacApp.use(require("cookie-parser")());
    rbacApp.get("/admin-only", sessionMiddleware, requireRole("admin"), (req, res) => {
      res.json({ message: "Welcome Admin", role: req.user.role });
    });
    rbacApp.get("/manager-or-admin", sessionMiddleware, requireRole("admin", "manager"), (req, res) => {
      res.json({ message: "Welcome Manager or Admin", role: req.user.role });
    });
    rbacApp.get("/staff-only", sessionMiddleware, requireRole("staff"), (req, res) => {
      res.json({ message: "Welcome Staff", role: req.user.role });
    });
    rbacApp.use((err, _req, res, _next) => {
      res.status(err.status || 500).json({ error: { code: err.code || "INTERNAL_ERROR", message: err.message } });
    });

    rbacServer = rbacApp.listen(0);
    await new Promise((r) => rbacServer.on("listening", r));
    rbacUrl = `http://localhost:${rbacServer.address().port}`;
  });

  after(async () => {
    if (server) server.close();
    if (rbacServer) rbacServer.close();
    await database.disconnect().catch(() => {});
  });

  // Task 1: GET /health — Kiểm tra trạng thái dịch vụ
  test("1. GET /health — Kiểm tra trạng thái dịch vụ", async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, "ok");
    assert.equal(body.service, "identity-service");
    assert.ok(body.time);
  });

  // Task 2: POST /api/auth/login — Tiếp nhận thông tin đăng nhập, xác thực và cấp cookie phiên hrm-session
  test("2. POST /api/auth/login — Xác thực hợp lệ và cấp cookie phiên hrm-session", async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@company.com", password: "123456" }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.message, "Đăng nhập thành công");
    assert.equal(body.data.user.email, "admin@company.com");
    assert.equal(body.data.user.role, "admin");
    assert.ok(body.data.accessToken);

    const setCookie = res.headers.get("set-cookie");
    assert.ok(setCookie, "Phải có header Set-Cookie");
    assert.ok(setCookie.includes("hrm-session="), "Cookie phải có tên hrm-session");
    adminCookie = setCookie.split(";")[0];
  });

  test("2.1 POST /api/auth/login — Từ chối mật khẩu sai", async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@company.com", password: "wrongpassword" }),
    });
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.error.code, "UNAUTHORIZED");
  });

  // Task 3: POST /api/auth/logout — Thu hồi phiên và hủy cookie trên trình duyệt
  test("3. POST /api/auth/logout — Thu hồi phiên và hủy cookie", async () => {
    const res = await fetch(`${baseUrl}/api/auth/logout`, {
      method: "POST",
      headers: { Cookie: adminCookie },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.message, "Đăng xuất thành công");
    const setCookie = res.headers.get("set-cookie");
    assert.ok(setCookie, "Phải có header Set-Cookie xóa cookie");
    assert.ok(
      setCookie.includes("hrm-session=;") ||
        setCookie.includes("Max-Age=0") ||
        setCookie.includes("Expires="),
      "Cookie phải được đánh dấu xóa/hết hạn"
    );
  });

  // Task 4: GET /api/auth/me — Kiểm tra và lấy thông tin người dùng đang đăng nhập
  test("4. GET /api/auth/me — Lấy thông tin người dùng đang đăng nhập", async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Cookie: adminCookie },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.data.email, "admin@company.com");
    assert.equal(body.data.role, "admin");
    assert.equal(body.data.name, "Trần Minh Tuấn");
    assert.equal(body.data.passwordHash, undefined, "Không được lộ passwordHash");
  });

  // Task 5: Middleware xác thực đọc cookie hrm-session và gắn thông tin vào req.user
  test("5. Middleware xác thực — Chặn truy cập khi thiếu cookie hoặc token không hợp lệ", async () => {
    const resNoCookie = await fetch(`${baseUrl}/api/auth/me`);
    assert.equal(resNoCookie.status, 401);
    const bodyNoCookie = await resNoCookie.json();
    assert.equal(bodyNoCookie.error.code, "UNAUTHORIZED");

    const resInvalidCookie = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Cookie: "hrm-session=invalid-jwt-token" },
    });
    assert.equal(resInvalidCookie.status, 401);
  });

  // Task 7: Tự động seed 3 tài khoản mặc định (Admin, Manager, Staff)
  test("7. Tự động seed 3 tài khoản mặc định (Admin, Manager, Staff) và đăng nhập thành công", async () => {
    // 1. Admin
    const resAdmin = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@company.com", password: "123456" }),
    });
    assert.equal(resAdmin.status, 200);
    const adminData = await resAdmin.json();
    assert.equal(adminData.data.user.role, "admin");

    // 2. Manager
    const resManager = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "manager@company.com", password: "123456" }),
    });
    assert.equal(resManager.status, 200);
    const managerData = await resManager.json();
    assert.equal(managerData.data.user.role, "manager");
    assert.equal(managerData.data.user.name, "Vũ Thành Công");
    const setCookieMgr = resManager.headers.get("set-cookie");
    managerCookie = setCookieMgr ? setCookieMgr.split(";")[0] : "";

    // 3. Staff
    const resStaff = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "nhanvien@company.com", password: "123456" }),
    });
    assert.equal(resStaff.status, 200);
    const staffData = await resStaff.json();
    assert.equal(staffData.data.user.role, "staff");
    assert.equal(staffData.data.user.name, "Nguyễn Thu Hà");
    const setCookieStaff = resStaff.headers.get("set-cookie");
    staffCookie = setCookieStaff ? setCookieStaff.split(";")[0] : "";
  });

  // Task 6: Phân quyền theo 3 cấp độ: admin, manager, staff
  test("6. Phân quyền theo 3 cấp độ (RBAC): admin, manager, staff", async () => {
    // Admin có quyền vào /admin-only
    const resAdmin = await fetch(`${rbacUrl}/admin-only`, {
      headers: { Cookie: adminCookie },
    });
    assert.equal(resAdmin.status, 200);

    // Manager bị chặn khi vào /admin-only (403 Forbidden)
    const resMgrToAdmin = await fetch(`${rbacUrl}/admin-only`, {
      headers: { Cookie: managerCookie },
    });
    assert.equal(resMgrToAdmin.status, 403);
    const bodyMgr = await resMgrToAdmin.json();
    assert.equal(bodyMgr.error.code, "FORBIDDEN");

    // Staff bị chặn khi vào /admin-only (403 Forbidden)
    const resStaffToAdmin = await fetch(`${rbacUrl}/admin-only`, {
      headers: { Cookie: staffCookie },
    });
    assert.equal(resStaffToAdmin.status, 403);

    // Manager có quyền vào /manager-or-admin
    const resMgrOk = await fetch(`${rbacUrl}/manager-or-admin`, {
      headers: { Cookie: managerCookie },
    });
    assert.equal(resMgrOk.status, 200);

    // Staff bị chặn khi vào /manager-or-admin (403 Forbidden)
    const resStaffToMgr = await fetch(`${rbacUrl}/manager-or-admin`, {
      headers: { Cookie: staffCookie },
    });
    assert.equal(resStaffToMgr.status, 403);

    // Staff có quyền vào /staff-only
    const resStaffOk = await fetch(`${rbacUrl}/staff-only`, {
      headers: { Cookie: staffCookie },
    });
    assert.equal(resStaffOk.status, 200);
  });
});
