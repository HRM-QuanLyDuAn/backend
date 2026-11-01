"use strict";

const assert = require("node:assert/strict");
const { test } = require("node:test");

test("tài liệu API contract và swagger ui hoạt động", async () => {
  const app = require("../src/app");
  const server = app.listen(0);
  await new Promise((r) => server.on("listening", r));
  const port = server.address().port;

  // Test /docs/openapi.json
  const jsonRes = await fetch(`http://localhost:${port}/docs/openapi.json`);
  assert.equal(jsonRes.status, 200);
  const spec = await jsonRes.json();
  assert.equal(spec.openapi, "3.0.3");
  assert.ok(spec.info.title.includes("HRM Enterprise"));
  assert.ok(spec.paths["/api/auth/login"]);
  assert.ok(spec.paths["/api/employees"]);

  // Test /docs/openapi.yaml
  const yamlRes = await fetch(`http://localhost:${port}/docs/openapi.yaml`);
  assert.equal(yamlRes.status, 200);
  const yamlText = await yamlRes.text();
  assert.ok(yamlText.includes("openapi: 3.0.3"));

  // Test /docs HTML page
  const docsRes = await fetch(`http://localhost:${port}/docs/`);
  assert.equal(docsRes.status, 200);
  const docsHtml = await docsRes.text();
  assert.ok(docsHtml.includes("swagger-ui"));

  // Test /help redirect
  const helpRes = await fetch(`http://localhost:${port}/help`, { redirect: "manual" });
  assert.equal(helpRes.status, 302);
  assert.equal(helpRes.headers.get("location"), "/docs");

  // Test /swagger redirect
  const swaggerRes = await fetch(`http://localhost:${port}/swagger`, { redirect: "manual" });
  assert.equal(swaggerRes.status, 302);
  assert.equal(swaggerRes.headers.get("location"), "/docs");

  server.close();
});
