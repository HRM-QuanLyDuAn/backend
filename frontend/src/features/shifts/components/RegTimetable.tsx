"use client";

import { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faChevronLeft, faChevronRight, faCloudSun, faMoon, faSun, faUsers } from "@fortawesome/free-solid-svg-icons";
import Badge from "@/components/ui/Badge";
import type { WeeklyRegistration } from "../types";

interface Props {
  registrations: WeeklyRegistration[];
  defaultBranch?: string;
  isManager?: boolean;
  managerBranch?: string;
}

interface RegistrationShiftGroup {
  id: string;
  shiftName: string;
  timeRange: string;
  iconType: "morning" | "afternoon" | "evening" | "off";
  staffList: { id: string; name: string; role: string; branch: string; note?: string }[];
}

export default function RegistrationTimetableSection({ registrations, defaultBranch = "all", isManager = false, managerBranch }: Props) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const effectiveDefaultBranch = isManager && managerBranch ? managerBranch : defaultBranch;
  const [selectedBranch, setSelectedBranch] = useState(effectiveDefaultBranch);

  const weekDays = useMemo(() => {
    const baseMonday = new Date(2026, 7, 17);
    const monday = new Date(baseMonday);
    monday.setDate(baseMonday.getDate() + weekOffset * 7);
    const dayKeys = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
    const dayNames = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"];
    return dayKeys.map((key, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      const dayNum = String(d.getDate()).padStart(2, "0");
      const monthNum = String(d.getMonth() + 1).padStart(2, "0");
      const yearNum = d.getFullYear();
      const dateStr = `${dayNum}/${monthNum}`;
      const fullDate = `${dayNum}/${monthNum}/${yearNum}`;
      const isToday = weekOffset === 0 && idx === 0;
      return { key, name: dayNames[idx], date: dateStr, fullDate, isToday };
    });
  }, [weekOffset]);

  const currentDay = weekDays[selectedDayIndex] || weekDays[0];

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

  const filteredRegs = useMemo(() => {
    if (selectedBranch === "all") return registrations;
    return registrations.filter((r) => r.branch.toLowerCase().replace("-", "") === selectedBranch.toLowerCase().replace("-", ""));
  }, [registrations, selectedBranch]);

  const dayGroups: RegistrationShiftGroup[] = useMemo(() => {
    const regsForDay = filteredRegs.filter((r) => {
      const shift = r.days[currentDay.key];
      return shift && shift !== "Nghỉ";
    });

    // Group by shift name
    const groups: Record<string, typeof regsForDay> = {};
    regsForDay.forEach((r) => {
      const shift = r.days[currentDay.key];
      if (!groups[shift]) groups[shift] = [];
      groups[shift].push(r);
    });

    const shiftOrder = ["Ca Sáng", "Ca Chiều", "Ca Tối", "Ca Tối (Part-time)"];
    const sortedKeys = Object.keys(groups).sort((a, b) => {
      const ia = shiftOrder.indexOf(a);
      const ib = shiftOrder.indexOf(b);
      if (ia === -1 && ib === -1) return a.localeCompare(b);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });

    return sortedKeys.map((shiftName, idx) => {
      const list = groups[shiftName];
      let iconType: RegistrationShiftGroup["iconType"] = "morning";
      let timeRange = "";
      if (shiftName.toLowerCase().includes("sáng")) {
        iconType = "morning";
        timeRange = "07:00 - 14:00";
      } else if (shiftName.toLowerCase().includes("chiều")) {
        iconType = "afternoon";
        timeRange = "14:00 - 22:00";
      } else if (shiftName.toLowerCase().includes("tối")) {
        iconType = "evening";
        timeRange = "18:00 - 23:00";
      }
      return {
        id: `reg-shift-${idx}`,
        shiftName,
        timeRange,
        iconType,
        staffList: list.map((r) => ({ id: r.id, name: r.employeeName, role: r.role, branch: r.branch, note: r.note })),
      };
    });
  }, [filteredRegs, currentDay]);

  const totalRegsForDay = dayGroups.reduce((sum, g) => sum + g.staffList.length, 0);

  return (
    <div className="flex flex-col gap-4 bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
      {/* Header: tiêu đề + bộ lọc chi nhánh */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <FontAwesomeIcon icon={faCalendar} fontSize={16} className="text-primary" />
            Thời gian biểu đăng ký ca
          </h3>
          {isManager ? (
            <div className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs bg-gray-50 font-bold text-gray-800 flex items-center gap-1.5">
              <span>{managerBranch}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary-50 text-primary border border-primary-200">Cố định</span>
            </div>
          ) : (
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs bg-gray-50 font-bold text-gray-800 focus:outline-none cursor-pointer"
            >
              <option value="all">Tất cả chi nhánh</option>
              <option value="HN-1">HN-1</option>
              <option value="HN-2">HN-2</option>
              <option value="ĐN-1">ĐN-1</option>
            </select>
          )}
        </div>
        <p className="text-xs text-gray-500">Lịch sử đăng ký nguyện vọng của nhân viên theo từng ngày, nhóm theo ca — đồng bộ như Lịch làm việc chung</p>
      </div>

      {/* Thanh chuyển tuần - cùng kích thước với ô tìm kiếm, ngang hàng */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 shadow-xs">
            <button
              type="button"
              onClick={() => setWeekOffset((p) => p - 1)}
              className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-gray-50 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
            >
              <FontAwesomeIcon icon={faChevronLeft} fontSize={16} />
            </button>
            <div className="text-center min-w-[130px]">
              <div className="font-bold text-gray-900 text-xs leading-tight">{getWeekTitle()}</div>
              <div className="text-[11px] text-gray-400 leading-tight">{getWeekRange()}</div>
            </div>
            <button
              type="button"
              onClick={() => setWeekOffset((p) => p + 1)}
              className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-gray-50 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
            >
              <FontAwesomeIcon icon={faChevronRight} fontSize={16} />
            </button>
          </div>
          {weekOffset !== 0 && (
            <button type="button" onClick={() => { setWeekOffset(0); setSelectedDayIndex(0); }} className="text-xs font-semibold text-primary hover:underline px-2 py-1 whitespace-nowrap">
              Về hôm nay
            </button>
          )}
        </div>
        <div className="hidden lg:block text-xs text-gray-400">Lịch sử đăng ký theo tuần</div>
      </div>

      {/* 7 ngày */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, idx) => {
          const isSelected = idx === selectedDayIndex;
          return (
            <button
              key={day.key}
              type="button"
              onClick={() => setSelectedDayIndex(idx)}
              className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border transition-all cursor-pointer min-h-[78px] ${
                isSelected ? "bg-primary text-white border-primary shadow-sm" : day.isToday ? "bg-primary-50 text-primary border-primary-200" : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
              }`}
            >
              <span className="text-[11px] font-semibold uppercase">{day.key}</span>
              <span className="text-base font-extrabold my-0.5">{day.date.split("/")[0]}</span>
              <div className="flex items-center justify-center h-[16px] min-h-[16px]">
                {day.isToday ? <span className={`text-[10px] px-1 py-0.5 rounded font-bold leading-none ${isSelected ? "bg-white/20 text-white" : "bg-primary text-white"}`}>Hôm nay</span> : <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSelected ? "bg-white" : "bg-gray-300"}`} />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Thống kê ngày */}
      <div className="flex items-center justify-between px-1">
        <div className="text-sm font-bold text-gray-900">
          {currentDay.name}, {currentDay.fullDate} <span className="text-xs font-normal text-gray-500">• {totalRegsForDay} lượt đăng ký</span>
        </div>
        <div className="flex gap-2">
          <Badge tone="primary"><FontAwesomeIcon icon={faCalendar} fontSize={13} /> {dayGroups.length} ca</Badge>
          <Badge tone="gray"><FontAwesomeIcon icon={faUsers} fontSize={13} /> {totalRegsForDay} NV</Badge>
        </div>
      </div>

      {/* Danh sách ca đăng ký trong ngày */}
      <div className="flex flex-col gap-3">
        {dayGroups.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-xs text-gray-400">Không có đăng ký nào cho ngày này (tất cả nghỉ).</div>
        ) : (
          dayGroups.map((group) => (
            <div key={group.id} className="bg-gray-50/60 border border-gray-200 rounded-xl overflow-hidden">
              <div className="p-3 flex items-center gap-3 bg-white">
                {group.iconType === "morning" && <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200"><FontAwesomeIcon icon={faSun} fontSize={18} /></div>}
                {group.iconType === "afternoon" && <div className="w-9 h-9 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-200"><FontAwesomeIcon icon={faCloudSun} fontSize={18} /></div>}
                {group.iconType === "evening" && <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200"><FontAwesomeIcon icon={faMoon} fontSize={18} /></div>}
                <div>
                  <div className="font-bold text-sm text-gray-900">{group.shiftName}</div>
                  <div className="text-xs text-gray-500 font-mono">{group.timeRange}</div>
                </div>
                <span className="ml-auto text-xs font-bold bg-gray-100 border border-gray-200 px-2 py-1 rounded-lg">{group.staffList.length} NV</span>
              </div>
              <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {group.staffList.map((s) => (
                  <div key={s.id} className="bg-white border border-gray-200 rounded-lg p-2.5 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">{s.name.charAt(0)}</div>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs text-gray-900 truncate">{s.name}</div>
                      <div className="text-[11px] text-gray-500 truncate">{s.role} • {s.branch}</div>
                      {s.note && <div className="text-[10px] text-amber-700 italic truncate max-w-[160px]">“{s.note}”</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
