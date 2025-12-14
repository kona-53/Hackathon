
import React, { useState, useEffect } from 'react';
import { TaskType, TASK_CONFIG } from '../types';
import { analyzeTask } from '../services/geminiService';
import { Loader2, Plus, RefreshCw, Wand2 } from 'lucide-react';

interface MissionFormProps {
  onAdd: (title: string, type: TaskType, date: string, reward: number) => void;
  onReset: () => void;
  selectedDate?: string;
}

export const MissionForm: React.FC<MissionFormProps> = ({ onAdd, onReset, selectedDate }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<TaskType>(TaskType.STUDY);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [manualReward, setManualReward] = useState<number>(30);
  const [isAiMode, setIsAiMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Update date when selectedDate prop changes (e.g. from calendar click)
  useEffect(() => {
    if (selectedDate) {
      setDate(selectedDate);
    }
  }, [selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    let finalReward = manualReward;
    let finalType = type;

    if (isAiMode) {
      setIsLoading(true);
      try {
        const result = await analyzeTask(title, date);
        finalReward = result.reward;
        finalType = result.type;
        setType(finalType);
        setManualReward(finalReward);
      } catch (err) {
        console.error("AI failed", err);
      } finally {
        setIsLoading(false);
      }
    }

    onAdd(title, finalType, date, finalReward);
    setTitle('');
  };

  return (
    <div className="bg-gray-900/60 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-gray-800 h-full flex flex-col relative overflow-hidden">
      {/* Decorative glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full pointer-events-none"></div>

      <h2 className="text-lg font-bold text-gray-200 mb-5 flex items-center gap-2 relative z-10">
        <Plus className="w-5 h-5 text-blue-400" />
        ミッション作成
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 flex-grow relative z-10">
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
          />
        </div>

        <div className="flex items-center gap-3 mt-1 bg-purple-900/20 p-3 rounded-lg border border-purple-500/30">
          <input
            type="checkbox"
            id="aiMode"
            checked={isAiMode}
            onChange={(e) => setIsAiMode(e.target.checked)}
            disabled={isLoading}
            className="w-5 h-5 text-purple-500 rounded bg-gray-800 border-gray-600 focus:ring-purple-500/50"
          />
          <label htmlFor="aiMode" className="text-sm text-gray-300 cursor-pointer flex-grow select-none">
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">日付</label>
            <input
              type="date"
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              disabled={isLoading}
            />
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
        </div>

        <div className="mt-auto pt-6 flex flex-col gap-3">
          <button
            type="submit"
            disabled={isLoading || !title}
            className={`w-full py-3.5 px-4 rounded-lg font-bold text-white flex justify-center items-center gap-2 transition-all duration-300 transform active:scale-[0.98] uppercase tracking-wider ${
              isLoading 
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_30px_rgba(34,197,94,0.6)]'
            }`}
          >
            {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : 'ミッション開始'}
          </button>
          
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-red-400 hover:text-red-300 flex items-center justify-center gap-1 mt-2 opacity-60 hover:opacity-100 transition-opacity"
          >
            <RefreshCw className="w-3 h-3" /> データ初期化
          </button>
        </div>
      </form>
    </div>
  );
};
