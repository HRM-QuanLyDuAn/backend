"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { departments as initialDepartments, employees } from "@/mock-data/portal";
import type { Department } from "@/types";
import DepartmentList from "@/features/departments/components/DepartmentList";
import DepartmentModal from "@/features/departments/components/modals/DepartmentForm";
import { useCurrentUser } from "@/context/AuthContext";

export default function DepartmentsPage() {
  const { role } = useCurrentUser();
  const isManager = role === "manager";

  const [deptList, setDeptList] = useState<Department[]>(initialDepartments);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [lockTarget, setLockTarget] = useState<Department | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);

  const handleSave = (data: Omit<Department, "id"> & { id?: string }) => {
    if (data.id) {
      setDeptList((prev) =>
        prev.map((d) => (d.id === data.id ? ({ ...d, ...data } as Department) : d))
      );
    } else {
      const created: Department = {
        id: `dept-${Date.now()}`,
        name: data.name,
        code: data.code,
        manager: data.manager,
        description: data.description,
        status: data.status,
        staff: 0,
        createdAt: new Date().toLocaleDateString("vi-VN"),
      };
      setDeptList((prev) => [...prev, created]);
    }
    setModalOpen(false);
    setEditing(null);
  };

  return (
    <div>
      <PageHeader
        title={isManager ? "Thông tin Cơ cấu Phòng ban Doanh nghiệp" : "Quản lý Phòng ban Doanh nghiệp"}
        breadcrumb={[{ label: "HRM", href: "#" }, { label: "Phòng ban" }]}
        actions={
          !isManager ? (
            <Button
              onClick={() => {
                setEditing(null);
                setModalOpen(true);
              }}
            >
              <FontAwesomeIcon icon={faPlus} fontSize={18} /> Thêm phòng ban mới
            </Button>
          ) : undefined
        }
      />

      <DepartmentList
        departments={deptList}
        employees={employees}
        onEdit={(d) => {
          if (!isManager) {
            setEditing(d);
            setModalOpen(true);
          }
        }}
        onLock={!isManager ? setLockTarget : undefined}
        onDelete={!isManager ? setDeleteTarget : undefined}
        isManager={isManager}
      />

      <DepartmentModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        department={editing}
        employees={employees}
        onSave={handleSave}
      />

      {/* Confirm Lock */}
      <ConfirmDialog
        open={!!lockTarget}
        title="Thay đổi trạng thái phòng ban"
        message={`Bạn có chắc muốn ${
          lockTarget?.status === "hoạt động" ? "tạm dừng hoạt động" : "kích hoạt lại"
        } "${lockTarget?.name}"?`}
        confirmLabel={lockTarget?.status === "hoạt động" ? "Tạm dừng" : "Kích hoạt"}
        tone="warning"
        onConfirm={() => {
          if (lockTarget) {
            setDeptList((prev) =>
              prev.map((d) =>
                d.id === lockTarget.id
                  ? {
                      ...d,
                      status: (d.status === "hoạt động" ? "tạm dừng" : "hoạt động") as "hoạt động" | "tạm dừng",
                    }
                  : d
              )
            );
          }
          setLockTarget(null);
        }}
        onCancel={() => setLockTarget(null)}
      />

      {/* Confirm Delete */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa phòng ban"
        message={`Xóa vĩnh viễn phòng ban "${deleteTarget?.name}"? Các nhân sự thuộc phòng ban này sẽ chuyển sang trạng thái chưa phân bổ phòng ban.`}
        confirmLabel="Xác nhận xóa"
        tone="danger"
        onConfirm={() => {
          if (deleteTarget) {
            setDeptList((prev) => prev.filter((d) => d.id !== deleteTarget.id));
          }
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
