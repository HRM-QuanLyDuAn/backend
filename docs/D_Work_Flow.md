# Work_flow_PTPMDV_D.md — Thành viên D — Môn Phát triển phần mềm hướng dịch vụ

> File này dành cho AI agent. Đọc hết trước khi sửa code hoặc tạo file. Nguồn: `PTPMDV_PhanCong.docx`.
> Mục có nhãn **(suy ra)** hoặc **(chưa quy định)** không có trong tài liệu phân công gốc. Không coi đó là yêu cầu chắc chắn; hỏi lại khi cần.
> Không đổi cổng, envelope, tên trường hay cấu trúc thư mục chung.

---

## 0. Tóm tắt nhanh

| Mục | Nội dung |
|---|---|
| Môn | Phát triển phần mềm hướng dịch vụ |
| Thành viên nhóm | A (nhóm trưởng), B, D, E |
| Phần D sở hữu | `backend/payroll-service` (4004) |
| Chức năng chính | Lương, lệnh chi, phiếu lương |

---

## 1. Phạm vi: được sửa và không được sửa

### Được sửa (thuộc D)
- `backend/payroll-service/` (cổng 4004): Lương, lệnh chi, phiếu lương

### Không sửa (thuộc thành viên khác)
| Thư mục | Cổng | Chủ sở hữu | Chức năng chính |
|---|---|---|---|
| `backend/api-gateway/`, `backend/identity-service/`, `mobile/`, `docker-compose.yml` | 4000, 4001 | A | Gateway, xác thực, mobile, compose |
| `backend/organization-service/` | 4002 | B | Danh mục tổ chức và nhân sự |
| `backend/work-service/` | 4003 | B | Ca, chấm công, tác vụ |
| `backend/integration-service/` | 4005 | E | SOAP ngân hàng, yêu cầu, thông báo, bảng tin, nội quy, Wi-Fi |

Nếu cần thay đổi ở phần của người khác (thiếu endpoint, sai schema, sai envelope), không tự sửa. Ghi lại vấn đề, nêu rõ service, endpoint, kỳ vọng và thực tế, rồi báo cho D để trao đổi với chủ phần đó.

---

## 2. Chuẩn kỹ thuật bắt buộc

### 2.1 Cấu trúc service
Mỗi service nằm trong `backend/<service-name>/` theo **Flat 3-Tier (Mẫu A)** — luồng chuẩn `Route -> Controller -> Service -> Prisma`:

```text
backend/<service-name>/
├── prisma/                # schema.prisma + migration + seed riêng
├── src/
│   ├── config/            # database.js + index.js (đọc env)
│   ├── clients/           # (nếu có) HTTP client gọi service khác, timeout 5000ms
│   ├── controllers/       # nhận req/res, gọi Service, trả JSON
│   ├── middlewares/       # xác thực, phân quyền, xử lý lỗi
│   ├── routes/            # khai báo route Express
│   ├── services/          # business logic + gọi trực tiếp Prisma (không qua repository)
│   ├── validators/        # (nếu có) kiểm tra đầu vào
│   ├── utils/             # errors.js, logger.js, ...
│   └── app.js             # khởi tạo Express, CORS, parser, gắn route, health
├── tests/
│   ├── unit/
│   └── integration/
├── .env.example
├── package.json
└── server.js
```

Cấm `config/` ở root, `src/api/`, `src/domain/`, `src/infrastructure/`, tầng `repositories` riêng.

### 2.2 Định dạng response
- Thành công: `{ "data": ... }`
- Lỗi: `{ "error": { "code": "...", "message": "..." } }`

### 2.3 Health check
Mỗi service có `GET /health`. Tài liệu PTPMDV không nêu định dạng body. Nên giữ thống nhất với chuẩn chung của dự án **(suy ra)**:

```json
{ "status": "ok", "service": "<service-name>", "time": "<thời gian hiện tại>" }
```

### 2.4 Gọi liên service (ràng buộc riêng của môn này)
- Gọi qua HTTP, timeout tối đa **5000ms**.
- **Không import chéo mã nguồn** giữa các service. Mỗi service độc lập, chỉ giao tiếp qua REST hoặc SOAP.

---

## 3. Git workflow

- Nhánh gốc làm việc: `dev`.
- Tạo nhánh theo mẫu `feat/<service>-<tên>` (ví dụ `feat/payroll-payouts`, `feat/payroll-payslips`).
- Xong thì tạo PR về `dev`.
- **Không commit thẳng vào `dev` hoặc `main`.**
- Mỗi PR nên gọn theo một service hoặc một chức năng.

