
import React, { useState } from 'react';
import { generateWeeklyMissions } from '../services/geminiService';
import { PoolMission, UserProfile } from '../types';
import { Loader2, Rocket, Sparkles, X } from 'lucide-react';

interface WeeklySetupModalProps {
  onComplete: (missions: PoolMission[], goalText: string) => void;
  onClose: () => void;
  userProfile?: UserProfile;
}

export const WeeklySetupModal: React.FC<WeeklySetupModalProps> = ({ onComplete, onClose, userProfile }) => {
  const [goals, setGoals] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goals.trim()) return;

    setIsLoading(true);
    try {
      const goalList = goals.split('\n').filter(g => g.trim().length > 0);
      // Pass the userProfile to the generator
      const missions = await generateWeeklyMissions(goalList, userProfile);
      // Pass both missions AND raw goals text back
      onComplete(missions, goals);
    } catch (error) {
      console.error(error);
      alert("ミッションの生成に失敗しました。もう一度お試しください。");
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-500">
      <div className="bg-gray-900 rounded-3xl shadow-[0_0_50px_rgba(37,99,235,0.2)] p-8 max-w-lg w-full relative border border-blue-500/20 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none"></div>
        
        <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors z-20"
        >
            <X size={24} />
        </button>

        <div className="relative z-10 text-center">
          <div className="mx-auto w-16 h-16 bg-blue-900/30 rounded-full flex items-center justify-center mb-6 border border-blue-500/30 shadow-[0_0_20px_rgba(37,99,235,0.3)]">
            <Rocket className="w-8 h-8 text-blue-400" />
          </div>

          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-3 tracking-tight">
            NEW WEEK START
          </h2>
          <p className="text-gray-400 mb-8 font-medium">
            今週達成したい目標は何ですか？<br/>
            <span className="text-xs opacity-60">（空いた枠は設定された趣味に基づいて「休息」などで埋めます！）</span>
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative">
              <textarea
                className="w-full h-32 px-5 py-4 rounded-xl bg-gray-800 border border-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none resize-none transition-all placeholder-gray-600 font-medium"
                placeholder="入力例:&#10;Reactのフックを勉強する&#10;ランニングを2回する&#10;レポートを終わらせる"
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !goals.trim()}
              className={`w-full py-4 rounded-xl font-bold text-white flex justify-center items-center gap-3 transition-all duration-300 uppercase tracking-widest ${
                isLoading 
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] transform hover:scale-[1.02]'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" />
                  デッキ構築中...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  週間ミッション生成
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};