"use client";

import { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faCheck, faChevronDown, faChevronLeft, faChevronRight, faChevronUp, faCircleExclamation, faClock, faCloudSun, faFilter, faMagnifyingGlass, faMoon, faPhone, faStore, faSun, faUserCheck, faUserPlus, faUsers } from "@fortawesome/free-solid-svg-icons";
import Badge from "@/components/ui/Badge";
import StaffShiftDetailModal from "./modals/ShiftDetail";
import type { ShiftTemplate, WorkShift } from "../types";

export interface StaffInShift {
  id: string;
  name: string;
  role: string;
  branch: string;
  avatarLetter: string;
  phone: string;
  checkInStatus: "checked_in" | "in_progress" | "not_yet";
  checkInTime?: string;
  checkOutTime?: string;
}

export interface GeneralShiftItem {
  id: string;
  templateId?: string;
  shiftName: string;
  timeRange: string;
  iconType: "morning" | "afternoon" | "evening";
  status: "completed" | "active" | "upcoming";
  staffList: StaffInShift[];
}

interface Props {
  workShifts: WorkShift[];
  templates: ShiftTemplate[];
  defaultBranch?: string;
  isManager?: boolean;
  managerBranch?: string;
  onOpenAssignModal?: (templateId: string, date: string, branch: string) => void;
}

