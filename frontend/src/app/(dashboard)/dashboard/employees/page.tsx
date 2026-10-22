"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { employees } from "@/mock-data/portal";
import type { Employee } from "@/types";
import EmployeeSection from "@/features/employees/components/EmployeeList";
import CreateEmployeeModal from "@/features/employees/components/modals/EmployeeCreate";
import DisableEmployeeDialog from "@/features/employees/components/modals/EmployeeDisable";
import EmployeeDetailModal from "@/features/employees/components/modals/EmployeeDetailModal";
import { useCurrentUser } from "@/context/AuthContext";

export default function EmployeesPage() {
  const { role, branchSlug } = useCurrentUser();
  const isManager = role === "manager";

  // Nếu là Manager, chỉ hiển thị nhân viên thuộc chi nhánh phụ trách (HN-1)
  const filteredEmployees = isManager
    ? employees.filter(
        (e) =>
          e.branch.toLowerCase().replace("-", "") === branchSlug.replace("-", "") ||
          e.branch === "HN-1"
      )
    : employees;

  const [empList, setEmpList] = useState<Employee[]>(filteredEmployees);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [lockTarget, setLockTarget] = useState<Employee | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);

  const pageTitle = isManager
    ? "Nhân sự Chi nhánh Hoàn Kiếm (HN-1)"
    : "Danh sách Nhân sự Toàn công ty";

  const handleSaveEmployee = (updated: Employee) => {
    setEmpList((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    setSelectedEmployee(updated);
  };

  return (
    <div>
      <PageHeader
        title={pageTitle}
        breadcrumb={[{ label: "HRM", href: "#" }, { label: "Nhân sự" }]}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <FontAwesomeIcon icon={faPlus} fontSize={18} /> Thêm nhân viên mới
          </Button>
        }
      />

      <EmployeeSection
        employees={empList}
        onOpenDetail={(e) => {
          setSelectedEmployee(e);
          setDetailOpen(true);
        }}
        onLock={setLockTarget}
        onDelete={setDeleteTarget}
        isManager={isManager}
        managerBranch={branchSlug.toUpperCase()}
      />

      <EmployeeDetailModal
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setSelectedEmployee(null);
        }}
        employee={selectedEmployee}
        onSave={handleSaveEmployee}
        isManager={isManager}
        managerBranch={branchSlug.toUpperCase()}
      />

      <CreateEmployeeModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        isManager={isManager}
        managerBranch={branchSlug.toUpperCase()}
        defaultBranch={branchSlug}
      />

      <DisableEmployeeDialog
        employee={lockTarget}
        onConfirm={() => {
          if (lockTarget) {
            setEmpList((prev) =>
              prev.map((e) =>
                e.id === lockTarget.id ? { ...e, status: "vô hiệu hóa" as const } : e
              )
            );
          }
          setLockTarget(null);
        }}
        onCancel={() => setLockTarget(null)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa nhân viên"
        message={`Xóa vĩnh viễn "${deleteTarget?.name}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xác nhận xóa"
        tone="danger"
        onConfirm={() => {
          if (deleteTarget) {
            setEmpList((prev) => prev.filter((e) => e.id !== deleteTarget.id));
          }
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
