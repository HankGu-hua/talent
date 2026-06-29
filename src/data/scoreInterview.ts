import { InterviewScoreReport, ScoreInterviewPayload, ScoreDimension } from '@/types/interview';

// 本地评分实现（用于预览 / H5 / 未接入云函数时的降级运行）
// 真实环境中微信端会调用同名云函数 scoreInterview，由后端转发给合规大模型评分
// 评分维度面向公职结构化面试练习，仅作为复盘参考，不代表官方评分

interface DimensionRule {
  name: string;
  maxScore: number;
  keywords: string[];
}

const dimensionRules: DimensionRule[] = [
  { name: '审题准确度', maxScore: 20, keywords: ['问题', '核心', '背景', '目标', '职责', '群众', '岗位'] },
  { name: '逻辑结构', maxScore: 20, keywords: ['首先', '其次', '然后', '最后', '第一', '第二', '第三', '总之'] },
  { name: '分析深度', maxScore: 20, keywords: ['原因', '影响', '意义', '风险', '矛盾', '根源', '长远'] },
  { name: '对策可行性', maxScore: 25, keywords: ['沟通', '协调', '落实', '反馈', '机制', '流程', '跟进', '评估'] },
  { name: '表达规范度', maxScore: 15, keywords: ['依法', '依规', '服务', '群众', '责任', '效率', '公开', '透明'] },
];

function countHits(answer: string, keywords: string[]): number {
  return keywords.reduce((sum, word) => (answer.includes(word) ? sum + 1 : sum), 0);
}

function buildDimensions(answer: string, answerPoints: string[]): ScoreDimension[] {
  const normalizedAnswer = answer.trim();
  const lengthFactor = Math.min(normalizedAnswer.length / 260, 1);

  return dimensionRules.map((rule) => {
    const hits = countHits(normalizedAnswer, rule.keywords);
    const keywordRatio = Math.min(hits / 4, 1);
    const pointHits = answerPoints.filter((point) => normalizedAnswer.includes(point.slice(0, 2))).length;
    const pointRatio = answerPoints.length === 0 ? 0 : pointHits / answerPoints.length;

    const ratio = keywordRatio * 0.45 + pointRatio * 0.3 + lengthFactor * 0.25;
    const rawScore = Math.round(rule.maxScore * Math.max(ratio, 0.18));

    return {
      name: rule.name,
      score: Math.min(rawScore, rule.maxScore),
      maxScore: rule.maxScore,
      comment: buildDimensionComment(rule.name, ratio),
    };
  });
}

function buildDimensionComment(name: string, ratio: number): string {
  const level = ratio >= 0.75 ? '较好' : ratio >= 0.45 ? '一般' : '偏弱';
  const map: Record<string, Record<string, string>> = {
    审题准确度: {
      较好: '能抓住题干任务和岗位语境',
      一般: '基本回应题干，但核心矛盾可再聚焦',
      偏弱: '对题干任务回应不足，建议先明确要解决的问题',
    },
    逻辑结构: {
      较好: '分点清晰，层次推进自然',
      一般: '有基本结构，可加强过渡和总分关系',
      偏弱: '表达顺序较散，建议使用“表态-分析-对策-总结”框架',
    },
    分析深度: {
      较好: '能兼顾原因、影响和现实约束',
      一般: '分析方向基本正确，但深度和层次仍可加强',
      偏弱: '分析偏表层，建议补充原因、影响和风险判断',
    },
    对策可行性: {
      较好: '措施具体，具备执行和反馈意识',
      一般: '有对策但部分表述较笼统，可细化责任和流程',
      偏弱: '缺少可执行步骤，建议给出具体动作和闭环安排',
    },
    表达规范度: {
      较好: '表达稳健，符合公共服务场景',
      一般: '表达基本得体，可补充依法依规和服务意识',
      偏弱: '口语化或泛泛而谈较多，建议使用更规范的岗位语言',
    },
  };
  return map[name][level];
}

function buildLevel(total: number): string {
  if (total >= 85) return '优秀';
  if (total >= 75) return '良好';
  if (total >= 60) return '合格';
  return '待提升';
}

export default function scoreInterview(payload: ScoreInterviewPayload): InterviewScoreReport {
  const { question, answer } = payload;
  console.info('[ScoreInterview] 本地评分开始', { questionId: question.id, answerLength: answer.length });

  const dimensions = buildDimensions(answer, question.answerPoints);
  const totalScore = dimensions.reduce((sum, item) => sum + item.score, 0);
  const level = buildLevel(totalScore);

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  dimensions.forEach((dim) => {
    const ratio = dim.score / dim.maxScore;
    if (ratio >= 0.75) {
      strengths.push(`${dim.name}：${dim.comment}`);
    } else if (ratio < 0.5) {
      weaknesses.push(`${dim.name}：${dim.comment}`);
    }
  });

  if (strengths.length === 0) {
    strengths.push('能够围绕题目作答，已具备基本面试表达意识');
  }
  if (weaknesses.length === 0) {
    weaknesses.push('整体表现较稳定，可继续打磨表达的针对性和细节');
  }

  const suggestions = [
    '开头先用一句话点明题干核心任务，再进入分点作答。',
    '对策部分尽量包含责任主体、执行动作、反馈方式，形成闭环。',
    '结尾回到岗位职责、群众需求和工作成效，避免机械套话。',
  ];

  const improvedAnswer = [
    `针对“${question.title}”，可以这样组织回答：`,
    `首先，我会${question.answerPoints[0] || '明确问题核心和工作目标'}，确保回应题干要求。`,
    `其次，我会${question.answerPoints[1] || '分析原因和现实约束'}，把问题讲清楚。`,
    `然后，我会${question.answerPoints[2] || '提出可执行的处理措施'}，注意责任分工和过程沟通。`,
    `最后，我会${question.answerPoints[3] || '做好反馈复盘和后续改进'}，让工作形成闭环。`,
  ].join('');

  const report: InterviewScoreReport = {
    reportId: `local_${Date.now()}`,
    questionId: question.id,
    questionTitle: question.title,
    totalScore,
    level,
    summary: `本次得分 ${totalScore} 分（${level}）。${weaknesses[0] ? '主要可提升点：' + weaknesses[0] : '整体结构和表达较均衡。'}`,
    dimensions,
    strengths,
    weaknesses,
    suggestions,
    improvedAnswer,
  };

  console.info('[ScoreInterview] 本地评分完成', { totalScore, level });
  return report;
}
