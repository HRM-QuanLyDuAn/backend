# Work_flow_QLDAPM_C.md — Thành viên C — Môn Quản lý dự án phần mềm

> File này dành cho AI agent. Đọc hết trước khi sửa code hoặc tạo file. Nguồn: `QLDAPM_PhanCong.docx`.
> Mục có nhãn **(suy ra)** hoặc **(chưa quy định)** không có trong tài liệu phân công gốc. Không coi đó là yêu cầu chắc chắn; hỏi lại khi cần.
> Không đổi cổng, envelope, tên trường hay cấu trúc thư mục chung.

---

## 0. Tóm tắt nhanh

| Mục | Nội dung |
|---|---|
| Môn | Quản lý dự án phần mềm (QLDAPM) |
| Thành viên nhóm | A (nhóm trưởng), B, C |
| Phần C sở hữu | `backend/work-service` (4003) + `backend/integration-service` (4005) |
| Chức năng chính | Ca làm việc, chấm công, tác vụ; SOAP ngân hàng, yêu cầu nội bộ, thông báo, bảng tin, nội quy, Wi-Fi |

---

## 1. Phạm vi: được sửa và không được sửa

### Được sửa (thuộc C)
- `backend/work-service/` (cổng 4003): Ca làm việc, chấm công, tác vụ
- `backend/integration-service/` (cổng 4005): SOAP ngân hàng, yêu cầu nội bộ, thông báo, bảng tin, nội quy, Wi-Fi

### Không sửa (thuộc thành viên khác)
| Thư mục | Cổng | Chủ sở hữu | Chức năng chính |
|---|---|---|---|
| `backend/api-gateway/`, `backend/identity-service/`, `mobile/`, `frontend/`, `docker-compose.yml` | 4000, 4001 | A | Gateway, xác thực, mobile, web portal, compose |
| `backend/organization-service/` | 4002 | B | Chi nhánh, phòng ban, nhân sự |
| `backend/payroll-service/` | 4004 | B | Tài khoản công ty, lương, lệnh chi, phiếu lương |

Nếu cần thay đổi ở phần của người khác (thiếu endpoint, sai schema, sai envelope), không tự sửa. Ghi lại vấn đề, nêu rõ service, endpoint, kỳ vọng và thực tế, rồi báo cho C để trao đổi với chủ phần đó.

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
- Tạo nhánh theo mẫu `feat/<service>-<tên>` (ví dụ `feat/work-attendance`, `feat/integration-soap`).
- Xong thì tạo PR về `dev`.
- **Không commit thẳng vào `dev` hoặc `main`.**
- Mỗi PR nên gọn theo một service hoặc một chức năng.

---

## 4. Danh sách việc của C

### Task 1 — work-service (cổng 4003)
- [ ] **Shifts (lịch ca / phân ca):**
  - `GET /api/shifts?branchSlug=&date=YYYY-MM-DD&employeeId=` — danh sách ca làm.
  - `POST /api/shifts` — tạo ca mới (admin/manager).
  - `PUT /api/shifts/:id` — cập nhật ca (admin/manager).
  - `DELETE /api/shifts/:id` — xóa ca (admin/manager).
  - `POST /api/shifts/:id/assign` — phân công ca cho nhân viên (`shift_assignment`).
  - `POST /api/shifts/register` — nhân viên tự đăng ký ca (`schedule_registration`).
  - `GET /api/shifts/registrations?branchSlug=&week=` — danh sách đăng ký ca của nhân viên (phục vụ bảng "Quản lý đăng ký ca" trên web) **(suy ra)**.
- [ ] **Attendance (chấm công):**
  - `POST /api/attendance/checkin` — check-in vào ca.
  - `POST /api/attendance/checkout` — check-out ra ca, tự động tính phạt vi phạm.
  - `GET /api/attendance?employeeId=&month=YYYY-MM` — lịch sử chấm công cá nhân.
  - `GET /api/attendance?branchSlug=&date=YYYY-MM-DD` — giám sát chấm công nhân sự theo ngày (`staff_monitor`).
  - `GET /api/attendance/config` — lấy cấu hình phạt vi phạm.
  - `PUT /api/attendance/config` — cập nhật cấu hình phạt (admin).
- [ ] **Tasks (tác vụ công việc):**
  - `GET /api/tasks?branchSlug=&assignedTo=&status=` — danh sách tác vụ.
  - `POST /api/tasks`, `PUT /api/tasks/:id`, `DELETE /api/tasks/:id` — CRUD tác vụ.
- [ ] `GET /health`.

