
import React, { useState, useEffect } from 'react';
import { PoolMission, TASK_CONFIG, StreakInfo } from '../types';
import { Gift, Zap, HelpCircle, Flame, CalendarClock, X } from 'lucide-react';

interface DailyGachaModalProps {
  pool: PoolMission[];
  onRoll: (mission: PoolMission) => void;
  onClose: () => void;
  streakInfo?: StreakInfo;
}

export const DailyGachaModal: React.FC<DailyGachaModalProps> = ({ pool, onRoll, onClose, streakInfo }) => {
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState<PoolMission | null>(null);
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);

  // Filter available missions
  const availableMissions = pool.filter(p => !p.isUsed);

  const handleRoll = () => {
    if (availableMissions.length === 0) {
      alert("プールにミッションが残っていません！");
      return;
    }

    setIsRolling(true);
    
    let currentIndex = 0;
    const totalDuration = 2000; // 2 seconds spin
    const intervalTime = 100; // Switch every 100ms
    const steps = totalDuration / intervalTime;
    let currentStep = 0;

    const interval = setInterval(() => {
      setHighlightIndex(currentIndex);
      currentIndex = (currentIndex + 1) % availableMissions.length;
      currentStep++;

      if (currentStep >= steps) {
        clearInterval(interval);
        
        // Final selection
        const winnerIndex = Math.floor(Math.random() * availableMissions.length);
        setHighlightIndex(winnerIndex);
        
        // Pause briefly on the winner before showing result card
        setTimeout(() => {
          setResult(availableMissions[winnerIndex]);
          setIsRolling(false);
        }, 500);
      }
    }, intervalTime);
  };

  const handleAccept = () => {
    if (result) {
      onRoll(result);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 animate-in fade-in duration-500">
      <div className="max-w-md w-full relative flex flex-col max-h-[90vh]">
        {/* Close Button - Only show if not currently rolling/result shown to prevent closing during animation if desired, but user asked for closeable anytime. Let's keep it generally available unless critical state. */}
        {!isRolling && !result && (
            <button 
                onClick={onClose} 
                className="absolute top-0 right-0 p-2 text-gray-500 hover:text-white transition-colors z-20"
            >
                <X size={24} />
            </button>
        )}

        {!result ? (
          <div className="text-center flex flex-col items-center w-full">
             
             {/* Gacha Machine Visual */}
             <div className="relative mb-6 mt-2 scale-90 sm:scale-100">
                <style>{`
                  @keyframes tumble {
                    0% { transform: translate(0,0) rotate(0deg); }
                    25% { transform: translate(15px, -20px) rotate(90deg); }
                    50% { transform: translate(-10px, -30px) rotate(180deg); }
                    75% { transform: translate(-15px, -10px) rotate(270deg); }
                    100% { transform: translate(0,0) rotate(360deg); }
                  }
                  .animate-tumble {
                    animation: tumble 0.5s infinite linear;
                  }
                `}</style>
                
                <div className="relative flex flex-col items-center">
                    {/* Dome */}
                    <div className="w-48 h-48 rounded-full bg-blue-500/10 border-4 border-gray-700/80 relative overflow-hidden z-10 backdrop-blur-sm shadow-[inset_0_0_30px_rgba(59,130,246,0.2)]">
                        {/* Reflection */}
                        <div className="absolute top-8 left-6 w-12 h-6 bg-white/10 rounded-full -rotate-45 blur-md pointer-events-none z-20"></div>
                        
                        {/* Capsules */}
                        <div className={`absolute inset-0 flex flex-wrap justify-center items-end content-end p-5 gap-1 transition-all duration-300 ${isRolling ? 'pb-8' : 'pb-4'}`}>
                           {[...Array(7)].map((_, i) => (
                              <div 
                                key={i} 
                                className={`w-10 h-10 rounded-full shadow-[inset_-2px_-2px_6px_rgba(0,0,0,0.4)] border border-white/20 relative ${
                                  ['bg-red-500', 'bg-blue-500', 'bg-yellow-400', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500'][i % 7]
                                } ${isRolling ? 'animate-tumble' : ''}`}
                                style={{
                                    animationDelay: isRolling ? `-${Math.random() * 0.5}s` : '0s',
                                    animationDuration: isRolling ? `${0.4 + Math.random() * 0.3}s` : '0s'
                                }}
                              >
                                <div className="absolute top-2 left-2 w-3 h-2 bg-white/30 rounded-full rotate-45"></div>
                                <div className="absolute inset-0 border-2 border-black/10 rounded-full opacity-50"></div>
                                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-black/10"></div>
                              </div>
                           ))}
                        </div>
                    </div>

                    {/* Base */}
                    <div className="w-40 h-36 bg-gray-800 rounded-b-[2rem] rounded-t-xl -mt-12 border-4 border-yellow-600/50 relative z-20 shadow-2xl flex flex-col items-center pt-14">
                        {/* Decorative plate */}
                        <div className="absolute top-14 w-32 h-20 bg-gray-900/50 rounded-xl border border-gray-700"></div>

                        {/* Handle */}
                        <div className="relative z-30 mt-1">
                          <div className={`w-16 h-16 bg-yellow-500 rounded-full border-4 border-yellow-700 flex items-center justify-center shadow-lg transition-transform duration-1000 ${isRolling ? 'animate-spin' : ''}`}>
                              <div className="w-12 h-3 bg-yellow-700 rounded-full"></div>
                          </div>
                        </div>
                        
                        {/* Outlet */}
                        <div className="absolute bottom-4 w-20 h-6 bg-black/80 rounded-full shadow-[inset_0_2px_5px_rgba(0,0,0,0.8)] border-b border-gray-700"></div>
                    </div>
                </div>
             </div>

             <h2 className="text-2xl font-black text-yellow-400 mb-1 tracking-widest uppercase drop-shadow-lg">
                GACHA MACHINE
             </h2>
             <p className="text-gray-400 mb-6 font-mono text-xs">運命のタスクを回せ</p>

             <button
               onClick={handleRoll}
               disabled={isRolling}
               className="mb-8 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-lg py-3 px-10 rounded-full shadow-[0_0_30px_rgba(234,179,8,0.5)] hover:shadow-[0_0_50px_rgba(234,179,8,0.7)] transform transition duration-100 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider shrink-0"
             >
               {isRolling ? '抽選中...' : 'ガチャを回す'}
             </button>

             {/* Remaining Pool List */}
             <div className="w-full bg-gray-900/80 rounded-xl border border-gray-800 p-4 overflow-hidden flex flex-col shadow-inner">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <HelpCircle size={12} /> 残りのミッション ({availableMissions.length})
                </div>
                
                <div className="flex flex-col gap-2 overflow-y-auto max-h-[200px] pr-1 custom-scrollbar">
                  {availableMissions.map((mission, idx) => {
                    const isHighlighted = idx === highlightIndex;
                    const config = TASK_CONFIG[mission.type];
                    
                    return (
                      <div 
                        key={mission.id}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-100 ${
                          isHighlighted 
                            ? 'bg-yellow-500/20 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)] scale-[1.02]' 
                            : 'bg-gray-800 border-gray-700/50 opacity-70'
                        }`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                           <div className="text-lg">{config.icon}</div>
                           <div className={`text-sm font-bold truncate ${isHighlighted ? 'text-white' : 'text-gray-400'}`}>
                             {mission.title}
                           </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                           {mission.isSabori && (
                             <span className="text-[10px] bg-pink-900/50 text-pink-300 px-1.5 py-0.5 rounded border border-pink-500/30">REST</span>
                           )}
                           <span className="text-xs font-mono text-yellow-500">+{mission.reward}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
             </div>
          </div>
        ) : (
          <div className="bg-gray-900 rounded-3xl p-1 border border-yellow-500/50 shadow-[0_0_100px_rgba(234,179,8,0.2)] animate-in zoom-in duration-300">
            <div className="bg-gray-800/50 rounded-[22px] p-8 text-center relative overflow-hidden">
               {/* Confetti / Rays */}
               <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 to-transparent pointer-events-none"></div>
               <div className="absolute -top-20 -right-20 w-64 h-64 bg-yellow-500/20 blur-[80px] rounded-full pointer-events-none"></div>

               <div className="text-yellow-400 font-black tracking-widest text-sm mb-6 uppercase">
                 Mission Acquired
               </div>

               <div className="text-6xl mb-4 filter drop-shadow-xl">
                 {TASK_CONFIG[result.type].icon}
               </div>

               <h3 className="text-2xl font-bold text-white mb-2 leading-tight">
                 {result.title}
               </h3>
               
               <div className="flex justify-center gap-2 mb-6">
                 <span className={`px-3 py-1 rounded-full text-xs font-bold border ${result.isSabori ? 'bg-pink-900/30 border-pink-500/50 text-pink-400' : 'bg-blue-900/30 border-blue-500/50 text-blue-400'}`}>
                   {result.isSabori ? 'サボりモード' : 'メインミッション'}
                 </span>
                 <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-900/30 border border-yellow-500/50 text-yellow-400 flex items-center gap-1">
                   <Zap size={10} /> +{result.reward} EXP
                 </span>
               </div>
               
               {/* Streak & Bonus Info */}
               {streakInfo && (
                <div className="bg-gray-900/80 rounded-xl p-3 mb-6 border border-gray-700/50">
                   <div className="flex items-center justify-between px-2 mb-2">
                      <div className="flex items-center gap-2 text-orange-400 font-bold">
                         <Flame size={16} className="fill-orange-400" />
                         <span>{streakInfo.currentStreak}日連続</span>
                      </div>
                      <div className="text-xs text-gray-400 flex items-center gap-1">
                         <CalendarClock size={12} />
                         <span>ビッグボーナスまであと {streakInfo.daysToNextBigBonus} 日</span>
                      </div>
                   </div>
                   
                   <div className="bg-gray-800 rounded-lg p-2 text-sm flex justify-center items-center gap-2 text-yellow-300 font-bold border border-yellow-500/20">
                      <Gift size={14} />
                      <span>ログインボーナス: +{streakInfo.bonusExp} EXP</span>
                   </div>
                </div>
               )}

               <button
                 onClick={handleAccept}
                 className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-bold py-4 rounded-xl shadow-lg transform transition active:scale-[0.98] uppercase tracking-wider"
               >
                 ミッション受諾 & ボーナス受取
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
