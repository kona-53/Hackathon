
import React, { useEffect, useState } from 'react';
import { Task, TASK_CONFIG } from '../types';
import { Trophy, CheckCircle2, X, BedDouble, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TaskCompletionModalProps {
  show: boolean;
  task: Task | null;
  onClose: () => void;
}

export const TaskCompletionModal: React.FC<TaskCompletionModalProps> = ({ show, task, onClose }) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (show && task) {
      setAnimate(true);
      
      // Fire confetti ONLY for normal tasks
      if (!task.isSabori) {
        const duration = 1000;
        const end = Date.now() + duration;

        (function frame() {
          confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#34d399', '#10b981', '#fbbf24']
          });
          confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#34d399', '#10b981', '#fbbf24']
          });

          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        }());
      }
    } else {
      setAnimate(false);
    }
  }, [show, task]);

  if (!show || !task) return null;

  const config = TASK_CONFIG[task.type];
  const isRest = task.isSabori;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className={`bg-gray-900 rounded-3xl p-1 ${isRest ? 'shadow-[0_0_50px_rgba(239,68,68,0.3)]' : 'shadow-[0_0_50px_rgba(16,185,129,0.3)]'} max-w-sm w-full relative overflow-hidden transform transition-all duration-500 ${animate ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
        {/* Border Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${isRest ? 'from-pink-500 via-red-500 to-gray-900' : 'from-emerald-500 via-teal-500 to-gray-900'} rounded-3xl p-[1px] -z-10`}></div>
        
        <div className="bg-gray-950 rounded-[23px] p-8 text-center relative overflow-hidden h-full">
           {/* Background glow */}
           <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 ${isRest ? 'bg-pink-500/10' : 'bg-emerald-500/20'} blur-[60px] rounded-full pointer-events-none`}></div>

           <button 
                onClick={onClose} 
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors z-20"
            >
                <X size={24} />
            </button>

           <div className="mb-6 relative inline-block">
             <div className={`absolute inset-0 ${isRest ? 'bg-pink-400' : 'bg-emerald-400'} blur-xl opacity-50 animate-pulse rounded-full`}></div>
             {isRest ? (
                <BedDouble size={64} className="text-pink-400 relative z-10 drop-shadow-[0_0_10px_rgba(244,114,182,0.5)]" />
             ) : (
                <Trophy size={64} className="text-yellow-400 relative z-10 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
             )}
             
             <div className={`absolute -bottom-2 -right-2 ${isRest ? 'bg-red-600' : 'bg-emerald-600'} rounded-full p-1 border-2 border-gray-900 z-20`}>
               {isRest ? <AlertTriangle size={20} className="text-white"/> : <CheckCircle2 size={20} className="text-white" />}
             </div>
           </div>

           <h2 className={`text-3xl font-black text-transparent bg-clip-text ${isRest ? 'bg-gradient-to-r from-pink-400 to-red-400' : 'bg-gradient-to-r from-emerald-400 to-teal-200'} mb-1 tracking-wider italic uppercase`}>
             {isRest ? 'REST TAKEN' : 'QUEST CLEAR!'}
           </h2>
           <p className="text-gray-400 text-xs font-mono mb-6 uppercase tracking-widest">{isRest ? 'Stats Decreased' : 'Mission Complete'}</p>

           <div className="bg-gray-900/80 rounded-xl p-4 border border-gray-800 mb-6">
              <div className="flex items-center gap-2 justify-center text-gray-300 font-bold mb-2">
                 <span>{isRest ? '🛌' : config.icon}</span>
                 <span className="truncate max-w-[200px]">{task.title}</span>
              </div>
              
              {isRest ? (
                 <div className="text-2xl font-black text-red-400 drop-shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                    -{task.reward} <span className="text-xs text-gray-500">XP from {config.label}</span>
                 </div>
              ) : (
                 <div className="text-4xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                    +{task.reward} <span className="text-base text-gray-500">EXP</span>
                 </div>
              )}
           </div>
            
            {isRest && (
                <p className="text-xs text-gray-500 mb-6 px-4">
                    十分な休息を取りましたが、成長の勢いが少し衰えました...
                </p>
            )}

           <button 
             onClick={onClose}
             className={`w-full bg-gradient-to-r ${isRest ? 'from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500' : 'from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500'} text-white font-black py-4 rounded-xl shadow-lg transform transition active:scale-[0.98] uppercase tracking-wider`}
           >
             {isRest ? '確認' : '報酬を受け取る'}
           </button>
        </div>
      </div>
    </div>
  );
};
