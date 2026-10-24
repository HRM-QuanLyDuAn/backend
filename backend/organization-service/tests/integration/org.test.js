"use strict";

const assert = require("node:assert/strict");
const { test } = require("node:test");

test("CRUD branches + departments + employees validation", async () => {
  const database = require("../../src/config/database");
  await database.connect();
  const app = require("../../src/app");
  const server = app.listen(0);
  await new Promise((r) => server.on("listening", r));
  const port = server.address().port;
  const base = `http://localhost:${port}`;
  const suffix = `${Date.now()}`;

  try {
    // Branches: khởi đầu là mảng (không phụ thuộc seed)
    let res = await fetch(`${base}/api/branches`);
    let body = await res.json();
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(body.data));

    // Tạo chi nhánh mới qua API
    res = await fetch(`${base}/api/branches`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: `Chi nhánh ${suffix}`, slug: `CN-${suffix}` }),
    });
    body = await res.json();
    assert.equal(res.status, 201);
    const branchSlug = body.data.slug;
    assert.ok(branchSlug);

    // Danh sách phải chứa chi nhánh vừa tạo
    res = await fetch(`${base}/api/branches`);
    body = await res.json();
    assert.equal(res.status, 200);
    assert.ok(body.data.length >= 1);
    assert.ok(body.data.some((b) => b.slug === branchSlug));

    // Trùng slug -> 409
    res = await fetch(`${base}/api/branches`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Trùng", slug: branchSlug }),
    });
    assert.equal(res.status, 409);

    // Departments: tạo + lọc danh sách
    res = await fetch(`${base}/api/departments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: `Phòng ${suffix}`, code: `DEP-${suffix}` }),
    });
    body = await res.json();
    assert.equal(res.status, 201);

    res = await fetch(`${base}/api/departments`);
    body = await res.json();
    assert.equal(res.status, 200);
    assert.ok(body.data.length >= 1);

    // Employees: tạo staff + filter theo systemRole
    res = await fetch(`${base}/api/employees`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Nhân viên test", email: `staff-${suffix}@company.com`, systemRole: "staff", branchSlug }),
    });
    body = await res.json();
    assert.equal(res.status, 201);

    res = await fetch(`${base}/api/employees?systemRole=staff`);
    body = await res.json();
    assert.equal(res.status, 200);
    assert.ok(body.data.every((e) => e.systemRole === "staff"));
    assert.ok(body.data.length >= 1);

    // Email trùng -> 409
    res = await fetch(`${base}/api/employees`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Trùng", email: "admin@company.com", systemRole: "staff" }),
    });
    assert.equal(res.status, 409);

    // systemRole sai -> 400
    res = await fetch(`${base}/api/employees`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Sai", email: `sai-${suffix}@company.com`, systemRole: "boss" }),
    });
    assert.equal(res.status, 400);
  } finally {
    server.close();
  }
});
