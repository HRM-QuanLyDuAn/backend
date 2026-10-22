"use client";

import { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateRight } from "@fortawesome/free-solid-svg-icons";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { wifiConfigs } from "@/mock-data/portal";
import type { WifiConfig } from "@/types";
import WifiTableSection from "@/features/wifi/components/WifiList";
import { useCurrentUser } from "@/context/AuthContext";

export default function WifiPage() {
  const { role, branchSlug } = useCurrentUser();
  const isManager = role === "manager";
  const [configs, setConfigs] = useState<WifiConfig[]>(wifiConfigs);
  const filteredConfigs = useMemo(
    () => (isManager ? configs.filter((c) => c.branch.toLowerCase().replace("-", "") === branchSlug.replace("-", "")) : configs),
    [configs, isManager, branchSlug]
  );

  return (
    <div>
      <PageHeader
        title="Cấu hình Wi-Fi"
        breadcrumb={[{ label: "HR", href: "#" }, { label: "Wi-Fi chấm công" }]}
        actions={
          <Button variant="white" onClick={() => setConfigs([...configs])}>
            <FontAwesomeIcon icon={faRotateRight} fontSize={16} /> Làm mới danh sách
          </Button>
        }
      />

      <div className="flex flex-col gap-6">
        <WifiTableSection configs={filteredConfigs} />
      </div>
    </div>
  );
}
