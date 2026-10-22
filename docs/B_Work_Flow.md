# Work_flow_QLDAPM_B.md — Thành viên B — Môn Quản lý dự án phần mềm

> File này dành cho AI agent. Đọc hết trước khi sửa code hoặc tạo file. Nguồn: `QLDAPM_PhanCong.docx`.
> Mục có nhãn **(suy ra)** hoặc **(chưa quy định)** không có trong tài liệu phân công gốc. Không coi đó là yêu cầu chắc chắn; hỏi lại khi cần.
> Không đổi cổng, envelope, tên trường hay cấu trúc thư mục chung.

---

## 0. Tóm tắt nhanh

| Mục | Nội dung |
|---|---|
| Môn | Quản lý dự án phần mềm (QLDAPM) |
| Thành viên nhóm | A (nhóm trưởng), B, C |
| Phần B sở hữu | `backend/organization-service` (4002) + `backend/payroll-service` (4004) |
| Chức năng chính | Danh mục tổ chức, chi nhánh, phòng ban, hồ sơ nhân sự; tài khoản công ty, lương, lệnh chi, phiếu lương |

---

## 1. Phạm vi: được sửa và không được sửa

### Được sửa (thuộc B)
- `backend/organization-service/` (cổng 4002): Danh mục tổ chức, chi nhánh, phòng ban, hồ sơ nhân sự
- `backend/payroll-service/` (cổng 4004): Tài khoản công ty, lương, lệnh chi, phiếu lương

### Không sửa (thuộc thành viên khác)
| Thư mục | Cổng | Chủ sở hữu | Chức năng chính |
|---|---|---|---|
| `backend/api-gateway/`, `backend/identity-service/`, `mobile/`, `frontend/`, `docker-compose.yml` | 4000, 4001 | A | Gateway, xác thực, mobile, web portal, compose |
| `backend/work-service/` | 4003 | C | Ca làm việc, chấm công, tác vụ |
| `backend/integration-service/` | 4005 | C | SOAP ngân hàng, yêu cầu, thông báo, bảng tin, nội quy, Wi-Fi |

Nếu cần thay đổi ở phần của người khác (thiếu endpoint, sai schema, sai envelope), không tự sửa. Ghi lại vấn đề, nêu rõ service, endpoint, kỳ vọng và thực tế, rồi báo cho B để trao đổi với chủ phần đó.

---

## 2. Chuẩn kỹ thuật bắt buộc

### 2.1 Cấu trúc service
Mỗi service nằm trong `backend/<service-name>/` gồm:

```text
config/
src/api/
src/domain/
src/services/
src/infrastructure/
tests/
.env.example
Dockerfile
server.js
```

### 2.2 Định dạng response
- Thành công: `{ "data": ... }`
- Lỗi: `{ "error": { "code": "...", "message": "..." } }`

### 2.3 Health check
Mỗi service có `GET /health`, trả:

```json
{ "status": "ok", "service": "<service-name>", "time": "<thời gian hiện tại>" }
```

### 2.4 Gọi liên service
- Gọi qua HTTP, timeout tối đa **5000ms**.
- **Không import chéo mã nguồn** giữa các service. Mỗi service độc lập, chỉ giao tiếp qua REST hoặc SOAP.

---

## 3. Git workflow

- Nhánh gốc làm việc: `dev`.
- Tạo nhánh theo mẫu `feat/<service>-<tên>` (ví dụ `feat/organization-employees`, `feat/payroll-payouts`).
- Xong thì tạo PR về `dev`.
- **Không commit thẳng vào `dev` hoặc `main`.**
- Mỗi PR nên gọn theo một service hoặc một chức năng.

---

## 4. Danh sách việc của B

### Task 1 — organization-service (cổng 4002)
- [ ] CRUD **branches (chi nhánh)**:
  - `GET /api/branches` — danh sách chi nhánh.
  - `GET /api/branches/:slug` — chi tiết chi nhánh.
  - `POST /api/branches` — thêm chi nhánh mới.
  - `PUT /api/branches/:slug` — cập nhật thông tin chi nhánh.
  - `DELETE /api/branches/:slug` — xóa/vô hiệu hóa chi nhánh.
- [ ] CRUD **departments (phòng ban)**:
  - `GET /api/departments` — danh sách phòng ban.
  - `GET /api/departments/:id` — chi tiết phòng ban.
  - `POST /api/departments` — tạo phòng ban.
  - `PUT /api/departments/:id` — sửa phòng ban.
  - `DELETE /api/departments/:id` — xóa phòng ban.
