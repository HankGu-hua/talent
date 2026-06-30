import { InterviewScoreReport, ScoreInterviewPayload } from '@/types/interview';
import localScoreInterview from '@/data/scoreInterview';

// 复盘服务：提审版本使用本地练习复盘，避免未接入云端能力时触发数据处理风险。
export async function scoreInterview(payload: ScoreInterviewPayload): Promise<InterviewScoreReport> {
  return localScoreInterview(payload);
}