---

## 4. Danh sách việc của D

### Task 1 — payroll-service (cổng 4004) — ✅ XONG (nhánh `feat/payroll-payouts`)
- [x] `GET /api/payroll/bank-accounts`.
- [x] `PUT /api/payroll/bank-accounts/:id` — sửa cấu hình liên kết ngân hàng (web dùng ở mục "Liên kết Ngân hàng") **(suy ra)**.
- [x] `GET /api/payroll/payouts` và `POST /api/payroll/payouts` với `idempotencyKey`:
  - Trùng key: trả bản ghi cũ kèm `deduped: true`.
  - Sinh `id` dạng `TXN-xxxxxx` và `bankReference` dạng `BANK-xxxxxxxx`.
  - Hết số dư: trả HTTP `422`.
- [x] `GET /api/payroll/payslips`.
- [x] `PUT /api/payroll/payslips/:id` — điều chỉnh thưởng/phạt của phiếu (modal "Điều chỉnh Thưởng / Phạt" trên web) **(suy ra)**.
- [x] `PUT /api/payroll/payslips/:id/status` — chốt phiếu (chưa chốt → đã chốt), phục vụ "Chốt phiếu lương hàng loạt" trên web **(suy ra)**.
- [x] `POST /api/payroll/payslips/generate`: tổng hợp phạt theo tháng; `netSalary = baseSalary + bonus - totalPenalty` (đúng SSOT tại `A_Work_Flow.md §6`, trước đây file này ghi thiếu `bonus`); chống trùng cặp `employeeId` + `month`.
- [x] `GET /health`.

---

## 5. Schema dữ liệu liên quan (phải khớp — SSOT tại `A_Work_Flow.md §6`)

Không tự đổi tên trường. Mọi thay đổi phải cập nhật `A_Work_Flow.md §6` trước.

- **Payout:** `id (TXN-xxxxxx), bankReference (BANK-xxxxxxxx), debitAccount, totalAmount, content, beneficiaryCount, idempotencyKey, status, createdAt`

- **Payslip:** `id, employeeId, month (MM-YYYY), baseSalary, bonus, totalPenalty, netSalary (= baseSalary + bonus - totalPenalty), payoutId, status (chưa chốt/đã chốt), issuedAt`
  > `bonus` được bổ sung so với tài liệu gốc để khớp frontend và mobile. Không trùng cặp `employeeId` + `month`.

- **Khuôn SOAP:** `POST /soap/payroll` nhận `PayoutRequest (idempotencyKey, debitAccount, content, totalAmount, beneficiaryCount)`, trả `PayoutResponse (transactionId (TXN-xxxxxx), bankReference (BANK-xxxxxxxx), status)`. Lỗi trả `soap:Fault` với `faultcode = soap:Client` và `faultstring` mô tả lỗi (ví dụ: Số dư không đủ).

Ghi chú định dạng ngày: `Payslip.month` dùng `MM-YYYY`; query attendance dùng `month=YYYY-MM`.

---

## 6. Phụ thuộc và phối hợp

- Mọi request từ web và mobile đi qua `api-gateway` (4000) của A. Client không gọi thẳng vào service của bạn.
- Đăng nhập và phiên `hrm-session` do `identity-service` (4001) của A xử lý.
- **B (work-service, 4003):** dữ liệu phạt chấm công (`penaltyAmount`) nằm ở work-service của B. Để "tổng hợp phạt theo tháng", gọi HTTP đến `GET /api/attendance?employeeId=&month=YYYY-MM` của B **(suy ra)**, timeout tối đa 5000ms, không import chéo mã nguồn. Xác nhận với B trước khi làm.
- **B (organization-service, 4002):** `baseSalary`, `bankName`, `bankAccount` nằm ở Employee của organization-service. Nếu cần, gọi HTTP đến `GET /api/employees/:id` **(suy ra)**.
- **E (integration-service, 4005):** SOAP `POST /soap/payroll` của E tạo lệnh chi và trả `transactionId`, `bankReference`. Cách E tạo lệnh chi là gọi REST payout của bạn qua HTTP **(suy ra)**. Lỗi hết số dư (422) của bạn phải chuyển được thành `soap:Fault` (ví dụ "Số dư không đủ") ở phía E.
- **A:** cần route `/api/payroll/*` cấu hình trên gateway. Màn hình `salary` trên mobile và demo REST idempotent của A gọi trực tiếp API của bạn.

---

## 7. Mốc kiểm tra

