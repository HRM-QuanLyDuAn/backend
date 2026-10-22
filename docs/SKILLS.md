# SKILLS.md — Kỹ Năng Thiết Kế Và Viết Code Chuẩn HRM Enterprise

> File này dạy cách thiết kế giao diện và cách viết code sao cho đúng chuẩn dự án.
> Toàn bộ nội dung viết bằng tiếng Việt.
> Đây là tài liệu thực hành đi kèm `docs/TECHS.md`, `docs/RULES.md` và `docs/AGENTS.md`.

---

## 1. Màu Chủ Đạo Và Hệ Nhận Diện Thương Hiệu

### 1.1. Màu chuẩn duy nhất

- Màu chính: `#8E1B2F` (đỏ đô / Deep Burgundy).
- Dùng cho: AppBar, nút chính, tiêu đề nhấn mạnh, trạng thái đang hoạt động, logo và điểm nhấn thương hiệu.
- Màu nền: trắng hoặc xám rất nhạt. Chữ chính: đen / xám đậm. Màu báo lỗi, cảnh báo, thành công dùng đúng thang Material (đỏ, cam, xanh lá).

### 1.2. Cách dùng màu trên Web (Next.js + Tailwind v4)

```tsx
// ĐÚNG — dùng mã màu thương hiệu tập trung
<button className="bg-[#8E1B2F] text-white hover:bg-[#7A1628]">
  Chốt phiếu lương
</button>

// SAI — dùng màu xanh/blue mặc định của Tailwind
<button className="bg-blue-600 text-white">Chốt phiếu lương</button>
```

Nên khai báo biến CSS hoặc token Tailwind dùng chung cho `#8E1B2F` để đổi một chỗ là đổi toàn hệ thống.

### 1.3. Cách dùng màu trên Mobile (Flutter)

```dart
// ĐÚNG — luôn tham chiếu AppColors
AppBar(backgroundColor: AppColors.primary);
Text('Xin chào', style: AppTypography.titleMedium);

// SAI — hardcode mã hex trong widget
AppBar(backgroundColor: Color(0xFF8E1B2F));
```

- Alpha (độ trong suốt của màu): bắt buộc dùng `.withValues(alpha: ...)`, cấm dùng `.withOpacity()`.

```dart
// ĐÚNG
Container(color: AppColors.primary.withValues(alpha: 0.12));

// SAI
Container(color: AppColors.primary.withOpacity(0.12));
```

### 1.4. Chữ và biểu tượng

- Mobile dùng font Public Sans qua `AppTypography`, không set font lẻ tẻ từng widget.
- Web dùng Font Awesome cho icon, giữ kích thước và độ dày icon nhất quán.
- Mọi nhãn hiển thị cho người dùng cuối viết tiếng Việt có dấu, ví dụ: "Chấm công", "Phiếu lương", "Duyệt đơn", "Số dư không đủ", "Thao tác thành công".

---

## 2. Kỹ Năng Viết Code Backend (Node.js + Express + Flat 3-Tier Mẫu A)

### 2.1. Nguyên tắc thiết kế (Route -> Controller -> Service -> Prisma)

1. Controller thật mỏng: chỉ trích xuất `req.params`, `req.query`, `req.body`, gọi Service rồi trả envelope.
2. Nghiệp vụ nằm trong `src/services/*.js` và gọi trực tiếp Prisma. Cấm viết nghiệp vụ trong controller.
3. Cấm tầng `repositories` riêng và cấm `domain/entities/` map 1-1 với Prisma. Truy xuất dữ liệu chỉ qua Prisma trong Service. Cấm viết SQL trực tiếp trong controller.
4. `src/utils/errors.js` chứa lớp lỗi nghiệp vụ; `src/utils/` chứa logger, jwt, constants. Không import Express hay HTTP client vào `utils/errors.js`.
5. Mọi đầu vào đi qua `src/validators/` (Joi/Zod); mọi lỗi đi qua `src/middlewares/errorHandler.js` để trả đúng `{error: {code, message}}`.

