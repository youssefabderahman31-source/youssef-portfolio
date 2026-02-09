"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { removeCompany, removeProject } from "@/lib/actions";

interface DeleteButtonProps {
  id: string;
  type: 'company' | 'project';
  size?: number;
  className?: string;
}

export function DeleteButton({ id, type, size = 18, className }: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const formData = new FormData();
      formData.append('id', id);

      if (type === 'company') {
        await removeCompany(formData);
      } else {
        await removeProject(formData);
      }
    } catch (error) {
      console.error('Error deleting:', error);
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className={className || "p-3 bg-red-900/20 text-red-500 hover:bg-red-600 hover:text-white transition-colors rounded disabled:opacity-50 disabled:cursor-not-allowed"}
    >
      {isDeleting ? (
        <div className="animate-spin">
          <Trash2 size={size} />
        </div>
      ) : (
        <Trash2 size={size} />
      )}
    </button>
  );
}
