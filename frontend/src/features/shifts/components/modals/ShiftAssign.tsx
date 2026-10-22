"use client";

import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { Field, Input, Select, Checkbox } from "@/components/ui/Form";
import { employees } from "@/mock-data/portal";
import type { ShiftTemplate } from "@/features/shifts/types";

interface Props {
  open: boolean;
  onClose: () => void;
  templates: ShiftTemplate[];
  employee: string;
  branch: string;
  date: string;
  templateId: string;
  note: string;
  isRecurring: boolean;
  isManager?: boolean;
  managerBranch?: string;
  lockedBranch?: string;
  onEmployeeChange: (v: string) => void;
  onBranchChange: (v: string) => void;
  onDateChange: (v: string) => void;
  onTemplateChange: (v: string) => void;
  onNoteChange: (v: string) => void;
  onRecurringChange: (v: boolean) => void;
  onSave: () => void;
}

export default function AssignShiftModal({
  open,
  onClose,
  templates,
  employee,
  branch,
  date,
  templateId,
  note,
  isRecurring,
  isManager = false,
  managerBranch,
  lockedBranch,
  onEmployeeChange,
  onBranchChange,
  onDateChange,
  onTemplateChange,
  onNoteChange,
  onRecurringChange,
  onSave,
}: Props) {
  const isBranchLocked = isManager || (lockedBranch !== undefined && lockedBranch !== "all" && lockedBranch !== "");
  const branchDisplay = isManager ? (managerBranch ?? branch) : (lockedBranch && lockedBranch !== "all" ? lockedBranch : branch);
  return (
    <Modal open={open} onClose={onClose} title="Phân công nhân viên vào ca" size="lg" footer={<><Button variant="white" onClick={onClose}>Hủy</Button><Button onClick={onSave}>Phân công</Button></>}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
        <Field label="Nhân viên" required>
          <Select value={employee} onChange={(e) => onEmployeeChange(e.target.value)}>
            {employees.filter((e) => e.status === "đang làm").map((emp) => (
              <option key={emp.id} value={emp.name}>{emp.name} ({emp.role})</option>
            ))}
          </Select>
        </Field>
        <Field label="Chi nhánh" required>
          {isBranchLocked ? (
            <div className="px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm font-bold text-gray-800 flex items-center justify-between">
              <span>Chi nhánh {branchDisplay}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-primary-50 text-primary border border-primary-200">{isManager ? "Cố định" : "Đã chọn"}</span>
            </div>
          ) : (
            <Select value={branch} onChange={(e) => onBranchChange(e.target.value)}>
              <option value="HN-1">Chi nhánh HN-1</option>
              <option value="HN-2">Chi nhánh HN-2</option>
              <option value="ĐN-1">Chi nhánh ĐN-1</option>
            </Select>
          )}
          {isManager && <p className="text-[11px] text-gray-400 mt-1">Manager chỉ phân ca cho chi nhánh phụ trách</p>}
          {!isManager && isBranchLocked && <p className="text-[11px] text-gray-400 mt-1">Đã khóa theo chi nhánh đã chọn ở bộ lọc tổng</p>}
        </Field>
        <Field label="Ngày làm việc" required>
          <Input type="text" placeholder="VD: 17/08/2026" value={date} onChange={(e) => onDateChange(e.target.value)} />
        </Field>
        <Field label="Khung ca áp dụng" required>
          <Select value={templateId} onChange={(e) => onTemplateChange(e.target.value)}>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>{t.name} ({t.startTime} - {t.endTime})</option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Ghi chú phân công (tùy chọn)">
        <Input placeholder="VD: Phụ trách ca chính, hỗ trợ chi nhánh..." value={note} onChange={(e) => onNoteChange(e.target.value)} />
      </Field>
      <div className="mt-1">
        <Checkbox
          label="Lặp lại"
          checked={isRecurring}
          onChange={(e) => onRecurringChange(e.target.checked)}
        />
        <p className="text-[11px] text-gray-400 mt-1 ml-6">Áp dụng ca này lặp lại hàng tuần cho nhân viên</p>
      </div>
    </Modal>
  );
}
