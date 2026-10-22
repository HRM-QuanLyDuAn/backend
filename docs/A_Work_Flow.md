# Work_flow_QLDAPM_A.md — Người A (nhóm trưởng) — Môn Quản lý dự án phần mềm

> File này dành cho AI agent. Đọc hết trước khi sửa code hoặc tạo file. Nguồn: `QLDAPM_PhanCong.docx`.
> Mục có nhãn **(suy ra)** hoặc **(chưa quy định)** không có trong tài liệu phân công gốc. Không coi đó là yêu cầu chắc chắn; hỏi lại người A khi cần.
> Khi làm việc, không đổi cổng, envelope, tên trường hay cấu trúc thư mục chung.

---

## 0. Tóm tắt nhanh

| Mục | Nội dung |
|---|---|
| Môn | Quản lý dự án phần mềm (QLDAPM) |
| Đề tài | Hệ thống quản trị nhân sự và vận hành ca kíp (HRM Enterprise) theo kiến trúc hướng dịch vụ (SOA) |
| Thành viên | A (nhóm trưởng), B, C |
| Phần A sở hữu | `backend/api-gateway` (4000), `backend/identity-service` (4001), `mobile/` (Flutter), `frontend/` (Web Portal) |
| Nhiệm vụ cuối | Đấu nối toàn hệ thống, demo REST idempotent và SOAP end-to-end trên cả web và mobile, optimize |

---

## 1. Phạm vi: được sửa và không được sửa

### Được sửa (thuộc A)
- `backend/api-gateway/` (cổng 4000)
- `backend/identity-service/` (cổng 4001)
- `mobile/` (Flutter)
- `frontend/` (Web Portal — Task 5) **(suy ra, chưa có trong tài liệu gốc)**
- `docker-compose.yml` (ở gốc dự án)

### Không sửa (thuộc thành viên khác)
| Thư mục | Cổng | Chủ sở hữu | Chức năng chính |
|---|---|---|---|
| `backend/organization-service/` | 4002 | B | Chi nhánh, phòng ban, nhân sự |
| `backend/work-service/` | 4003 | C | Ca làm việc, chấm công, tác vụ |
| `backend/payroll-service/` | 4004 | B | Tài khoản công ty, lương, lệnh chi, phiếu lương |
| `backend/integration-service/` | 4005 | C | SOAP ngân hàng, yêu cầu, thông báo, bảng tin, nội quy, Wi-Fi |

Nếu cần thay đổi ở service của người khác (thiếu endpoint, sai schema, sai envelope), không tự sửa. Ghi lại vấn đề, nêu rõ service, endpoint, kỳ vọng và thực tế, rồi báo cho người A để trao đổi với chủ service.

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

Áp dụng cho `api-gateway` và `identity-service`.

### 2.2 Định dạng response
- Thành công: `{ "data": ... }`
- Lỗi: `{ "error": { "code": "...", "message": "..." } }`

### 2.3 Health check
Mỗi service (kể cả gateway) có `GET /health`. Nghiệm thu yêu cầu chạy được ở đủ **6 điểm**: gateway + 5 service.

Chuẩn response:
```json
{ "status": "ok", "service": "<service-name>", "time": "<thời gian hiện tại>" }
```

### 2.4 Gọi liên service
- Gọi qua HTTP, timeout tối đa **5000ms**.
- **Không import chéo mã nguồn** giữa các service. Mỗi service độc lập, chỉ giao tiếp qua REST hoặc SOAP.
- Áp dụng cho các lệnh gọi từ gateway đến service phía sau **(suy ra)**.

### 2.5 Mobile (Flutter)
- Điều hướng: `go_router`.
- Màu: `AppColors` (chủ đạo `#8E1B2F`).
- Font: Public Sans.
- **Không dùng `withOpacity`** (dùng `.withValues(alpha: ...)`).

---

## 3. Git workflow

