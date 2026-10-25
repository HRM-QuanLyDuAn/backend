"use client";

import { useEffect, useState, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faRotateRight } from "@fortawesome/free-solid-svg-icons";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { employees as initialEmployees } from "@/mock-data/portal";
import type { Employee } from "@/types";
import EmployeeSection from "@/features/employees/components/EmployeeList";
import CreateEmployeeModal from "@/features/employees/components/modals/EmployeeCreate";
import DisableEmployeeDialog from "@/features/employees/components/modals/EmployeeDisable";
import EmployeeDetailModal from "@/features/employees/components/modals/EmployeeDetailModal";
import { useCurrentUser } from "@/context/AuthContext";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";

const normalizeEmployee = (e: any): Employee => ({
  ...e,
  branch: e?.branchSlug ?? e?.branch ?? "",
  department: e?.department || "",
  role: e?.role || "Nhân viên",
  systemRole: e?.systemRole || "staff",
  status: e?.status === "hoạt động" || e?.status === "đang làm" ? "đang làm" : "vô hiệu hóa",
  phone: e?.phone || "",
});

export default function EmployeesPage() {
  const { role, branchSlug } = useCurrentUser();
  const isManager = role === "manager";

  const [rawEmployees, setRawEmployees] = useState<Employee[]>(initialEmployees);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ text: string; tone: "success" | "danger" } | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [lockTarget, setLockTarget] = useState<Employee | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);

  const showToast = (text: string, tone: "success" | "danger" = "success") => {
    setToast({ text, tone });
    setTimeout(() => setToast(null), 3500);
  };

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGet<any[]>("/api/employees");
      if (data && Array.isArray(data) && data.length > 0) {
        setRawEmployees(data.map(normalizeEmployee));
      }
    } catch {
      // Giữ mock data nếu backend chưa chạy
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  // Nếu là Manager, chỉ hiển thị nhân viên thuộc chi nhánh phụ trách (HN-1)
  const empList = isManager
    ? rawEmployees.filter(
        (e) =>
          (e.branch || "").toLowerCase().replace(/-/g, "") === branchSlug.toLowerCase().replace(/-/g, "") ||
          e.branch === "HN-1"
      )
    : rawEmployees;

  const pageTitle = isManager
    ? "Nhân sự Chi nhánh Hoàn Kiếm (HN-1)"
    : "Danh sách Nhân sự Toàn công ty";

  const handleSaveEmployee = async (updated: Employee) => {
    try {
      await apiPut(`/api/employees/${encodeURIComponent(updated.id)}`, updated);
      setRawEmployees((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      setSelectedEmployee(updated);
      showToast("Cập nhật hồ sơ nhân sự thành công!");
    } catch {
      setRawEmployees((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      setSelectedEmployee(updated);
      showToast("Đã lưu hồ sơ (cục bộ)!", "success");
    }
  };

  const handleCreateEmployee = async (newEmp: any) => {
    try {
      const created = await apiPost<any>("/api/employees", newEmp);
      const normalized = normalizeEmployee(created || newEmp);
      setRawEmployees((prev) => [normalized, ...prev]);
      showToast("Tiếp nhận nhân sự mới thành công!");
    } catch {
      const fallback: Employee = {
        id: `emp-${Date.now()}`,
        name: newEmp.name,
        email: newEmp.email,
        phone: newEmp.phone || "",
        branch: newEmp.branchSlug || newEmp.branch || "HN-1",
        department: newEmp.department || "Kỹ thuật",
        role: newEmp.role || "Nhân viên",
        systemRole: newEmp.systemRole || "staff",
        status: "đang làm",
      };
      setRawEmployees((prev) => [fallback, ...prev]);
      showToast("Đã thêm nhân sự (cục bộ)!", "success");
    }
    setCreateOpen(false);
  };

  const handleConfirmLock = async () => {
    if (!lockTarget) return;
    try {
      await apiPost(`/api/employees/${encodeURIComponent(lockTarget.id)}/leave`, { reason: "Vô hiệu hóa tài khoản" });
      setRawEmployees((prev) =>
        prev.map((e) => (e.id === lockTarget.id ? { ...e, status: "vô hiệu hóa" as const } : e))
      );
      showToast("Đã vô hiệu hóa nhân sự!");
    } catch {
      setRawEmployees((prev) =>
        prev.map((e) => (e.id === lockTarget.id ? { ...e, status: "vô hiệu hóa" as const } : e))
      );
      showToast("Đã vô hiệu hóa nhân sự!");
    } finally {
      setLockTarget(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiDelete(`/api/employees/${encodeURIComponent(deleteTarget.id)}`);
      setRawEmployees((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      showToast("Đã xóa hồ sơ nhân viên!");
    } catch {
      setRawEmployees((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      showToast("Đã xóa hồ sơ nhân sự!");
    } finally {
      setDeleteTarget(null);
    }
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
        title={pageTitle}
        breadcrumb={[{ label: "HRM", href: "#" }, { label: "Nhân sự" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="white" onClick={loadEmployees} disabled={loading}>
              <FontAwesomeIcon icon={faRotateRight} className={loading ? "animate-spin" : ""} /> Tải lại
            </Button>
            <Button onClick={() => setCreateOpen(true)}>
              <FontAwesomeIcon icon={faPlus} fontSize={18} /> Thêm nhân viên mới
            </Button>
          </div>
        }
      />

      <EmployeeSection
        employees={empList}
        onOpenDetail={(e) => {
          setSelectedEmployee(e);
          setDetailOpen(true);
        }}
        onLock={setLockTarget}
        onDelete={!isManager ? setDeleteTarget : undefined}
      />

      <CreateEmployeeModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        isManager={isManager}
        managerBranch={isManager ? "hn-1" : undefined}
      />

      <EmployeeDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        employee={selectedEmployee}
        onSave={handleSaveEmployee}
      />

      <DisableEmployeeDialog
        employee={lockTarget}
        onConfirm={handleConfirmLock}
        onCancel={() => setLockTarget(null)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa hồ sơ nhân viên"
        message={`Xóa vĩnh viễn hồ sơ của "${deleteTarget?.name}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xác nhận xóa"
        tone="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
