# AGENTS.md — Hướng Dẫn Làm Việc Cho AI Agent Trong Monorepo HRM

> File này nằm trong `docs/` và dành riêng cho AI Agent (Claude, GPT, Gemini, Cursor, Copilot, Antigravity) cùng lập trình viên.
> Toàn bộ nội dung viết bằng tiếng Việt.
> Chi tiết công nghệ xem `docs/TECHS.md`; quy tắc bất biến xem `docs/RULES.md`; kỹ năng viết code xem `docs/SKILLS.md`.

---

## 1. Nguyên Tắc Đọc Tài Liệu

1. Trước khi sửa code hoặc tạo file, phải đọc hết file này cộng với `docs/TECHS.md`, `docs/RULES.md` và file `*_Work_Flow.md` của đúng thành viên mình phụ trách.
2. Không tự bịa endpoint, tên trường hay hành vi nghiệp vụ. Nội dung nào không có trong tài liệu gốc thì gắn nhãn **(suy ra)** và hỏi lại nhóm trưởng.
3. Không được đổi cổng, envelope, tên trường hay cấu trúc thư mục chung khi chưa được chốt.
4. Thứ tự đọc khuyến nghị: `AGENTS.md` (file này) → `RULES.md` → `TECHS.md` → `SKILLS.md` → file Work_Flow của mình.

## 2. Phạm Vi Sở Hữu Và Ranh Giới Thư Mục

| Thành viên | Được sửa | Database sở hữu (đã chốt 5 DB) | Không được sửa |
|---|---|---|---|
| A (nhóm trưởng) | `backend/api-gateway/`, `backend/identity-service/`, `mobile/`, `frontend/`, `docker-compose.yml` gốc | `hrm_identity` (4001); gateway không DB | Service và DB của B, D, E |
| B | `backend/organization-service/` (4002), `backend/work-service/` (4003) | `hrm_organization`, `hrm_work` | Gateway, identity, mobile, payroll, integration và DB của họ |
| D | `backend/payroll-service/` (4004) | `hrm_payroll` | Mọi service/DB còn lại, mobile, web |
| E | `backend/integration-service/` (4005) | `hrm_integration` | Mọi service/DB còn lại, mobile, web |

Quy tắc ranh giới:

1. Agent được giao service nào thì chỉ tạo/sửa file trong `backend/<ten-service>/` đó **và chỉ truy cập database của chính service đó**.
2. Cấm đọc/ghi trực tiếp DB của service khác, cấm join xuyên cơ sở dữ liệu, cấm FK xuyên cơ sở dữ liệu. Cần dữ liệu chéo thì gọi HTTP qua `src/clients/` (timeout 5000ms).
2. Không sửa service của người khác, `frontend/` hay `mobile/` trừ khi đề bài ghi rõ.
3. Khi cần thay đổi ở phần của người khác (thiếu endpoint, sai schema, sai envelope), không tự sửa. Ghi lại service, endpoint, kỳ vọng và thực tế rồi báo cho chủ service hoặc nhóm trưởng.

## 3. Quy Trình Git Cho Agent

1. Không bao giờ commit trực tiếp vào `main` hoặc `dev`.
2. Luôn tách nhánh từ `dev`: `feat/<ten-service>-<ten-viec>` hoặc `fix/<ten-service>-<ten-loi>`.
3. Mỗi pull request gọn trong một service hoặc một chức năng, đích đến là `dev`.
4. Trước khi nhờ review phải chạy `git pull origin dev`, giải quyết xung đột và kiểm thử lại.
5. Khi báo kết quả phải nêu rõ đã chạy lệnh nào và kết quả ra sao. Cấm báo "pass" khi chưa chạy lệnh thật.

Ví dụ đặt tên nhánh đúng:

- `feat/api-gateway-proxy`
- `feat/identity-auth`
- `feat/organization-employees`
- `feat/work-attendance`
- `feat/payroll-payouts`
- `feat/integration-soap`

## 4. Quy Trình Bàn Giao Tài Liệu (Bắt Buộc)

