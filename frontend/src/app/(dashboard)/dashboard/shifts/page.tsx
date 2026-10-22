"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDay, faCalendarWeek, faGear } from "@fortawesome/free-solid-svg-icons";
import PageHeader from "@/components/ui/PageHeader";
import { employees } from "@/mock-data/portal";
import type { ShiftTemplate, WorkShift, WeeklyRegistration } from "@/features/shifts/types";
import ShiftTemplateSection from "@/features/shifts/components/ShiftTemplates";
import WorkShiftSection from "@/features/shifts/components/ShiftList";
import WeeklyRegistrationSection from "@/features/shifts/components/WeekWishes";
import GeneralScheduleSection from "@/features/shifts/components/ScheduleOverview";
import RegistrationTimetableSection from "@/features/shifts/components/RegTimetable";
import TemplateModal from "@/features/shifts/components/modals/TemplateForm";
import AssignShiftModal from "@/features/shifts/components/modals/ShiftAssign";
import ExportModal from "@/features/shifts/components/modals/ShiftExport";
import { useCurrentUser } from "@/context/AuthContext";

const initialTemplates: ShiftTemplate[] = [
  { id: "t1", name: "Ca Sáng", startTime: "07:00", endTime: "14:00" },
  { id: "t2", name: "Ca Chiều", startTime: "14:00", endTime: "22:00" },
  { id: "t3", name: "Ca Tối (Part-time)", startTime: "18:00", endTime: "23:00" },
];

const initialWorkShifts: WorkShift[] = [
  { id: "ws1", employee: "Nguyễn Thu Hà", branch: "HN-1", date: "17/08/2026", templateName: "Ca Sáng", scheduled: "07:00-14:00", checkIn: "06:58", checkOut: "14:02", status: "Đúng giờ", isRecurring: true },
  { id: "ws2", employee: "Phạm Quỳnh Trang", branch: "HN-1", date: "17/08/2026", templateName: "Ca Sáng", scheduled: "07:00-14:00", checkIn: "07:06", checkOut: "14:00", status: "Trễ", isRecurring: true },
  { id: "ws3", employee: "Hoàng Minh Đức", branch: "HN-1", date: "17/08/2026", templateName: "Ca Chiều", scheduled: "14:00-22:00", checkIn: "13:55", checkOut: "—", status: "Đúng giờ", isRecurring: true },
  { id: "ws4", employee: "Vũ Thành Công", branch: "HN-1", date: "17/08/2026", templateName: "Ca Chiều", scheduled: "14:00-22:00", checkIn: "14:01", checkOut: "—", status: "Đúng giờ", isRecurring: true },
];

const initialWeeklyRegistrations: WeeklyRegistration[] = [
  {
    id: "reg-1",
    employeeName: "Nguyễn Thu Hà",
    role: "Nhân viên phục vụ",
    branch: "HN-1",
    requestedCount: 5,
    registeredAt: "15/08 08:30",
    order: 1,
    note: "Thứ Ba bận học ca tối, xin ưu tiên xếp ca sáng; T7 sẵn sàng làm thêm ca",
    days: {
      "T2": "Ca Sáng",
      "T3": "Ca Sáng",
      "T4": "Ca Chiều",
      "T5": "Nghỉ",
      "T6": "Ca Sáng",
      "T7": "Ca Chiều",
      "CN": "Nghỉ",
    },
  },
  {
    id: "reg-2",
    employeeName: "Phạm Quỳnh Trang",
    role: "Thu ngân",
    branch: "HN-1",
    requestedCount: 6,
    registeredAt: "15/08 09:15",
    order: 2,
    note: "Xin ưu tiên xếp ca sáng để tiện đưa đón con nhỏ",
    days: {
      "T2": "Ca Chiều",
      "T3": "Ca Chiều",
      "T4": "Ca Sáng",
      "T5": "Ca Sáng",
      "T6": "Nghỉ",
      "T7": "Ca Chiều",
      "CN": "Ca Sáng",
    },
  },
  {
    id: "reg-3",
    employeeName: "Hoàng Minh Đức",
    role: "Nhân viên pha chế",
    branch: "HN-1",
    requestedCount: 5,
    registeredAt: "15/08 11:45",
    order: 3,
    note: "Sẵn sàng đổi ca hỗ trợ chi nhánh khi thiếu người trực",
    days: {
      "T2": "Ca Sáng",
      "T3": "Ca Sáng",
      "T4": "Nghỉ",
      "T5": "Ca Tối",
      "T6": "Ca Chiều",
      "T7": "Nghỉ",
      "CN": "Ca Chiều",
    },
  },
];

