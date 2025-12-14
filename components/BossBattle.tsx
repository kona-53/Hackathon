
import React, { useState } from 'react';
import { Boss, BossType } from '../types';
import { analyzeBoss } from '../services/geminiService';
import { Sword, Skull, Plus, Shield, Calendar, Gift, X, Loader2, Sparkles } from 'lucide-react';

interface BossBattleProps {
  bosses: Boss[];
  onAddBoss: (boss: Boss) => void;
  onDeleteBoss: (id: string) => void;
}

export const BossBattle: React.FC<BossBattleProps> = ({ bosses, onAddBoss, onDeleteBoss }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Active bosses first, then completed/failed
  const activeBoss = bosses.find(b => b.status === 'active');
  
  // Form State
  const [name, setName] = useState('');
  const [deadline, setDeadline] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !deadline) return;

    setIsLoading(true);

    try {
        // Calculate days remaining
        const today = new Date();
        const targetDate = new Date(deadline);
        const diffTime = targetDate.getTime() - today.getTime();
        const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const validDays = Math.max(1, daysRemaining);

        // AI Analyze
        const analysis = await analyzeBoss(name, validDays);

        const newBoss: Boss = {
            id: crypto.randomUUID(),
            name,
            description: analysis.description,
            hp: analysis.hp,
            maxHp: analysis.hp,
            rewardGold: Math.floor(analysis.hp * 0.5),
            expReward: Math.floor(analysis.hp * 0.2),
            deadline: deadline,
            type: analysis.type,
            status: 'active'
        };

        onAddBoss(newBoss);
        setShowAddForm(false);
        setName('');
        setDeadline('');
    } catch (error) {
        console.error("Failed to generate boss", error);
        alert("ボスの生成に失敗しました。");
    } finally {
        setIsLoading(false);
    }
  };

  const getBossVisual = (type: BossType) => {
    switch(type) {
      case 'dragon': return '🐲';
      case 'demon': return '👿';
      case 'kraken': return '🦑';
      case 'golem': return '🗿';
      default: return '👾';
    }
  };

  return (
    <div className="bg-gray-900/60 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-gray-800 relative overflow-hidden min-h-[300px] flex flex-col">
       {/* Background Ambience */}
       <div className="absolute top-0 right-0 w-64 h-64 bg-red-900/10 blur-[80px] rounded-full pointer-events-none"></div>

       <div className="flex justify-between items-center mb-4 relative z-10">
         <h2 className="text-lg font-bold text-gray-200 flex items-center gap-2">
            <Sword className="w-5 h-5 text-red-500" />
            ボスバトル (長期目標)
         </h2>
         {!activeBoss && !showAddForm && (
            <button 
              onClick={() => setShowAddForm(true)} 
              className="text-xs bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-800/50 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
            >
              <Plus size={14} /> 新規討伐
            </button>
         )}
       </div>

       {showAddForm ? (
         <form onSubmit={handleAdd} className="flex flex-col gap-4 relative z-10 animate-in fade-in slide-in-from-right duration-300">
            <div>
                <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">目標名</label>
                <input 
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-red-500/50 outline-none"
                placeholder="例: 資格試験合格、アプリ完成"
                value={name} onChange={e => setName(e.target.value)} required
                disabled={isLoading}
                />
            </div>
            
            <div>
               <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">達成期限</label>
               <input 
                  type="date"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-red-500/50 outline-none"
                  value={deadline} onChange={e => setDeadline(e.target.value)}
                  required
                  disabled={isLoading}
               />
               <p className="text-[10px] text-gray-500 mt-1">※内容と期限からAIがボスの強さを決定します</p>
            </div>

            <div className="flex gap-2 mt-2">
               <button 
                type="button" 
                onClick={() => setShowAddForm(false)} 
                disabled={isLoading}
                className="flex-1 py-3 bg-gray-700 text-gray-300 rounded-lg text-xs font-bold hover:bg-gray-600 transition-colors"
               >
                 キャンセル
               </button>
               <button 
                type="submit" 
                disabled={isLoading}
                className="flex-1 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white rounded-lg text-xs font-bold shadow-[0_0_15px_rgba(220,38,38,0.4)] flex justify-center items-center gap-2"
               >
                 {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <><Sparkles size={14} /> 召喚</>}
               </button>
            </div>
         </form>
       ) : activeBoss ? (
         <div className="flex flex-col items-center flex-grow justify-center relative z-10">
            <div className="absolute top-0 right-0">
               <button onClick={() => { if(confirm('討伐を諦めますか？')) onDeleteBoss(activeBoss.id) }} className="text-gray-600 hover:text-red-400 p-1">
                  <X size={16} />
               </button>
            </div>
            
            <div className="text-6xl mb-2 filter drop-shadow-[0_0_20px_rgba(220,38,38,0.5)] animate-bounce-slow transform hover:scale-110 transition-transform cursor-pointer">
               {getBossVisual(activeBoss.type)}
            </div>
            
            <h3 className="text-xl font-black text-red-100 mb-0 leading-tight text-center px-2">{activeBoss.name}</h3>
            {activeBoss.description && (
                <p className="text-xs text-red-300/70 mb-3 italic text-center max-w-[200px]">{activeBoss.description}</p>
            )}
            
            {activeBoss.deadline && (
               <div className="text-xs text-red-300 mb-4 flex items-center gap-1 bg-red-900/30 px-2 py-0.5 rounded border border-red-500/20">
                  <Calendar size={12} /> {activeBoss.deadline} まで
               </div>
            )}
            
            <div className="w-full max-w-[240px] mb-2">
               <div className="flex justify-between text-xs font-bold text-gray-400 mb-1">
                  <span>HP</span>
                  <span>{activeBoss.hp} / {activeBoss.maxHp}</span>
               </div>
               <div className="h-4 bg-gray-800 rounded-full border border-gray-700 overflow-hidden relative shadow-inner">
                  <div 
                     className="h-full bg-gradient-to-r from-red-600 to-orange-500 transition-all duration-500"
                     style={{ width: `${(activeBoss.hp / activeBoss.maxHp) * 100}%` }}
                  ></div>
               </div>
            </div>
            
            <div className="text-[10px] text-gray-500 flex gap-3 mt-2">
               <span className="flex items-center gap-1"><Gift size={10} /> {activeBoss.rewardGold} G</span>
               <span className="flex items-center gap-1"><Shield size={10} /> {activeBoss.expReward} EXP</span>
            </div>
         </div>
       ) : (
         <div className="flex flex-col items-center justify-center flex-grow text-gray-500 relative z-10">
            <Skull size={48} className="mb-2 opacity-50" />
            <p className="text-sm">現在アクティブなボスはいません。</p>
            <p className="text-xs opacity-70 mt-1">大きな目標を設定して挑みましょう。</p>
         </div>
       )}
    </div>
  );
};
