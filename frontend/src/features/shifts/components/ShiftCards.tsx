"use client";

import { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faCalendarCheck, faCheck, faChevronDown, faChevronLeft, faChevronRight, faChevronUp, faClock, faCloudSun, faMoon, faPlus, faRepeat, faStore, faSun, faUser, faUserPlus, faXmark } from "@fortawesome/free-solid-svg-icons";
import type { ShiftTemplate, WorkShift, WeeklyRegistration } from "../types";
import { employees } from "@/mock-data/portal";

interface ShiftCardsGridProps {
  templates: ShiftTemplate[];
  workShifts: WorkShift[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  selectedBranch: string;
  onBranchChange: (branch: string) => void;
  onAddEmployeeToShift: (templateId: string) => void;
  onRemoveShift: (workShiftId: string) => void;
  onAddDirectShift?: (
    templateName: string,
    employeeName: string,
    date: string,
    branch: string,
    isRecurring: boolean
  ) => void;
  weeklyRegistrations?: WeeklyRegistration[];
  onToggleRecurring?: (workShiftId: string) => void;
}

export default function ShiftCardsGrid({
  templates,
  workShifts,
  selectedDate,
  onDateChange,
  selectedBranch,
  onBranchChange,
  onAddEmployeeToShift,
  onRemoveShift,
  onAddDirectShift,
  weeklyRegistrations = [],
  onToggleRecurring,
}: ShiftCardsGridProps) {
  // Offset tuần (0: Tuần này, -1: Tuần trước, 1: Tuần sau)
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  // Cấu hình lặp lại hàng tuần add cứng theo từng ca cụ thể
  const [isRecurringByTemplate, setIsRecurringByTemplate] = useState<
    Record<string, boolean>
  >({
    [templates[0]?.id || "t1"]: true,
    [templates[1]?.id || "t2"]: true,
    [templates[2]?.id || "t3"]: true,
  });

  // Mở rộng các ca làm việc (Accordion)
  const [expandedShifts, setExpandedShifts] = useState<Record<string, boolean>>({
    [templates[0]?.id || "t1"]: true,
    [templates[1]?.id || "t2"]: true,
  });

  // Nhân viên đang chọn để thêm vào ca cho từng template
  const [selectedStaffByTemplate, setSelectedStaffByTemplate] = useState<
    Record<string, string>
  >({});

  // Tính toán 7 ngày trong tuần
  const weekDays = useMemo(() => {
    const baseMonday = new Date(2026, 7, 17); // Thứ Hai 17/08/2026
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
      const isToday = weekOffset === 0 && idx === 0;

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

  const toggleExpand = (templateId: string) => {
    setExpandedShifts((prev) => ({
      ...prev,
      [templateId]: !prev[templateId],
    }));
  };

  const handleSelectDay = (index: number) => {
    setSelectedDayIndex(index);
    const day = weekDays[index];
    if (day) {
      onDateChange(day.fullDate);
    }
  };

  // Danh sách nhân viên theo chi nhánh đã chọn
  const availableEmployees = useMemo(() => {
    if (selectedBranch === "all") return employees;
    return employees.filter(
      (e) => e.branch.toLowerCase().replace("-", "") === selectedBranch.toLowerCase().replace("-", "")
    );
  }, [selectedBranch]);

  // Danh sách đăng ký nguyện vọng theo chi nhánh đã chọn
  const filteredRegistrations = useMemo(() => {
    if (!weeklyRegistrations || weeklyRegistrations.length === 0) return [];
    if (selectedBranch === "all") return weeklyRegistrations;
    return weeklyRegistrations.filter(
      (r) =>
        r.branch.toLowerCase().replace("-", "") ===
        selectedBranch.toLowerCase().replace("-", "")
    );
  }, [weeklyRegistrations, selectedBranch]);

  // Nguyện vọng của nhân sự trong ngày đang chọn (currentDay)
  const wishesForCurrentDay = useMemo(() => {
    return filteredRegistrations.map((reg) => {
      const desiredShift = reg.days[currentDay.key] || "Nghỉ";
      const isOff = desiredShift === "Nghỉ";

      // Kiểm tra xem nhân viên này đã được xếp ca trong ngày này chưa
      const assignedShift = workShifts.find((ws) => {
        const matchDate = ws.date === currentDay.fullDate;
        const matchName =
          ws.employee.toLowerCase() === reg.employeeName.toLowerCase();
        const matchBranch =
          selectedBranch === "all" ||
          ws.branch.toLowerCase().replace("-", "") ===
            selectedBranch.toLowerCase().replace("-", "");
        return matchDate && matchName && matchBranch;
      });

      return {
        ...reg,
        desiredShift,
        isOff,
        assignedShift,
      };
    });
  }, [filteredRegistrations, currentDay, workShifts, selectedBranch]);

  // Thống kê nhanh nguyện vọng trong ngày đang chọn
  const wishesSummary = useMemo(() => {
    let working = 0;
    let off = 0;
    const byShift: Record<string, number> = {};

    wishesForCurrentDay.forEach((w) => {
      if (w.isOff) {
        off++;
      } else {
        working++;
        byShift[w.desiredShift] = (byShift[w.desiredShift] || 0) + 1;
      }
    });

    return { working, off, byShift };
  }, [wishesForCurrentDay]);

  // Xử lý thêm nhân viên trực tiếp vào ca cụ thể (add cứng lặp lại cho ca đó)
  const handleAddEmployeeDirectly = (tpl: ShiftTemplate) => {
    const chosenEmployee =
      selectedStaffByTemplate[tpl.id] || availableEmployees[0]?.name;
    if (!chosenEmployee) return;

    const isRecurringForThisShift = isRecurringByTemplate[tpl.id] ?? true;

    if (onAddDirectShift) {
      onAddDirectShift(
        tpl.name,
        chosenEmployee,
        currentDay.fullDate,
        selectedBranch === "all" ? "HN-1" : selectedBranch,
        isRecurringForThisShift
      );
    } else {
      onAddEmployeeToShift(tpl.id);
    }
  };

  const getWeekRange = () => {
    if (weekDays.length < 7) return "";
    return `${weekDays[0].date} - ${weekDays[6].date}/2026`;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-5 space-y-5">
      {/* ── BỐ CỤC 3 CỘT CHÍNH: 1. THỨ TRONG TUẦN - 2. CÁC CA LÀM VIỆC - 3. NGUYỆN VỌNG ĐĂNG KÝ ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* ── CỘT 1 (BÊN TRÁI): THỨ TRONG TUẦN XẾP TỪ TRÊN XUỐNG DƯỚI ── */}
        <div className="lg:col-span-3 flex flex-col gap-2">
          <div className="flex items-center justify-between px-1 mb-1">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              1. Thứ trong tuần
            </span>
            <span className="text-[11px] text-gray-400">Chọn thứ</span>
          </div>

          <div className="space-y-1.5">
            {weekDays.map((day, idx) => {
              const isSelected = idx === selectedDayIndex;

              // Đếm số lượng nhân viên đã gán cho ngày này
              const staffCountForThisDay = workShifts.filter((ws) => {
                const matchDate = ws.date === day.fullDate;
                const matchBranch =
                  selectedBranch === "all" ||
                  ws.branch.toLowerCase().replace("-", "") ===
                    selectedBranch.toLowerCase().replace("-", "");
                return matchDate && matchBranch;
              }).length;

              // Đếm số nhân viên có nguyện vọng làm việc trong ngày này
              const regCountForThisDay = filteredRegistrations.filter(
                (r) => r.days[day.key] && r.days[day.key] !== "Nghỉ"
              ).length;

              return (
                <button
                  key={day.key}
                  type="button"
                  onClick={() => handleSelectDay(idx)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? "bg-primary text-white border-primary shadow-sm ring-2 ring-primary/20 scale-[1.01]"
                      : "bg-gray-50/80 hover:bg-gray-100/80 text-gray-800 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : day.isToday
                          ? "bg-primary text-white"
                          : "bg-white text-gray-700 border border-gray-200"
                      }`}
                    >
                      {day.key}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs truncate">
                          {day.name}
                        </span>
                        {day.isToday && (
                          <span
                            className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                              isSelected
                                ? "bg-white/25 text-white"
                                : "bg-primary-50 text-primary border border-primary-200"
                            }`}
                          >
                            Nay
                          </span>
                        )}
                      </div>
                      <div
                        className={`text-[11px] ${
                          isSelected ? "text-white/80" : "text-gray-500"
                        }`}
                      >
                        {day.date}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-0.5 shrink-0">
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : staffCountForThisDay > 0
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {staffCountForThisDay > 0
                        ? `${staffCountForThisDay} đã xếp`
                        : "Chưa xếp"}
                    </span>
                    <span
                      className={`text-[10px] ${
                        isSelected
                          ? "text-white/85"
                          : "text-blue-600 font-medium"
                      }`}
                    >
                      {regCountForThisDay} NV đ/ký
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── CỘT 2 (GIỮA): DANH SÁCH CÁC CA LÀM TRONG THỨ ĐÓ (BẤM VÀO SỔ XUỐNG THÊM NV) ── */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="flex items-center justify-between px-1 mb-1">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                2. Các ca làm {currentDay.name} ({currentDay.date})
              </span>
              <span className="text-xs text-gray-500">
                Bấm vào ca để xem & thêm nhân sự
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-primary bg-primary-50 border border-primary-200 px-2 py-0.5 rounded-lg">
                {templates.length} ca
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {templates.map((tpl) => {
              const isExpanded = !!expandedShifts[tpl.id];

              // Danh sách nhân viên trong ca của ngày này
              const assignedInThisTemplate = workShifts.filter((ws) => {
                const matchDate = ws.date === currentDay.fullDate;
                const matchTemplate =
                  ws.templateName.toLowerCase() === tpl.name.toLowerCase();
                const matchBranch =
                  selectedBranch === "all" ||
                  ws.branch.toLowerCase().replace("-", "") ===
                    selectedBranch.toLowerCase().replace("-", "");
                return matchDate && matchTemplate && matchBranch;
              });

              const getShiftIcon = () => {
                const nameLower = tpl.name.toLowerCase();
                if (nameLower.includes("sáng")) {
                  return (
                    <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shrink-0">
                      <FontAwesomeIcon icon={faSun} fontSize={20} />
                    </div>
                  );
                }
                if (nameLower.includes("chiều")) {
                  return (
                    <div className="w-9 h-9 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-200 shrink-0">
                      <FontAwesomeIcon icon={faCloudSun} fontSize={20} />
                    </div>
                  );
                }
                return (
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200 shrink-0">
                    <FontAwesomeIcon icon={faMoon} fontSize={20} />
                  </div>
                );
              };

              return (
                <div
                  key={tpl.id}
                  className={`bg-white border rounded-xl overflow-hidden transition-all shadow-2xs ${
                    isExpanded
                      ? "border-primary/50 ring-1 ring-primary/10"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {/* Header của Ca (Bấm vào để xổ xuống) */}
                  <div
                    onClick={() => toggleExpand(tpl.id)}
                    className="p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none hover:bg-gray-50/70 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {getShiftIcon()}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-900 text-sm">
                            {tpl.name}
                          </h4>
                          <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-primary bg-primary-50 px-2 py-0.5 rounded border border-primary-200">
                            <FontAwesomeIcon icon={faClock} fontSize={12} />
                            {tpl.startTime} - {tpl.endTime}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 mt-0.5 block">
                          Áp dụng cho {currentDay.name} ({currentDay.fullDate})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                          assignedInThisTemplate.length > 0
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-gray-100 text-gray-600 border-gray-200"
                        }`}
                      >
                        {assignedInThisTemplate.length} nhân viên
                      </span>

                      <div className="text-gray-400 p-1">
                        {isExpanded ? (
                          <FontAwesomeIcon icon={faChevronUp} fontSize={18} className="text-primary" />
                        ) : (
                          <FontAwesomeIcon icon={faChevronDown} fontSize={18} />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Nội dung xổ xuống: Danh sách nhân viên & Form thêm nhân viên vào ca */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50/40 p-4 space-y-3.5">
                      {/* Danh sách nhân viên trong ca */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Nhân sự trực ca:
                          </span>
                          <span className="text-[11px] text-emerald-700 flex items-center gap-1 font-semibold">
                            <FontAwesomeIcon icon={faRepeat} fontSize={12} /> Ca cố định lặp lại hàng tuần
                          </span>
                        </div>

                        {assignedInThisTemplate.length === 0 ? (
                          <div className="text-center py-4 bg-white border border-dashed border-gray-200 rounded-lg text-xs text-gray-400">
                            Chưa có nhân viên nào trong ca này. Hãy chọn nhân viên bên dưới để thêm vào.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {assignedInThisTemplate.map((ws) => (
                              <div
                                key={ws.id}
                                className="relative bg-white border border-gray-200 rounded-lg p-2.5 pb-5 flex items-center justify-between shadow-2xs hover:shadow-xs transition-shadow"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                                    {ws.employee.charAt(0)}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-semibold text-xs text-gray-900 truncate">
                                      {ws.employee}
                                    </div>
                                    <div className="text-[10px] text-gray-400 truncate">
                                      Chi nhánh {ws.branch} • {ws.scheduled}
                                    </div>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onRemoveShift(ws.id);
                                  }}
                                  className="text-gray-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                                  title="Xóa nhân viên khỏi ca này"
                                >
                                  <FontAwesomeIcon icon={faXmark} fontSize={15} />
                                </button>
                                {ws.isRecurring !== false && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onToggleRecurring?.(ws.id);
                                    }}
                                    className="absolute bottom-1 right-2 text-[9px] font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                                    title="Bấm để tắt lặp lại"
                                  >
                                    lặp lại
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>


                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── CỘT 3 (BÊN PHẢI): NGUYỆN VỌNG ĐĂNG KÝ TRONG THỨ ĐÓ (HIỆN RA CHUNG KHI BẤM VÀO THỨ) ── */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <div className="flex items-center justify-between px-1 mb-1">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                3. Nguyện vọng {currentDay.name} ({currentDay.date})
              </span>
              <span className="text-xs text-gray-500">
                Đối chiếu nguyện vọng & xếp ca 1-chạm
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-lg">
                {wishesSummary.working} muốn làm
              </span>
              {wishesSummary.off > 0 && (
                <span className="text-[11px] font-bold text-gray-600 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded-lg">
                  {wishesSummary.off} nghỉ
                </span>
              )}
            </div>
          </div>

          {/* Thống kê nhanh theo ca */}
          {Object.keys(wishesSummary.byShift).length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap p-2 bg-blue-50/60 border border-blue-100 rounded-xl text-xs">
              <span className="text-[11px] font-bold text-blue-800 shrink-0">Nhu cầu:</span>
              {Object.entries(wishesSummary.byShift).map(([sName, count]) => (
                <span
                  key={sName}
                  className="text-[11px] font-semibold bg-white text-gray-800 border border-blue-200 px-2 py-0.5 rounded-md shadow-2xs"
                >
                  {sName}: <strong className="text-primary">{count}</strong>
                </span>
              ))}
            </div>
          )}

          {/* Danh sách từng nhân viên có nguyện vọng */}
          <div className="space-y-2.5">
            {wishesForCurrentDay.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-xs text-gray-400 p-4">
                Chưa có nhân viên nào gửi đăng ký nguyện vọng cho {currentDay.name}.
              </div>
            ) : (
              wishesForCurrentDay.map((item) => {
                const shiftBadgeColor = () => {
                  if (item.isOff) return "bg-gray-100 text-gray-600 border-gray-200";
                  if (item.desiredShift.includes("Sáng"))
                    return "bg-amber-50 text-amber-800 border-amber-200";
                  if (item.desiredShift.includes("Chiều"))
                    return "bg-orange-50 text-orange-800 border-orange-200";
                  return "bg-indigo-50 text-indigo-800 border-indigo-200";
                };

                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-xl border bg-white shadow-2xs transition-all ${
                      item.assignedShift
                        ? "border-emerald-200 bg-emerald-50/20"
                        : item.isOff
                        ? "border-gray-200 opacity-80"
                        : "border-blue-200/80 hover:border-blue-300"
                    }`}
                  >
                    {/* Thông tin nhân viên */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                          {item.employeeName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <h5 className="font-bold text-xs text-gray-900 truncate">
                            {item.employeeName}
                          </h5>
                          <div className="text-[10px] text-gray-400 truncate">
                            {item.role} • {item.requestedCount} ca/tuần
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${shiftBadgeColor()}`}
                      >
                        {item.isOff ? "Nghỉ (OFF)" : item.desiredShift}
                      </span>
                    </div>

                    {/* Note nguyện vọng nếu có */}
                    {item.note && (
                      <div className="text-[11px] text-amber-800 bg-amber-50/70 border border-amber-200/60 rounded-md p-1.5 mb-2 leading-tight flex items-start gap-1">
                        <span className="shrink-0">💬</span>
                        <span className="italic">{item.note}</span>
                      </div>
                    )}

                    {/* Trạng thái & Thao tác xếp ca */}
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                      {item.assignedShift ? (
                        <div className="flex items-center justify-between w-full">
                          <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                            <FontAwesomeIcon icon={faCheck} fontSize={14} className="text-emerald-600" />
                            <span>Đã xếp: {item.assignedShift.templateName}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100/80 text-emerald-800 font-semibold inline-flex items-center gap-0.5">
                              <FontAwesomeIcon icon={faRepeat} fontSize={10} /> Lặp lại tuần
                            </span>
                          </span>
                          <button
                            type="button"
                            onClick={() => onRemoveShift(item.assignedShift!.id)}
                            className="text-[10px] text-red-500 hover:text-red-700 hover:underline cursor-pointer"
                          >
                            Bỏ xếp
                          </button>
                        </div>
                      ) : item.isOff ? (
                        <span className="text-[11px] text-gray-400 italic">
                          Nhân viên đăng ký nghỉ ngày này
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            if (onAddDirectShift) {
                              onAddDirectShift(
                                item.desiredShift,
                                item.employeeName,
                                currentDay.fullDate,
                                item.branch || (selectedBranch === "all" ? "HN-1" : selectedBranch),
                                true
                              );
                            }
                          }}
                          className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-2xs transition-all cursor-pointer"
                        >
                          <FontAwesomeIcon icon={faPlus} fontSize={13} />
                          <span>+ Xếp vào {item.desiredShift}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