- Nhánh gốc làm việc: `dev`.
- Tạo nhánh theo mẫu `feat/<service>-<tên>` (ví dụ `feat/api-gateway-proxy`, `feat/identity-auth`, `feat/mobile-salary`).
- Xong thì tạo PR về `dev`.
- **Không commit thẳng vào `dev` hoặc `main`.**
- Mỗi PR nên gọn theo một service hoặc một chức năng.

---

## 4. Danh sách việc của A

### Task 1 — api-gateway (cổng 4000)
- [ ] Dựng gateway proxy về các service 4001–4005.
- [ ] Cấu hình CORS cho phép cookie `hrm-session` (credentials: true, origin cụ thể).
- [ ] Xử lý lỗi tập trung, trả đúng envelope `{error: {code, message}}`.
- [ ] `GET /health` cho gateway.
- [ ] Viết `docker-compose` chạy đủ 6 thành phần (gateway + 5 service + database).
- [ ] Đặt timeout tối đa 5000ms khi proxy về service phía sau.
- [ ] Rate-limiting và xác thực JWT đầu vào tại gateway (Tech.md §4.5) **(suy ra)**.
- [ ] Gateway là **cổng duy nhất** cho Web và Mobile: client không gọi thẳng vào các service.

### Task 2 — identity-service (cổng 4001)
- [ ] `POST /api/auth/login`
- [ ] `POST /api/auth/logout`
- [ ] `GET /api/auth/me`
- [ ] Middleware đọc cookie `hrm-session` và gắn `req.user`.
- [ ] Phân quyền theo vai trò: `admin`, `manager`, `staff`.
- [ ] Seed 3 tài khoản: `admin`, `manager`, `staff`.
- [ ] `GET /health`.
- [ ] `POST /api/auth/refresh` — cấp lại access token bằng refresh token (Tech.md §2.3) **(suy ra)**.
- [ ] `POST /api/auth/change-password` — phục vụ đổi mật khẩu trên mobile (`profile/password.dart`) **(suy ra)**.
- [ ] `POST /api/auth/forgot-password` — phục vụ nút "Quên mật khẩu?" trên web và mobile **(suy ra)**.
- [ ] `GET /api/auth/devices` và `DELETE /api/auth/devices/:id` — quản lý thiết bị/phiên đăng nhập **(suy ra)**.

> Quyết định đã chốt: DB dùng **PostgreSQL (Supabase) + Prisma**; auth dùng **JWT + cookie `hrm-session` HttpOnly**; seed pass mặc định `123456`.

### Task 3 — Mobile (Flutter, thư mục `mobile/`)
- [ ] Đồng bộ models mobile với schema backend (mục 6): `User`, `Branch`, `Shift`, `Attendance`, `Payslip`, `Payout`, `Request`, `Notification`, `News`, `Regulation`, `WifiConfig`.
- [ ] Đấu màn hình login + splash về API thật (phiên `hrm-session`).
- [ ] Đấu màn hình `salary` (phiếu lương) về API thật qua gateway (kèm fallback mock khi chưa có).
- [ ] Đấu màn hình `attendance` (checkin/checkout) về API thật — ⏳ chờ C (work-service 4003).
- [ ] Đấu màn hình `schedule` (lịch cá nhân) về API thật — ⏳ chờ C (4003).
- [ ] Đấu màn hình `general_schedule` + `staff_monitor` về API thật (`GET /api/shifts`, `GET /api/attendance`) — ⏳ chờ C (4003).
- [ ] Đấu màn hình `shift_assignment` (phân ca) + `schedule_registration` (đăng ký ca) về API thật — ⏳ chờ C (4003).
- [ ] Đấu màn hình `tasks` về API thật (`GET/POST /api/tasks`) — ⏳ chờ C (4003).
- [ ] Đấu màn hình `leave_request` + `salary_advance` về API thật (`POST /api/requests`) — ⏳ chờ C (integration-service 4005).
- [ ] Đấu màn hình `approvals` về API thật — ⏳ chờ C (4005).
- [ ] Đấu màn hình `notifications` về API thật — ⏳ chờ C (4005).
- [ ] Đấu màn hình `news` về API thật — ⏳ chờ C (4005).
- [ ] Đấu màn hình `regulations` về API thật — ⏳ chờ C (4005).
- [ ] Đấu màn hình `wifi_config` về API thật — ⏳ chờ C (4005).
- [ ] Đấu màn hình `profile` (hồ sơ, bảo mật, đổi mật khẩu, thiết bị) về API thật.
- [ ] Cấu hình base URL và company, tự nhận diện platform (iOS: localhost, Android emulator: 10.0.2.2).
- [ ] Build và kiểm thử bản iOS / Android.
- [ ] `flutter analyze` pass (0 issues).
- [ ] `flutter test` pass.

