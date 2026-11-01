"use strict";

const path = require("path");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const { createProxyMiddleware } = require("http-proxy-middleware");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

const config = require("./config");
const { errorHandler } = require("./middlewares/errorHandler");
const { createAuthMiddleware } = require("./middlewares/auth");
const { createRateLimitMiddleware } = require("./middlewares/rateLimit");

const app = express();

app.use(morgan("dev"));
// CORS cho phiên cookie hrm-session: chỉ định origin cụ thể, không dùng "*".
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: config.serviceName, time: new Date().toISOString() });
});

// Phục vụ API Contract & Swagger UI tập trung (truy cập công khai, không bị rate-limit chặn asset)
const openapiPath = path.join(__dirname, "../docs/openapi.yaml");
let swaggerDocument;
try {
  swaggerDocument = YAML.load(openapiPath);
} catch (err) {
  console.warn("[gateway] Không thể nạp docs/openapi.yaml:", err.message);
}

if (swaggerDocument) {
  // Trả về OpenAPI Schema dạng JSON cho Postman, Insomnia, Swagger Codegen
  app.get("/docs/openapi.json", (_req, res) => {
    res.json(swaggerDocument);
  });

  // Trả về file OpenAPI Spec gốc dạng YAML
  app.get("/docs/openapi.yaml", (_req, res) => {
    res.sendFile(openapiPath);
  });

  // Giao diện Swagger UI tương tác trực quan
  const swaggerOptions = {
    customSiteTitle: "HRM Enterprise — API Contract & Help Page",
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 25px 0 15px 0; }
      .swagger-ui .info .title { font-size: 28px; color: #1e293b; font-weight: 700; }
    `,
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: "none",
      filter: true,
      tryItOutEnabled: true,
    },
  };

  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));
  // Hỗ trợ các alias quen thuộc như trong ASP.NET (/help, /swagger, /api-docs)
  app.get("/api-docs", (_req, res) => res.redirect("/docs"));
  app.get("/help", (_req, res) => res.redirect("/docs"));
  app.get("/swagger", (_req, res) => res.redirect("/docs"));
}

// Giới hạn tần suất + xác thực JWT trước khi proxy (TECHS.md §6.3).
app.use(createRateLimitMiddleware());
app.use(createAuthMiddleware());

function proxyTo(pathFilter, target, label) {
  // http-proxy-middleware v3: pathFilter nằm trong options, app.use không gắn
  // path Express để giữ nguyên full path /api/... khi forward. Timeout 5000ms.
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathFilter,
    proxyTimeout: config.timeoutMs,
    timeout: config.timeoutMs,
    logLevel: "warn",
    on: {
      proxyReq: (proxyReq, req) => {
        // Chuyển danh tính đã verify sang service phía sau, service không cần re-verify.
        if (req.user) {
          if (req.user.userId) proxyReq.setHeader("x-user-id", String(req.user.userId));
          if (req.user.role) proxyReq.setHeader("x-user-role", String(req.user.role));
          if (req.user.branchSlug) proxyReq.setHeader("x-branch-slug", String(req.user.branchSlug));
        }
      },
      error: (err, _req, res) => {
        console.warn(`[gateway] ${label} lỗi:`, err.message);
        if (!res.headersSent) {
          res.status(502).json({
            error: { code: "BAD_GATEWAY", message: `Không kết nối được ${label}` },
          });
        }
      },
    },
  });
}

// Bảng route qua gateway (docs/A §5). Đường dẫn ✔ từ tài liệu gốc giữ nguyên;
// nhóm (suy ra) vẫn proxy để B/D/E cắm vào không đổi gateway.
app.use(proxyTo("/api/auth", config.targets.identity, "identity-service"));
app.use(proxyTo("/api/branches", config.targets.organization, "organization-service"));
app.use(proxyTo("/api/departments", config.targets.organization, "organization-service"));
app.use(proxyTo("/api/employees", config.targets.organization, "organization-service"));
app.use(proxyTo("/api/shifts", config.targets.work, "work-service"));
app.use(proxyTo("/api/shift-templates", config.targets.work, "work-service"));
app.use(proxyTo("/api/attendance", config.targets.work, "work-service"));
app.use(proxyTo("/api/tasks", config.targets.work, "work-service"));
app.use(proxyTo("/api/payroll", config.targets.payroll, "payroll-service"));
// SOAP: chuyển tiếp nguyên vẹn body/headers/status XML, không bọc {data}/{error}.
app.use(proxyTo("/soap/payroll", config.targets.integration, "integration-service"));
app.use(proxyTo("/api/news", config.targets.integration, "integration-service"));
app.use(proxyTo("/api/regulations", config.targets.integration, "integration-service"));
app.use(proxyTo("/api/wifi-configs", config.targets.integration, "integration-service"));
app.use(proxyTo("/api/requests", config.targets.integration, "integration-service"));
app.use(proxyTo("/api/notifications", config.targets.integration, "integration-service"));
app.use(proxyTo("/api/soap-config", config.targets.integration, "integration-service"));
app.use(proxyTo("/api/upload", config.targets.integration, "integration-service"));

app.use((_req, res) => {
  res.status(404).json({ error: { code: "NOT_FOUND", message: "Không tìm thấy tài nguyên" } });
});

app.use(errorHandler);

module.exports = app;
