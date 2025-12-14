
import { GoogleGenAI, Type } from "@google/genai";
import { TaskType, PoolMission, UserProfile, BossType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeTask = async (title: string, date: string): Promise<{ type: TaskType, reward: number }> => {
  const prompt = `
    以下のタスクを分析し、適切なカテゴリ（Task Type）と報酬ポイント（経験値）を決定してください。
    タスク: "${title}"
    日付: ${date}

    タスクタイプ (Task Types):
    - study: 学習, 読書, 調査, 勉強 (知識).
    - exercise: 筋トレ, ランニング, スポーツ, 身体活動 (体力).
    - work: 仕事, コーディング, メール, 集中作業 (集中力).

    報酬基準 (Reward Scale):
    - 簡単/早い (<15分): 10-20
    - 普通 (30-60分): 30-50
    - 難しい/長い (>1時間): 60-100

    JSONのみを出力してください。
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: ["study", "exercise", "work"] },
            reward: { type: Type.INTEGER }
          },
          required: ["type", "reward"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const result = JSON.parse(text);
    return {
      type: result.type as TaskType,
      reward: result.reward
    };
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    // Fallback defaults
    return { type: TaskType.WORK, reward: 30 };
  }
};

export const generateWeeklyMissions = async (userGoals: string[], userProfile?: UserProfile): Promise<PoolMission[]> => {
  
  const hobbyContext = userProfile?.hobbies 
    ? `ユーザーの趣味・好きなこと: ${userProfile.hobbies}` 
    : "ユーザーの趣味: 特になし (一般的なリラックス方法を提案)";
    
  const activityContext = userProfile?.recentActivities
    ? `最近の活動・状況: ${userProfile.recentActivities}`
    : "最近の活動: 不明";

  const prompt = `
    ゲーミフィケーションToDoアプリのための「週間ミッションリスト」を作成してください。
    出力言語は必ず「日本語」にしてください。
    
    【ユーザー情報】
    今週の目標: ${JSON.stringify(userGoals)}
    ${hobbyContext}
    ${activityContext}
    
    【ルール】
    1. 合計7つのミッションを作成する。
    2. ユーザーの目標を具体的なミッションとして含める。
    3. 「サボり（休息・娯楽）」ミッション（isSabori: true）を**最大3つ**含める。
       - **重要**: サボりミッションの内容は、上記の「ユーザーの趣味」や「最近の活動」に基づいたものにしてください。
       - 例: 趣味が「映画」なら「映画を1本観る」、最近「忙しい」なら「ゆっくり入浴する」など。
    4. 残りの枠は、目標に関連する生産的なミッション（isSabori: false）で埋める。
       - サボりミッションでも、適切なタイプ(study/exercise/work)を割り当てること (例: 映画鑑賞 -> study(感性), 散歩 -> exercise)。
    
    JSON配列のみを出力してください。
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Mission title in Japanese" },
              type: { type: Type.STRING, enum: ["study", "exercise", "work"] },
              reward: { type: Type.INTEGER, description: "10-50 for sabori, 30-100 for real tasks" },
              isSabori: { type: Type.BOOLEAN }
            },
            required: ["title", "type", "reward", "isSabori"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const rawMissions = JSON.parse(text);
    
    // Add IDs and isUsed flag
    return rawMissions.map((m: any) => ({
      id: crypto.randomUUID(),
      title: m.title,
      type: m.type as TaskType,
      reward: m.reward,
      isSabori: m.isSabori,
      isUsed: false
    }));

  } catch (error) {
    console.error("Gemini weekly generation failed:", error);
    // Fallback if AI fails
    const fallbackMissions: PoolMission[] = [];
    
    // Add user goals
    userGoals.forEach(g => fallbackMissions.push({
      id: crypto.randomUUID(), title: g, type: TaskType.WORK, reward: 50, isSabori: false, isUsed: false
    }));
    
    let saboriCount = 0;

    // Fill rest
    while(fallbackMissions.length < 7) {
      if (saboriCount < 3) {
        fallbackMissions.push({
          id: crypto.randomUUID(), 
          title: "趣味の時間（リラックス）", 
          type: TaskType.EXERCISE, 
          reward: 10, 
          isSabori: true, 
          isUsed: false
        });
        saboriCount++;
      } else {
        fallbackMissions.push({
          id: crypto.randomUUID(), 
          title: "自己研鑽のための読書", 
          type: TaskType.STUDY, 
          reward: 30, 
          isSabori: false, 
          isUsed: false
        });
      }
    }
    return fallbackMissions;
  }
};

export const analyzeBoss = async (name: string, daysRemaining: number): Promise<{ type: BossType, hp: number, description: string }> => {
  const prompt = `
    ユーザーが設定した「長期目標」をRPGのボスモンスターに変換してください。
    
    目標名: "${name}"
    期限までの残り日数: ${daysRemaining}日

    【分析ルール】
    1. **ボスの種類 (Type)**: 目標の性質に合わせて以下から1つ選択。
       - 'dragon': 身体的、体力、攻撃的な目標 (例: ダイエット、スポーツ、大会優勝)
       - 'demon': 悪い習慣を断つ、精神的な戦い (例: 禁煙、早起き、悪癖の克服)
       - 'kraken': 探求、深い学習、研究、複雑な問題 (例: 論文執筆、言語習得、研究開発)
       - 'golem': 構築、仕事、積み上げ、忍耐 (例: アプリ開発、貯金、資格勉強)

    2. **HP (Hit Points)**: 目標の難易度と期間に基づいて算出 (500 ~ 50000)。
       - 基本計算: (残り日数 × 100) + (目標の推定難易度ボーナス)
       - 長期間で難しい目標ほどHPを高く設定する。

    3. **説明文 (Description)**: RPG風のフレーバーテキスト (日本語, 50文字以内)。
    
    JSONのみを出力してください。
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: ["dragon", "demon", "kraken", "golem"] },
            hp: { type: Type.INTEGER },
            description: { type: Type.STRING }
          },
          required: ["type", "hp", "description"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini boss analysis failed:", error);
    // Fallback
    return { 
      type: 'dragon', 
      hp: daysRemaining * 100 + 1000, 
      description: '強大な試練が立ちはだかる...' 
    };
  }
};
