"use client";

import { useEffect, useState, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faRotateRight } from "@fortawesome/free-solid-svg-icons";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { branches as initialBranches } from "@/mock-data/portal";
import type { Branch } from "@/types";
import BranchSection from "@/features/branches/components/BranchList";
import BranchModal from "@/features/branches/components/modals/BranchForm";
import { useCurrentUser } from "@/context/AuthContext";
import { apiGet, apiPost, apiPut, apiDelete, GatewayError } from "@/lib/api";

export default function BranchesPage() {
  const { role } = useCurrentUser();
  const isManager = role === "manager";

  const [list, setList] = useState<Branch[]>(initialBranches);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ text: string; tone: "success" | "danger" } | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [lockTarget, setLockTarget] = useState<Branch | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Branch | null>(null);

  const showToast = (text: string, tone: "success" | "danger" = "success") => {
    setToast({ text, tone });
    setTimeout(() => setToast(null), 3500);
  };

  const loadBranches = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGet<Branch[]>("/api/branches");
      if (data && Array.isArray(data) && data.length > 0) {
        setList(data);
      }
    } catch {
      // Giữ mock data nếu backend chưa chạy
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBranches();
  }, [loadBranches]);

  const handleSave = async (data: Omit<Branch, "id"> & { id?: string }) => {
    if (data.id && editing?.slug) {
      try {
        await apiPut(`/api/branches/${encodeURIComponent(editing.slug)}`, data);
        setList((prev) => prev.map((b) => (b.id === data.id ? ({ ...b, ...data } as Branch) : b)));
        showToast("Cập nhật chi nhánh thành công!");
      } catch (err: any) {
        setList((prev) => prev.map((b) => (b.id === data.id ? ({ ...b, ...data } as Branch) : b)));
        showToast("Đã lưu chi nhánh (cục bộ)!", "success");
      }
    } else {
      const created: Branch = {
        id: `b-${Date.now()}`,
        name: data.name,
        slug: data.slug,
        address: data.address,
        phone: data.phone,
        manager: data.manager,
        status: data.status,
        staff: 0,
      };
      try {
        await apiPost("/api/branches", data);
        setList((prev) => [...prev, created]);
        showToast("Thêm mới chi nhánh thành công!");
      } catch (err: any) {
        setList((prev) => [...prev, created]);
        showToast("Đã thêm chi nhánh mới (cục bộ)!", "success");
      }
    }
    setModalOpen(false);
    setEditing(null);
  };

  const handleConfirmLock = async () => {
    if (!lockTarget) return;
    try {
      await apiPut(`/api/branches/${encodeURIComponent(lockTarget.slug)}`, {
        ...lockTarget,
        status: "vô hiệu hóa",
      });
      setList((prev) => prev.map((b) => (b.id === lockTarget.id ? { ...b, status: "vô hiệu hóa" as const } : b)));
      showToast("Đã vô hiệu hóa chi nhánh!");
    } catch {
      setList((prev) => prev.map((b) => (b.id === lockTarget.id ? { ...b, status: "vô hiệu hóa" as const } : b)));
      showToast("Đã vô hiệu hóa chi nhánh!");
    } finally {
      setLockTarget(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiDelete(`/api/branches/${encodeURIComponent(deleteTarget.slug)}`);
      setList((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      showToast("Xóa chi nhánh thành công!");
    } catch {
      setList((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      showToast("Đã xóa chi nhánh!");
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
        title={isManager ? "Thông tin Hệ thống Chi nhánh" : "Quản lý Chi nhánh Doanh nghiệp"}
        breadcrumb={[{ label: "HRM", href: "#" }, { label: "Chi nhánh" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="white" onClick={loadBranches} disabled={loading}>
              <FontAwesomeIcon icon={faRotateRight} className={loading ? "animate-spin" : ""} /> Tải lại
            </Button>
            {!isManager && (
              <Button
                onClick={() => {
                  setEditing(null);
                  setModalOpen(true);
                }}
              >
                <FontAwesomeIcon icon={faPlus} fontSize={18} /> Thêm chi nhánh mới
              </Button>
            )}
          </div>
        }
      />

      <BranchSection
        branches={list}
        onEdit={(b) => {
          if (!isManager) {
            setEditing(b);
            setModalOpen(true);
          }
        }}
        onLock={!isManager ? setLockTarget : undefined}
        onDelete={!isManager ? setDeleteTarget : undefined}
      />

      <BranchModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        branch={editing}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={!!lockTarget}
        title="Khóa chi nhánh"
        message={`Khóa "${lockTarget?.name}"? Chi nhánh sẽ chuyển sang trạng thái vô hiệu hóa.`}
        confirmLabel="Xác nhận khóa"
        tone="warning"
        onConfirm={handleConfirmLock}
        onCancel={() => setLockTarget(null)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa chi nhánh"
        message={`Xóa vĩnh viễn "${deleteTarget?.name}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xác nhận xóa"
        tone="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
