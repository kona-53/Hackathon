
import React, { useEffect, useRef } from 'react';
import { Task } from '../types';
import { CheckCircle, Trash2, Undo2, Edit } from 'lucide-react';

interface TaskContextMenuProps {
  x: number;
  y: number;
  task: Task | null;
  onClose: () => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number) => void;
  onEdit: (task: Task) => void;
}

export const TaskContextMenu: React.FC<TaskContextMenuProps> = ({ x, y, task, onClose, onDelete, onToggleStatus, onEdit }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (!task) return null;

  return (
    <div 
      ref={menuRef}
      className="fixed z-50 bg-gray-800 rounded-lg shadow-2xl border border-gray-700 w-52 py-1 overflow-hidden animate-in fade-in zoom-in duration-100"
      style={{ top: y, left: x }}
    >
      <div className="px-4 py-3 border-b border-gray-700 bg-gray-900/50 text-xs font-bold text-gray-400 truncate uppercase tracking-wider">
        {task.title}
      </div>
      
      <button 
        onClick={() => { onToggleStatus(task.id); onClose(); }}
        className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-blue-600/20 hover:text-blue-400 flex items-center gap-3 transition-colors"
      >
        {task.done ? (
            <>
                <Undo2 size={16} />
                <span>未完了に戻す</span>
            </>
        ) : (
            <>
                <CheckCircle size={16} />
                <span>完了にする</span>
            </>
        )}
      </button>
      
      <button 
        onClick={() => { onEdit(task); onClose(); }}
        className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-yellow-600/20 hover:text-yellow-400 flex items-center gap-3 transition-colors"
      >
        <Edit size={16} />
        <span>編集</span>
      </button>
      
      <button 
        onClick={() => { 
          onClose(); 
          // メニューが閉じるのを待ってから削除確認を出す（ブロッキング回避）
          setTimeout(() => onDelete(task.id), 50);
        }}
        className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 flex items-center gap-3 transition-colors"
      >
        <Trash2 size={16} />
        <span>削除</span>
      </button>
    </div>
  );
};
