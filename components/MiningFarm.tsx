
import React, { useState, useEffect } from 'react';
import { Stats, GeneratorData, getLevelInfo, TaskType } from '../types';
import { Coins, Pickaxe, TrendingUp } from 'lucide-react';

interface MiningFarmProps {
  stats: Stats;
  generatorData: GeneratorData;
  onCollect: (amount: number) => void;
}

export const MiningFarm: React.FC<MiningFarmProps> = ({ stats, generatorData, onCollect }) => {
  const [pendingGold, setPendingGold] = useState(0);

  // 1. Calculate Total Level
  const studyLevel = getLevelInfo(stats[TaskType.STUDY]).level;
  const exerciseLevel = getLevelInfo(stats[TaskType.EXERCISE]).level;
  const workLevel = getLevelInfo(stats[TaskType.WORK]).level;
  const totalLevel = studyLevel + exerciseLevel + workLevel;

  // 2. Calculate Rate (Gold Per Hour)
  // Request: Increase by 1 unit every 3 levels.
  // Formula: floor(Total Level / 3) G/hr
  const goldPerHour = Math.floor(totalLevel / 3);
  const goldPerSecond = goldPerHour / 3600;

  useEffect(() => {
    // Update pending gold every second for visual effect
    const interval = setInterval(() => {
        if (!generatorData.lastCollected) {
             setPendingGold(0);
             return;
        }

        const lastCollectedTime = new Date(generatorData.lastCollected).getTime();
        
        // Safety check for invalid date causing NaN
        if (isNaN(lastCollectedTime)) {
            setPendingGold(0);
            return;
        }

        const now = Date.now();
        const diffSeconds = (now - lastCollectedTime) / 1000;
        
        const generated = Math.floor(diffSeconds * goldPerSecond);
        
        // Ensure strictly non-negative and not NaN
        setPendingGold(Math.max(0, isNaN(generated) ? 0 : generated));
    }, 1000);

    return () => clearInterval(interval);
  }, [generatorData, goldPerSecond]);

  const handleCollect = () => {
     if (pendingGold > 0) {
        onCollect(pendingGold);
        setPendingGold(0);
     }
  };

  return (
    <div className="bg-gray-900/80 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-gray-800 flex flex-col items-center justify-center relative overflow-hidden min-h-[200px] transition-all duration-500 group">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-yellow-500/10 blur-[50px] rounded-full pointer-events-none group-hover:bg-yellow-500/20 transition-colors duration-1000"></div>
      
      {/* Label */}
      <div className="absolute top-3 left-3 bg-gray-800/80 px-2 py-0.5 rounded text-[10px] text-yellow-500 font-mono border border-yellow-500/30 flex items-center gap-1">
        <Pickaxe size={10} /> IDLE
      </div>

      {/* Main Visual */}
      <div className="relative z-10 py-1 flex flex-col items-center w-full">
         <div className="text-4xl filter drop-shadow-[0_0_15px_rgba(234,179,8,0.4)] animate-pulse mb-1">
            🏛️
         </div>
         <h3 className="text-sm font-bold text-yellow-400 mb-0.5 drop-shadow-sm tracking-widest uppercase">
            資産運用
         </h3>
         <p className="text-[9px] text-gray-500 text-center max-w-[180px] mb-2">
            Lv.3ごとに1G/Hr
         </p>

         {/* Stats Panel */}
         <div className="w-full max-w-[200px] bg-gray-950/50 rounded-lg p-2 border border-gray-700/50 mb-2 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-1 pb-1 border-b border-gray-800">
               <span className="text-[9px] text-gray-500 font-bold uppercase">Total Lv</span>
               <span className="text-white font-mono font-bold text-xs">{totalLevel}</span>
            </div>
            <div className="flex justify-between items-center text-yellow-500">
               <span className="text-[9px] font-bold uppercase flex items-center gap-1">
                  <TrendingUp size={10} /> Rate
               </span>
               <span className="font-mono font-bold text-xs flex items-center gap-1">
                  {goldPerHour} <span className="text-[8px]">G/Hr</span>
               </span>
            </div>
         </div>

         {/* Collection Display */}
         <div className="flex flex-col items-center gap-2 w-full max-w-[200px]">
             <div className="text-xl font-black text-white font-mono flex items-center gap-2 drop-shadow-lg">
                <span className="text-yellow-500 text-base">🪙</span>
                {pendingGold.toLocaleString()}
             </div>
             
             <button
               onClick={handleCollect}
               disabled={pendingGold <= 0}
               className={`w-full py-1.5 px-4 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  pendingGold > 0 
                  ? 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white shadow-[0_0_15px_rgba(234,179,8,0.3)]' 
                  : 'bg-gray-800 text-gray-600 cursor-not-allowed'
               }`}
             >
                <Coins size={12} /> 回収
             </button>
         </div>
      </div>
    </div>
  );
};
