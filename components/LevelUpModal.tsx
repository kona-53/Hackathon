
import React from 'react';
import { TaskType, TASK_CONFIG, getTitleForLevel } from '../types';
import { X, Crown } from 'lucide-react';

interface LevelUpModalProps {
  show: boolean;
  type: TaskType | null;
  newLevel: number;
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ show, type, newLevel, onClose }) => {
  if (!show || !type) return null;
  const config = TASK_CONFIG[type];
  const newTitle = getTitleForLevel(type, newLevel);
  
  // Check if this level up triggered a Rank Change (Every 10 levels: 10, 20, 30...)
  const isRankUp = newLevel % 10 === 0;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className={`bg-gray-900 rounded-3xl shadow-[0_0_50px_rgba(250,204,21,0.3)] p-8 max-w-sm w-full text-center relative border border-yellow-500/30 overflow-hidden ${isRankUp ? 'border-2 border-yellow-400' : ''}`}>
        {/* Background rays effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 to-transparent z-0" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-500/20 blur-[60px] rounded-full"></div>
        
        <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors z-20"
        >
            <X size={24} />
        </button>

        <div className="relative z-10">
            {isRankUp && (
               <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-yellow-500 animate-bounce">
                  <Crown size={40} className="fill-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]" />
               </div>
            )}

            <div className="text-7xl mb-6 animate-bounce drop-shadow-[0_0_20px_rgba(255,255,255,0.5)] mt-4">
                {config.icon}
            </div>
            
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 mb-2 drop-shadow-sm uppercase tracking-wider italic">
                {isRankUp ? 'RANK UP!!' : 'LEVEL UP!'}
            </h2>
            
            <div className="text-gray-400 font-bold text-lg mb-4">
                <span className={config.textColor}>{config.label}</span> が<br/>
                <span className="text-5xl text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] mt-2 block">Lv.{newLevel}</span>
                に上がりました！
            </div>

            {isRankUp && (
              <div className="bg-yellow-900/40 border border-yellow-500/50 p-3 rounded-xl mb-6 animate-pulse">
                <div className="text-xs text-yellow-200 font-bold uppercase tracking-widest mb-1">New Title Acquired</div>
                <div className="text-2xl font-black text-yellow-100">{newTitle}</div>
              </div>
            )}

            <button 
                onClick={onClose}
                className="bg-yellow-500 hover:bg-yellow-400 text-black font-black py-4 px-10 rounded-full shadow-[0_0_20px_rgba(234,179,8,0.6)] hover:shadow-[0_0_40px_rgba(234,179,8,0.8)] transform transition duration-200 hover:scale-105 active:scale-95 uppercase tracking-widest"
            >
                最高！
            </button>
        </div>
      </div>
    </div>
  );
};
