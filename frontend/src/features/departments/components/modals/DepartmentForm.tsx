"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { Field, Input, Select } from "@/components/ui/Form";
import type { Department, Employee } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  department: Department | null;
  employees: Employee[];
  onSave: (data: Omit<Department, "id"> & { id?: string }) => void;
}

export default function DepartmentModal({ open, onClose, department, employees, onSave }: Props) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [manager, setManager] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"hoạt động" | "tạm dừng">("hoạt động");

  useEffect(() => {
    if (department) {
      setName(department.name);
      setCode(department.code);
      setManager(department.manager);
      setDescription(department.description || "");
      setStatus(department.status);
    } else {
      setName("");
      setCode("");
      setManager(employees[0]?.name || "");
      setDescription("");
      setStatus("hoạt động");
    }
  }, [department, employees, open]);

  const handleSave = () => {
    if (!name.trim() || !code.trim()) return;
    onSave({
      id: department?.id,
      name: name.trim(),
      code: code.trim().toUpperCase(),
      manager: manager.trim(),
      description: description.trim(),
      status,
      staff: department?.staff ?? 0,
      createdAt: department?.createdAt || new Date().toLocaleDateString("vi-VN"),
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={department ? "Cập nhật thông tin phòng ban" : "Thêm phòng ban mới"}
      size="lg"
      footer={
        <>
          <Button variant="white" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSave}>{department ? "Lưu thay đổi" : "Tạo phòng ban"}</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
        <Field label="Tên phòng ban" required>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ví dụ: Phòng Marketing & Thương hiệu"
          />
        </Field>

        <Field label="Mã phòng ban" required>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Ví dụ: PMKT"
          />
        </Field>

        <Field label="Trưởng phòng / Phụ trách" className="md:col-span-2">
          <div className="space-y-2">
            <Select value={manager} onChange={(e) => setManager(e.target.value)}>
              <option value="">-- Chọn nhân sự phụ trách --</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.name}>
                  {emp.name} — {emp.role} ({emp.branch})
                </option>
              ))}
            </Select>
            <Input
              value={manager}
              onChange={(e) => setManager(e.target.value)}
              placeholder="Hoặc nhập tên người phụ trách nếu chưa có tài khoản..."
            />
          </div>
        </Field>

        <Field label="Mô tả chức năng & nhiệm vụ" className="md:col-span-2">
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả tóm tắt phạm vi công việc của phòng ban..."
          />
        </Field>

        <Field label="Trạng thái hoạt động" required className="md:col-span-2">
          <Select value={status} onChange={(e) => setStatus(e.target.value as "hoạt động" | "tạm dừng")}>
            <option value="hoạt động">Hoạt động (Đang vận hành)</option>
            <option value="tạm dừng">Tạm dừng (Vô hiệu hóa)</option>
          </Select>
        </Field>
      </div>
    </Modal>
  );
}
