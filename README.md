# HRM Enterprise — Quản trị Nhân sự & Vận hành Ca kíp (On-Premises SOA)

Hệ thống quản trị nhân sự, phân ca, chấm công Wi-Fi và chi lương nội bộ cho doanh nghiệp chuỗi.
Kiến trúc On-Premises SOA: Web Portal (Next.js) + Mobile App (Flutter) + Core Server (Express).

## Tài khoản thử nghiệm

| Vai trò | Email | Mật khẩu | Dùng ở |
|---|---|---|---|
| Admin — Trần Minh Tuấn | `admin@company.com` | `123456` | Web & Mobile |
| Manager — Vũ Thành Công | `manager@company.com` | `123456` | Web & Mobile |
| Staff — Nguyễn Thu Hà | `nhanvien@company.com` | `123456` | Mobile |

Chi nhánh: HN-1 Hoàn Kiếm, HN-2 Cầu Giấy, DN-1 Đà Nẵng.

## Cấu trúc

```text
hrm-enterprise/
├── README.md
├── docs/        # TECHS, RULES, AGENTS, SKILLS + Work_Flow từng thành viên
├── frontend/   # Web Portal quản trị (Next.js 16 App Router + Tailwind v4)
├── mobile/     # App nhân viên & quản lý (Flutter 3.x, Material 3)
└── backend/    # Core Server nội bộ (Express: REST + SOAP chi lương)
```

## Chạy dự án

```bash
# 0. Hạ tầng DB local — 5 Postgres RIÊNG BIỆT (mỗi service 1 server/node/port riêng)
docker compose up -d
#   hrm-db-identity:5433 · hrm-db-organization:5434 · hrm-db-work:5435
#   hrm-db-payroll:5436 · hrm-db-integration:5437

# 1. Core Server — chạy từng service (4000..4005). Copy .env.example -> .env trước,
#    rồi đồng bộ schema vào DB của chính service đó:
cd backend/api-gateway && npm install && npm run dev            # 4000 (không DB)
cd backend/identity-service && npm install && npx prisma db push && npm run dev    # 4001
#   organization (4002), work (4003), payroll (4004), integration (4005) làm tương tự

# 2. Web Portal (http://localhost:3000)
cd frontend && npm install && npm run dev

# 3. Mobile App
cd mobile && flutter pub get && flutter run
```

## API Backend

- `GET /health` — kiểm tra server
- `GET /api/branches`, `GET /api/employees` — danh mục chi nhánh, nhân sự
- `GET /api/payroll/bank-accounts`, `GET/POST /api/payroll/payouts` — tài khoản DN, tạo lệnh chi (chống trùng bằng `idempotencyKey`)
- `GET /soap/payroll?wsdl` — lấy WSDL cho ngân hàng
- `POST /soap/payroll` — ngân hàng gửi `PayoutRequest`, nhận `PayoutResponse` (XML)

## Nghiệp vụ chi lương

Bảng lương chốt → tạo lệnh chi (REST/SOAP kèm `idempotencyKey`) → trích nợ TK công ty → ghi có TK nhân viên → sinh mã đối soát `BANK-*`. Không bắn push mobile khi chuyển tiền (nhân viên tự tra cứu qua SMS/App ngân hàng); thông báo chung do Admin/Manager đăng ở Bảng tin.
