"use client";

import { useEffect, useState, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faRotateRight } from "@fortawesome/free-solid-svg-icons";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { departments as initialDepartments, employees as initialEmployees } from "@/mock-data/portal";
import type { Department, Employee } from "@/types";
import DepartmentList from "@/features/departments/components/DepartmentList";
import DepartmentModal from "@/features/departments/components/modals/DepartmentForm";
import { useCurrentUser } from "@/context/AuthContext";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";

export default function DepartmentsPage() {
  const { role } = useCurrentUser();
  const isManager = role === "manager";

  const [deptList, setDeptList] = useState<Department[]>(initialDepartments);
  const [employeeList, setEmployeeList] = useState<Employee[]>(initialEmployees);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ text: string; tone: "success" | "danger" } | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [lockTarget, setLockTarget] = useState<Department | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);

  const showToast = (text: string, tone: "success" | "danger" = "success") => {
    setToast({ text, tone });
    setTimeout(() => setToast(null), 3500);
  };

  const loadDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const [deptData, empData] = await Promise.allSettled([
        apiGet<Department[]>("/api/departments"),
        apiGet<Employee[]>("/api/employees"),
      ]);
      if (deptData.status === "fulfilled" && deptData.value && Array.isArray(deptData.value) && deptData.value.length > 0) {
        setDeptList(deptData.value);
      }
      if (empData.status === "fulfilled" && empData.value && Array.isArray(empData.value) && empData.value.length > 0) {
        setEmployeeList(empData.value);
      }
    } catch {
      // Giữ mock data nếu backend chưa chạy
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  const handleSave = async (data: Omit<Department, "id"> & { id?: string }) => {
    if (data.id) {
      try {
        await apiPut(`/api/departments/${encodeURIComponent(data.id)}`, data);
        setDeptList((prev) =>
          prev.map((d) => (d.id === data.id ? ({ ...d, ...data } as Department) : d))
        );
        showToast("Cập nhật phòng ban thành công!");
      } catch {
        setDeptList((prev) =>
          prev.map((d) => (d.id === data.id ? ({ ...d, ...data } as Department) : d))
        );
        showToast("Đã lưu phòng ban (cục bộ)!", "success");
      }
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
      try {
        await apiPost("/api/departments", data);
        setDeptList((prev) => [...prev, created]);
        showToast("Tạo phòng ban mới thành công!");
      } catch {
        setDeptList((prev) => [...prev, created]);
        showToast("Đã tạo phòng ban mới (cục bộ)!", "success");
      }
    }
    setModalOpen(false);
    setEditing(null);
  };

  const handleConfirmLock = async () => {
    if (!lockTarget) return;
    try {
      await apiPut(`/api/departments/${encodeURIComponent(lockTarget.id)}`, {
        ...lockTarget,
        status: "tạm dừng",
      });
      setDeptList((prev) =>
        prev.map((d) => (d.id === lockTarget.id ? { ...d, status: "tạm dừng" as const } : d))
      );
      showToast("Đã chuyển trạng thái phòng ban!");
    } catch {
      setDeptList((prev) =>
        prev.map((d) => (d.id === lockTarget.id ? { ...d, status: "tạm dừng" as const } : d))
      );
      showToast("Đã chuyển trạng thái phòng ban!");
    } finally {
      setLockTarget(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiDelete(`/api/departments/${encodeURIComponent(deleteTarget.id)}`);
      setDeptList((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      showToast("Xóa phòng ban thành công!");
    } catch {
      setDeptList((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      showToast("Đã xóa phòng ban!");
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
        title={isManager ? "Thông tin Cơ cấu Phòng ban Doanh nghiệp" : "Quản lý Phòng ban Doanh nghiệp"}
        breadcrumb={[{ label: "HRM", href: "#" }, { label: "Phòng ban" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="white" onClick={loadDepartments} disabled={loading}>
              <FontAwesomeIcon icon={faRotateRight} className={loading ? "animate-spin" : ""} /> Tải lại
            </Button>
            {!isManager && (
              <Button
                onClick={() => {
                  setEditing(null);
                  setModalOpen(true);
                }}
              >
                <FontAwesomeIcon icon={faPlus} fontSize={18} /> Thêm phòng ban mới
              </Button>
            )}
          </div>
        }
      />

      <DepartmentList
        departments={deptList}
        employees={employeeList}
        onEdit={(d) => {
          if (!isManager) {
            setEditing(d);
            setModalOpen(true);
          }
        }}
        onLock={!isManager ? setLockTarget : undefined}
        onDelete={!isManager ? setDeleteTarget : undefined}
      />

      <DepartmentModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        department={editing}
        employees={employeeList}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={!!lockTarget}
        title="Đổi trạng thái phòng ban"
        message={`Đổi trạng thái phòng ban "${lockTarget?.name}" sang Tạm dừng hoạt động?`}
        confirmLabel="Xác nhận"
        tone="warning"
        onConfirm={handleConfirmLock}
        onCancel={() => setLockTarget(null)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa phòng ban"
        message={`Xóa phòng ban "${deleteTarget?.name}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xác nhận xóa"
        tone="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
