export type ExamStage = '国考' | '省考' | '事业单位' | '选调生';

export type QuestionType = '综合分析' | '组织计划' | '应急应变' | '人际关系' | '岗位认知' | '情景模拟';

export type Difficulty = '入门' | '进阶' | '冲刺';

export interface InterviewQuestion {
  id: number;
  title: string;
  type: QuestionType;
  // 复用原字段名：这里表示考试类型
  stage: ExamStage;
  // 复用原字段名：这里表示岗位方向
  subject: string;
  difficulty: Difficulty;
  category: string;
  prompt: string;
  answerPoints: string[];
  duration: number;
}

export interface InterviewRecord {
  id: number;
  date: string;
  title: string;
  score: number;
  comment: string;
  report?: InterviewScoreReport;
}

export interface ScoreDimension {
  name: string;
  score: number;
  maxScore: number;
  comment: string;
}

export interface InterviewScoreReport {
  reportId: string;
  questionId: number;
  questionTitle: string;
  totalScore: number;
  level: string;
  summary: string;
  dimensions: ScoreDimension[];
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  improvedAnswer: string;
}

export interface ScoreInterviewPayload {
  question: InterviewQuestion;
  answer: string;
}