export default function ShiftsPage() {
  const { role, branchSlug } = useCurrentUser();
  const isManager = role === "manager";
  const managerBranch = branchSlug.toUpperCase(); // e.g. hn-1 -> HN-1
  const [activeTab, setActiveTab] = useState<"scheduling" | "general_schedule" | "templates">("scheduling");

  const [templates, setTemplates] = useState<ShiftTemplate[]>(initialTemplates);
  const [workShiftList, setWorkShiftList] = useState<WorkShift[]>(initialWorkShifts);
  const [weeklyRegistrations] = useState<WeeklyRegistration[]>(initialWeeklyRegistrations);

  // Bộ chọn ngày & chi nhánh cho khối Xếp ca - Manager cứng theo chi nhánh phụ trách
  const [schedulerDate, setSchedulerDate] = useState("17/08/2026");
  const [schedulerBranch, setSchedulerBranch] = useState(isManager ? managerBranch : "HN-1");

  // Manager chỉ thấy dữ liệu chi nhánh mình - lọc lịch sử hiển thị
  const displayedWorkShifts = isManager
    ? workShiftList.filter((s) => s.branch.toLowerCase().replace("-", "") === branchSlug.replace("-", ""))
    : workShiftList;
  const displayedRegistrations = isManager
    ? weeklyRegistrations.filter((r) => r.branch.toLowerCase().replace("-", "") === branchSlug.replace("-", ""))
    : weeklyRegistrations;

  const [exportOpen, setExportOpen] = useState(false);
  const [addTemplateOpen, setAddTemplateOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ShiftTemplate | null>(null);
  const [assignShiftOpen, setAssignShiftOpen] = useState(false);

  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateStart, setNewTemplateStart] = useState("07:00");
  const [newTemplateEnd, setNewTemplateEnd] = useState("14:00");

  const [assignEmployee, setAssignEmployee] = useState(employees[0]?.name ?? "Nguyễn Thu Hà");
  const [assignBranch, setAssignBranch] = useState("HN-1");
  const [assignDate, setAssignDate] = useState("17/08/2026");
  const [assignTemplateId, setAssignTemplateId] = useState(templates[0]?.id ?? "");
  const [assignNote, setAssignNote] = useState("");
  const [assignIsRecurring, setAssignIsRecurring] = useState(true);

  const openAddTemplate = () => {
    setEditingTemplate(null);
    setNewTemplateName("");
    setNewTemplateStart("07:00");
    setNewTemplateEnd("14:00");
    setAddTemplateOpen(true);
  };

  const openEditTemplate = (t: ShiftTemplate) => {
    setEditingTemplate(t);
    setNewTemplateName(t.name);
    setNewTemplateStart(t.startTime);
    setNewTemplateEnd(t.endTime);
    setAddTemplateOpen(true);
  };

  const handleSaveTemplate = () => {
    if (!newTemplateName) return;
    if (editingTemplate) {
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === editingTemplate.id
            ? { ...t, name: newTemplateName, startTime: newTemplateStart, endTime: newTemplateEnd }
            : t
        )
      );
    } else {
      setTemplates((prev) => [
        ...prev,
        { id: `t-${Date.now()}`, name: newTemplateName, startTime: newTemplateStart, endTime: newTemplateEnd },
      ]);
    }
    setAddTemplateOpen(false);
    setEditingTemplate(null);
    setNewTemplateName("");
  };

  // Xóa phân công ca
  const handleRemoveShift = (workShiftId: string) => {
    setWorkShiftList((prev) => prev.filter((s) => s.id !== workShiftId));
  };

  // Xếp ca nhanh từ bảng Nguyện vọng đăng ký
  const handleAssignFromRegistration = (reg: WeeklyRegistration) => {
    setAssignEmployee(reg.employeeName);
    setAssignBranch(reg.branch);
    setAssignDate(schedulerDate);
    setAssignIsRecurring(true);
    // Tìm ca đầu tiên đăng ký khác Nghỉ
    const firstActiveShift = Object.entries(reg.days).find(([_, shift]) => shift !== "Nghỉ");
    if (firstActiveShift) {
      const match = templates.find((t) => t.name.toLowerCase() === firstActiveShift[1].toLowerCase());
      if (match) setAssignTemplateId(match.id);
    }
    setAssignShiftOpen(true);
  };

  const handleAssignShift = () => {
    const template = templates.find((t) => t.id === assignTemplateId) || templates[0];
    const created: WorkShift = {
      id: `ws-${Date.now()}`,
      employee: assignEmployee,
      branch: assignBranch,
      date: assignDate,
      templateName: template.name,
      scheduled: `${template.startTime}-${template.endTime}`,
      checkIn: "—",
      checkOut: "—",
      status: "Chưa làm",
      note: assignNote,
      isRecurring: assignIsRecurring,
    };
    setWorkShiftList((prev) => [created, ...prev]);
    setAssignShiftOpen(false);
    setAssignNote("");
    setAssignIsRecurring(true);
  };

  return (
    <div>
      <PageHeader
        actions={
          <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl border border-gray-200">
            <button
              type="button"
              onClick={() => setActiveTab("scheduling")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                activeTab === "scheduling"
                  ? "bg-white text-primary shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <FontAwesomeIcon icon={faCalendarWeek} fontSize={15} />
              <span>Quản lý đăng ký ca</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("general_schedule")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                activeTab === "general_schedule"
                  ? "bg-white text-primary shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <FontAwesomeIcon icon={faCalendarDay} fontSize={15} />
              <span>Lịch làm việc chung</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("templates")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                activeTab === "templates"
                  ? "bg-white text-primary shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <FontAwesomeIcon icon={faGear} fontSize={15} />
              <span>Cấu hình ca mẫu</span>
            </button>
          </div>
        }
      />

      {/* Tab 1: Lịch làm việc chung toàn chi nhánh (Giống Mobile) */}
      {activeTab === "general_schedule" && (
        <GeneralScheduleSection
          workShifts={displayedWorkShifts}
          templates={templates}
          defaultBranch={schedulerBranch}
          isManager={isManager}
          managerBranch={managerBranch}
          onOpenAssignModal={(templateId, date, branch) => {
            const effectiveBranch = isManager ? managerBranch : branch;
            setAssignTemplateId(templateId);
            setAssignDate(date);
            setAssignBranch(effectiveBranch);
            setAssignIsRecurring(true);
            setAssignShiftOpen(true);
          }}
        />
      )}

      {/* Tab 2: Quản lý đăng ký ca (Thời gian biểu đăng ký + Lịch sử phân công) */}
      {activeTab === "scheduling" && (
        <div className="flex flex-col gap-6">
          {/* Thời gian biểu đăng ký ca - lưu lịch sử đăng ký như Lịch làm việc chung */}
          <RegistrationTimetableSection registrations={displayedRegistrations} defaultBranch={schedulerBranch} isManager={isManager} managerBranch={managerBranch} />

          {/* Bảng tổng hợp nguyện vọng toàn cảnh cả tuần (Thu gọn / Mở rộng để tham khảo ma trận) */}
          <details className="group bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            <summary className="px-5 py-3.5 flex items-center justify-between cursor-pointer select-none hover:bg-gray-50/80 transition-colors font-bold text-xs text-gray-700">
              <span className="flex items-center gap-2">
                <FontAwesomeIcon icon={faCalendarDay} fontSize={16} className="text-primary" />
                <span>Bảng ma trận nguyện vọng cả tuần của toàn bộ nhân viên (Thứ 2 - CN)</span>
              </span>
              <span className="text-[11px] text-gray-400 group-open:hidden">
                Bấm để mở rộng bảng tổng hợp toàn cảnh ▼
              </span>
            </summary>
            <div className="p-4 pt-2 border-t border-gray-100">
              <WeeklyRegistrationSection
                registrations={displayedRegistrations}
                onAssignFromRegistration={handleAssignFromRegistration}
              />
            </div>
          </details>

          {/* Khối 3: Bảng danh sách chi tiết toàn bộ phân công */}
          <WorkShiftSection
            workShifts={displayedWorkShifts}
            onDelete={handleRemoveShift}
          />
        </div>
      )}

      {/* Tab 3: Cấu hình ca mẫu (Đã loại bỏ khối Lịch sử ca) */}
      {activeTab === "templates" && (
        <div className="flex flex-col gap-6">
          <ShiftTemplateSection
            templates={templates}
            onAdd={openAddTemplate}
            onEdit={openEditTemplate}
            onDelete={(id) => setTemplates((prev) => prev.filter((t) => t.id !== id))}
          />
        </div>
      )}

      <TemplateModal
        open={addTemplateOpen}
        onClose={() => setAddTemplateOpen(false)}
        editing={!!editingTemplate}
        name={newTemplateName}
        start={newTemplateStart}
        end={newTemplateEnd}
        onNameChange={setNewTemplateName}
        onStartChange={setNewTemplateStart}
        onEndChange={setNewTemplateEnd}
        onSave={handleSaveTemplate}
      />

      <AssignShiftModal
        open={assignShiftOpen}
        onClose={() => setAssignShiftOpen(false)}
        templates={templates}
        employee={assignEmployee}
        branch={assignBranch}
        date={assignDate}
        templateId={assignTemplateId}
        note={assignNote}
        isRecurring={assignIsRecurring}
        isManager={isManager}
        managerBranch={managerBranch}
        lockedBranch={schedulerBranch}
        onEmployeeChange={setAssignEmployee}
        onBranchChange={setAssignBranch}
        onDateChange={setAssignDate}
        onTemplateChange={setAssignTemplateId}
        onNoteChange={setAssignNote}
        onRecurringChange={setAssignIsRecurring}
        onSave={handleAssignShift}
      />

      <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} />
    </div>
  );
}
