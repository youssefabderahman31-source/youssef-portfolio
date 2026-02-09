"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface DeleteButtonProps {
  id: string;
  type: 'company' | 'project';
  size?: number;
  className?: string;
}

export function DeleteButton({ id, type, size = 18, className }: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const formData = new FormData();
      formData.append('id', id);
      formData.append('type', type);

      const response = await fetch('/api/admin/delete', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete');
      }

      // Refresh the page to see the changes
      router.refresh();
      
      // Wait a moment for the refresh to complete, then reload
      setTimeout(() => {
        window.location.href = '/admin/dashboard';
      }, 500);
    } catch (error) {
      console.error('Error deleting:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to delete'}`);
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
