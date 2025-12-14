
import React, { useState } from 'react';
import { TaskType, TASK_CONFIG } from '../types';
import { analyzeTask } from '../services/geminiService';
import { Loader2, Plus, Wand2, X } from 'lucide-react';

interface CreateTaskModalProps {
  date: string;
  onAdd: (title: string, type: TaskType, date: string, reward: number) => void;
  onClose: () => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ date, onAdd, onClose }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<TaskType>(TaskType.STUDY);
  const [manualReward, setManualReward] = useState<number>(30);
  const [isAiMode, setIsAiMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let finalReward = manualReward;
    let finalType = type;

    if (isAiMode) {
      setIsLoading(true);
      try {
        const result = await analyzeTask(title, date);
        finalReward = result.reward;
        finalType = result.type;
      } catch (err) {
        console.error("AI failed", err);
      } finally {
        setIsLoading(false);
      }
    }

    onAdd(title, finalType, date, finalReward);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-md relative overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-gray-900/50">
          <h3 className="text-lg font-bold text-gray-200 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-400" />
            新規ミッション作成
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
           <div className="bg-blue-900/20 px-3 py-2 rounded text-xs text-blue-300 border border-blue-500/30 text-center font-mono">
              Target Date: {date}
           </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">ミッション名</label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none transition-all placeholder-gray-600"
              placeholder="例: 第4章を読む、ジムに行く"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isLoading}
              autoFocus
            />
          </div>

          <div className="flex items-center gap-3 mt-1 bg-purple-900/20 p-3 rounded-lg border border-purple-500/30">
            <input
              type="checkbox"
              id="modalAiMode"
              checked={isAiMode}
              onChange={(e) => setIsAiMode(e.target.checked)}
              disabled={isLoading}
              className="w-5 h-5 text-purple-500 rounded bg-gray-800 border-gray-600 focus:ring-purple-500/50"
            />
            <label htmlFor="modalAiMode" className="text-sm text-gray-300 cursor-pointer flex-grow select-none">
              <span className="font-bold text-purple-400 flex items-center gap-2">
                <Wand2 className="w-4 h-4" /> AI自動分析
              </span>
            </label>
          </div>

          <div className={`transition-opacity duration-200 ${isAiMode ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">カテゴリー</label>
            <div className="relative">
                <select
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none appearance-none"
                  value={type}
                  onChange={(e) => setType(e.target.value as TaskType)}
                  disabled={isAiMode || isLoading}
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
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    ▼
                </div>
            </div>
          </div>

          <div className={`transition-opacity duration-200 ${isAiMode ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">報酬 (EXP)</label>
            <input
              type="number"
              min="10"
              step="5"
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none"
              value={manualReward}
              onChange={(e) => setManualReward(Number(e.target.value))}
              disabled={isAiMode || isLoading}
            />
          </div>

          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-lg font-bold text-gray-400 hover:bg-gray-800 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isLoading || !title}
              className={`flex-1 py-3.5 px-4 rounded-lg font-bold text-white flex justify-center items-center gap-2 transition-all duration-300 transform active:scale-[0.98] uppercase tracking-wider ${
                isLoading 
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)]'
              }`}
            >
              {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : '作成'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
