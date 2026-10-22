"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { Field, Select } from "@/components/ui/Form";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ExportModal({ open, onClose }: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Xuất báo cáo ca làm việc"
      size="md"
      footer={<><Button variant="white" onClick={onClose}>Hủy</Button><Button onClick={onClose}><FontAwesomeIcon icon={faDownload} fontSize={16} /> Xuất file</Button></>}
    >
      <Field label="Định dạng" required>
        <Select defaultValue="pdf"><option value="pdf">PDF</option><option value="excel">Excel (XLSX)</option></Select>
      </Field>
      <Field label="Khoảng thời gian" required>
        <Select defaultValue="month"><option value="day">Hôm nay</option><option value="week">Tuần này</option><option value="month">Tháng này</option></Select>
      </Field>
    </Modal>
  );
}
