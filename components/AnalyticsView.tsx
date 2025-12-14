
import React, { useMemo } from 'react';
import { Task, Stats, TaskType, TASK_CONFIG } from '../types';
import { Activity } from 'lucide-react';

interface AnalyticsViewProps {
  tasks: Task[];
  stats: Stats;
  compact?: boolean;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ tasks, stats, compact = false }) => {
  
  // Heatmap Data Preparation
  const heatmapData = useMemo(() => {
    // Generate last N weeks of data (fewer for compact mode)
    const weeks = compact ? 12 : 20; 
    const days = weeks * 7;
    const today = new Date();
    const data = [];

    // Map: 'YYYY-MM-DD' -> count
    const taskCounts: Record<string, number> = {};
    tasks.forEach(t => {
      if(t.done && !t.isSabori) {
        taskCounts[t.date] = (taskCounts[t.date] || 0) + 1;
      }
    });

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      data.push({
        date: dateStr,
        count: taskCounts[dateStr] || 0
      });
    }
    return data;
  }, [tasks, compact]);

  // Radar Chart Data (Simplified for CSS/SVG rendering)
  const maxStat = Math.max(stats[TaskType.STUDY], stats[TaskType.EXERCISE], stats[TaskType.WORK], 1);
  const normalizedStats = {
    study: stats[TaskType.STUDY] / maxStat,
    exercise: stats[TaskType.EXERCISE] / maxStat,
    work: stats[TaskType.WORK] / maxStat,
  };

  // Helper to get color intensity
  const getIntensityClass = (count: number) => {
    if (count === 0) return 'bg-gray-800';
    if (count <= 2) return 'bg-emerald-900';
    if (count <= 4) return 'bg-emerald-700';
    return 'bg-emerald-500';
  };

  return (
    <div className={`bg-gray-900/60 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-gray-800 relative overflow-hidden ${compact ? '' : 'mt-6'}`}>
      {/* Background Decor */}
      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-500/5 blur-[60px] rounded-full pointer-events-none"></div>

      <h2 className="text-base font-bold text-gray-200 flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-emerald-400" />
        冒険の記録
      </h2>

      <div className={`grid grid-cols-1 ${compact ? '' : 'md:grid-cols-2'} gap-6`}>
        
        {/* Heatmap Section */}
        <div>
           <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Activity Log</h3>
           <div className="flex flex-wrap gap-1 content-start justify-center md:justify-start">
              {heatmapData.map((day, idx) => (
                <div 
                  key={day.date} 
                  className={`w-2.5 h-2.5 rounded-sm ${getIntensityClass(day.count)} border border-black/20`}
                  title={`${day.date}: ${day.count} tasks`}
                />
              ))}
           </div>
           <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-500 justify-end">
              <span>Less</span>
              <div className="w-2.5 h-2.5 bg-gray-800 rounded-sm"></div>
              <div className="w-2.5 h-2.5 bg-emerald-900 rounded-sm"></div>
              <div className="w-2.5 h-2.5 bg-emerald-700 rounded-sm"></div>
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-sm"></div>
              <span>More</span>
           </div>
        </div>

        {/* Stats Radar (Visual only) */}
        <div className="flex flex-col items-center justify-center relative">
           <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 w-full text-center md:text-left">Status Balance</h3>
           
           <div className="relative w-32 h-32">
              {/* Background Triangle (Equilateral for simplicity representation) */}
              <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible opacity-50">
                 {/* Axes */}
                 <line x1="50" y1="50" x2="50" y2="5" stroke="#374151" strokeWidth="1" /> {/* Top (Study) */}
                 <line x1="50" y1="50" x2="90" y2="85" stroke="#374151" strokeWidth="1" /> {/* Bottom Right (Exercise) */}
                 <line x1="50" y1="50" x2="10" y2="85" stroke="#374151" strokeWidth="1" /> {/* Bottom Left (Work) */}
                 
                 {/* Grid */}
                 <polygon points="50,5 90,85 10,85" fill="none" stroke="#1f2937" strokeWidth="1" />
                 <polygon points="50,27.5 70,67.5 30,67.5" fill="none" stroke="#1f2937" strokeWidth="1" />
                 
                 {/* Data Polygon */}
                 {/* 
                    Top: (50, 50 - 45 * val)
                    Right: (50 + 40 * val, 50 + 35 * val)
                    Left: (50 - 40 * val, 50 + 35 * val)
                 */}
                 <polygon 
                   points={`
                     50,${50 - 45 * normalizedStats.study} 
                     ${50 + 40 * normalizedStats.exercise},${50 + 35 * normalizedStats.exercise} 
                     ${50 - 40 * normalizedStats.work},${50 + 35 * normalizedStats.work}
                   `}
                   fill="rgba(16, 185, 129, 0.3)"
                   stroke="#10b981"
                   strokeWidth="2"
                   className="drop-shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000 ease-out"
                 />
              </svg>

              {/* Labels */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-3 text-[8px] font-bold text-blue-400 bg-gray-900 px-1 rounded">STUDY</div>
              <div className="absolute bottom-1 right-0 translate-x-2 text-[8px] font-bold text-red-400 bg-gray-900 px-1 rounded">EXERCISE</div>
              <div className="absolute bottom-1 left-0 -translate-x-2 text-[8px] font-bold text-emerald-400 bg-gray-900 px-1 rounded">WORK</div>
           </div>
        </div>

      </div>
    </div>
  );
};
