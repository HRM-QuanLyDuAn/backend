"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import type { WifiConfig } from "@/types";
import WifiTableSection from "@/features/wifi/components/WifiList";
import WifiFormModal, { type WifiFormPayload } from "@/features/wifi/components/modals/WifiForm";
import { useCurrentUser } from "@/context/AuthContext";
import { apiGet, apiPost, apiPut, apiDelete, GatewayError } from "@/lib/api";

export default function WifiPage() {
  const { role, branchSlug } = useCurrentUser();
  const isManager = role === "manager";
  const [configs, setConfigs] = useState<WifiConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WifiConfig | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiGet<WifiConfig[]>("/api/wifi-configs");
      setConfigs(data || []);
    } catch (e) {
      setError(e instanceof GatewayError ? e.message : "Lỗi tải cấu hình Wi-Fi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredConfigs = useMemo(
    () => (isManager ? configs.filter((c) => c.branch.toLowerCase().replace("-", "") === (branchSlug || "").replace("-", "")) : configs),
    [configs, isManager, branchSlug]
  );

  const handleOpenCreate = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: WifiConfig) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleSubmit = async (payload: WifiFormPayload) => {
    setSaving(true);
    try {
      if (editingItem) {
        const updated = await apiPut<WifiConfig>(`/api/wifi-configs/${editingItem.id}`, payload);
        setConfigs((prev) => prev.map((c) => (c.id === editingItem.id ? updated : c)));
      } else {
        const created = await apiPost<WifiConfig>("/api/wifi-configs", payload);
        setConfigs((prev) => [created, ...prev]);
      }
      setModalOpen(false);
      setEditingItem(null);
    } catch (e) {
      alert(e instanceof GatewayError ? e.message : "Lỗi lưu cấu hình Wi-Fi.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const target = configs.find((c) => c.id === id);
    if (!confirm(`Bạn có chắc chắn muốn xóa Wi-Fi "${target?.ssid ?? ""}" (${target?.branch ?? ""}) không?`)) return;
    try {
      await apiDelete(`/api/wifi-configs/${id}`);
      setConfigs((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      alert(e instanceof GatewayError ? e.message : "Lỗi xóa cấu hình Wi-Fi.");
    }
  };

  return (
    <div>
      <PageHeader
        title="Cấu hình Wi-Fi"
        breadcrumb={[{ label: "HR", href: "#" }, { label: "Wi-Fi chấm công" }]}
        actions={
          !isManager ? (
            <div className="flex items-center gap-2">
              <Button onClick={handleOpenCreate} className="text-xs">
                <FontAwesomeIcon icon={faPlus} fontSize={14} /> Thêm Wi-Fi
              </Button>
            </div>
          ) : undefined
        }
      />

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-center justify-between gap-3">
          <span>{error}</span>
          <Button variant="white" onClick={fetchData} className="text-xs shrink-0">
            Thử lại
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-6">
        {loading ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-5 animate-pulse space-y-3">
            <div className="h-4 bg-gray-100 rounded w-1/3" />
            <div className="h-8 bg-gray-100 rounded w-full" />
            <div className="text-xs text-gray-500">Đang tải cấu hình Wi-Fi qua Gateway...</div>
          </div>
        ) : (
          <WifiTableSection configs={filteredConfigs} onEdit={handleOpenEdit} onDelete={handleDelete} />
        )}
      </div>

      <WifiFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingItem(null);
        }}
        initial={editingItem}
        saving={saving}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
