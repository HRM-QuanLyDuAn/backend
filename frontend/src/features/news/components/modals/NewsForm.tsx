"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Field, Input, Textarea, Select } from "@/components/ui/Form";
import type { NewsItem } from "../../types";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreate: (item: NewsItem) => void;
}

export default function CreateNewsModal({ open, onClose, onCreate }: Props) {
  const [newTitle, setNewTitle] = useState("");
  const [newTag, setNewTag] = useState("Thông báo");
  const [newSummary, setNewSummary] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newAuthor, setNewAuthor] = useState("Ban Giám Đốc");

  const handleCreate = () => {
    if (!newTitle.trim() || !newContent.trim()) return;

    let tone: NewsItem["tagTone"] = "primary";
    if (newTag === "Khẩn cấp") tone = "danger";
    else if (newTag === "Khen thưởng") tone = "warning";
    else if (newTag === "Nghỉ lễ") tone = "danger";

    onCreate({
      id: `news-${Date.now()}`,
      title: newTitle.trim(),
      summary: newSummary.trim() || `${newContent.trim().substring(0, 100)}...`,
      content: newContent.trim(),
      author: newAuthor,
      date: "17/08/2026",
      tag: newTag,
      tagTone: tone,
      pinned: newTag === "Khẩn cấp",
    });

    setNewTitle("");
    setNewSummary("");
    setNewContent("");
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Đăng thông báo nội bộ mới"
      size="lg"
      footer={
        <>
          <Button variant="white" onClick={onClose}>Hủy</Button>
          <Button onClick={handleCreate}>Phát hành thông báo</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Tiêu đề thông báo" required>
          <Input
            placeholder="VD: Thông báo kiểm kê chi nhánh, lịch nghỉ lễ..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Phân loại">
            <Select value={newTag} onChange={(e) => setNewTag(e.target.value)}>
              <option value="Thông báo">📢 Thông báo chung</option>
              <option value="Khẩn cấp">🚨 Thông báo khẩn</option>
              <option value="Nghỉ lễ">🏖️ Nghỉ lễ</option>
              <option value="Khen thưởng">🏆 Khen thưởng</option>
              <option value="Vận hành">⚙️ Vận hành</option>
            </Select>
          </Field>
          <Field label="Người / Đơn vị phát hành">
            <Input
              placeholder="VD: Ban Giám Đốc, Quản lý chi nhánh..."
              value={newAuthor}
              onChange={(e) => setNewAuthor(e.target.value)}
            />
          </Field>
        </div>
        <Field label="Tóm tắt ngắn (hiển thị trên thẻ)">
          <Input
            placeholder="Nội dung tóm tắt trong 1-2 câu..."
            value={newSummary}
            onChange={(e) => setNewSummary(e.target.value)}
          />
        </Field>
        <Field label="Nội dung chi tiết" required>
          <Textarea
            rows={4}
            placeholder="Nhập toàn văn thông báo gửi tới toàn bộ nhân sự..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
          />
        </Field>
      </div>
    </Modal>
  );
}
