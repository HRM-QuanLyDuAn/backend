"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faUser, faBuilding, faCalendarDay, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import Badge, { StatusBadge } from "@/components/ui/Badge";
import Table, { Column } from "@/components/ui/Table";
import { Input, Select } from "@/components/ui/Form";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import type { WorkShift } from "@/features/shifts/types";

interface Props {
  workShifts: WorkShift[];
  onDelete: (id: string) => void;
}

export default function WorkShiftSection({ workShifts, onDelete }: Props) {
  const [selectedShift, setSelectedShift] = useState<WorkShift | null>(null);

  const columns: Column<WorkShift>[] = [
    { key: "employee", header: "Nhân viên", render: (s) => <span className="font-semibold text-gray-800">{s.employee}</span> },
    { key: "branch", header: "Chi nhánh", render: (s) => <Badge tone="gray">{s.branch}</Badge> },
    { key: "date", header: "Ngày", render: (s) => <span className="text-gray-600">{s.date}</span> },
    { key: "templateName", header: "Khung ca", render: (s) => <Badge tone="primary">{s.templateName}</Badge> },
    { key: "scheduled", header: "Giờ làm", render: (s) => <span className="font-medium text-gray-700">{s.scheduled}</span> },
    { key: "checkIn", header: "Check-in", render: (s) => <span className="font-mono text-sm">{s.checkIn}</span> },
    { key: "checkOut", header: "Check-out", render: (s) => <span className="font-mono text-sm">{s.checkOut}</span> },
    {
      key: "status",
      header: "Trạng thái",
      render: (s) => (s.status === "Chưa làm" ? <Badge tone="gray">{s.status}</Badge> : <StatusBadge status={s.status} />),
    },
    {
      key: "actions",
      header: "Thao tác",
      render: (s) => (
        <button
          type="button"
          onClick={() => setSelectedShift(s)}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-primary hover:text-white transition-all cursor-pointer shadow-2xs"
        >
          Chi tiết
        </button>
      ),
    },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Lịch phân công nhân viên (Xếp ca)</CardTitle>
          <div className="flex gap-2">
            <Select className="w-auto py-1.5 text-sm" defaultValue="hn-1">
              <option value="hn-1">HN-1</option>
              <option value="hn-2">HN-2</option>
              <option value="dn-1">ĐN-1</option>
            </Select>
            <Input type="date" className="w-auto py-1.5 text-sm" defaultValue="2026-08-17" />
          </div>
        </CardHeader>
        <CardBody className="pt-2">
          <Table columns={columns} data={workShifts} rowKey={(s) => s.id} emptyMessage="Chưa có nhân viên nào được phân công" />
        </CardBody>
      </Card>

      {/* Modal Chi tiết phân công ca */}
      <Modal
        open={!!selectedShift}
        onClose={() => setSelectedShift(null)}
        title="Chi tiết phân công ca làm việc"
        size="md"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                if (selectedShift) {
                  onDelete(selectedShift.id);
                  setSelectedShift(null);
                }
              }}
            >
              <FontAwesomeIcon icon={faTrashCan} className="mr-1.5" />
              Xóa phân công
            </Button>
            <Button variant="white" size="sm" onClick={() => setSelectedShift(null)}>
              Đóng
            </Button>
          </div>
        }
      >
        {selectedShift && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-gray-900 text-base">{selectedShift.employee}</h4>
                <p className="text-xs text-gray-500 mt-0.5">Mã ca: {selectedShift.id}</p>
              </div>
              <Badge tone="primary">{selectedShift.templateName}</Badge>
            </div>

            <div className="rounded-xl border border-gray-200 p-4 space-y-2.5 text-sm">
              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="text-gray-500 flex items-center gap-2">
                  <FontAwesomeIcon icon={faCalendarDay} className="text-gray-400 text-xs w-4" />
                  Ngày làm việc:
                </span>
                <span className="font-semibold text-gray-800">{selectedShift.date}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="text-gray-500 flex items-center gap-2">
                  <FontAwesomeIcon icon={faClock} className="text-gray-400 text-xs w-4" />
                  Khung giờ dự kiến:
                </span>
                <span className="font-semibold text-gray-800">{selectedShift.scheduled}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="text-gray-500 flex items-center gap-2">
                  <FontAwesomeIcon icon={faBuilding} className="text-gray-400 text-xs w-4" />
                  Chi nhánh:
                </span>
                <span className="font-semibold text-gray-800">{selectedShift.branch}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="text-gray-500">Giờ Check-in thực tế:</span>
                <span className="font-mono font-semibold text-gray-800">{selectedShift.checkIn}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="text-gray-500">Giờ Check-out thực tế:</span>
                <span className="font-mono font-semibold text-gray-800">{selectedShift.checkOut}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-500">Trạng thái:</span>
                <StatusBadge status={selectedShift.status} />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
