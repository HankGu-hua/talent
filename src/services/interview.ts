import { callFunction } from './cloud';
import { InterviewScoreReport, ScoreInterviewPayload } from '@/types/interview';

// 评分服务：统一入口
// - 微信端：callFunction 会调用云函数 scoreInterview（后端转发合规大模型）
// - 预览/H5：callFunction 会降级到 src/data/scoreInterview.ts 本地实现
export async function scoreInterview(payload: ScoreInterviewPayload): Promise<InterviewScoreReport> {
  try {
    const report = await callFunction<InterviewScoreReport>('scoreInterview', payload);
    return report;
  } catch (error) {
    console.error('[InterviewService] 评分请求失败:', error);
    throw error;
  }
}
