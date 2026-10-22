import type { NewsItem } from "./types";

export const initialNews: NewsItem[] = [
  {
    id: "news-1",
    title: "Thông báo lịch nghỉ lễ Quốc khánh 02/09/2026",
    summary: "Toàn thể cán bộ nhân viên được nghỉ lễ từ ngày 01/09 đến hết ngày 03/09/2026. Các ca trực vận hành hưởng lương x300%.",
    content: "Ban Giám đốc thông báo lịch nghỉ lễ Quốc khánh 02/09/2026:\n\n1. Toàn thể CBNV được nghỉ từ 01/09 đến hết 03/09/2026.\n2. Nhân sự trực ca sẽ hưởng chế độ lương x300% theo quy định.\n3. Quản lý chi nhánh gửi danh sách nhân sự trực trước 25/08.",
    author: "Ban Giám Đốc",
    date: "12/08/2026",
    tag: "Nghỉ lễ",
    tagTone: "danger",
    pinned: true,
  },
  {
    id: "news-2",
    title: "Cập nhật chuẩn Wi-Fi chấm công mới tại toàn bộ chi nhánh",
    summary: "Hệ thống đã nâng cấp mạng Wi-Fi và cập nhật danh sách SSID xác thực chấm công định danh cho từng chi nhánh.",
    content: "Nhằm nâng cao tính ổn định khi nhân viên chấm công vào/ra ca trên ứng dụng di động:\n\n• Mạng Wi-Fi chi nhánh chuẩn hóa dạng HRM_[MÃ_CHI_NHÁNH]_OFFICE.\n• Trường hợp mất mạng hoặc sự cố, nhân viên gửi đơn Bổ sung chấm công.",
    author: "Bộ phận IT & Vận hành",
    date: "10/08/2026",
    tag: "Vận hành",
    tagTone: "primary",
  },
  {
    id: "news-3",
    title: "Vinh danh Nhân viên xuất sắc tháng 07/2026 - Nguyễn Thu Hà",
    summary: "Chúc mừng bạn Nguyễn Thu Hà (Chi nhánh HN-1) đạt thành tích Best Employee tháng 07 với 100% chuyên cần và vượt KPIs.",
    content: "Ban Giám đốc xin nhiệt liệt biểu dương bạn Nguyễn Thu Hà đã hoàn thành xuất sắc nhiệm vụ trong tháng 07/2026. Phần thưởng 2.000.000 đ đã được cộng trực tiếp vào phiếu lương.",
    author: "Phòng Nhân sự",
    date: "05/08/2026",
    tag: "Khen thưởng",
    tagTone: "warning",
  },
];
