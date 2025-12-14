
import React from 'react';
import { PoolMission, Task, TASK_CONFIG } from '../types';
import { Target, Lock, CheckCircle2, PlayCircle, HelpCircle } from 'lucide-react';

interface WeeklyGoalsPanelProps {
  pool: PoolMission[];
  tasks: Task[];
}

export const WeeklyGoalsPanel: React.FC<WeeklyGoalsPanelProps> = ({ pool, tasks }) => {
  const hasGoals = pool.length > 0;

  return (
    <div className="bg-gray-900/60 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-gray-800 h-full relative overflow-hidden flex flex-col min-h-[500px]">
       <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[60px] rounded-full pointer-events-none"></div>

       <h2 className="text-lg font-bold text-gray-200 flex items-center gap-2 mb-4 relative z-10">
          <Target className="w-5 h-5 text-purple-400" />
          今週の目標
       </h2>

       {!hasGoals ? (
         <div className="flex flex-col items-center justify-center flex-grow text-gray-500 gap-3 relative z-10 opacity-70 p-4">
            <div className="w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center border border-dashed border-gray-700">
                <HelpCircle size={32} />
            </div>
            <p className="text-xs text-center leading-relaxed">
               目標が設定されていません。<br/>
               <span className="text-purple-400 font-bold">「週目標」</span>ボタンから<br/>
               今週のミッションを生成しましょう。
            </p>
         </div>
       ) : (
         <div className="flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-1 relative z-10 flex-grow">
            {pool.map((mission) => {
               const config = TASK_CONFIG[mission.type];
               const isUsed = mission.isUsed;
               
               // Check status by finding a matching task in the active list
               // We match by title since we don't strictly link IDs between pool and tasks
               const linkedTask = isUsed 
                  ? tasks.find(t => t.title === mission.title) 
                  : null;
                  
               const isCompleted = linkedTask?.done;
               const isActive = isUsed && !isCompleted;
               const isLocked = !isUsed;

               return (
                 <div 
                   key={mission.id} 
                   className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                     isCompleted 
                       ? 'bg-gray-800/30 border-gray-700 opacity-60 grayscale-[0.5]' 
                       : isActive 
                         ? 'bg-gray-800 border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.1)]'
                         : 'bg-gray-900/40 border-gray-800/80 opacity-80'
                   }`}
                 >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0 transition-colors ${
                        isLocked ? 'bg-gray-950 text-gray-600 border border-gray-800' : 'bg-gray-800/80 border border-gray-700'
                    }`}>
                       {isLocked ? <Lock size={14} /> : config.icon}
                    </div>
                    
                    <div className="flex-grow min-w-0">
                       <div className={`text-xs font-bold truncate ${isCompleted ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                          {mission.title}
                       </div>
                       <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                              isLocked ? 'border-gray-800 text-gray-600 bg-gray-900' : `${config.borderColor} ${config.textColor} bg-gray-900/50`
                          }`}>
                             {config.label.split(' ')[0]}
                          </span>
                          <span className="text-[10px] text-gray-500 font-mono">+{mission.reward} XP</span>
                       </div>
                    </div>

                    <div className="shrink-0 text-gray-500">
                       {isCompleted && <CheckCircle2 size={18} className="text-emerald-500" />}
                       {isActive && <PlayCircle size={18} className="text-purple-400 animate-pulse" />}
                       {isLocked && <div className="w-4 h-4 rounded-full border-2 border-gray-800 border-dashed"></div>}
                    </div>
                 </div>
               );
            })}
         </div>
       )}
    </div>
  );
};