| Mốc | Việc của D |
|---|---|
| 1 | Xong lệnh chi (payouts) |

Tài liệu không nêu mốc riêng cho phiếu lương (payslips). **Phụ trách: D** — đặt payslips vào Mốc 2 (trước kết nối/demo của A) **(suy ra)**.

Mốc đầu tiên của A là gateway + identity. Cần bám sát để chạy được qua gateway khi tích hợp.

---

## 8. Nghiệm thu (Definition of Done)

- Lệnh chi chống trùng và kiểm tra số dư đúng.
- Sinh phiếu đúng, không trùng.

### Checklist trước khi mở PR
- [ ] Đúng cấu trúc thư mục service (mục 2.1).
- [ ] Response đúng envelope `{data}` hoặc `{error: {code, message}}`.
- [ ] Có `GET /health`.
- [ ] Có `.env.example` (mặc định trỏ Postgres local của chính service; Supabase để dạng comment, mỗi service 1 link riêng).
- [ ] Payout trùng `idempotencyKey` trả bản ghi cũ kèm `deduped: true`; hết số dư trả 422.
- [ ] Payslip có `netSalary = baseSalary + bonus - totalPenalty`, không trùng cặp `employeeId` + `month`.
- [ ] Đồng bộ công thức `netSalary` với `AGENTS.md` §2.6 (hiện ghi `baseSalary - totalPenalties + allowances` — khác bản này, cần chốt với A) **(suy ra)**.
- [ ] Gọi liên service qua HTTP, timeout tối đa 5000ms, không import chéo mã nguồn.
- [ ] Nhánh đặt tên `feat/<service>-<tên>`, PR về `dev`.
- [ ] Không sửa file thuộc phần của người khác.

---

## 9. Điểm chưa quy định

Các mục sau không có trong tài liệu phân công. Không tự quyết định rồi coi như đã chốt. Hỏi A (nhóm trưởng) hoặc ghi rõ giả định trong PR.

- **Cơ sở dữ liệu và ORM (đã chốt 5 DB trên 5 link Supabase riêng):** D sở hữu DB riêng `hrm_payroll` (4004) với Prisma schema + migration + `DATABASE_URL` riêng trỏ link Supabase riêng. Lớp lưu trữ nằm trong `src/services/` gọi trực tiếp Prisma (Mẫu A — không có tầng `repositories` riêng hay `src/infrastructure`). Cấm join xuyên cơ sở dữ liệu; cần `penaltyAmount` thì gọi HTTP `GET /api/attendance` của B, cần `baseSalary` thì gọi HTTP `GET /api/employees/:id` của B.
- **Cách service nhận danh tính người dùng (vai trò `admin`/`manager`/`staff`):** tài liệu chỉ nêu middleware `hrm-session` gắn `req.user` ở identity-service. Cách các service khác lấy được danh tính và vai trò chưa được quy định. Hỏi A trước khi làm phần phân quyền.
- **Schema tài khoản công ty (bank-accounts) và cách quản lý số dư:** không được nêu.
- **Giá trị `status` của Payout và Payslip:** không được nêu.
- **Cách lấy dữ liệu phạt và lương cơ bản:** tài liệu không nêu cách gọi giữa các service, xem mục 6.
- **Cách xử lý khi gọi B bị timeout hoặc lỗi lúc sinh phiếu:** không được nêu.
- **Định dạng body của `/health`:** tài liệu PTPMDV không nêu, xem mục 2.3.

---

## 10. Quy tắc làm việc cho agent

1. Đọc mục 1 trước. Chỉ sửa trong phạm vi của D.
2. Không tự bịa endpoint, tên trường hay hành vi. Nếu tài liệu không nêu, dùng nhãn **(suy ra)** và hỏi lại.
3. Bám đúng envelope, tên trường và định dạng ngày ở mục 5.
4. Không commit thẳng vào `dev` hoặc `main`. Mỗi thay đổi đi qua nhánh `feat/...` và PR về `dev`.
5. Không import chéo mã nguồn giữa các service. Muốn dùng dữ liệu của service khác thì gọi qua HTTP.
6. Sau mỗi thay đổi, kiểm tra `GET /health` và chạy test của service (`tests/`).
7. Khi báo kết quả, nói rõ đã chạy lệnh nào và kết quả ra sao. Không báo "pass" khi chưa chạy.
8. Ưu tiên theo thứ tự: lệnh chi (mốc 1) trước, vì SOAP của E và demo REST idempotent của A phụ thuộc vào nó; rồi phiếu lương.
