
import React from 'react';
import { TaskType, TASK_CONFIG, getLevelInfo, getTitleForLevel } from '../types';

interface StatCardProps {
  type: TaskType;
  exp: number;
  compact?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ type, exp, compact = false }) => {
  const config = TASK_CONFIG[type];
  
  // Use new dynamic calculator
  const { level, currentLevelExp, nextLevelReq, progress } = getLevelInfo(exp);
  const title = getTitleForLevel(type, level);

  if (compact) {
    return (
      <div className={`p-3 rounded-xl shadow-md border ${config.borderColor} ${config.bgLight} backdrop-blur-sm transition-all hover:scale-[1.02] relative overflow-hidden group min-w-[200px] flex-1`}>
        {/* Background sheen effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

        <div className="flex items-center gap-3 mb-2 relative z-10">
           <div className="w-8 h-8 rounded-md bg-gray-900/50 flex items-center justify-center text-lg border border-white/10 shadow-inner shrink-0">
             {config.icon}
           </div>
           <div className="flex flex-col min-w-0 flex-1">
              <div className="flex justify-between items-end">
                <span className={`font-bold text-sm ${config.textColor} truncate`}>{config.label}</span>
                <span className="text-xl font-black text-white leading-none">Lv.{level}</span>
              </div>
           </div>
        </div>
        
        <div className="w-full bg-gray-900/80 rounded-full h-1.5 mb-1 border border-gray-700/50 overflow-hidden relative shadow-inner">
          <div 
            className={`h-full ${config.barColor} relative transition-all duration-700 ease-out`}
            style={{ width: `${progress}%` }}
          >
            <div className={`absolute top-0 right-0 h-full w-1 bg-white/50 blur-[1px]`}></div>
            <div className={`absolute inset-0 ${config.glowColor} opacity-50 blur-[2px]`}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-5 rounded-2xl shadow-lg border ${config.borderColor} ${config.bgLight} backdrop-blur-sm transition-all hover:scale-[1.02] relative overflow-hidden group`}>
      {/* Background sheen effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

      <div className="flex justify-between items-start mb-3 relative z-10">
        <div className="flex items-center gap-3">
           <div className="w-12 h-12 rounded-lg bg-gray-900/50 flex items-center justify-center text-3xl border border-white/10 shadow-inner">
             {config.icon}
           </div>
           <div className="flex flex-col">
              <span className={`font-bold text-lg ${config.textColor} drop-shadow-sm leading-tight`}>{config.label}</span>
              <span className="text-xs text-gray-400 font-mono mt-0.5 bg-gray-900/50 px-2 py-0.5 rounded border border-gray-700/50 self-start">
                {title}
              </span>
           </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block">Lv</span>
          <div className="text-4xl font-black text-white leading-none drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{level}</div>
        </div>
      </div>
      
      <div className="w-full bg-gray-900/80 rounded-full h-3 mb-2 border border-gray-700/50 overflow-hidden relative shadow-inner">
        <div 
          className={`h-full ${config.barColor} relative transition-all duration-700 ease-out`}
          style={{ width: `${progress}%` }}
        >
          {/* Progress bar glow */}
          <div className={`absolute top-0 right-0 h-full w-2 bg-white/50 blur-[2px]`}></div>
          <div className={`absolute inset-0 ${config.glowColor} opacity-50 blur-[4px]`}></div>
        </div>
      </div>
      <div className="flex justify-between text-xs font-bold text-gray-500 font-mono">
        <span>経験値</span>
        <span className="text-gray-400">{currentLevelExp} / {nextLevelReq}</span>
      </div>
    </div>
  );
};
