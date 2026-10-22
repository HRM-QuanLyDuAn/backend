"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { Field, Input, Select } from "@/components/ui/Form";
import type { Branch } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  branch: Branch | null;
  onSave: (data: Omit<Branch, "id"> & { id?: string }) => void;
}

export default function BranchModal({ open, onClose, branch, onSave }: Props) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [manager, setManager] = useState("");
  const [status, setStatus] = useState<"hoạt động" | "vô hiệu hóa">("hoạt động");

  useEffect(() => {
    if (branch) {
      setName(branch.name);
      setSlug(branch.slug);
      setAddress(branch.address);
      setPhone(branch.phone);
      setManager(branch.manager);
      setStatus(branch.status);
    } else {
      setName("");
      setSlug("");
      setAddress("");
      setPhone("");
      setManager("");
      setStatus("hoạt động");
    }
  }, [branch, open]);

  const handleSave = () => {
    if (!name || !slug) return;
    onSave({ id: branch?.id, name, slug, address, phone, manager, status, staff: branch?.staff ?? 0 });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={branch ? "Cập nhật chi nhánh" : "Thêm chi nhánh"}
      size="lg"
      footer={
        <>
          <Button variant="white" onClick={onClose}>Hủy</Button>
          <Button onClick={handleSave}>{branch ? "Lưu" : "Tạo"}</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
        <Field label="Tên chi nhánh" required><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Chi nhánh HN-3" /></Field>
        <Field label="Mã chi nhánh (slug)" required><Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="hn-3" /></Field>
        <Field label="Địa chỉ" required className="md:col-span-2"><Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Số nhà, đường, quận/huyện" /></Field>
        <Field label="SĐT" required><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="024 3xxx xxxx" /></Field>
        <Field label="Quản lý"><Input value={manager} onChange={(e) => setManager(e.target.value)} placeholder="Tên quản lý" /></Field>
        <Field label="Trạng thái" required>
          <Select value={status} onChange={(e) => setStatus(e.target.value as any)}>
            <option value="hoạt động">Hoạt động</option>
            <option value="vô hiệu hóa">Vô hiệu hóa</option>
          </Select>
        </Field>
      </div>
    </Modal>
  );
}