### Task 2 — integration-service (cổng 4005)
- [ ] **SOAP Bank Gateway:**
  - `GET /soap/payroll?wsdl` — expose WSDL hợp lệ.
  - `POST /soap/payroll` — nhận `PayoutRequest`, gọi sang REST payout của B (`payroll-service`), trả `PayoutResponse`.
  - Lỗi hết số dư (422) từ B chuyển thành `soap:Fault` với `faultcode = soap:Client` và `faultstring` mô tả.
- [ ] **Requests (yêu cầu nội bộ):**
  - `GET /api/requests?employeeId=&branchSlug=&status=&type=` — danh sách yêu cầu.
  - `GET /api/requests/:id` — chi tiết một yêu cầu (`request_detail`).
  - `POST /api/requests` — tạo yêu cầu mới. `type` hỗ trợ: `leave`, `overtime`, `advance`, `shift_swap`, `work_supplement`, `other`.
  - `PUT /api/requests/:id/approve` — duyệt yêu cầu (tự sinh thông báo kết quả).
  - `PUT /api/requests/:id/reject` — từ chối yêu cầu (tự sinh thông báo).
  - `DELETE /api/requests/:id` — xóa yêu cầu khi đang `pending`.
  - **Lưu ý `shift_swap`:** payload kèm `sourceShiftId` và `targetShiftId`. Khi duyệt, cập nhật phân công ca ở work-service.
  - **Lưu ý `work_supplement`:** khi duyệt, cập nhật bản ghi công tương ứng ở attendance.
- [ ] **Notifications (thông báo):**
  - `GET /api/notifications?employeeId=&branchSlug=` — gồm cả broadcast (`targetEmployeeId = null`).
  - `POST /api/notifications` — gửi thông báo mới.
  - `PUT /api/notifications/:id/read` — đánh dấu đã đọc.
  - `DELETE /api/notifications/:id`.
- [ ] **Bảng tin (News/Announcements):**
  - `GET /api/news`, `GET /api/news/:id`.
  - `POST /api/news`, `PUT /api/news/:id`, `DELETE /api/news/:id` (chỉ `admin`/`manager`).
- [ ] **Nội quy (Regulations):**
  - `GET /api/regulations`, `GET /api/regulations/:id`.
  - `POST /api/regulations`, `PUT /api/regulations/:id`, `DELETE /api/regulations/:id`.
- [ ] **Wi-Fi chấm công:**
  - `GET /api/wifi-configs?branch=`.
  - `POST /api/wifi-configs`, `PUT /api/wifi-configs/:id`, `DELETE /api/wifi-configs/:id`.
- [ ] `GET /health`.

---

## 5. Schema dữ liệu liên quan (phải khớp — SSOT tại `A_Work_Flow.md §6`)

Không tự đổi tên trường. Mọi thay đổi phải cập nhật `A_Work_Flow.md §6` trước.

- **Shift:** `id, employeeId, branch (slug), date (DD-MM-YYYY), template (tên ca), scheduledStart (HH:MM), scheduledEnd (HH:MM), checkIn (HH:MM), checkOut (HH:MM), status (hoàn thành/đang làm/vắng/trễ)`

- **Attendance:** `id, employeeId, shiftId, date (DD-MM-YYYY), checkIn (HH:MM), checkOut (HH:MM), penaltyAmount, penaltyNote, status (present/absent/late/early_leave)`

- **AttendanceConfig:** `latePenaltyAmount (mặc định 20000), earlyLeavePenaltyAmount, gracePeriodMinutes (mặc định 5), autoCloseShift (bool), shiftSwapMode (string)`

- **Task:** `id, title, description, assignedTo (employeeId), branchSlug, dueDate, status (pending/in_progress/done), createdAt`

- **Yêu cầu nội bộ (Request):** `id, type, employeeId, branchSlug, title, content, attachmentUrl, status (pending/approved/rejected), reviewedBy, reviewNote, createdAt, updatedAt`
  > `type` hợp lệ: `leave`, `overtime`, `advance`, `shift_swap`, `work_supplement`, `other`.

- **Thông báo (Notification):** `id, targetEmployeeId (null = toàn hệ thống), branchSlug, title, body, isRead, createdAt`

- **Bảng tin (Announcement/News):** `id, title, summary, content, author, date, tag, tagTone (danger/warning/success/primary/gray), pinned (bool)`

- **Nội quy (Regulation):** `id, code, title, category, summary, content, status (hiệu lực/dự thảo/hết hiệu lực), scope (Toàn công ty hoặc slug chi nhánh), effectiveDate (DD-MM-YYYY), expiryDate, author, createdAt, updatedAt, version, pinned, attachments`

- **Wi-Fi chấm công:** `id, ssid, bssid, branch (slug chi nhánh), status (hoạt động/vô hiệu hóa)`