`docs/` là kênh thông tin chính của cả nhóm. Agent phải giữ tài liệu luôn đồng bộ với code.

### 4.1. Khi nào phải cập nhật tài liệu

1. **Tạo service mới**: bổ sung tên service, thư mục, cổng và trách nhiệm vào bảng đăng ký service trong `docs/TECHS.md`.
2. **Đổi hợp đồng dùng chung**: đổi trường của Employee, Branch, Shift, BankAccount, Payslip, Request thì phải cập nhật schema SSOT và ghi rõ lý do trong pull request.
3. **Hoàn thành task**: cập nhật checkbox `[x]`, nhánh và pull request liên quan trong file `Work_Flow` của mình trước khi nhờ review hoặc merge.

### 4.2. Khi nào không được ghi vào tài liệu kiến trúc

1. Không ghi nhật ký cá nhân, ghi chú nháp, log debug tạm thời hay danh sách việc vặt vào `docs/TECHS.md`, `docs/RULES.md`, `docs/AGENTS.md`, `docs/SKILLS.md`.
2. Bốn file trên chỉ dành cho kiến trúc lâu dài và ràng buộc chung, không phải sổ tay tạm thời.

## 5. Checklist Nghiệm Thu Trước Khi Mở Pull Request

Agent phải tự kiểm tra toàn bộ mục sau và tick đầy đủ trước khi nhờ review:

- [ ] Đúng cấu trúc Flat 3-Tier (Mẫu A) theo `docs/TECHS.md` §3.1 (cấm `src/api/`, `src/domain/`, `src/infrastructure/`).
- [ ] Response đúng envelope `{data}` hoặc `{error: {code, message}}` theo `docs/RULES.md` (trừ tuyến SOAP trả XML).
- [ ] Có `GET /health` đúng khuôn.
- [ ] Có `.env.example` (mặc định trỏ Postgres local của chính service; Supabase để dạng comment, mỗi service 1 link riêng).
- [ ] Gọi liên service qua HTTP, timeout tối đa 5000ms, không import chéo mã nguồn, không join xuyên cơ sở dữ liệu.
- [ ] Đúng database của service mình (`hrm_identity` / `hrm_organization` / `hrm_work` / `hrm_payroll` / `hrm_integration`), có migration và `DATABASE_URL` riêng.
- [ ] Nhánh đặt tên `feat/...` hoặc `fix/...`, đích pull request là `dev`.
- [ ] Không sửa file thuộc phần của thành viên khác.
- [ ] Mobile (nếu đụng tới): dùng `AppColors`, `go_router`, font Public Sans, không dùng `withOpacity`.
- [ ] Đã chạy kiểm thử bắt buộc của tầng mình sửa (backend: test service + `GET /health`; web: `npx tsc --noEmit`; mobile: `flutter analyze` và `flutter test`).
- [ ] Đã cập nhật tiến độ vào file `Work_Flow` của mình.

## 6. Quy Tắc Ứng Xử Khi Gặp Điểm Chưa Rõ

1. Các mục gắn nhãn **(suy ra)** hoặc **(chưa quy định)** trong file Work_Flow không phải yêu cầu chốt. Không tự quyết rồi coi như đã xong.
2. Những điểm hay thiếu gồm: body chi tiết của login/me, mật khẩu seed, đường dẫn shifts/attendance/tasks/requests/notifications, body của `/health`, phân phiên bản `/api/v1/`, ma trận phân quyền chi tiết. Riêng CSDL và ORM đã chốt: 5 Postgres riêng + Prisma mỗi service 1 schema (xem `docs/TECHS.md` §6.2, `docs/RULES.md` §6).
3. Cách xử lý: nêu giả định trong pull request, hỏi nhóm trưởng, chờ chốt rồi mới code tiếp.
4. Ưu tiên làm theo thứ tự: hạ tầng dùng chung (gateway + identity) trước, rồi tới service nghiệp vụ, rồi tới kết nối mobile/web, cuối cùng là demo idempotent và SOAP end-to-end rồi mới tối ưu.
