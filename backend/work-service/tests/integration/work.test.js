"use strict";

const assert = require("node:assert/strict");
const { test } = require("node:test");

test("shifts + attendance + tasks flow", async () => {
  const app = require("../../src/app");
  const server = app.listen(0);
  await new Promise((r) => server.on("listening", r));
  const port = server.address().port;
  const base = `http://localhost:${port}`;

  // Config mặc định
  let res = await fetch(`${base}/api/attendance/config`);
  let body = await res.json();
  assert.equal(res.status, 200);
  assert.equal(body.data.latePenaltyAmount, 20000);
  assert.equal(body.data.gracePeriodMinutes, 5);

  // Tạo ca
  res = await fetch(`${base}/api/shifts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ employeeId: "e-staff-1", branchSlug: "HN-1", date: "02-10-2026", template: "Ca chiều", scheduledStart: "13:00", scheduledEnd: "17:00" }),
  });
  body = await res.json();
  assert.equal(res.status, 201);

  // Thiếu date -> 400
  res = await fetch(`${base}/api/shifts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ employeeId: "e-staff-1" }),
  });
  assert.equal(res.status, 400);

  // Checkin + checkout + history
  res = await fetch(`${base}/api/attendance/checkin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ employeeId: "e-staff-1" }),
  });
  assert.equal(res.status, 201);

  res = await fetch(`${base}/api/attendance/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ employeeId: "e-staff-1", time: "17:30" }),
  });
  body = await res.json();
  assert.equal(res.status, 200);
  assert.ok(typeof body.data.penaltyAmount === "number");

  res = await fetch(`${base}/api/attendance?employeeId=e-staff-1`);
  body = await res.json();
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(body.data));

  // POST /api/attendance (Check-in ca làm việc tính phạt nếu đi muộn)
  res = await fetch(`${base}/api/attendance`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ employeeId: "e-staff-2", time: "09:30" }),
  });
  body = await res.json();
  assert.equal(res.status, 201);
  assert.equal(body.data.status, "late");
  assert.equal(body.data.penaltyAmount, 20000);
  const attId = body.data.id;

  // PUT /api/attendance/:id (Check-out tính phạt nếu về sớm)
  res = await fetch(`${base}/api/attendance/${attId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ time: "16:00" }),
  });
  body = await res.json();
  assert.equal(res.status, 200);
  assert.equal(body.data.checkOut, "16:00");
  assert.ok(body.data.penaltyAmount >= 40000);

  // GET /api/attendance?employeeId=&month=YYYY-MM
  const now = new Date();
  const yyyyMm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  res = await fetch(`${base}/api/attendance?employeeId=e-staff-2&month=${yyyyMm}`);
  body = await res.json();
  assert.equal(res.status, 200);
  assert.ok(body.data.length >= 1);

  // Tasks CRUD + filter
  res = await fetch(`${base}/api/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Dọn kho", assignedTo: "e-staff-1", branchSlug: "HN-1" }),
  });
  const created = await res.json();
  assert.equal(res.status, 201);

  res = await fetch(`${base}/api/tasks?branchSlug=HN-1&status=pending`);
  body = await res.json();
  assert.equal(res.status, 200);
  assert.ok(body.data.length >= 1);

  // Update + delete task
  res = await fetch(`${base}/api/tasks/${created.data.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "done" }),
  });
  assert.equal(res.status, 200);

  res = await fetch(`${base}/api/tasks/${created.data.id}`, {
    method: "DELETE",
  });
  body = await res.json();
  assert.equal(res.status, 200);
  assert.equal(body.data.ok, true);

  server.close();
});
