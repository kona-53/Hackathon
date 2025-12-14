
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Save, User, X, Coffee, Activity } from 'lucide-react';

interface ProfileSettingsModalProps {
  profile: UserProfile;
  onSave: (newProfile: UserProfile) => void;
  onClose: () => void;
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({ profile, onSave, onClose }) => {
  const [hobbies, setHobbies] = useState(profile.hobbies);
  const [recentActivities, setRecentActivities] = useState(profile.recentActivities);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      hobbies,
      recentActivities
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-gray-900 rounded-3xl shadow-[0_0_50px_rgba(168,85,247,0.2)] border border-purple-500/20 max-w-md w-full relative overflow-hidden">
        
        {/* Background Effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none"></div>

        <div className="flex justify-between items-center p-6 border-b border-gray-800 relative z-10">
          <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 flex items-center gap-2">
            <User size={24} className="text-purple-400" />
            プレイヤー設定
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6 relative z-10">
          <p className="text-sm text-gray-400 bg-gray-800/50 p-3 rounded-lg border border-gray-700">
            ここで設定した内容は、AIが生成する「休息ミッション（サボり）」の内容に反映されます。<br/>
            <span className="text-xs text-purple-400 mt-1 block">例：趣味に「映画」と書くと、「映画を見る」等のミッションが出やすくなります。</span>
          </p>

          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide">
              <Coffee size={16} className="text-orange-400" />
              趣味・好きなこと
            </label>
            <textarea
              className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-700 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 outline-none transition-all placeholder-gray-600 h-24 resize-none"
              placeholder="例: ゲーム、サウナ、読書、カフェ巡り..."
              value={hobbies}
              onChange={(e) => setHobbies(e.target.value)}
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide">
              <Activity size={16} className="text-blue-400" />
              最近の状況・活動
            </label>
            <textarea
              className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-700 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 outline-none transition-all placeholder-gray-600 h-24 resize-none"
              placeholder="例: 最近仕事が忙しい、新しい言語を勉強中、運動不足気味..."
              value={recentActivities}
              onChange={(e) => setRecentActivities(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full mt-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] transform transition active:scale-[0.98] uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <Save size={18} />
            設定を保存
          </button>
        </form>
      </div>
    </div>
  );
};
