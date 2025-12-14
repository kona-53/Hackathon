
import React, { useState, useEffect } from 'react';
import { TaskType, Stats, TASK_CONFIG, getLevelInfo, getTotalExpForLevelStart } from '../types';
import { Save, RotateCcw } from 'lucide-react';

interface StatCorrectionFormProps {
  currentStats: Stats;
  onUpdate: (newStats: Stats) => void;
}

export const StatCorrectionForm: React.FC<StatCorrectionFormProps> = ({ currentStats, onUpdate }) => {
  const [values, setValues] = useState<Record<TaskType, { level: number; exp: number }>>({
     [TaskType.STUDY]: { level: 1, exp: 0 },
     [TaskType.EXERCISE]: { level: 1, exp: 0 },
     [TaskType.WORK]: { level: 1, exp: 0 },
  });

  useEffect(() => {
     const newValues: any = {};
     Object.values(TaskType).forEach(type => {
        const total = currentStats[type];
        const info = getLevelInfo(total);
        newValues[type] = { level: info.level, exp: info.currentLevelExp };
     });
     setValues(newValues);
  }, [currentStats]);

  const handleChange = (type: TaskType, field: 'level' | 'exp', val: string) => {
     const num = parseInt(val);
     if (isNaN(num)) return;

     setValues(prev => ({
        ...prev,
        [type]: { ...prev[type], [field]: num }
     }));
  };

  const handleSave = (e: React.FormEvent) => {
     e.preventDefault();
     const newStats: Stats = { ...currentStats };
     
     Object.entries(values).forEach(([type, { level, exp }]) => {
         const t = type as TaskType;
         const l = Math.max(1, level);
         
         // Calculate total EXP: Base for Level + remainder exp
         const baseExp = getTotalExpForLevelStart(l);
         const totalExp = baseExp + Math.max(0, exp);
         
         newStats[t] = totalExp;
     });

     onUpdate(newStats);
     alert('データが同期されました。');
  };

  return (
    <div className="bg-gray-900/60 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-gray-800 h-full flex flex-col relative overflow-hidden">
       {/* Decorative glow */}
       <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-[50px] rounded-full pointer-events-none"></div>

       <h2 className="text-lg font-bold text-gray-200 mb-5 flex items-center gap-2 relative z-10">
         <RotateCcw className="w-5 h-5 text-orange-500" />
         データ手動修正
       </h2>
       
       <form onSubmit={handleSave} className="flex flex-col gap-4 relative z-10">
         {Object.values(TaskType).map(type => {
            const config = TASK_CONFIG[type];
            return (
              <div key={type} className="flex flex-col gap-2 p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
                 <div className="flex items-center gap-2 text-sm font-bold text-gray-300">
                    <span className="text-xl">{config.icon}</span>
                    <span className={config.textColor}>{config.label.split(' ')[0]}</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="text-[10px] text-gray-500 block mb-1 uppercase font-bold">レベル</label>
                      <input 
                        type="number" min="1" 
                        className="w-full bg-gray-900 border border-gray-700 rounded-md px-2 py-2 text-white text-center focus:ring-1 focus:ring-orange-500 outline-none"
                        value={values[type]?.level ?? 1}
                        onChange={(e) => handleChange(type, 'level', e.target.value)}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] text-gray-500 block mb-1 uppercase font-bold">現在のXP</label>
                      <input 
                        type="number" min="0"
                        className="w-full bg-gray-900 border border-gray-700 rounded-md px-2 py-2 text-white text-center focus:ring-1 focus:ring-orange-500 outline-none"
                        value={values[type]?.exp ?? 0}
                        onChange={(e) => handleChange(type, 'exp', e.target.value)}
                      />
                    </div>
                 </div>
              </div>
            );
         })}
         
         <button className="mt-4 w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3.5 rounded-lg shadow-[0_0_20px_rgba(234,88,12,0.4)] hover:shadow-[0_0_30px_rgba(234,88,12,0.6)] transition-all flex justify-center items-center gap-2 uppercase tracking-wider">
           <Save className="w-4 h-4" />
           変更を保存
         </button>
       </form>
    </div>
  )
}
