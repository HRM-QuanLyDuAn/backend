"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStore } from "@fortawesome/free-solid-svg-icons";
import DashboardShell from "@/components/layout/DashboardShell";
import { useCurrentUser } from "@/context/AuthContext";
import { buildMenuItems } from "@/lib/permissions";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role } = useCurrentUser();
  const isAdmin = role === "admin";
  const roleName = isAdmin ? "Quản trị viên (Admin)" : "Quản lý Chi nhánh (Manager)";
  const groups = buildMenuItems(role);

  return (
    <DashboardShell
      brand="HRM System"
      groups={groups}
      userName={user.name}
      userRole={roleName}
      logoutHref="/login"
      profileHref="/dashboard/employees"
      sidebarFooter={{
        icon: <FontAwesomeIcon icon={faStore} fontSize={16} />,
        text: user.branchName || (isAdmin ? "Toàn bộ hệ thống (HQ)" : "Chi nhánh HN-1 (Phụ trách)"),
      }}
    >
      {children}
    </DashboardShell>
  );
}