### Task 4 — Đấu nối, demo và optimize (làm cuối)
- [ ] Đấu nối toàn hệ thống khi các service khác đã hoàn thiện.
- [ ] Test end-to-end trên **web và mobile**.
- [ ] Demo **REST idempotent** end-to-end trên cả web và mobile: gửi lệnh chi hai lần với cùng `idempotencyKey`, lần hai trả bản ghi cũ kèm `deduped: true`.
- [ ] Demo **SOAP end-to-end** trên cả web và mobile: gọi `/soap/payroll`, tạo được lệnh chi, lỗi trả `soap:Fault`.
- [ ] Demo **SAGA compensating transaction** cho luồng chi lương khi thất bại giữa chừng (Tech.md §4.2, phối hợp cùng B và C) **(suy ra)**.
- [ ] **API Composition** cho trang dashboard web (gộp organization + work + payroll) và **BFF** payload gọn cho mobile (Tech.md §4.4, §4.5) **(suy ra)**.
- [ ] Optimize hiệu năng và trải nghiệm người dùng sau khi luồng chạy đúng.

### Task 5 — Web Portal (`frontend/`) — Phụ trách: **A**
> A nhận phụ trách toàn diện Web Management Portal để đảm bảo demo hoàn chỉnh trên web.
- [ ] Chủ sở hữu `frontend/`: **A**.
- [ ] Đấu 13 trang dashboard (employees, departments, branches, shifts, tasks, requests, payslips, bank, news, regulations, wifi, dashboard tổng quan, login) về API thật qua gateway.
- [ ] Nút "Quên mật khẩu?" của web nối với `POST /api/auth/forgot-password`.
- [ ] RBAC menu theo `buildMenuItems(role)` nối với role thật từ identity-service.
- [ ] Chốt ma trận phân quyền theo vai trò cho từng endpoint (A Task 5) **(suy ra)**.

---

## 5. Bảng route qua gateway

Gateway proxy các đường dẫn sau về service tương ứng.

| Đường dẫn | Service (cổng) | Chủ sở hữu | Nguồn |
|---|---|---|---|
| `/api/auth/*` | identity (4001) | A | ✔ |
| `/api/branches`, `/api/departments`, `/api/employees` | organization (4002) | B | ✔ |
| `/api/shifts`, `/api/attendance` | work (4003) | C | ✔ |
| `/api/tasks` | work (4003) | C | (suy ra) |
| `/api/payroll/*` (`bank-accounts`, `payouts`, `payslips`) | payroll (4004) | B | ✔ |
| `/soap/payroll` (`?wsdl` và POST) | integration (4005) | C | ✔ |
| `/api/news`, `/api/regulations`, `/api/wifi-configs` | integration (4005) | C | ✔ |
| `/api/requests` | integration (4005) | C | (suy ra) |
| `/api/notifications` | integration (4005) | C | (suy ra) |

Lưu ý: `/soap/payroll` nhận và trả XML, và trả `soap:Fault` khi lỗi. Gateway phải chuyển tiếp nguyên vẹn body, header và status của SOAP, không bọc lại thành `{data}` hay `{error}`.

---

## 6. Schema dữ liệu thống nhất (SSOT — Single Source of Truth)

Đây là chuẩn chung SSOT cho toàn dự án QLDAPM. Không tự đổi tên trường. Mọi thay đổi schema phải cập nhật file này trước.

