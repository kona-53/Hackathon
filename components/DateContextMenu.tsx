
import React, { useEffect, useRef } from 'react';
import { Plus } from 'lucide-react';

interface DateContextMenuProps {
  x: number;
  y: number;
  dateStr: string;
  onClose: () => void;
  onCreateMission: () => void;
}

export const DateContextMenu: React.FC<DateContextMenuProps> = ({ x, y, dateStr, onClose, onCreateMission }) => {
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

  return (
    <div 
      ref={menuRef}
      className="fixed z-50 bg-gray-800 rounded-lg shadow-2xl border border-gray-700 w-52 py-1 overflow-hidden animate-in fade-in zoom-in duration-100"
      style={{ top: y, left: x }}
    >
      <div className="px-4 py-3 border-b border-gray-700 bg-gray-900/50 text-xs font-bold text-gray-400 truncate uppercase tracking-wider">
        {dateStr}
      </div>
      
      <button 
        onClick={() => { onCreateMission(); onClose(); }}
        className="w-full text-left px-4 py-3 text-sm text-blue-400 hover:bg-blue-600/20 hover:text-blue-300 flex items-center gap-3 transition-colors font-bold"
      >
        <Plus size={16} />
        <span>ミッションを作成</span>
      </button>
    </div>
  );
};
