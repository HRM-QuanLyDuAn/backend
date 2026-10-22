"use client";

import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { Field, Select } from "@/components/ui/Form";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function BulkClosePayslipModal({ open, onClose }: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Chốt phiếu lương"
      size="md"
      footer={
        <>
          <Button variant="white" onClick={onClose}>Hủy</Button>
          <Button onClick={onClose}>Chốt</Button>
        </>
      }
    >
      <Field label="Kỳ lương (theo tháng)" required>
        <div className="grid grid-cols-2 gap-2">
          <Select defaultValue="08">
            <option value="08">Tháng 08</option>
            <option value="07">Tháng 07</option>
          </Select>
          <Select defaultValue="2026">
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </Select>
        </div>
      </Field>
      <Field label="Phạm vi" required>
        <Select defaultValue="all">
          <option value="all">Toàn công ty</option>
          <option value="hn-1">Chi nhánh HN-1</option>
          <option value="emp">Từng nhân viên</option>
        </Select>
      </Field>
      <div className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-500">
        Hệ thống sẽ lập phiếu lương theo tháng đã chọn (công, lương, thưởng / phạt) cho phạm vi trên.
      </div>
    </Modal>
  );
}