### Khuôn SOAP
- **Request:** `PayoutRequest` gồm `idempotencyKey, debitAccount, content, totalAmount, beneficiaryCount`.
- **Response:** `PayoutResponse` gồm `transactionId (TXN-xxxxxx), bankReference (BANK-xxxxxxxx), status`.
- **Lỗi:** trả `soap:Fault` với `faultcode = soap:Client` và `faultstring` mô tả lỗi (ví dụ: "Số dư không đủ").

### Các thực thể

- **Branch:** `id, name, slug, address, phone, manager (tên hiển thị), status (hoạt động/vô hiệu hóa), staff (số lượng nhân sự)`

- **Department:** `id, name, code, description, manager (tên hiển thị), status (hoạt động/tạm dừng), staff, createdAt`

- **Employee:** `id, name, email, phone, gender, birthDate, province, ward, street, cccd, issueDate, issuePlace, cccdFront, cccdBack, branch (slug chi nhánh, ví dụ "HN-1"), department (tên phòng ban), role (chức danh hiển thị), systemRole (admin/manager/staff), status (đang làm/vô hiệu hóa), joinDate, baseSalary, salaryType (hourly/monthly), hourlySalary, bankName, bankAccountNumber, bankAccountName`

- **Shift (lịch ca / phân ca):** `id, employeeId, branch (slug), date (DD-MM-YYYY), template (tên ca), scheduledStart (HH:MM), scheduledEnd (HH:MM), checkIn (HH:MM), checkOut (HH:MM), status (hoàn thành/đang làm/vắng/trễ)`

- **Attendance (chấm công):** `id, employeeId, shiftId, date (DD-MM-YYYY), checkIn (HH:MM), checkOut (HH:MM), penaltyAmount, penaltyNote, status (present/absent/late/early_leave)`

- **AttendanceConfig:** `latePenaltyAmount (số tiền/lần, mặc định 20000), earlyLeavePenaltyAmount, gracePeriodMinutes (mặc định 5), autoCloseShift (bool), shiftSwapMode (string)`
  > Chủ sở hữu: **C** (work-service 4003). Endpoint gợi ý: `GET /api/attendance/config`, `PUT /api/attendance/config`.

- **Task:** `id, title, description, assignedTo (employeeId), branchSlug, dueDate, status (pending/in_progress/done), createdAt`

- **Payslip:** `id, employeeId, month (MM-YYYY), baseSalary, bonus, totalPenalty, netSalary (= baseSalary + bonus - totalPenalty), payoutId, status (chưa chốt/đã chốt), issuedAt`
  > Chủ sở hữu: **B** (payroll-service 4004). Công thức chuẩn: `netSalary = baseSalary + bonus - totalPenalty`.

- **Payout:** `id (TXN-xxxxxx), bankReference (BANK-xxxxxxxx), debitAccount, totalAmount, content, beneficiaryCount, idempotencyKey, status, createdAt`

- **Yêu cầu nội bộ (Request):** `id, type, employeeId, branchSlug, title, content, attachmentUrl, status (pending/approved/rejected), reviewedBy, reviewNote, createdAt, updatedAt`
  > Các giá trị `type` hợp lệ: `leave` (nghỉ phép), `overtime` (tăng ca), `advance` (tạm ứng lương), `shift_swap` (đổi ca), `work_supplement` (bổ sung công), `other`.
  > Chủ sở hữu: **C** (integration-service 4005). Lưu ý: `shift_swap` cần `sourceShiftId` và `targetShiftId`.

- **Thông báo (Notification):** `id, targetEmployeeId (null = toàn hệ thống), branchSlug, title, body, isRead, createdAt`

- **Bảng tin (Announcement/News):** `id, title, summary, content, author, date, tag, tagTone (danger/warning/success/primary/gray), pinned (bool)`

- **Nội quy (Regulation):** `id, code, title, category, summary, content, status (hiệu lực/dự thảo/hết hiệu lực), scope (Toàn công ty hoặc slug chi nhánh), effectiveDate (DD-MM-YYYY), expiryDate, author, createdAt, updatedAt, version, pinned, attachments (số file đính kèm)`

