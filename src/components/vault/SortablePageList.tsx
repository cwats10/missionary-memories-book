import { useState } from 'react';
import { Page } from '@/hooks/usePages';
import { PageCard } from './PageCard';

interface SortablePageListProps {
  pages: Page[];
  onReorder?: (pages: Page[]) => Promise<{ error: Error | null }>;
  onDelete: (id: string) => Promise<void>;
  onEdit: (page: Page) => void;
  onApprove?: (id: string) => Promise<{ error: unknown }>;
  onReject?: (id: string) => Promise<{ error: unknown }>;
  onUnapprove?: (id: string) => Promise<{ error: unknown }>;
  onSubmit?: (id: string) => Promise<{ error: unknown }>;
  isOwner?: boolean;
}

export function SortablePageList({
  pages,
  onReorder,
  onDelete,
  onEdit,
  onApprove,
  onReject,
  onUnapprove,
  onSubmit,
  isOwner,
}: SortablePageListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const canReorder = !!onReorder;

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (!canReorder) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    if (!canReorder) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (!canReorder || draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newPages = [...pages];
    const [draggedPage] = newPages.splice(draggedIndex, 1);
    newPages.splice(dropIndex, 0, draggedPage);

    setDraggedIndex(null);
    setDragOverIndex(null);

    await onReorder(newPages);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-3">
      {pages.map((page, index) => (
        <div
          key={page.id}
          draggable={canReorder}
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
          className={`transition-all duration-150 ${
            dragOverIndex === index && draggedIndex !== index ? 'transform translate-y-1 opacity-70' : ''
          } ${draggedIndex === index ? 'opacity-50' : ''} ${!canReorder ? 'cursor-default' : ''}`}
        >
          {dragOverIndex === index && draggedIndex !== null && draggedIndex !== index && (
            <div className="h-1 bg-primary/50 rounded-full mb-2 animate-pulse" />
          )}
          <PageCard
            page={page}
            pageNumber={index + 1}
            onDelete={onDelete}
            onEdit={onEdit}
            onApprove={onApprove}
            onReject={onReject}
            onUnapprove={onUnapprove}
            onSubmit={onSubmit}
            isOwner={isOwner}
            isDragging={draggedIndex === index}
            dragHandleProps={{
              onMouseDown: (e) => e.stopPropagation(),
            }}
          />
        </div>
      ))}
    </div>
  );
}