- [ ] CRUD **employees (hồ sơ nhân sự)**:
  - `GET /api/employees?branchSlug=&departmentId=&systemRole=&status=` — danh sách nhân sự (hỗ trợ lọc và tìm kiếm).
  - `GET /api/employees/:id` — chi tiết một nhân viên.
  - `POST /api/employees` — thêm nhân viên mới.
  - `PUT /api/employees/:id` — cập nhật thông tin nhân viên.
  - `DELETE /api/employees/:id` — vô hiệu hóa/xóa nhân viên.
  - Validate email không trùng lặp; `systemRole` bắt buộc thuộc `admin` / `manager` / `staff`.
- [ ] `GET /health`.

### Task 2 — payroll-service (cổng 4004)
- [ ] **Bank Accounts (tài khoản công ty & liên kết ngân hàng):**
  - `GET /api/payroll/bank-accounts` — danh sách tài khoản doanh nghiệp.
  - `PUT /api/payroll/bank-accounts/:id` — cập nhật cấu hình tài khoản/số dư **(suy ra)**.
- [ ] **Payouts (lệnh chi lương):**
  - `GET /api/payroll/payouts` — lịch sử lệnh chi.
  - `POST /api/payroll/payouts` — tạo lệnh chi mới bắt buộc kèm `idempotencyKey`:
    - Trùng `idempotencyKey`: trả lại bản ghi đã xử lý trước đó kèm `{ "deduped": true }`.
    - Sinh mã giao dịch `id` tiền tố `TXN-xxxxxx` và `bankReference` tiền tố `BANK-xxxxxxxx`.
    - Hết số dư: trả lỗi HTTP `422` (`INSUFFICIENT_FUNDS`).
- [ ] **Payslips (phiếu lương nhân viên):**
  - `GET /api/payroll/payslips?month=MM-YYYY&employeeId=` — danh sách phiếu lương.
  - `GET /api/payroll/payslips/:id` — chi tiết phiếu lương.
  - `PUT /api/payroll/payslips/:id` — điều chỉnh thưởng / phạt phiếu lương (modal "Điều chỉnh Thưởng / Phạt" trên web) **(suy ra)**.
  - `PUT /api/payroll/payslips/:id/status` — chốt phiếu lương (chưa chốt → đã chốt) **(suy ra)**.
  - `POST /api/payroll/payslips/generate` — sinh bảng lương tháng:
    - Lấy dữ liệu phạt từ `GET /api/attendance?employeeId=&month=YYYY-MM` của C (work-service).
    - Áp dụng công thức chuẩn: `netSalary = baseSalary + bonus - totalPenalty`.
    - Chống trùng lặp cặp `(employeeId, month)`.
- [ ] `GET /health`.

---

## 5. Schema dữ liệu liên quan (phải khớp — SSOT tại `A_Work_Flow.md §6`)

Không tự đổi tên trường. Mọi thay đổi phải cập nhật `A_Work_Flow.md §6` trước.

- **Branch:** `id, name, slug, address, phone, manager, status (hoạt động/vô hiệu hóa), staff`

- **Department:** `id, name, code, description, manager, status (hoạt động/tạm dừng), staff, createdAt`

- **Employee:** `id, name, email, phone, gender, birthDate, province, ward, street, cccd, issueDate, issuePlace, cccdFront, cccdBack, branch (slug chi nhánh), department, role, systemRole (admin/manager/staff), status (đang làm/vô hiệu hóa), joinDate, baseSalary, salaryType, hourlySalary, bankName, bankAccountNumber, bankAccountName`

- **Payout:** `id (TXN-xxxxxx), bankReference (BANK-xxxxxxxx), debitAccount, totalAmount, content, beneficiaryCount, idempotencyKey, status, createdAt`

- **Payslip:** `id, employeeId, month (MM-YYYY), baseSalary, bonus, totalPenalty, netSalary (= baseSalary + bonus - totalPenalty), payoutId, status (chưa chốt/đã chốt), issuedAt`

- **Khuôn SOAP:** `POST /soap/payroll` nhận `PayoutRequest (idempotencyKey, debitAccount, content, totalAmount, beneficiaryCount)`, trả `PayoutResponse (transactionId (TXN-xxxxxx), bankReference (BANK-xxxxxxxx), status)`. Lỗi trả `soap:Fault` với `faultcode = soap:Client` và `faultstring` mô tả lỗi.