- **Wi-Fi chấm công:** `id, ssid, bssid, branch (slug chi nhánh), status (hoạt động/vô hiệu hóa)`

Ghi chú định dạng ngày: `date` và `joinDate` dùng `DD-MM-YYYY`; `Payslip.month` dùng `MM-YYYY`; query attendance dùng `month=YYYY-MM`.

---

## 7. Mốc kiểm tra

| Mốc | Việc của A | Việc của người khác (phụ thuộc) |
|---|---|---|
| 1 | Xong gateway + identity + đấu API mobile cơ bản | B xong organization; C xong work-service |
| 2 | Xong build và kiểm thử iOS/Android, đấu nối, demo REST idempotent và SOAP end-to-end, rồi optimize | B xong payroll-service; C xong integration-service (requests, notifications, SOAP, bảng tin, nội quy, Wi-Fi) |

---

## 8. Nghiệm thu (Definition of Done)

- Đăng nhập và phiên chạy được.
- `GET /health` pass ở cả 6 điểm (gateway + 5 services).
- `docker-compose up` khởi chạy thành công toàn bộ hệ thống.
- Web Portal và App Mobile đăng nhập được, gọi API thật pass.
- `flutter analyze` (0 errors/warnings) và `flutter test` pass.
- Luồng end-to-end (chấm công → sinh phiếu lương → chi lương REST/SOAP) pass.

### Checklist trước khi mở PR
- [ ] Đúng cấu trúc thư mục service (mục 2.1).
- [ ] Response đúng envelope `{data}` hoặc `{error: {code, message}}`.
- [ ] Có `GET /health` đúng định dạng.
- [ ] Có `.env.example` và `Dockerfile`.
- [ ] Gọi liên service qua HTTP, timeout tối đa 5000ms, không import chéo mã nguồn.
- [ ] Nhánh đặt tên `feat/<service>-<tên>`, PR về `dev`.
- [ ] Mobile không dùng `withOpacity`, dùng `AppColors`, `go_router`, Public Sans.
- [ ] Không sửa file thuộc service của người khác.
- [ ] Cập nhật tiến độ vào file `Work_flow` của mình trước khi mở PR.

---

## 9. Điểm chưa quy định

Các mục sau không có trong tài liệu phân công gốc:

- **Cơ sở dữ liệu và ORM:** DB dùng **PostgreSQL (Supabase) + Prisma**, lớp lưu trữ đặt trong `src/infrastructure`.
- **API versioning `/api/v1/`:** Tech.md §4.6 yêu cầu versioning; cấu hình định tuyến tập trung tại gateway. **Phụ trách: A**.
- **Ma trận phân quyền chi tiết cho từng endpoint:** **Phụ trách: A** chốt cùng nhóm tại Task 5.
- **Thẩm quyền duyệt yêu cầu nội bộ:** `manager` duyệt đơn chi nhánh, `admin` duyệt đơn toàn hệ thống. **Phụ trách: A** chốt.

---

## 10. Quy tắc làm việc cho agent

1. Đọc mục 1 trước. Chỉ sửa trong phạm vi của A.
2. Không tự bịa endpoint, tên trường hay hành vi. Bám đúng schema SSOT ở mục 6.
3. Không import chéo mã nguồn giữa các service. Mọi giao tiếp qua HTTP, timeout tối đa 5000ms.
4. Không commit thẳng vào `dev` hoặc `main`. Mỗi thay đổi đi qua nhánh `feat/...` và PR về `dev`.
5. Sau mỗi thay đổi ở mobile, chạy `flutter analyze` và `flutter test`. Sau mỗi thay đổi ở backend, kiểm tra `GET /health` và chạy test của service.
6. Khi báo kết quả, nói rõ đã chạy lệnh nào và kết quả ra sao. Không báo "pass" khi chưa chạy.
7. **Luật cập nhật tiến độ (bắt buộc):** sau khi hoàn thành mỗi task và trước khi nhờ review/merge PR, phải cập nhật file `Work_flow` của mình — đánh dấu `[x]` các việc đã xong, ghi rõ nhánh/PR liên quan.
