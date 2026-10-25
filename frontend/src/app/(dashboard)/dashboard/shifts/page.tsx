"use client";

import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDay, faCalendarWeek, faGear, faRotateRight } from "@fortawesome/free-solid-svg-icons";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
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
import { apiGet, apiPost } from "@/lib/api";

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
      "T2": "Ca Sáng",
      "T3": "Ca Sáng",
      "T4": "Ca Sáng",
      "T5": "Ca Sáng",
      "T6": "Ca Sáng",
      "T7": "Ca Sáng",
      "CN": "Nghỉ",
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
  const managerBranch = branchSlug.toUpperCase();
  const [activeTab, setActiveTab] = useState<"scheduling" | "general_schedule" | "templates">("scheduling");

  const [templates, setTemplates] = useState<ShiftTemplate[]>(initialTemplates);
  const [workShiftList, setWorkShiftList] = useState<WorkShift[]>(initialWorkShifts);
  const [weeklyRegistrations] = useState<WeeklyRegistration[]>(initialWeeklyRegistrations);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ text: string; tone: "success" | "danger" } | null>(null);

  const [schedulerDate, setSchedulerDate] = useState("17/08/2026");
  const [schedulerBranch, setSchedulerBranch] = useState(isManager ? managerBranch : "HN-1");

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

  const showToast = (text: string, tone: "success" | "danger" = "success") => {
    setToast({ text, tone });
    setTimeout(() => setToast(null), 3500);
  };

  const loadShifts = useCallback(async () => {
    setLoading(true);
    try {
      const [tplData, shiftData] = await Promise.all([
        apiGet<any[]>("/api/shift-templates").catch(() => null),
        apiGet<any[]>("/api/shifts").catch(() => null),
      ]);
      if (tplData && Array.isArray(tplData) && tplData.length > 0) {
        setTemplates(tplData);
      }
      if (shiftData && Array.isArray(shiftData) && shiftData.length > 0) {
        setWorkShiftList(shiftData.map((s: any) => ({
          id: s.id,
          employee: s.employee || s.employeeId || "Nhân sự",
          branch: s.branchSlug || s.branch || "HN-1",
          date: s.date || "17/08/2026",
          templateName: s.template || s.templateName || "Ca Sáng",
          scheduled: s.scheduled || `${s.scheduledStart || "07:00"}-${s.scheduledEnd || "14:00"}`,
          checkIn: s.checkIn || "—",
          checkOut: s.checkOut || "—",
          status: s.status === "hoàn thành" ? "Đúng giờ" : s.status || "Chưa làm",
          note: s.note || "",
          isRecurring: true,
        })));
      }
    } catch {
      // Giữ mock data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadShifts();
  }, [loadShifts]);

  // Manager chỉ thấy dữ liệu chi nhánh mình - lọc lịch sử hiển thị
  const displayedWorkShifts = isManager
    ? workShiftList.filter((s) => s.branch.toLowerCase().replace("-", "") === branchSlug.replace("-", ""))
    : workShiftList;
  const displayedRegistrations = isManager
    ? weeklyRegistrations.filter((r) => r.branch.toLowerCase().replace("-", "") === branchSlug.replace("-", ""))
    : weeklyRegistrations;

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

  const handleSaveTemplate = async () => {
    if (!newTemplateName) return;
    const tplData = { name: newTemplateName, startTime: newTemplateStart, endTime: newTemplateEnd };
    try {
      await apiPost("/api/shift-templates", tplData);
      showToast("Lưu khung ca mẫu thành công!");
    } catch {
      showToast("Đã lưu khung ca (cục bộ)!", "success");
    }

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

  const handleDeleteTemplate = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    showToast("Đã xóa khung ca mẫu!");
  };

  const handleRemoveShift = (workShiftId: string) => {
    setWorkShiftList((prev) => prev.filter((s) => s.id !== workShiftId));
    showToast("Đã hủy phân công ca làm!");
  };

  const handleAssignFromRegistration = (reg: WeeklyRegistration) => {
    setAssignEmployee(reg.employeeName);
    setAssignBranch(reg.branch);
    setAssignDate(schedulerDate);
    setAssignIsRecurring(true);
    const firstActiveShift = Object.entries(reg.days).find(([_, shift]) => shift !== "Nghỉ");
    if (firstActiveShift) {
      const match = templates.find((t) => t.name.toLowerCase() === firstActiveShift[1].toLowerCase());
      if (match) setAssignTemplateId(match.id);
    }
    setAssignShiftOpen(true);
  };

  const handleAssignShift = async () => {
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

    try {
      await apiPost("/api/shifts", {
        employeeId: assignEmployee,
        branchSlug: assignBranch,
        date: assignDate,
        template: template.name,
        scheduledStart: template.startTime,
        scheduledEnd: template.endTime,
      });
      showToast("Xếp ca làm việc thành công!");
    } catch {
      showToast("Đã xếp ca làm việc (cục bộ)!", "success");
    }

    setWorkShiftList((prev) => [created, ...prev]);
    setAssignShiftOpen(false);
    setAssignNote("");
    setAssignIsRecurring(true);
  };

  return (
    <div className="space-y-4">
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-lg text-sm font-semibold shadow-lg text-white transition-all ${
            toast.tone === "success" ? "bg-emerald-600" : "bg-rose-600"
          }`}
        >
          {toast.text}
        </div>
      )}

      <PageHeader
        title="Quản trị Ca làm việc & Chấm công Wi-Fi"
        breadcrumb={[{ label: "HRM", href: "#" }, { label: "Vận hành ca kíp" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="white" onClick={loadShifts} disabled={loading}>
              <FontAwesomeIcon icon={faRotateRight} className={loading ? "animate-spin" : ""} /> Tải lại
            </Button>
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
                <FontAwesomeIcon icon={faCalendarDay} fontSize={13} />
                <span>Xếp ca & Nguyện vọng</span>
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
                <FontAwesomeIcon icon={faCalendarWeek} fontSize={13} />
                <span>Lịch tổng & Chấm công</span>
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
                <FontAwesomeIcon icon={faGear} fontSize={13} />
                <span>Khung ca mẫu</span>
              </button>
            </div>
          </div>
        }
      />

      {activeTab === "scheduling" && (
        <div className="space-y-6">
          <RegistrationTimetableSection
            registrations={displayedRegistrations}
            defaultBranch={schedulerBranch}
            isManager={isManager}
            managerBranch={isManager ? "hn-1" : undefined}
          />

          <WeeklyRegistrationSection
            registrations={displayedRegistrations}
            onAssignFromRegistration={handleAssignFromRegistration}
          />
        </div>
      )}

      {activeTab === "general_schedule" && (
        <div className="space-y-6">
          <GeneralScheduleSection
            workShifts={displayedWorkShifts}
            templates={templates}
            defaultBranch={schedulerBranch}
            isManager={isManager}
            managerBranch={isManager ? "hn-1" : undefined}
            onOpenAssignModal={(templateId, date, branch) => {
              setAssignTemplateId(templateId);
              setAssignDate(date);
              setAssignBranch(branch);
              setAssignShiftOpen(true);
            }}
          />

          <WorkShiftSection
            workShifts={displayedWorkShifts}
            onDelete={handleRemoveShift}
          />
        </div>
      )}

      {activeTab === "templates" && (
        <ShiftTemplateSection
          templates={templates}
          onAdd={openAddTemplate}
          onEdit={openEditTemplate}
          onDelete={handleDeleteTemplate}
        />
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
        managerBranch={isManager ? "hn-1" : undefined}
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
