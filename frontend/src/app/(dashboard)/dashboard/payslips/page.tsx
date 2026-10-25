"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear, faPlus } from "@fortawesome/free-solid-svg-icons";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import type { Payslip } from "@/types";
import PayslipSection from "@/features/payslips/components/PayslipList";
import BulkClosePayslipModal from "@/features/payslips/components/modals/PayslipClose";
import GeneratePayslipModal, { type GenerateInput } from "@/features/payslips/components/modals/PayslipGenerate";
import AttendanceConfigModal, { type AttendanceConfigState } from "@/features/shared/components/modals/AttendanceForm";
import { EditPayslipModal, ConfirmClosePayslipDialog, PrintPayslipModal } from "@/features/payslips/components/modals/PayslipEdit";
import { useCurrentUser } from "@/context/AuthContext";
import { apiGet, apiPost, GATEWAY_URL, GatewayError } from "@/lib/api";

async function apiPut<T>(path: string, payload: unknown): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(`${GATEWAY_URL}${path}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const text = await res.text();
    let body: unknown = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = null;
    }
    if (!res.ok) {
      const err = (body as { error?: { code: string; message: string } } | null)?.error;
      throw new GatewayError(err?.code || `HTTP_${res.status}`, err?.message || `Lỗi hệ thống (${res.status})`, res.status);
    }
    if (body !== null && typeof body === "object" && "data" in body) {
      return (body as { data: T }).data;
    }
    return body as T;
  } finally {
    clearTimeout(timer);
  }
}

interface PayslipRow {
  id: string;
  employeeId: string;
  month: string;
  baseSalary: number;
  bonus: number;
  totalPenalty: number;
  netSalary: number;
  status: string;
  issuedAt: string;
}

interface EmployeeRow {
  id: string;
  name: string;
  branch: string;
}

export default function PayslipsPage() {
  const { role, branchSlug } = useCurrentUser();
  const isManager = role === "manager";

  const [slips, setSlips] = useState<Payslip[]>([]);
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [closeSlipOpen, setCloseSlipOpen] = useState(false);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [generateSaving, setGenerateSaving] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [editSlipTarget, setEditSlipTarget] = useState<Payslip | null>(null);
  const [editBonusStr, setEditBonusStr] = useState("");
  const [editPenaltyStr, setEditPenaltyStr] = useState("");
  const [editReasonStr, setEditReasonStr] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [printSlipTarget, setPrintSlipTarget] = useState<Payslip | null>(null);
  const [confirmCloseSlipTarget, setConfirmCloseSlipTarget] = useState<Payslip | null>(null);
  const [attConfig, setAttConfig] = useState<AttendanceConfigState>({
    gracePeriod: "5",
    shiftSwapMode: "manager",
    requireReasonSwap: true,
    allowDoubleCheckin: true,
  });

  const fetchConfig = useCallback(async () => {
    try {
      const c = await apiGet<any>("/api/attendance/config");
      if (c) {
        setAttConfig((prev) => ({
          ...prev,
          gracePeriod: String(c.gracePeriodMinutes ?? c.gracePeriod ?? prev.gracePeriod),
          shiftSwapMode: c.shiftSwapMode || prev.shiftSwapMode,
          requireReasonSwap: c.requireReasonSwap ?? prev.requireReasonSwap,
          allowDoubleCheckin: c.allowDoubleCheckin ?? prev.allowDoubleCheckin,
        }));
      }
    } catch {
      // giữ mặc định
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [rows, emps] = await Promise.all([
        apiGet<PayslipRow[]>("/api/payroll/payslips"),
        apiGet<EmployeeRow[]>("/api/employees"),
      ]);
      const nameById = new Map(emps.map((e) => [e.id, e] as const));
      setEmployees(emps);
      setSlips(
        (rows || []).map((r) => {
          const emp = nameById.get(r.employeeId);
          return {
            id: r.id,
            employee: emp?.name || r.employeeId,
            branch: emp?.branch,
            month: r.month,
            days: 26,
            salary: Number(r.baseSalary) || 0,
            bonus: Number(r.bonus) || 0,
            penalty: Number(r.totalPenalty) || 0,
            total: Number(r.netSalary) || 0,
            status: (r.status === "đã chốt" ? "đã chốt" : "chưa chốt") as Payslip["status"],
          };
        })
      );
    } catch (e) {
      setError(e instanceof GatewayError ? e.message : "Lỗi tải phiếu lương");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  // Manager chỉ thấy phiếu của chi nhánh mình
  const visibleSlips = useMemo(() => {
    if (!isManager) return slips;
    const norm = (s: string) => s.toLowerCase().replace("-", "");
    return slips.filter((p) => !p.branch || norm(p.branch) === norm(branchSlug));
  }, [slips, isManager, branchSlug]);

  const handleSavePayslipEdit = async () => {
    if (!editSlipTarget || savingEdit) return;
    const bonusVal = Math.max(0, Number(editBonusStr) || 0);
    const penaltyVal = Math.max(0, Number(editPenaltyStr) || 0);
    if ((bonusVal > 0 || penaltyVal > 0) && !editReasonStr.trim()) {
      alert("Vui lòng nhập lý do điều chỉnh khi có tiền thưởng hoặc phạt!");
      return;
    }
    setSavingEdit(true);
    try {
      const updated = await apiPut<PayslipRow>(`/api/payroll/payslips/${editSlipTarget.id}`, {
        bonus: bonusVal,
        totalPenalty: penaltyVal,
      });
      setSlips((prev) =>
        prev.map((s) =>
          s.id === editSlipTarget.id
            ? {
                ...s,
                bonus: Number(updated.bonus) || 0,
                penalty: Number(updated.totalPenalty) || 0,
                total: Number(updated.netSalary) || 0,
                reason: editReasonStr.trim() || undefined,
              }
            : s
        )
      );
      setEditSlipTarget(null);
    } catch (e) {
      alert(e instanceof GatewayError ? e.message : "Lỗi điều chỉnh phiếu lương.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleConfirmCloseOne = async () => {
    if (!confirmCloseSlipTarget) return;
    try {
      await apiPut(`/api/payroll/payslips/${confirmCloseSlipTarget.id}/status`, { status: "đã chốt" });
      setSlips((prev) => prev.map((s) => (s.id === confirmCloseSlipTarget.id ? { ...s, status: "đã chốt" as const } : s)));
      setConfirmCloseSlipTarget(null);
    } catch (e) {
      alert(e instanceof GatewayError ? e.message : "Lỗi chốt phiếu lương.");
    }
  };

  const handleGenerate = async (input: GenerateInput) => {
    setGenerateSaving(true);
    setGenerateError(null);
    try {
      await apiPost("/api/payroll/payslips", {
        employeeId: input.employeeId,
        month: input.month,
        baseSalary: input.baseSalary,
        bonus: input.bonus,
        totalPenalty: input.sumPenalty ? 0 : 0,
      });
      await fetchData();
      setGenerateOpen(false);
    } catch (e) {
      setGenerateError(e instanceof GatewayError ? e.message : "Lỗi tạo phiếu lương");
    } finally {
      setGenerateSaving(false);
    }
  };

  const currentMonthDefault = () => {
    const now = new Date();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    return `${m}/${now.getFullYear()}`;
  };

  return (
    <div>
      <PageHeader
        title={isManager ? "Bảng lương Chi nhánh Hoàn Kiếm (HN-1)" : "Bảng lương & Chốt công Toàn công ty"}
        breadcrumb={[{ label: "HRM", href: "#" }, { label: "Phiếu lương" }]}
        actions={
          <div className="flex items-center gap-2">
            {!isManager && (
              <>
                <Button variant="white" onClick={() => setAttendanceOpen(true)}>
                  <FontAwesomeIcon icon={faGear} fontSize={16} /> Cấu hình chấm công
                </Button>
                <Button onClick={() => setGenerateOpen(true)}>
                  <FontAwesomeIcon icon={faPlus} fontSize={14} /> Tạo phiếu lương
                </Button>
              </>
            )}
          </div>
        }
      />

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-center justify-between">
          <span>{error}</span>
          <Button variant="white" onClick={fetchData} className="text-xs">Thử lại</Button>
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-xs text-gray-500">Đang tải phiếu lương qua Gateway...</div>
      ) : (
        <PayslipSection
          payslips={visibleSlips}
          onEdit={(s) => {
            setEditSlipTarget(s);
            setEditBonusStr(String(s.bonus));
            setEditPenaltyStr(String(s.penalty));
            setEditReasonStr(s.reason || "");
          }}
          onPrint={(s) => setPrintSlipTarget(s)}
          onCloseOne={(s) => setConfirmCloseSlipTarget(s)}
          onBulkClose={() => setCloseSlipOpen(true)}
        />
      )}

      <BulkClosePayslipModal
        open={closeSlipOpen}
        onClose={() => setCloseSlipOpen(false)}
      />

      <GeneratePayslipModal
        open={generateOpen}
        onClose={() => setGenerateOpen(false)}
        employees={employees}
        defaultMonth={currentMonthDefault()}
        saving={generateSaving}
        error={generateError}
        onConfirm={handleGenerate}
      />

      <AttendanceConfigModal
        open={attendanceOpen}
        onClose={() => setAttendanceOpen(false)}
        config={attConfig}
        setConfig={setAttConfig}
      />

      <EditPayslipModal
        payslip={editSlipTarget}
        bonusStr={editBonusStr}
        penaltyStr={editPenaltyStr}
        reasonStr={editReasonStr}
        onBonusChange={setEditBonusStr}
        onPenaltyChange={setEditPenaltyStr}
        onReasonChange={setEditReasonStr}
        onClose={() => setEditSlipTarget(null)}
        onSave={handleSavePayslipEdit}
      />

      <ConfirmClosePayslipDialog
        payslip={confirmCloseSlipTarget}
        onConfirm={handleConfirmCloseOne}
        onCancel={() => setConfirmCloseSlipTarget(null)}
      />

      <PrintPayslipModal
        payslip={printSlipTarget}
        onClose={() => setPrintSlipTarget(null)}
      />
    </div>
  );
}
