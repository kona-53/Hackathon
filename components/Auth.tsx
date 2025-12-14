
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, User, Lock, LogIn, UserPlus } from 'lucide-react';

export const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);

  // ダミーのドメイン。SupabaseはEmail形式を要求するため、内部的に付与する。
  const DUMMY_DOMAIN = '@grow.local';

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // 半角英数チェックなどのバリデーションが必要な場合はここに追加
    const emailForAuth = `${username}${DUMMY_DOMAIN}`;

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: emailForAuth,
          password,
          options: {
            // メタデータとして純粋なユーザー名を保存
            data: {
              username: username
            }
          }
        });
        if (error) throw error;
        setMessage({ text: '登録が完了しました。ログインしてください。', type: 'success' });
        setIsSignUp(false); // 登録成功後はログインモードへ
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: emailForAuth,
          password,
        });
        if (error) throw error;
      }
    } catch (error: any) {
      let errorMsg = error.message;
      if (errorMsg.includes('Invalid login credentials')) {
        errorMsg = 'ユーザー名またはパスワードが間違っています。';
      } else if (errorMsg.includes('User already registered')) {
        errorMsg = 'そのユーザー名は既に使用されています。';
      }
      setMessage({ text: errorMsg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <div className="max-w-md w-full bg-gray-900 rounded-3xl p-8 shadow-[0_0_50px_rgba(37,99,235,0.1)] border border-gray-800 relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10">
            <h1 className="text-4xl font-black text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                GROW
            </h1>
            <p className="text-center text-gray-500 mb-8 font-medium">RPGタスク管理システム</p>

            <div className="bg-gray-800/50 rounded-xl p-1 mb-6 flex text-sm font-bold border border-gray-700">
                <button 
                    onClick={() => { setIsSignUp(false); setMessage(null); }}
                    className={`flex-1 py-2 rounded-lg transition-all ${!isSignUp ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
                >
                    ログイン
                </button>
                <button 
                    onClick={() => { setIsSignUp(true); setMessage(null); }}
                    className={`flex-1 py-2 rounded-lg transition-all ${isSignUp ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
                >
                    新規登録
                </button>
            </div>

            <form onSubmit={handleAuth} className="flex flex-col gap-4">
                <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="ユーザー名"
                        className="w-full bg-gray-950 border border-gray-700 rounded-xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        autoCapitalize="none"
                        autoCorrect="off"
                    />
                </div>
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input
                        type="password"
                        placeholder="パスワード"
                        className="w-full bg-gray-950 border border-gray-700 rounded-xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                {message && (
                    <div className={`text-xs p-3 rounded-lg border ${message.type === 'error' ? 'bg-red-900/20 border-red-500/30 text-red-400' : 'bg-green-900/20 border-green-500/30 text-green-400'}`}>
                        {message.text}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
                >
                    {loading ? <Loader2 className="animate-spin" /> : (isSignUp ? <><UserPlus size={18}/> 登録する</> : <><LogIn size={18}/> ログイン</>)}
                </button>
            </form>
            
            <p className="text-center text-xs text-gray-600 mt-6">
                クラウドセーブを利用して、<br/>どのデバイスからでも冒険を続けよう。
            </p>
        </div>
      </div>
    </div>
  );
};
