import { callFunction } from './cloud';
import { InterviewScoreReport, ScoreInterviewPayload } from '@/types/interview';
import localScoreInterview from '@/data/scoreInterview';

// 评分服务：统一入口
// - 微信端：callFunction 会调用云函数 scoreInterview（后端转发合规大模型）
// - 预览/H5：callFunction 会降级到 src/data/scoreInterview.ts 本地实现
export async function scoreInterview(payload: ScoreInterviewPayload): Promise<InterviewScoreReport> {
  try {
    const report = await callFunction<InterviewScoreReport>('scoreInterview', payload);
    return report;
  } catch (error) {
    console.warn('[InterviewService] 云端评分不可用，已切换本地练习评分:', error);
    return localScoreInterview(payload);
  }
}
