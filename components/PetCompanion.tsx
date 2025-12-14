
import React, { useEffect, useState } from 'react';
import { PetData } from '../types';
import { Sparkles, RefreshCcw, Egg, ArrowUpCircle } from 'lucide-react';

interface PetCompanionProps {
  pet: PetData;
  onRebirth: () => void;
}

export const PetCompanion: React.FC<PetCompanionProps> = ({ pet, onRebirth }) => {
  const [animate, setAnimate] = useState(false);

  // Trigger animation on exp change
  useEffect(() => {
    setAnimate(true);
    const timer = setTimeout(() => setAnimate(false), 500);
    return () => clearTimeout(timer);
  }, [pet.currentExp]);

  // Calculate Progress & Stage
  const progressPercent = Math.min(100, (pet.currentExp / pet.hatchThreshold) * 100);
  
  // Determine Stage
  // 0-30%: Egg
  // 30-70%: Baby
  // 70-100%: Young
  // Hatched: Adult
  let stage: 'egg' | 'baby' | 'young' | 'adult' = 'egg';
  if (pet.status === 'hatched') {
    stage = 'adult';
  } else if (progressPercent >= 70) {
    stage = 'young';
  } else if (progressPercent >= 30) {
    stage = 'baby';
  } else {
    stage = 'egg';
  }

  // Determine Dominant Stat
  const { study, exercise, work } = pet.expDistribution;
  let dominantStat: 'study' | 'exercise' | 'work' | 'balanced' = 'balanced';
  const maxVal = Math.max(study, exercise, work);
  
  if (maxVal > 0) {
      if (study === maxVal && study > exercise && study > work) dominantStat = 'study';
      else if (exercise === maxVal && exercise > study && exercise > work) dominantStat = 'exercise';
      else if (work === maxVal && work > study && work > exercise) dominantStat = 'work';
  }

  // Visual & Text Helpers
  const getVisualConfig = () => {
    if (stage === 'adult') {
        switch (pet.type) {
            case 'owl': return { icon: '🦉', color: 'text-blue-400', glow: 'shadow-blue-500/50', name: 'ミネルヴァ (知恵のフクロウ)' };
            case 'lion': return { icon: '🦁', color: 'text-red-400', glow: 'shadow-red-500/50', name: 'レオン (力の獅子)' };
            case 'fox': return { icon: '🦊', color: 'text-emerald-400', glow: 'shadow-emerald-500/50', name: 'コンコン (集中の狐)' };
            case 'slime': default: return { icon: '👾', color: 'text-purple-400', glow: 'shadow-purple-500/50', name: 'メタモン (万能スライム)' };
        }
    }

    // Intermediate Stages
    switch (dominantStat) {
        case 'study':
            if (stage === 'young') return { icon: '🦅', color: 'text-blue-300', glow: 'shadow-blue-500/40', name: '賢き若鳥' };
            if (stage === 'baby') return { icon: '🐛', color: 'text-blue-200', glow: 'shadow-blue-500/30', name: '知識の幼虫' };
            return { icon: <Egg size={100} className="text-blue-200" />, color: 'text-blue-100', glow: 'shadow-blue-500/20', name: '青く光る卵' };
        
        case 'exercise':
            if (stage === 'young') return { icon: '🐯', color: 'text-red-300', glow: 'shadow-red-500/40', name: '猛き若虎' };
            if (stage === 'baby') return { icon: '🐗', color: 'text-red-200', glow: 'shadow-red-500/30', name: '力の瓜坊' };
            return { icon: <Egg size={100} className="text-red-200" />, color: 'text-red-100', glow: 'shadow-red-500/20', name: '赤く脈打つ卵' };

        case 'work':
            if (stage === 'young') return { icon: '🐕', color: 'text-emerald-300', glow: 'shadow-emerald-500/40', name: '忠実な若犬' };
            if (stage === 'baby') return { icon: '🐜', color: 'text-emerald-200', glow: 'shadow-emerald-500/30', name: '勤勉な蟻' };
            return { icon: <Egg size={100} className="text-emerald-200" />, color: 'text-emerald-100', glow: 'shadow-emerald-500/20', name: '緑に輝く卵' };

        default: // Balanced or Initial
            if (stage === 'young') return { icon: '🌀', color: 'text-purple-300', glow: 'shadow-purple-500/40', name: '混沌の渦' };
            if (stage === 'baby') return { icon: '👻', color: 'text-purple-200', glow: 'shadow-purple-500/30', name: '謎の幼体' };
            return { icon: <Egg size={100} className="text-gray-300" />, color: 'text-gray-100', glow: 'shadow-white/20', name: '静かな卵' };
    }
  };

  const visual = getVisualConfig();

  const getPetDescription = () => {
     if (stage === 'adult') {
        switch (pet.type) {
            case 'owl': return '知識の探求を極めた姿。賢明な判断力であなたを導きます。';
            case 'lion': return '圧倒的な力を得た姿。困難なタスクもなぎ倒す勇気を与えます。';
            case 'fox': return '集中と効率を極めた姿。無駄のない動きで生産性を最大化します。';
            case 'slime': return 'あらゆる可能性を秘めた姿。柔軟な思考でどんな状況にも適応します。';
            default: return '未知の進化を遂げた相棒です。';
        }
     }
     
     if (stage === 'young') {
        switch (dominantStat) {
            case 'study': return '知性の翼が広がり始めています。立派な賢者になる予感がします。';
            case 'exercise': return '筋肉が隆起し、力がみなぎっています。王者の風格が漂います。';
            case 'work': return '鋭い眼差しで周囲を観察しています。仕事人の顔つきになってきました。';
            default: return '形が定まらず、不思議なオーラを放っています。何になるのか予測できません。';
        }
     }

     if (stage === 'baby') {
        switch (dominantStat) {
            case 'study': return '本を読むような仕草を見せます。知識への渇望を感じます。';
            case 'exercise': return '元気に飛び回っています。体力の片鱗が見えます。';
            case 'work': return 'せっせと何かを運んでいます。真面目な性格のようです。';
            default: return '殻が割れ、何かが生まれました。まだ方向性は定まっていないようです。';
        }
     }

     // Egg
     return 'タスクを完了してエネルギーを送りましょう。あなたの行動によって生まれる姿が変わります。';
  };

  return (
    <div className="bg-gray-900/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-gray-800 flex flex-col items-center justify-center relative overflow-hidden min-h-[320px] transition-all duration-500">
      {/* Background Ambience */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 blur-[80px] rounded-full pointer-events-none transition-colors duration-1000 ${stage === 'egg' ? 'bg-gray-500/10' : visual.color.replace('text-', 'bg-').replace('400', '500/20').replace('300', '500/20').replace('200', '500/20')}`}></div>
      
      {/* Generation Badge */}
      <div className="absolute top-4 left-4 bg-gray-800/80 px-2 py-1 rounded text-[10px] text-gray-400 font-mono border border-gray-700">
        GEN: {pet.generation} | STAGE: {stage.toUpperCase()}
      </div>

      {pet.status === 'hatched' && (
         <button 
           onClick={() => {
             if (confirm("相棒と別れて、新しい卵を育てますか？")) {
               onRebirth();
             }
           }}
           className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
           title="新しい卵を育てる"
         >
           <RefreshCcw size={16} />
         </button>
      )}

      {/* Main Visual */}
      <div 
        className={`relative z-10 py-6 cursor-pointer transform transition-all duration-500 ${animate ? 'scale-110' : 'scale-100'}`} 
        onClick={() => setAnimate(true)}
      >
         {typeof visual.icon === 'string' ? (
             <div className={`text-8xl filter drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] animate-bounce`}>
                 {visual.icon}
             </div>
         ) : (
             <div className={`${animate ? 'animate-pulse' : ''} transition-all duration-1000`}>
                {visual.icon}
             </div>
         )}
      </div>

      <div className="text-center mt-2 relative z-10 w-full px-4">
        <h3 className={`text-xl font-bold ${visual.color} mb-2 drop-shadow-sm transition-colors duration-500`}>
            {visual.name}
        </h3>
        <p className="text-xs text-gray-400 leading-relaxed h-12 flex items-center justify-center">
            {getPetDescription()}
        </p>
      </div>

      {/* Progress Bar (Only for pre-adult) */}
      {stage !== 'adult' && (
        <div className="w-full mt-4 relative z-10 px-4">
            <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                <span className="flex items-center gap-1"><Sparkles size={12}/> 進化度</span>
                <span>{Math.floor(progressPercent)}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3 border border-gray-700 overflow-hidden relative">
                <div 
                    className={`h-full transition-all duration-500 relative ${
                        dominantStat === 'study' ? 'bg-gradient-to-r from-blue-600 to-cyan-400' :
                        dominantStat === 'exercise' ? 'bg-gradient-to-r from-red-600 to-orange-400' :
                        dominantStat === 'work' ? 'bg-gradient-to-r from-emerald-600 to-lime-400' :
                        'bg-gradient-to-r from-purple-600 to-pink-400'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
                
                {/* Stage Markers */}
                <div className="absolute top-0 bottom-0 left-[30%] w-0.5 bg-gray-900/50 border-r border-white/10" title="Baby Stage"></div>
                <div className="absolute top-0 bottom-0 left-[70%] w-0.5 bg-gray-900/50 border-r border-white/10" title="Young Stage"></div>
            </div>
            
            {/* Stat Influence Indicators */}
            <div className="flex justify-center gap-3 mt-3 text-[10px] font-mono text-gray-500">
                <div className={`flex items-center gap-1 ${dominantStat === 'study' ? 'text-blue-400 font-bold' : ''}`}>
                    <div className={`w-1.5 h-1.5 rounded-full bg-blue-500`} /> KNOW
                </div>
                <div className={`flex items-center gap-1 ${dominantStat === 'exercise' ? 'text-red-400 font-bold' : ''}`}>
                    <div className={`w-1.5 h-1.5 rounded-full bg-red-500`} /> POW
                </div>
                <div className={`flex items-center gap-1 ${dominantStat === 'work' ? 'text-emerald-400 font-bold' : ''}`}>
                    <div className={`w-1.5 h-1.5 rounded-full bg-emerald-500`} /> FOC
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