// Danh sách nhân sự mẫu phong phú đồng bộ với mobile & portal
const mockStaffPool: Record<string, StaffInShift[]> = {
  "T2": [
    { id: "s1", name: "Trần Minh Tuấn", role: "Quản lý / Admin", branch: "HN-1", avatarLetter: "T", phone: "0901 111 222", checkInStatus: "checked_in", checkInTime: "06:50", checkOutTime: "14:05" },
    { id: "s2", name: "Nguyễn Thu Hà", role: "Phục vụ bàn", branch: "HN-1", avatarLetter: "H", phone: "0902 333 444", checkInStatus: "checked_in", checkInTime: "06:55", checkOutTime: "14:02" },
    { id: "s3", name: "Phạm Quỳnh Trang", role: "Thu ngân", branch: "HN-1", avatarLetter: "T", phone: "0903 555 666", checkInStatus: "checked_in", checkInTime: "07:05", checkOutTime: "14:00" },
    { id: "s4", name: "Hoàng Minh Đức", role: "Pha chế", branch: "HN-1", avatarLetter: "Đ", phone: "0904 777 888", checkInStatus: "in_progress", checkInTime: "13:50" },
    { id: "s5", name: "Vũ Thành Công", role: "Phục vụ bàn", branch: "HN-1", avatarLetter: "C", phone: "0905 123 456", checkInStatus: "in_progress", checkInTime: "13:58" },
    { id: "s6", name: "Lê Văn An", role: "Quản lý Chi nhánh", branch: "HN-2", avatarLetter: "A", phone: "0987 654 321", checkInStatus: "not_yet" },
    { id: "s7", name: "Trần Bích Ngọc", role: "Lễ tân", branch: "ĐN-1", avatarLetter: "N", phone: "0977 889 900", checkInStatus: "not_yet" },
  ],
  "T3": [
    { id: "s8", name: "Nguyễn Thu Hà", role: "Phục vụ bàn", branch: "HN-1", avatarLetter: "H", phone: "0902 333 444", checkInStatus: "checked_in", checkInTime: "06:52", checkOutTime: "14:03" },
    { id: "s9", name: "Hoàng Minh Đức", role: "Barista", branch: "HN-1", avatarLetter: "Đ", phone: "0904 777 888", checkInStatus: "checked_in", checkInTime: "06:58", checkOutTime: "14:00" },
    { id: "s10", name: "Vũ Thị Mai", role: "Thu ngân", branch: "HN-1", avatarLetter: "M", phone: "0909 567 890", checkInStatus: "in_progress", checkInTime: "13:55" },
    { id: "s11", name: "Đặng Văn E", role: "Phục vụ bàn", branch: "HN-1", avatarLetter: "E", phone: "0906 234 567", checkInStatus: "not_yet" },
  ],
  "T4": [
    { id: "s12", name: "Phạm Quỳnh Trang", role: "Thu ngân", branch: "HN-1", avatarLetter: "T", phone: "0903 555 666", checkInStatus: "not_yet" },
    { id: "s13", name: "Vũ Thành Công", role: "Phục vụ bàn", branch: "HN-1", avatarLetter: "C", phone: "0905 123 456", checkInStatus: "not_yet" },
    { id: "s14", name: "Bùi Văn G", role: "Pha chế", branch: "HN-2", avatarLetter: "G", phone: "0908 456 789", checkInStatus: "not_yet" },
  ],
  "T5": [
    { id: "s15", name: "Trần Minh Tuấn", role: "Quản lý / Admin", branch: "HN-1", avatarLetter: "T", phone: "0901 111 222", checkInStatus: "not_yet" },
    { id: "s16", name: "Nguyễn Thu Hà", role: "Phục vụ bàn", branch: "HN-1", avatarLetter: "H", phone: "0902 333 444", checkInStatus: "not_yet" },
    { id: "s17", name: "Đặng Văn E", role: "Barista", branch: "HN-1", avatarLetter: "E", phone: "0906 234 567", checkInStatus: "not_yet" },
  ],
  "T6": [
    { id: "s18", name: "Hoàng Minh Đức", role: "Pha chế", branch: "HN-1", avatarLetter: "Đ", phone: "0904 777 888", checkInStatus: "not_yet" },
    { id: "s19", name: "Phạm Quỳnh Trang", role: "Thu ngân", branch: "HN-1", avatarLetter: "T", phone: "0903 555 666", checkInStatus: "not_yet" },
    { id: "s20", name: "Trần Bích Ngọc", role: "Lễ tân", branch: "ĐN-1", avatarLetter: "N", phone: "0977 889 900", checkInStatus: "not_yet" },
  ],
  "T7": [
    { id: "s21", name: "Nguyễn Thu Hà", role: "Phục vụ bàn", branch: "HN-1", avatarLetter: "H", phone: "0902 333 444", checkInStatus: "not_yet" },
    { id: "s22", name: "Vũ Thành Công", role: "Phục vụ bàn", branch: "HN-1", avatarLetter: "C", phone: "0905 123 456", checkInStatus: "not_yet" },
    { id: "s23", name: "Bùi Văn G", role: "Pha chế", branch: "HN-1", avatarLetter: "G", phone: "0908 456 789", checkInStatus: "not_yet" },
    { id: "s24", name: "Lê Văn An", role: "Quản lý Chi nhánh", branch: "HN-2", avatarLetter: "A", phone: "0987 654 321", checkInStatus: "not_yet" },
  ],
  "CN": [
    { id: "s25", name: "Trần Minh Tuấn", role: "Quản lý / Admin", branch: "HN-1", avatarLetter: "T", phone: "0901 111 222", checkInStatus: "not_yet" },
    { id: "s26", name: "Phạm Quỳnh Trang", role: "Thu ngân", branch: "HN-1", avatarLetter: "T", phone: "0903 555 666", checkInStatus: "not_yet" },
    { id: "s27", name: "Đặng Văn E", role: "Barista", branch: "HN-1", avatarLetter: "E", phone: "0906 234 567", checkInStatus: "not_yet" },
  ],
};

