"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { branches as initialBranches } from "@/mock-data/portal";
import type { Branch } from "@/types";
import BranchSection from "@/features/branches/components/BranchList";
import BranchModal from "@/features/branches/components/modals/BranchForm";
import { useCurrentUser } from "@/context/AuthContext";

export default function BranchesPage() {
  const { role } = useCurrentUser();
  const isManager = role === "manager";

  const [list, setList] = useState<Branch[]>(initialBranches);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [lockTarget, setLockTarget] = useState<Branch | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Branch | null>(null);

  const handleSave = (data: Omit<Branch, "id"> & { id?: string }) => {
    if (data.id) {
      setList((prev) => prev.map((b) => (b.id === data.id ? { ...b, ...data } as Branch : b)));
    } else {
      const created: Branch = { id: `b-${Date.now()}`, name: data.name, slug: data.slug, address: data.address, phone: data.phone, manager: data.manager, status: data.status, staff: 0 };
      setList((prev) => [...prev, created]);
    }
    setModalOpen(false);
    setEditing(null);
  };

  return (
    <div>
      <PageHeader
        title={isManager ? "Thông tin Hệ thống Chi nhánh" : "Quản lý Chi nhánh Doanh nghiệp"}
        breadcrumb={[{ label: "HRM", href: "#" }, { label: "Chi nhánh" }]}
        actions={
          !isManager ? (
            <Button onClick={() => { setEditing(null); setModalOpen(true); }}>
              <FontAwesomeIcon icon={faPlus} fontSize={18} /> Thêm chi nhánh mới
            </Button>
          ) : undefined
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

      <BranchModal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} branch={editing} onSave={handleSave} />

      <ConfirmDialog
        open={!!lockTarget}
        title="Khóa chi nhánh"
        message={`Khóa "${lockTarget?.name}"? Chi nhánh sẽ chuyển sang trạng thái vô hiệu hóa.`}
        confirmLabel="Xác nhận khóa"
        tone="warning"
        onConfirm={() => {
          if (lockTarget) setList((prev) => prev.map((b) => (b.id === lockTarget.id ? { ...b, status: "vô hiệu hóa" as const } : b)));
          setLockTarget(null);
        }}
        onCancel={() => setLockTarget(null)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa chi nhánh"
        message={`Xóa vĩnh viễn "${deleteTarget?.name}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xác nhận xóa"
        tone="danger"
        onConfirm={() => {
          if (deleteTarget) setList((prev) => prev.filter((e) => e.id !== deleteTarget.id));
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
