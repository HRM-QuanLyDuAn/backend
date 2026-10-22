"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { shiftRequests, attendanceConfig } from "@/mock-data/portal";
import type { ShiftRequest } from "@/types";
import ShiftRequestSection from "@/features/shift-requests/components/RequestList";
import AttendanceConfigModal, { type AttendanceConfigState } from "@/features/shared/components/modals/AttendanceForm";
import { useCurrentUser } from "@/context/AuthContext";

export default function RequestsPage() {
  const { role, branchSlug } = useCurrentUser();
  const isManager = role === "manager";

  // Nếu là Manager: chỉ thấy các yêu cầu của nhân viên chi nhánh mình
  const initialRequests = isManager
    ? shiftRequests.filter((r) => r.branch.toLowerCase().replace("-", "") === branchSlug.replace("-", "") || r.branch === "HN-1")
    : shiftRequests;

  const [requests, setRequests] = useState<ShiftRequest[]>(initialRequests);
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [attConfig, setAttConfig] = useState<AttendanceConfigState>({
    gracePeriod: attendanceConfig.gracePeriod,
    shiftSwapMode: attendanceConfig.shiftSwapMode,
    requireReasonSwap: true,
    allowDoubleCheckin: true,
  });

  const handleApprove = (id: string) =>
    setRequests((prev) => prev.map((x) => (x.id === id ? { ...x, status: "đã duyệt" as const } : x)));

  const handleReject = (id: string) =>
    setRequests((prev) => prev.map((x) => (x.id === id ? { ...x, status: "từ chối" as const } : x)));

  return (
    <div>
      <PageHeader
        title={isManager ? "Phê duyệt yêu cầu Chi nhánh Hoàn Kiếm (HN-1)" : "Phê duyệt yêu cầu Toàn hệ thống"}
        breadcrumb={[{ label: "HRM", href: "#" }, { label: "Phê duyệt yêu cầu" }]}
        actions={
          !isManager ? (
            <Button variant="white" onClick={() => setAttendanceOpen(true)}>
              <FontAwesomeIcon icon={faGear} fontSize={16} /> Cấu hình chấm công
            </Button>
          ) : undefined
        }
      />

      <ShiftRequestSection requests={requests} onApprove={handleApprove} onReject={handleReject} />

      <AttendanceConfigModal open={attendanceOpen} onClose={() => setAttendanceOpen(false)} config={attConfig} setConfig={setAttConfig} />
    </div>
  );
}
