"use strict";

/**
 * Script kiểm tra trạng thái khởi động thành công và phản hồi GET /health
 * của toàn bộ 6 dịch vụ Microservices (4000 - 4005).
 */
const SERVICES = [
  { name: "API Gateway", port: 4000, path: "/health" },
  { name: "Identity Service", port: 4001, path: "/health" },
  { name: "Organization Service", port: 4002, path: "/health" },
  { name: "Work Service", port: 4003, path: "/health" },
  { name: "Payroll Service", port: 4004, path: "/health" },
  { name: "Integration Service", port: 4005, path: "/health" },
];

async function checkService(svc) {
  const url = `http://localhost:${svc.port}${svc.path}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    const json = await res.json().catch(() => null);
    clearTimeout(timer);

    if (res.status === 200 && json && json.status === "ok") {
      return { ok: true, name: svc.name, port: svc.port, data: json };
    }
    return { ok: false, name: svc.name, port: svc.port, error: `HTTP ${res.status}: ${JSON.stringify(json)}` };
  } catch (err) {
    clearTimeout(timer);
    return { ok: false, name: svc.name, port: svc.port, error: err.message };
  }
}

async function main() {
  console.log("===============================================================");
  console.log("HRM Enterprise — Kiểm tra 6/6 Microservices Health Check");
  console.log("===============================================================");

  const results = await Promise.all(SERVICES.map(checkService));
  let passCount = 0;

  for (const r of results) {
    if (r.ok) {
      passCount++;
      console.log(`[PASS] [:${r.port}] ${r.name.padEnd(22)}: status='${r.data.status}', service='${r.data.service}'`);
    } else {
      console.log(`[FAIL] [:${r.port}] ${r.name.padEnd(22)}: ${r.error}`);
    }
  }

  console.log("---------------------------------------------------------------");
  console.log(`Kết quả: ${passCount}/${SERVICES.length} dịch vụ đang phản hồi hợp lệ.`);
  console.log("===============================================================");

  if (passCount !== SERVICES.length) {
    process.exit(1);
  }
}

main();