### 2.2. Mẫu controller đúng chuẩn

```javascript
// ĐÚNG — controller chỉ điều phối qua Service (Flat 3-Tier)
async function createPayout(req, res, next) {
  try {
    const result = await PayoutService.create(req.body);
    return res.status(201).json({ data: result, message: "Thao tác thành công" });
  } catch (error) {
    return next(error);
  }
}

// SAI — nhét nghiệp vụ và Prisma/SQL vào controller
async function createPayout(req, res) {
  if (req.body.totalAmount > balance) { /* ... */ }
  const row = await prisma.payout.create({ data: req.body });
  return res.json(row);
}
```

### 2.3. Mẫu Service và idempotency (gộp Use Case + Repository)

```javascript
// src/services/PayoutService.js — gọi trực tiếp Prisma, không qua Repository
async function create(payload) {
  const existed = await prisma.payout.findUnique({ where: { idempotencyKey: payload.idempotencyKey } });
  if (existed) return { ...existed, deduped: true };
  // kiểm tra số dư, sinh id TXN-*, bankReference BANK-*, lưu bản ghi mới
}
```

Hết số dư phải ném ngoại lệ ánh xạ thành HTTP `422` với mã `INSUFFICIENT_FUNDS` và thông điệp tiếng Việt.

### 2.4. Mẫu client gọi liên service

```javascript
const axios = require("axios");

async function getAttendance(employeeId, month) {
  const res = await axios.get(`http://localhost:4003/api/attendance`, {
    params: { employeeId, month },
    timeout: 5000,
  });
  return res.data.data;
}
```

Luôn đặt `timeout: 5000`, đặt adapter trong `src/clients/`, không import chéo mã nguồn service khác.

### 2.5. Kỹ năng làm việc với 5 database riêng (đã chốt)

1. Mỗi service chỉ truy cập 1 DB của mình: identity → `hrm_identity`, organization → `hrm_organization`, work → `hrm_work`, payroll → `hrm_payroll`, integration → `hrm_integration`. Gateway không có DB.
2. Mỗi service có `prisma/schema.prisma`, migration, seed và `DATABASE_URL` riêng. Cấm trỏ 2 service về cùng 1 DB.
3. Cấm join xuyên cơ sở dữ liệu và FK xuyên cơ sở dữ liệu. Tham chiếu chéo chỉ lưu chuỗi (`employeeId`, `branchSlug`, `shiftId`):

```javascript
// ĐÚNG — payroll lưu employeeId dạng chuỗi, cần chi tiết thì gọi HTTP
const employee = await orgClient.getEmployeeById(payslip.employeeId);
const penalties = await workClient.getAttendance({ employeeId, month });

// SAI — join trực tiếp bảng service khác
// SELECT * FROM payslips JOIN work.attendances ...
// SELECT * FROM payouts JOIN organization.employees ...
```

4. Ba client bắt buộc phải viết: `payroll→workClient.getAttendance`, `payroll→orgClient.getEmployee`, `integration→payrollClient.createPayout` (+ `integration→workClient.updateShift` khi duyệt `shift_swap` / `work_supplement`).

---

## 3. Kỹ Năng Viết Code Frontend (Next.js 16 App Router)

### 3.1. Tổ chức route và component

1. Route đặt dưới `src/app/`, kèm đủ `loading.tsx`, `error.tsx`, `not-found.tsx` khi cần.
2. Logic theo miền đặt dưới `src/features/<ten-mien>/`, không lồng sâu `hr/...`.
3. Component dùng chung đặt dưới `src/components/ui/`, bố cục đặt dưới `src/components/layout/`.
4. Component có state, hook hoặc sự kiện trình duyệt phải có `"use client"` ở dòng đầu.

```tsx
"use client";

import { useState } from "react";