export default function GeneralScheduleSection({
  workShifts,
  templates,
  defaultBranch = "all",
  isManager = false,
  managerBranch,
  onOpenAssignModal,
}: Props) {
  // Offset tuần (0: Tuần này, -1: Tuần trước, 1: Tuần sau...)
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0); // 0: Thứ 2 ... 6: Chủ nhật
  const effectiveDefaultBranch = isManager && managerBranch ? managerBranch : defaultBranch;
  const [selectedBranch, setSelectedBranch] = useState(effectiveDefaultBranch);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "checked_in" | "not_yet">("all");
  const [expandedShifts, setExpandedShifts] = useState<Record<string, boolean>>({
    "shift_0": true,
    "shift_1": true,
    "shift_2": true,
  });
  const [detailStaff, setDetailStaff] = useState<StaffInShift | null>(null);
  const [detailShift, setDetailShift] = useState<GeneralShiftItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [staffOverrides, setStaffOverrides] = useState<Record<string, { checkInStatus: StaffInShift["checkInStatus"]; checkInTime?: string; checkOutTime?: string }>>({});
  const [canceledIds, setCanceledIds] = useState<Set<string>>(new Set());

  // Tính toán các ngày trong tuần được chọn
  const weekDays = useMemo(() => {
    const baseMonday = new Date(2026, 7, 17); // Mặc định Thứ Hai 17/08/2026
    const monday = new Date(baseMonday);
    monday.setDate(baseMonday.getDate() + weekOffset * 7);

    const dayKeys = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
    const dayNames = [
      "Thứ Hai",
      "Thứ Ba",
      "Thứ Tư",
      "Thứ Năm",
      "Thứ Sáu",
      "Thứ Bảy",
      "Chủ Nhật",
    ];

    return dayKeys.map((key, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      const dayNum = String(d.getDate()).padStart(2, "0");
      const monthNum = String(d.getMonth() + 1).padStart(2, "0");
      const yearNum = d.getFullYear();
      const dateStr = `${dayNum}/${monthNum}`;
      const fullDate = `${dayNum}/${monthNum}/${yearNum}`;
      const isToday = weekOffset === 0 && idx === 0; // Giả lập Thứ Hai là hôm nay

      return {
        key,
        name: dayNames[idx],
        date: dateStr,
        fullDate,
        isToday,
      };
    });
  }, [weekOffset]);

  const currentDay = weekDays[selectedDayIndex] || weekDays[0];

  // Xây dựng danh sách ca làm việc của ngày được chọn
  const dayShifts: GeneralShiftItem[] = useMemo(() => {
    const dayKey = currentDay.key;
    const baseStaff = mockStaffPool[dayKey] || [];

    // Tích hợp thêm các phân công thực tế từ workShifts nếu khớp ngày
    const dynamicStaffFromWorkShifts: StaffInShift[] = workShifts
      .filter((ws) => ws.date === currentDay.fullDate)
      .map((ws, idx) => ({
        id: `dynamic-${ws.id}-${idx}`,
        name: ws.employee,
        role: "Nhân viên trực ca",
        branch: ws.branch,
        avatarLetter: ws.employee.charAt(0).toUpperCase(),
        phone: "0912 345 678",
        checkInStatus: ws.checkIn && ws.checkIn !== "—" ? "checked_in" : "not_yet",
        checkInTime: ws.checkIn !== "—" ? ws.checkIn : undefined,
        checkOutTime: ws.checkOut !== "—" ? ws.checkOut : undefined,
      }));

    // Gộp danh sách nhân sự không trùng lặp tên, bổ sung checkOutTime nếu có
    const allStaff = [...baseStaff];
    dynamicStaffFromWorkShifts.forEach((ds) => {
      const idx = allStaff.findIndex((s) => s.name === ds.name);
      if (idx === -1) {
        allStaff.push(ds);
      } else {
        if (!allStaff[idx].checkOutTime && ds.checkOutTime) {
          allStaff[idx] = { ...allStaff[idx], checkOutTime: ds.checkOutTime };
        }
      }
    });

    // Áp dụng override chấm công và loại bỏ ca đã hủy
    const withOverrides = allStaff
      .filter((s) => !canceledIds.has(s.id))
      .map((s) => {
        const ov = staffOverrides[s.id];
        if (ov) {
          return {
            ...s,
            checkInStatus: ov.checkInStatus,
            checkInTime: ov.checkInTime ?? s.checkInTime,
            checkOutTime: ov.checkOutTime ?? s.checkOutTime,
          };
        }
        return s;
      });

    // Lọc theo chi nhánh nếu được chọn
    const filteredByBranch =
      selectedBranch === "all"
        ? withOverrides
        : withOverrides.filter(
            (s) => s.branch.toLowerCase() === selectedBranch.toLowerCase()
          );

    // Chia nhân sự vào 3 ca mẫu tiêu biểu (Sáng, Chiều, Tối)
    return [
      {
        id: "shift_0",
        templateId: "t1",
        shiftName: "Ca Sáng (Mở cửa)",
        timeRange: "07:00 - 14:00",
        iconType: "morning",
        status: currentDay.isToday ? "completed" : weekOffset < 0 ? "completed" : "upcoming",
        staffList: filteredByBranch.slice(0, 3),
      },
      {
        id: "shift_1",
        templateId: "t2",
        shiftName: "Ca Chiều",
        timeRange: "14:00 - 22:00",
        iconType: "afternoon",
        status: currentDay.isToday ? "active" : weekOffset < 0 ? "completed" : "upcoming",
        staffList: filteredByBranch.slice(3, 5),
      },
      {
        id: "shift_2",
        templateId: "t3",
        shiftName: "Ca Tối (Part-time & Đóng cửa)",
        timeRange: "18:00 - 23:00",
        iconType: "evening",
        status: weekOffset < 0 ? "completed" : "upcoming",
        staffList: filteredByBranch.slice(5),
      },
    ];
  }, [currentDay, workShifts, selectedBranch, weekOffset, staffOverrides, canceledIds]);

  const toggleExpand = (shiftId: string) => {
    setExpandedShifts((prev) => ({
      ...prev,
      [shiftId]: !prev[shiftId],
    }));
  };

  const getWeekTitle = () => {
    if (weekOffset === 0) return "Tuần này";
    if (weekOffset === -1) return "Tuần trước";
    if (weekOffset === 1) return "Tuần sau";
    if (weekOffset < -1) return `${Math.abs(weekOffset)} tuần trước`;
    return `${weekOffset} tuần sau`;
  };

  const getWeekRange = () => {
    if (weekDays.length < 7) return "";
    return `${weekDays[0].date} - ${weekDays[6].date}/2026`;
  };

  // Tổng số lượt nhân sự trực trong ngày
  const totalStaffInDay = dayShifts.reduce(
    (sum, s) => sum + s.staffList.length,
    0
  );

  return (
    <div className="flex flex-col gap-5">
      {/* ── THANH ĐIỀU HƯỚNG TUẦN & BỘ LỌC CHI NHÁNH - ngang hàng cùng kích thước ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Chuyển tuần - cùng chiều cao với ô tìm kiếm */}
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 shadow-xs">
              <button
                type="button"
                onClick={() => setWeekOffset((prev) => prev - 1)}
                className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-gray-50 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                title="Tuần trước"
              >
                <FontAwesomeIcon icon={faChevronLeft} fontSize={16} />
              </button>
              <div className="text-center min-w-[130px]">
                <div className="font-bold text-gray-900 text-xs leading-tight">
                  {getWeekTitle()}
                </div>
                <div className="text-[11px] text-gray-400 font-normal leading-tight">
                  {getWeekRange()}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setWeekOffset((prev) => prev + 1)}
                className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-gray-50 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                title="Tuần sau"
              >
                <FontAwesomeIcon icon={faChevronRight} fontSize={16} />
              </button>
            </div>
            {weekOffset !== 0 && (
              <button
                type="button"
                onClick={() => {
                  setWeekOffset(0);
                  setSelectedDayIndex(0);
                }}
                className="text-xs font-semibold text-primary hover:underline px-2 py-1 whitespace-nowrap"
              >
                Về hôm nay
              </button>
            )}
          </div>

          {/* Bộ lọc chi nhánh & tìm kiếm */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {isManager ? (
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-700">
                <FontAwesomeIcon icon={faStore} fontSize={15} className="text-primary" />
                <span>Chi nhánh: <strong className="text-gray-900">{managerBranch}</strong></span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary-50 text-primary border border-primary-200 ml-1">Cố định</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-700">
                <FontAwesomeIcon icon={faStore} fontSize={15} className="text-primary" />
                <span>Chi nhánh:</span>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="bg-transparent border-none text-xs font-bold text-gray-900 focus:outline-hidden cursor-pointer"
                >
                  <option value="all">Tất cả chi nhánh</option>
                  <option value="HN-1">Chi nhánh HN-1 (Hoàn Kiếm)</option>
                  <option value="HN-2">Chi nhánh HN-2 (Cầu Giấy)</option>
                  <option value="ĐN-1">Chi nhánh ĐN-1 (Đà Nẵng)</option>
                </select>
              </div>
            )}

            <div className="relative">
              <FontAwesomeIcon icon={faMagnifyingGlass} fontSize={15}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Tìm tên hoặc SĐT..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-gray-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-primary w-40"
              />
            </div>

            <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs">
              <FontAwesomeIcon icon={faFilter} fontSize={14} className="text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as "all" | "checked_in" | "not_yet")
                }
                className="bg-transparent border-none text-xs text-gray-700 focus:outline-hidden cursor-pointer"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="checked_in">Đã chấm công</option>
                <option value="not_yet">Chưa chấm công</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── THẺ CHỌN 7 NGÀY TRONG TUẦN (GIỐNG MOBILE) ── */}
        <div className="grid grid-cols-7 gap-2 mt-4 pt-4 border-t border-gray-100">
          {weekDays.map((day, idx) => {
            const isSelected = idx === selectedDayIndex;
            return (
              <button
                key={day.key}
                type="button"
                onClick={() => setSelectedDayIndex(idx)}
                className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl transition-all cursor-pointer border min-h-[78px] ${
                  isSelected
                    ? "bg-primary text-white border-primary shadow-sm ring-2 ring-primary/20 scale-[1.02]"
                    : day.isToday
                    ? "bg-primary-50 text-primary border-primary-200 hover:bg-primary-100/50"
                    : "bg-gray-50/70 text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                }`}
              >
                <span
                  className={`text-[11px] font-semibold uppercase tracking-wider ${
                    isSelected
                      ? "text-white/90"
                      : day.isToday
                      ? "text-primary font-bold"
                      : "text-gray-500"
                  }`}
                >
                  {day.key}
                </span>
                <span
                  className={`text-base font-extrabold my-0.5 ${
                    isSelected ? "text-white" : "text-gray-900"
                  }`}
                >
                  {day.date.split("/")[0]}
                </span>
                <div className="flex items-center justify-center gap-1 h-[16px] min-h-[16px]">
                  {day.isToday ? (
                    <span
                      className={`text-[10px] px-1 py-0.5 rounded font-bold leading-none ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-primary text-white"
                      }`}
                    >
                      Hôm nay
                    </span>
                  ) : (
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        isSelected ? "bg-white" : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── TIÊU ĐỀ NGÀY ĐANG CHỌN & THỐNG KÊ ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-900">
              {currentDay.name}, Ngày {currentDay.fullDate}
            </h2>
            {currentDay.isToday && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary-50 text-primary border border-primary-200">
                Hôm nay
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Lịch phân công ca làm việc chung toàn bộ nhân sự chi nhánh • Chạm vào từng ca để xem chi tiết
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge tone="primary">
            <FontAwesomeIcon icon={faCalendar} fontSize={13} /> {dayShifts.length} ca làm việc
          </Badge>
          <Badge tone="gray">
            <FontAwesomeIcon icon={faUsers} fontSize={13} /> {totalStaffInDay} lượt nhân sự
          </Badge>
        </div>
      </div>

      {/* ── DANH SÁCH CÁC CA LÀM VIỆC TRONG NGÀY (ACCORDION GIỐNG MOBILE) ── */}
      <div className="flex flex-col gap-4">
        {dayShifts.map((shift) => {
          const isExpanded = !!expandedShifts[shift.id];

          // Lọc nhân sự theo ô tìm kiếm và trạng thái checkin
          const visibleStaff = shift.staffList.filter((s) => {
            const matchesQuery =
              !searchQuery ||
              s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              s.phone.includes(searchQuery) ||
              s.role.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus =
              statusFilter === "all"
                ? true
                : statusFilter === "checked_in"
                ? s.checkInStatus === "checked_in" || s.checkInStatus === "in_progress"
                : s.checkInStatus === "not_yet";

            return matchesQuery && matchesStatus;
          });

          const getStatusBadge = () => {
            if (shift.status === "completed") {
              return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <FontAwesomeIcon icon={faCheck} fontSize={13} /> Đã hoàn thành
                </span>
              );
            }
            if (shift.status === "active") {
              return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  Đang diễn ra
                </span>
              );
            }
            return (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                <FontAwesomeIcon icon={faClock} fontSize={13} /> Sắp diễn ra
              </span>
            );
          };

          const getShiftIcon = () => {
            if (shift.iconType === "morning") {
              return (
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shrink-0">
                  <FontAwesomeIcon icon={faSun} fontSize={22} />
                </div>
              );
            }
            if (shift.iconType === "afternoon") {
              return (
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-200 shrink-0">
                  <FontAwesomeIcon icon={faCloudSun} fontSize={22} />
                </div>
              );
            }
            return (
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200 shrink-0">
                <FontAwesomeIcon icon={faMoon} fontSize={22} />
              </div>
            );
          };

          return (
            <div
              key={shift.id}
              className={`bg-white border rounded-xl overflow-hidden transition-all shadow-xs ${
                isExpanded
                  ? "border-primary/40 ring-1 ring-primary/10"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {/* Header ca làm việc (Clickable để xổ xuống) */}
              <div
                onClick={() => toggleExpand(shift.id)}
                className="p-4 flex items-center justify-between gap-3 cursor-pointer select-none hover:bg-gray-50/70 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {getShiftIcon()}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900 text-sm md:text-base truncate">
                        {shift.shiftName}
                      </h3>
                      {getStatusBadge()}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <span className="flex items-center gap-1 font-mono font-medium text-gray-700">
                        <FontAwesomeIcon icon={faClock} fontSize={13} className="text-gray-400" />
                        {shift.timeRange}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-gray-100 text-gray-800 border border-gray-200">
                    <FontAwesomeIcon icon={faUsers} fontSize={14} className="text-primary" />
                    {shift.staffList.length} nhân sự
                  </span>

                  {onOpenAssignModal && shift.templateId && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenAssignModal(
                          shift.templateId!,
                          currentDay.fullDate,
                          selectedBranch === "all" ? "HN-1" : selectedBranch
                        );
                      }}
                      className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary-50 text-primary hover:bg-primary hover:text-white transition-all cursor-pointer"
                      title="Gán thêm nhân viên vào ca này"
                    >
                      <FontAwesomeIcon icon={faUserPlus} fontSize={14} /> Thêm NV
                    </button>
                  )}

                  <div className="text-gray-400 p-1">
                    {isExpanded ? (
                      <FontAwesomeIcon icon={faChevronUp} fontSize={20} className="text-primary" />
                    ) : (
                      <FontAwesomeIcon icon={faChevronDown} fontSize={20} />
                    )}
                  </div>
                </div>
              </div>

              {/* Danh sách nhân sự trong ca khi mở rộng */}
              {isExpanded && (
                <div className="border-t border-gray-100 bg-gray-50/50 p-4">
                  {visibleStaff.length === 0 ? (
                    <div className="text-center py-6 text-gray-400 text-xs">
                      Trống
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {visibleStaff.map((staff) => {
                        const isCheckedIn =
                          staff.checkInStatus === "checked_in" ||
                          staff.checkInStatus === "in_progress";

                        return (
                          <div
                            key={staff.id}
                            onClick={() => { setDetailStaff(staff); setDetailShift(shift); setDetailOpen(true); }}
                            className="bg-white border border-gray-200 rounded-xl p-3.5 flex items-start justify-between gap-3 shadow-2xs hover:shadow-xs transition-shadow cursor-pointer hover:border-primary/30"
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border ${
                                  isCheckedIn
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : "bg-gray-100 text-gray-600 border-gray-200"
                                }`}
                              >
                                {staff.avatarLetter}
                              </div>

                              <div className="min-w-0">
                                <div className="font-bold text-gray-900 text-sm truncate">
                                  {staff.name}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                  {staff.role} • Chi nhánh {staff.branch}
                                </div>

                                {/* Trạng thái Check-in - chỉ hiển thị trạng thái */}
                                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                                  {staff.checkInStatus === "checked_in" && (() => {
                                    const isLate = (() => {
                                      if (!staff.checkInTime || !shift.timeRange) return false;
                                      const startStr = shift.timeRange.split("-")[0]?.trim().split(" ")[0];
                                      if (!startStr) return false;
                                      const [sh, sm] = startStr.split(":").map(Number);
                                      const [ch, cm] = staff.checkInTime.split(":").map(Number);
                                      if ([sh, sm, ch, cm].some((n) => Number.isNaN(n))) return false;
                                      return ch * 60 + cm - (sh * 60 + sm) > 5;
                                    })();
                                    return (
                                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold border ${isLate ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
                                        <FontAwesomeIcon icon={faUserCheck} fontSize={12} />
                                        {isLate ? "Trễ" : "Đúng giờ"}
                                      </span>
                                    );
                                  })()}
                                  {staff.checkInStatus === "in_progress" && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                                      Đang trong ca
                                    </span>
                                  )}
                                  {staff.checkInStatus === "not_yet" && (() => {
                                    const isForgot = !currentDay.isToday || weekOffset < 0;
                                    return (
                                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold border ${isForgot ? "bg-red-50 text-red-700 border-red-200" : "bg-gray-100 text-gray-600 border-gray-200"}`}>
                                        <FontAwesomeIcon icon={faCircleExclamation} fontSize={12} />
                                        {isForgot ? "Quên chấm công" : "Chưa chấm công"}
                                      </span>
                                    );
                                  })()}
                                </div>
                              </div>
                            </div>

                            {/* Nút liên hệ nhanh qua điện thoại */}
                            <a
                              href={`tel:${staff.phone.replace(/\s/g, "")}`}
                              onClick={(e) => e.stopPropagation()}
                              className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-primary-50 hover:text-primary transition-colors shrink-0 border border-gray-200"
                              title={`Gọi điện thoại: ${staff.phone}`}
                            >
                              <FontAwesomeIcon icon={faPhone} fontSize={15} />
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <StaffShiftDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        staff={(() => {
          if (!detailStaff) return null;
          const found = dayShifts.flatMap((s) => s.staffList).find((s) => s.id === detailStaff.id);
          return found || detailStaff;
        })()}
        shift={detailShift}
        day={currentDay}
        onCancelShift={(staffId) => {
          setCanceledIds((prev) => new Set(prev).add(staffId));
        }}
        onCheckIn={(staffId) => {
          const now = new Date();
          const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
          setStaffOverrides((prev) => ({ ...prev, [staffId]: { checkInStatus: "checked_in", checkInTime: time } }));
        }}
        onCheckOut={(staffId) => {
          const now = new Date();
          const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
          setStaffOverrides((prev) => ({
            ...prev,
            [staffId]: {
              ...prev[staffId],
              checkInStatus: "checked_in",
              checkInTime: prev[staffId]?.checkInTime ?? detailStaff?.checkInTime ?? "07:00",
              checkOutTime: time,
            },
          }));
        }}
        onSupplement={(staffId) => {
          const now = new Date();
          const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
          setStaffOverrides((prev) => ({ ...prev, [staffId]: { checkInStatus: "checked_in", checkInTime: time } }));
        }}
      />
    </div>
  );
}