- **Khuôn SOAP:** `POST /soap/payroll` nhận `PayoutRequest (idempotencyKey, debitAccount, content, totalAmount, beneficiaryCount)`, trả `PayoutResponse (transactionId (TXN-xxxxxx), bankReference (BANK-xxxxxxxx), status)`. Lỗi trả `soap:Fault` với `faultcode = soap:Client`.

Ghi chú định dạng ngày: `date` dùng `DD-MM-YYYY`; query attendance dùng `month=YYYY-MM`.

---

## 6. Phụ thuộc và phối hợp

- Mọi request từ web và mobile đi qua `api-gateway` (4000) của A. Client không gọi thẳng vào service của bạn.
- Đăng nhập và phiên `hrm-session` do `identity-service` (4001) của A xử lý.
- **B (payroll-service, 4004):** B gọi `GET /api/attendance?employeeId=&month=YYYY-MM` của bạn để lấy tổng phạt chấm công khi tính lương. Giữ endpoint này ổn định.
- **B (payroll-service, 4004):** Khi nhận SOAP `POST /soap/payroll`, service của bạn gọi REST payout của B qua HTTP **(suy ra)**, timeout tối đa 5000ms. Chuyển tiếp lỗi 422 thành `soap:Fault`.
- **A:** cần cấu hình route cho shifts, attendance, tasks, requests, notifications, news, regulations, wifi-configs và SOAP trên gateway. Các màn hình mobile và web portal của A gọi trực tiếp các API của bạn.

---

## 7. Mốc kiểm tra

| Mốc | Việc của C |
|---|---|
| 1 | Xong work-service (4003) |
| 2 | Xong integration-service (4005 — SOAP, requests, notifications, bảng tin, nội quy, Wi-Fi) |

---

## 8. Nghiệm thu (Definition of Done)

- Chấm công tính phạt đúng theo cấu hình.
- Quản lý ca kíp, đăng ký ca, phân ca và tác vụ đầy đủ.
- WSDL và SOAP hoạt động ổn định, tạo được lệnh chi qua payroll-service.
- Yêu cầu và thông báo liên động đúng (duyệt/từ chối sinh thông báo).
- CRUD bảng tin, nội quy, Wi-Fi đúng chuẩn envelope.

### Checklist trước khi mở PR
- [ ] Đúng cấu trúc thư mục service (mục 2.1).
- [ ] Response đúng envelope `{data}` hoặc `{error: {code, message}}`.
- [ ] Có `GET /health`.
- [ ] Có `.env.example` và `Dockerfile`.
- [ ] Duyệt/từ chối yêu cầu tự sinh thông báo; chỉ xóa yêu cầu khi `pending`.
- [ ] `GET /soap/payroll?wsdl` trả WSDL hợp lệ; lỗi trả `soap:Fault` với `faultcode = soap:Client`.
- [ ] Tạo/sửa/xóa bảng tin chỉ cho `admin`/`manager`.
- [ ] Gọi liên service qua HTTP, timeout tối đa 5000ms, không import chéo mã nguồn.
- [ ] Nhánh đặt tên `feat/<service>-<tên>`, PR về `dev`.
- [ ] Không sửa file thuộc phần của người khác.

---

## 9. Điểm chưa quy định

Các mục sau không có trong tài liệu phân công gốc:

- **Cơ sở dữ liệu và ORM:** DB dùng **PostgreSQL (Supabase) + Prisma**, lớp lưu trữ đặt trong `src/infrastructure`.
- **Cách service nhận danh tính người dùng:** middleware đọc cookie `hrm-session` hoặc bearer token từ gateway.
- **Luật tính phạt chấm công:** xem mục 5 (`AttendanceConfig`), mặc định phạt đi muộn 20.000đ sau 5 phút ân hạn.

---

## 10. Quy tắc làm việc cho agent

1. Đọc mục 1 trước. Chỉ sửa trong phạm vi của C (`work-service`, `integration-service`).
2. Không tự bịa endpoint, tên trường hay hành vi. Bám đúng schema SSOT ở mục 5.
3. Không commit thẳng vào `dev` hoặc `main`. Mỗi thay đổi đi qua nhánh `feat/...` và PR về `dev`.
4. Không import chéo mã nguồn giữa các service. Muốn dùng dữ liệu của service khác thì gọi qua HTTP.
5. Sau mỗi thay đổi, kiểm tra `GET /health` và chạy test của service (`tests/`).
6. Khi báo kết quả, nói rõ đã chạy lệnh nào và kết quả ra sao. Không báo "pass" khi chưa chạy.
7. Ưu tiên theo thứ tự: work-service (mốc 1) trước, rồi integration-service (mốc 2).
