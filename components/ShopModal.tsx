
import React from 'react';
import { ShopItem } from '../types';
import { Coins, X, ShoppingBag, Ticket } from 'lucide-react';

interface ShopModalProps {
  gold: number;
  onClose: () => void;
  onBuy: (item: ShopItem) => void;
  currentPotionPrice: number;
  currentSkipTicketPrice: number; // New prop
}

// Static Item Definitions (Base values)
const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'potion_stamina',
    name: 'スタミナポーション',
    description: 'サボりで減った全ステータスを50ポイント回復する。',
    cost: 1000, // Base cost
    icon: '🧪',
    effectType: 'heal_stats',
    effectValue: 50
  },
  {
    id: 'skip_ticket',
    name: '免罪符 (サボりチケット)',
    description: '1回だけペナルティ(XP減少)なしでタスクをサボることができるアイテム。',
    cost: 2000, // Base cost
    icon: '📜',
    effectType: 'item',
    effectValue: 1
  }
];

export const ShopModal: React.FC<ShopModalProps> = ({ gold, onClose, onBuy, currentPotionPrice, currentSkipTicketPrice }) => {
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-gray-900 rounded-3xl border border-yellow-600/30 max-w-2xl w-full h-[60vh] flex flex-col relative shadow-[0_0_50px_rgba(234,179,8,0.2)] overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-800 bg-gray-900/80 relative z-10">
           <div className="flex items-center gap-3">
              <div className="bg-yellow-500/20 p-2 rounded-lg text-yellow-500">
                 <ShoppingBag size={24} />
              </div>
              <div>
                 <h2 className="text-2xl font-black text-white">ITEM SHOP</h2>
                 <p className="text-xs text-gray-400">ゴールドを使ってアイテムを購入</p>
              </div>
           </div>
           
           <div className="flex items-center gap-4">
              <div className="bg-gray-800 px-4 py-2 rounded-full border border-yellow-500/30 flex items-center gap-2 text-yellow-400 font-mono font-bold">
                 <Coins size={16} />
                 {gold.toLocaleString()} G
              </div>
              <button onClick={onClose} className="bg-gray-800 p-2 rounded-full hover:bg-gray-700 transition-colors">
                 <X size={20} className="text-gray-400" />
              </button>
           </div>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-6 grid grid-cols-1 gap-4 custom-scrollbar">
           {SHOP_ITEMS.map(baseItem => {
              // Apply dynamic price
              const item = { ...baseItem };
              if (item.id === 'potion_stamina') {
                  item.cost = currentPotionPrice;
              } else if (item.id === 'skip_ticket') {
                  item.cost = currentSkipTicketPrice;
              }

              return (
                <div key={item.id} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 hover:border-yellow-500/50 transition-all group flex flex-col md:flex-row items-center gap-4">
                    <div className="text-4xl group-hover:scale-110 transition-transform duration-300 p-2 bg-gray-900 rounded-lg shrink-0">
                        {item.icon}
                    </div>
                    
                    <div className="flex-grow text-center md:text-left">
                        <h3 className="font-bold text-lg text-white mb-1">{item.name}</h3>
                        <p className="text-xs text-gray-400">{item.description}</p>
                        {item.id === 'potion_stamina' && (
                             <p className="text-[10px] text-yellow-500 mt-1">
                                ※購入ごとに100G値上がりします（毎月1日にリセット）
                             </p>
                        )}
                        {item.id === 'skip_ticket' && (
                             <p className="text-[10px] text-yellow-500 mt-1">
                                ※購入ごとに200G値上がりします（毎月1日にリセット）
                             </p>
                        )}
                    </div>
                    
                    <div className="flex flex-col items-end gap-2 shrink-0 w-full md:w-auto">
                        <span className={`font-mono font-bold text-lg ${gold >= item.cost ? 'text-yellow-400' : 'text-red-400'}`}>
                            {item.cost.toLocaleString()} G
                        </span>
                        <button 
                        onClick={() => onBuy(item)}
                        disabled={gold < item.cost}
                        className={`w-full md:w-32 py-2 px-4 rounded-lg font-bold text-sm uppercase tracking-wider transition-all ${
                            gold >= item.cost 
                            ? 'bg-yellow-600 hover:bg-yellow-500 text-white shadow-lg hover:shadow-yellow-500/20' 
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        }`}
                        >
                            {gold >= item.cost ? '購入' : '不足'}
                        </button>
                    </div>
                </div>
              );
           })}
        </div>
      </div>
    </div>
  );
};