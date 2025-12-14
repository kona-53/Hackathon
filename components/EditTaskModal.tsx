
import React, { useState } from 'react';
import { Task, TaskType, TASK_CONFIG } from '../types';
import { Save, X, Trash2 } from 'lucide-react';

interface EditTaskModalProps {
  task: Task;
  onSave: (updatedTask: Task) => void;
  onDelete: (id: number) => void;
  onClose: () => void;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({ task, onSave, onDelete, onClose }) => {
  const [title, setTitle] = useState(task.title);
  const [type, setType] = useState<TaskType>(task.type);
  const [date, setDate] = useState(task.date);
  const [reward, setReward] = useState(task.reward);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...task,
      title,
      type,
      date,
      reward
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-md relative overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-gray-900/50">
          <h3 className="text-lg font-bold text-gray-200">タスク編集</h3>
          <div className="flex items-center gap-2">
            <button 
                onClick={() => onDelete(task.id)}
                className="text-gray-500 hover:text-red-400 transition-colors p-2 hover:bg-red-900/20 rounded-full"
                title="削除"
            >
                <Trash2 size={20} />
            </button>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-full">
                <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">ミッション名</label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none transition-all placeholder-gray-600"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">カテゴリー</label>
            <div className="relative">
              <select
                className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none appearance-none"
                value={type}
                onChange={(e) => setType(e.target.value as TaskType)}
              >
                {Object.values(TaskType).map((t) => {
                  const config = TASK_CONFIG[t];
                  return (
                    <option key={t} value={t}>
                      {config.label}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">日付</label>
              <input
                type="date"
                className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">報酬 (EXP)</label>
              <input
                type="number"
                min="1"
                className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none"
                value={reward}
                onChange={(e) => setReward(Number(e.target.value))}
              />
            </div>
          </div>
          
          {task.done && (
            <p className="text-xs text-yellow-500 bg-yellow-900/20 p-2 rounded border border-yellow-500/30">
              ※完了済みのタスクを編集・削除すると、獲得済みの経験値も自動的に調整されます。
            </p>
          )}

          <div className="mt-4 flex gap-3">
             <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-lg font-bold text-gray-400 hover:bg-gray-800 transition-colors"
             >
               キャンセル
             </button>
             <button
              type="submit"
              className="flex-1 py-3 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg flex justify-center items-center gap-2"
             >
               <Save size={18} />
               保存する
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};