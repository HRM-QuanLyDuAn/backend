"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { regulations as initialRegulations } from "@/mock-data/portal";
import type { Regulation } from "@/types";
import RegulationSection from "@/features/regulations/components/RegulationList";
import RegulationDetailModal from "@/features/regulations/components/modals/RegulationDetail";
import RegulationFormModal, { type RegulationFormInput } from "@/features/regulations/components/modals/RegulationForm";

export default function RegulationsManagementPage() {
  const [items, setItems] = useState<Regulation[]>(initialRegulations);

  // Modal xem chi tiết
  const [viewingItem, setViewingItem] = useState<Regulation | null>(null);

  // Modal tạo / chỉnh sửa
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Regulation | null>(null);

  // Mở modal tạo mới
  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setIsEditModalOpen(true);
  };

  // Mở modal chỉnh sửa
  const handleOpenEditModal = (item: Regulation) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  // Từ modal xem chi tiết → mở modal chỉnh sửa
  const handleEditFromView = (item: Regulation) => {
    setViewingItem(null);
    handleOpenEditModal(item);
  };

  // Lưu tạo mới hoặc cập nhật
  const handleSaveItem = (input: RegulationFormInput) => {
    if (editingItem) {
      // Cập nhật
      setItems((prev) =>
        prev.map((i) =>
          i.id === editingItem.id
            ? {
                ...i,
                code: input.code.trim() || i.code,
                title: input.title.trim(),
                category: input.category,
                summary: input.summary.trim() || input.title.trim(),
                content: input.content.trim(),
                status: input.status,
                scope: input.scope,
                effectiveDate: input.effectiveDate,
                author: input.author,
                version: input.version,
                pinned: input.pinned,
                updatedAt: "14/09/2026",
              }
            : i
        )
      );
    } else {
      // Thêm mới
      const newItem: Regulation = {
        id: `reg-${Date.now()}`,
        code: input.code.trim() || `NQ-2026-00${items.length + 1}`,
        title: input.title.trim(),
        category: input.category,
        summary: input.summary.trim() || input.title.trim(),
        content: input.content.trim(),
        status: input.status,
        scope: input.scope,
        effectiveDate: input.effectiveDate,
        author: input.author,
        createdAt: "14/09/2026",
        updatedAt: "14/09/2026",
        version: input.version,
        pinned: input.pinned,
        attachments: 1,
      };
      setItems([newItem, ...items]);
    }

    setIsEditModalOpen(false);
  };

  // Bật/tắt ghim
  const handleTogglePin = (id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, pinned: !i.pinned } : i))
    );
  };

  // Xóa nội quy
  const handleDeleteItem = (id: string, title: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa văn bản nội quy "${title}" không?`)) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      if (viewingItem?.id === id) setViewingItem(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý Nội quy & Quy định"
        actions={
          <Button
            variant="primary"
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5"
          >
            <FontAwesomeIcon icon={faPlus} fontSize={18} />
            Tạo văn bản nội quy mới
          </Button>
        }
      />

      <RegulationSection
        items={items}
        onView={setViewingItem}
        onEdit={handleOpenEditModal}
        onDelete={handleDeleteItem}
        onTogglePin={handleTogglePin}
      />

      {/* MODAL 1: XEM TOÀN VĂN QUY ĐỊNH */}
      <RegulationDetailModal item={viewingItem} onClose={() => setViewingItem(null)} onEdit={handleEditFromView} />

      {/* MODAL 2: TẠO MỚI / CHỈNH SỬA VĂN BẢN */}
      {isEditModalOpen && (
        <RegulationFormModal
          initial={editingItem}
          defaultCode={`NQ-2026-00${items.length + 1}`}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveItem}
        />
      )}
    </div>
  );
}
