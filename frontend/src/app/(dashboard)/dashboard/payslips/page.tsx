"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { payslips, attendanceConfig } from "@/mock-data/portal";
import type { Payslip } from "@/types";
import PayslipSection from "@/features/payslips/components/PayslipList";
import BulkClosePayslipModal from "@/features/payslips/components/modals/PayslipClose";
import AttendanceConfigModal, { type AttendanceConfigState } from "@/features/shared/components/modals/AttendanceForm";
import { EditPayslipModal, ConfirmClosePayslipDialog, PrintPayslipModal } from "@/features/payslips/components/modals/PayslipEdit";
import { useCurrentUser } from "@/context/AuthContext";

export default function PayslipsPage() {
  const { role, branchSlug } = useCurrentUser();
  const isManager = role === "manager";

  // Nếu là Manager, chỉ hiển thị phiếu lương nhân sự chi nhánh mình
  const filteredPayslips = isManager
    ? payslips.filter((p) => !p.branch || p.branch.toLowerCase().replace("-", "") === branchSlug.replace("-", "") || p.branch === "HN-1")
    : payslips;

  const [slips, setSlips] = useState<Payslip[]>(filteredPayslips);
  const [closeSlipOpen, setCloseSlipOpen] = useState(false);
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [editSlipTarget, setEditSlipTarget] = useState<Payslip | null>(null);
  const [editBonusStr, setEditBonusStr] = useState("");
  const [editPenaltyStr, setEditPenaltyStr] = useState("");
  const [editReasonStr, setEditReasonStr] = useState("");
  const [printSlipTarget, setPrintSlipTarget] = useState<Payslip | null>(null);
  const [confirmCloseSlipTarget, setConfirmCloseSlipTarget] = useState<Payslip | null>(null);
  const [attConfig, setAttConfig] = useState<AttendanceConfigState>({
    gracePeriod: attendanceConfig.gracePeriod,
    shiftSwapMode: attendanceConfig.shiftSwapMode,
    requireReasonSwap: true,
    allowDoubleCheckin: true,
  });

  const handleSavePayslipEdit = () => {
    if (!editSlipTarget) return;
    const bonusVal = Math.max(0, Number(editBonusStr) || 0);
    const penaltyVal = Math.max(0, Number(editPenaltyStr) || 0);
    if ((bonusVal > 0 || penaltyVal > 0) && !editReasonStr.trim()) {
      alert("Vui lòng nhập lý do điều chỉnh khi có tiền thưởng hoặc phạt!");
      return;
    }
    setSlips((prev) => prev.map((s) => (s.id === editSlipTarget.id ? { ...s, bonus: bonusVal, penalty: penaltyVal, reason: editReasonStr.trim() || undefined, total: s.salary + bonusVal - penaltyVal } : s)));
    setEditSlipTarget(null);
  };

  return (
    <div>
      <PageHeader
        title={isManager ? "Bảng lương Chi nhánh Hoàn Kiếm (HN-1)" : "Bảng lương & Chốt công Toàn công ty"}
        breadcrumb={[{ label: "HRM", href: "#" }, { label: "Phiếu lương" }]}
        actions={
          !isManager ? (
            <Button variant="white" onClick={() => setAttendanceOpen(true)}>
              <FontAwesomeIcon icon={faGear} fontSize={15} /> Cấu hình chấm công
            </Button>
          ) : undefined
        }
      />

      <PayslipSection
        payslips={slips}
        onEdit={(p) => {
          setEditSlipTarget(p);
          setEditBonusStr(p.bonus ? String(p.bonus) : "");
          setEditPenaltyStr(p.penalty ? String(p.penalty) : "");
          setEditReasonStr(p.reason ?? "");
        }}
        onCloseOne={setConfirmCloseSlipTarget}
        onPrint={setPrintSlipTarget}
        onBulkClose={!isManager ? () => setCloseSlipOpen(true) : undefined}
      />

      <BulkClosePayslipModal open={closeSlipOpen} onClose={() => setCloseSlipOpen(false)} />
      <AttendanceConfigModal open={attendanceOpen} onClose={() => setAttendanceOpen(false)} config={attConfig} setConfig={setAttConfig} />

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
        onConfirm={() => {
          if (confirmCloseSlipTarget) setSlips((prev) => prev.map((s) => (s.id === confirmCloseSlipTarget.id ? { ...s, status: "đã chốt" as const } : s)));
          setConfirmCloseSlipTarget(null);
        }}
        onCancel={() => setConfirmCloseSlipTarget(null)}
      />
      <PrintPayslipModal payslip={printSlipTarget} onClose={() => setPrintSlipTarget(null)} />
    </div>
  );
}
