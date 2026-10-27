"use strict";

const assert = require("node:assert/strict");
const { test } = require("node:test");

test("notifications CRUD + read", async () => {
  const app = require("../../src/app");
  const server = app.listen(0);
  await new Promise((r) => server.on("listening", r));
  const port = server.address().port;
  const base = `http://localhost:${port}`;
  const json = { "Content-Type": "application/json" };

  try {
    // Tạo 1 thông báo broadcast (không targetEmployeeId) rồi kiểm tra
    let res = await fetch(`${base}/api/notifications`, {
      method: "POST",
      headers: json,
      body: JSON.stringify({ title: "Thông báo chung", body: "Nội dung broadcast" }),
    });
    assert.equal(res.status, 201);

    // Broadcast luôn trả về cho mọi nhân viên
    res = await fetch(`${base}/api/notifications?employeeId=ai-do`);
    let body = await res.json();
    assert.equal(res.status, 200);
    assert.ok(body.data.some((n) => n.targetEmployeeId === null));

  // Thiếu body -> 400
  res = await fetch(`${base}/api/notifications`, {
    method: "POST",
    headers: json,
    body: JSON.stringify({ title: "x" }),
  });
  assert.equal(res.status, 400);

  res = await fetch(`${base}/api/notifications`, {
    method: "POST",
    headers: json,
    body: JSON.stringify({ targetEmployeeId: "e-x", title: "Chào", body: "Nội dung" }),
  });
  body = await res.json();
  assert.equal(res.status, 201);
  const id = body.data.id;

  res = await fetch(`${base}/api/notifications/${id}/read`, { method: "PUT" });
  body = await res.json();
  assert.equal(res.status, 200);
  assert.equal(body.data.isRead, true);

  res = await fetch(`${base}/api/notifications/${id}`, { method: "DELETE" });
  assert.equal(res.status, 200);

  } finally {
    server.close();
  }
});

test("SOAP WSDL + Fault khi thiếu trường", async () => {
  const app = require("../../src/app");
  const server = app.listen(0);
  await new Promise((r) => server.on("listening", r));
  const port = server.address().port;
  const base = `http://localhost:${port}`;

  try {
    let res = await fetch(`${base}/soap/payroll?wsdl`);
  let text = await res.text();
  assert.equal(res.status, 200);
  assert.ok(res.headers.get("content-type").includes("xml"));
  assert.ok(text.includes('name="PayoutRequest"'));

  // POST thiếu trường -> soap:Fault 400
  res = await fetch(`${base}/soap/payroll`, {
    method: "POST",
    headers: { "Content-Type": "text/xml" },
    body: `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><PayoutRequest><content>x</content></PayoutRequest></soap:Body></soap:Envelope>`,
  });
  text = await res.text();
  assert.equal(res.status, 400);
  assert.ok(text.includes("<faultcode>soap:Client</faultcode>"));

  // POST XML rác -> soap:Fault
  res = await fetch(`${base}/soap/payroll`, {
    method: "POST",
    headers: { "Content-Type": "text/xml" },
    body: `<hello/>`,
  });
  text = await res.text();
  assert.ok(text.includes("soap:Fault"));

  } finally {
    server.close();
  }
});