Ghi chú định dạng ngày: `Payslip.month` dùng `MM-YYYY`; `Employee.joinDate` dùng `DD-MM-YYYY`; query attendance dùng `month=YYYY-MM`.

---

## 6. Phụ thuộc và phối hợp

- Mọi request từ web và mobile đi qua `api-gateway` (4000) của A. Client không gọi thẳng vào service của bạn.
- Đăng nhập và phiên `hrm-session` do `identity-service` (4001) của A xử lý.
- **C (work-service, 4003):** dữ liệu phạt chấm công (`penaltyAmount`) nằm ở work-service của C. Để sinh phiếu lương tháng, gọi HTTP đến `GET /api/attendance?employeeId=&month=YYYY-MM` của C **(suy ra)**, timeout tối đa 5000ms, không import chéo mã nguồn.
- **C (integration-service, 4005):** SOAP `POST /soap/payroll` của C tạo lệnh chi và trả `transactionId`, `bankReference`. C gọi REST payout của bạn qua HTTP **(suy ra)**. Khi bạn trả lỗi 422 (hết số dư), C sẽ chuyển thành `soap:Fault`.
- **A:** cần cấu hình các route `/api/branches`, `/api/departments`, `/api/employees`, `/api/payroll/*` trên gateway. Màn hình `salary` trên mobile và web portal của A gọi trực tiếp các API của bạn.

---

## 7. Mốc kiểm tra

| Mốc | Việc của B |
|---|---|
| 1 | Xong organization-service (4002) |
| 2 | Xong payroll-service (4004 — lệnh chi và phiếu lương) |

---

## 8. Nghiệm thu (Definition of Done)

- CRUD danh mục tổ chức và nhân sự đúng chuẩn envelope.
- Lệnh chi chống trùng lặp qua `idempotencyKey` (`deduped: true`, hết số dư trả `422`).
- Sinh phiếu lương đúng công thức, không trùng cặp `employeeId` + `month`.

### Checklist trước khi mở PR
- [ ] Đúng cấu trúc thư mục service (mục 2.1).
- [ ] Response đúng envelope `{data}` hoặc `{error: {code, message}}`.
- [ ] Có `GET /health`.
- [ ] Có `.env.example` và `Dockerfile`.
- [ ] Email trùng bị từ chối, `systemRole` chỉ nhận `admin`/`manager`/`staff`.
- [ ] Payout trùng `idempotencyKey` trả bản ghi cũ kèm `deduped: true`.
- [ ] Payslip có `netSalary = baseSalary + bonus - totalPenalty`.
- [ ] Gọi liên service qua HTTP, timeout tối đa 5000ms, không import chéo mã nguồn.
- [ ] Nhánh đặt tên `feat/<service>-<tên>`, PR về `dev`.
- [ ] Không sửa file thuộc phần của người khác.

---

## 9. Điểm chưa quy định

Các mục sau không có trong tài liệu phân công gốc:

- **Cơ sở dữ liệu và ORM:** DB dùng **PostgreSQL (Supabase) + Prisma**, lớp lưu trữ đặt trong `src/infrastructure`.
- **Cách service nhận danh tính người dùng:** middleware đọc cookie `hrm-session` hoặc bearer token từ gateway chuyển tiếp.
- **Quy trình khi gọi C bị lỗi lúc sinh phiếu:** trả mã lỗi 500 kèm thông báo rõ ràng "Không thể kết nối đến work-service".

---

## 10. Quy tắc làm việc cho agent

1. Đọc mục 1 trước. Chỉ sửa trong phạm vi của B (`organization-service`, `payroll-service`).
2. Không tự bịa endpoint, tên trường hay hành vi. Bám đúng schema SSOT ở mục 5.
3. Không commit thẳng vào `dev` hoặc `main`. Mỗi thay đổi đi qua nhánh `feat/...` và PR về `dev`.
4. Không import chéo mã nguồn giữa các service. Muốn dùng dữ liệu của service khác thì gọi qua HTTP.
5. Sau mỗi thay đổi, kiểm tra `GET /health` và chạy test của service (`tests/`).
6. Khi báo kết quả, nói rõ đã chạy lệnh nào và kết quả ra sao. Không báo "pass" khi chưa chạy.
7. Ưu tiên theo thứ tự: organization-service (mốc 1) trước, rồi payroll-service (mốc 2).
