"use client";

import { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { employees } from "@/mock-data/portal";
import type { TaskItem, TaskSourceType, TaskStatus } from "@/features/tasks/types";
import { initialTasks } from "@/features/tasks/mock";
import TaskFilterBar from "@/features/tasks/components/TaskFilter";
import TaskTable from "@/features/tasks/components/TaskTable";
import CreateTaskModal from "@/features/tasks/components/modals/TaskForm";
import TaskDetailModal from "@/features/tasks/components/modals/TaskDetail";
import { useCurrentUser } from "@/context/AuthContext";

export default function TasksPage() {
  const { role, branchSlug } = useCurrentUser();
  const isAdmin = role === "admin";

  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusTab, setStatusTab] = useState<TaskStatus | "all">("all");
  const [sourceFilter, setSourceFilter] = useState<TaskSourceType | "all">("all");
  const [branchFilter, setBranchFilter] = useState<string>("all");
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Modal Chi tiết nhiệm vụ
  const [detailTask, setDetailTask] = useState<TaskItem | null>(null);

  // Lọc theo chi nhánh: Admin có bộ lọc chi nhánh (all/HN-1...), Manager cố định chi nhánh
  const branchFilteredTasks = useMemo(() => {
    if (isAdmin) {
      if (branchFilter === "all") return tasks;
      return tasks.filter(
        (t) => t.branch.toLowerCase().replace("-", "") === branchFilter.toLowerCase().replace("-", "")
      );
    }
    return tasks.filter(
      (t) =>
        t.branch.toLowerCase().replace("-", "") === branchSlug.toLowerCase().replace("-", "") ||
        t.branch === "HN-1"
    );
  }, [tasks, isAdmin, branchSlug, branchFilter]);

  // Bộ đếm trạng thái cho badge
  const statusCounts = useMemo(() => {
    const counts = {
      all: branchFilteredTasks.length,
      pending: 0,
      inProgress: 0,
      overdue: 0,
      completed: 0,
    };
    branchFilteredTasks.forEach((t) => {
      if (t.status in counts) {
        counts[t.status as TaskStatus]++;
      }
    });
    return counts;
  }, [branchFilteredTasks]);

  // Lọc theo search, tab trạng thái và nguồn việc
  const displayedTasks = useMemo(() => {
    return branchFilteredTasks.filter((t) => {
      // Filter status tab
      if (statusTab !== "all" && t.status !== statusTab) {
        return false;
      }
      // Filter source
      if (sourceFilter !== "all" && t.sourceType !== sourceFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchDesc = t.description.toLowerCase().includes(q);
        const matchAssignee = t.assignedToName.toLowerCase().includes(q);
        const matchAssigner = t.assignedByName.toLowerCase().includes(q);
        return matchTitle || matchDesc || matchAssignee || matchAssigner;
      }
      return true;
    });
  }, [branchFilteredTasks, statusTab, sourceFilter, searchQuery]);

  // Xác nhận hoàn thành công việc từ Modal chi tiết
  const handleCompleteTask = (taskId: string, photoUrl?: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            status: "completed",
            proofPhotoUrl: photoUrl || t.proofPhotoUrl,
            completedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
          };
        }
        return t;
      })
    );
  };

  // Thao tác xóa task từ Modal chi tiết
  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  // Thêm task mới
  const handleCreateTask = (newTask: TaskItem) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  const currentUserName = isAdmin ? "Trần Minh Tuấn (Admin)" : "Vũ Thành Công (Quản lý)";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Giao việc & Quản lý nhiệm vụ"
        breadcrumb={[{ label: "HRM", href: "#" }, { label: "Nhiệm vụ" }]}
        actions={
          <Button variant="primary" onClick={() => setCreateModalOpen(true)}>
            <FontAwesomeIcon icon={faPlus} fontSize={18} className="mr-1 inline" />
            Giao việc mới
          </Button>
        }
      />

      {/* Filter & Search Bar - Admin chọn chi nhánh ở đây */}
      <TaskFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusTab={statusTab}
        onStatusTabChange={setStatusTab}
        sourceFilter={sourceFilter}
        onSourceFilterChange={setSourceFilter}
        branchFilter={branchFilter}
        onBranchFilterChange={setBranchFilter}
        isManager={!isAdmin}
        managerBranch={branchSlug.toUpperCase()}
        statusCounts={statusCounts}
      />

      {/* Bảng danh sách công việc: Thao tác mở Modal Chi tiết */}
      <TaskTable
        tasks={displayedTasks}
        onOpenDetail={(task) => setDetailTask(task)}
      />

      {/* Modal Giao việc mới - Manager cứng chi nhánh, Admin theo chi nhánh đã chọn ở bộ lọc */}
      <CreateTaskModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        employees={
          isAdmin
            ? (branchFilter !== "all"
                ? employees.filter((e) => e.branch.toLowerCase().replace("-", "") === branchFilter.toLowerCase().replace("-", ""))
                : employees)
            : employees.filter((e) => e.branch.toLowerCase().replace("-", "") === branchSlug.toLowerCase().replace("-", ""))
        }
        currentBranch={isAdmin && branchFilter !== "all" ? branchFilter.toUpperCase() : branchSlug.toUpperCase()}
        currentUserName={currentUserName}
        onCreated={handleCreateTask}
      />

      {/* Modal Chi tiết nhiệm vụ (Xác nhận hoàn thành & Xóa tại đây) */}
      <TaskDetailModal
        open={!!detailTask}
        onClose={() => setDetailTask(null)}
        task={detailTask}
        onComplete={handleCompleteTask}
        onDelete={handleDeleteTask}
      />
    </div>
  );
}
