"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { initialNews } from "@/features/news/mock";
import type { NewsItem } from "@/features/news/types";
import NewsSection from "@/features/news/components/NewsList";
import NewsDetailModal from "@/features/news/components/modals/NewsDetail";
import CreateNewsModal from "@/features/news/components/modals/NewsForm";

export default function NewsPage() {
  const [newsList, setNewsList] = useState<NewsItem[]>(initialNews);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  const handleCreateNews = (item: NewsItem) => {
    setNewsList((prev) => [item, ...prev]);
    setModalOpen(false);
  };

  const handleDeleteNews = (id: string) => {
    setNewsList((prev) => prev.filter((n) => n.id !== id));
    if (selectedNews?.id === id) {
      setSelectedNews(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Quản lý Bảng Tin & Truyền Thông Nội Bộ"
        breadcrumb={[{ label: "HR & Quản trị", href: "#" }, { label: "Bảng tin & Thông báo" }]}
        actions={
          <Button onClick={() => setModalOpen(true)}>
            <FontAwesomeIcon icon={faPlus} fontSize={18} /> Đăng thông báo mới
          </Button>
        }
      />

      <NewsSection items={newsList} onSelect={setSelectedNews} onDelete={handleDeleteNews} />

      {/* Modal xem chi tiết thông báo */}
      <NewsDetailModal item={selectedNews} onClose={() => setSelectedNews(null)} />

      {/* Modal tạo thông báo mới */}
      <CreateNewsModal open={modalOpen} onClose={() => setModalOpen(false)} onCreate={handleCreateNews} />
    </div>
  );
}