export function CheckoutButton() {
  const [loading, setLoading] = useState(false);
  // ...
}
```

### 3.2. Xác thực, phân quyền và định dạng

```tsx
// Menu theo vai trò thật từ identity-service, không hardcode
import { buildMenuItems } from "@/lib/permissions";
const menu = buildMenuItems(role);

// Tiền tệ luôn dùng hàm chuẩn
import { formatVND } from "@/lib/utils";
<p>{formatVND(payslip.netSalary)}</p>
```

- Bảo vệ route bằng `src/middleware.ts` và cookie `hrm-session`.
- Không đưa `role` hay `branchSlug` lên URL.
- Kiểm tra bắt buộc: `npx tsc --noEmit` 0 lỗi, `npm run build` thành công.

---

## 4. Kỹ Năng Viết Code Mobile (Flutter + go_router + Material 3)

### 4.1. Điều hướng và cấu trúc tính năng

```dart
// ĐÚNG — đi qua go_router tập trung
context.go('/main');
context.pushReplacement('/login');

// SAI — gọi Navigator trực tiếp
Navigator.of(context).push(MaterialPageRoute(builder: (_) => const HomePage()));
```

- Mọi route khai báo duy nhất trong `core/router/router.dart`.
- Mỗi tính năng đặt dưới `features/<ten_tinh_nang>/data` và `features/<ten_tinh_nang>/presentation`.
- Model trong `core/models` phải khớp schema SSOT với backend và web.

### 4.2. Gọi API và fallback

1. Trỏ base URL về Gateway (cổng 4000), tự phân biệt iOS `localhost` và Android `10.0.2.2`.
2. Repository viết sẵn cho cả API thật và mock dự phòng khi service khác chưa xong.
3. Màn hình lương, thông báo, đơn từ, ca, chấm công phải tích hợp đúng endpoint đã chốt, đúng envelope `{data}` / `{error}` và đúng định dạng ngày.
4. Sau mỗi thay đổi mobile phải chạy `flutter analyze` và `flutter test`.

---

## 5. Kỹ Năng Đặt Tên, Envelope Và Định Dạng Chung

1. Tên file backend theo Flat 3-Tier (Mẫu A): `XxxService.js` trong `src/services/`, `xxx.js` cho controller/route/middleware/validator rõ nghĩa. Cấm `CreateXxxUseCase.js`, `XxxRepository.js`, `src/api/`, `src/domain/`, `src/infrastructure/`.
2. Tên route REST dùng danh từ số nhiều: `/api/employees`, `/api/shifts`, `/api/payroll/payouts`, `/api/requests`, `/api/news`.
3. Thành công trả `{ "data": ..., "message": "Thao tác thành công" }`; thất bại trả `{ "error": { "code": "...", "message": "...", "details": null } }`.
4. Ngày tháng: `date`/`joinDate` dùng `DD-MM-YYYY`; `Payslip.month` dùng `MM-YYYY`; query attendance dùng `month=YYYY-MM`.
5. Mã giao dịch: `id` dạng `TXN-xxxxxx`, `bankReference` dạng `BANK-xxxxxxxx`; trùng `idempotencyKey` trả kèm `deduped: true`.
6. Comment và log kỹ thuật có thể tiếng Anh, nhưng mọi chuỗi hiển thị cho người dùng phải tiếng Việt.

## 6. Checklist Tự Đánh Giá Kỹ Năng Trước Khi Gửi Code

- [ ] Màu chính đúng `#8E1B2F`, không hardcode hex lẻ, mobile không dùng `withOpacity`.
- [ ] Chữ Public Sans (mobile) và icon Font Awesome (web) nhất quán.
- [ ] Toàn bộ UI tiếng Việt, tiền tệ qua `formatVND`.
- [ ] Controller mỏng, nghiệp vụ nằm trong `src/services/` gọi trực tiếp Prisma, có validator và error handler.
- [ ] Gọi liên service qua client adapter với timeout 5000ms.
- [ ] Route, model và định dạng ngày khớp SSOT.
- [ ] Đã chạy đủ kiểm thử bắt buộc của tầng mình sửa.
