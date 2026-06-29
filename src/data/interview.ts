import { InterviewQuestion, InterviewRecord, InterviewScoreReport, QuestionType, ExamStage, Difficulty } from '@/types/interview';

// ================================================================
// 公职结构化面试练习题库
// 方向：工具化练习、结构化复盘、参考框架，不承诺考试结果
// ================================================================

interface CategorySeed {
  category: string;
  type: QuestionType;
  subjectsByStage: Record<ExamStage, string[]>;
  templates: string[];
  prompt: string;
  answerPoints: string[];
  frameIntro: string;
}

const allStages: ExamStage[] = ['国考', '省考', '事业单位', '选调生'];
const difficultyList: Difficulty[] = ['入门', '进阶', '冲刺'];

const scenarioFillers = [
  '基层治理数字化',
  '政务服务便民化',
  '青年就业压力',
  '老旧小区改造',
  '乡村公共服务',
  '窗口服务效能',
  '网络舆情回应',
  '社区养老服务',
  '营商环境优化',
  '公共资源节约',
  '基层减负',
  '志愿服务常态化',
];

const conflictFillers = [
  '群众排队时间较长并现场抱怨',
  '活动报名人数远超预期',
  '同事对分工安排有意见',
  '群众提交材料不完整但情绪激动',
  '现场设备临时故障',
  '网络平台出现错误信息',
  '多个部门对职责边界理解不一致',
  '服务对象对政策理解有偏差',
  '上级临时增加紧急任务',
  '媒体关注一起突发事件',
];

const positionFillers = [
  '综合管理岗',
  '行政执法岗',
  '基层服务岗',
  '文字综合岗',
  '财经管理岗',
  '公共服务岗',
];

function pick<T>(arr: T[], index: number): T {
  return arr[index % arr.length];
}

function fillTemplate(template: string, index: number, subject: string): string {
  return template
    .replace(/\{topic\}/g, pick(scenarioFillers, index))
    .replace(/\{event\}/g, pick(conflictFillers, index * 2))
    .replace(/\{position\}/g, subject)
    .replace(/\{target\}/g, pick(positionFillers, index * 3));
}

function buildReferenceFrame(q: InterviewQuestion, seed: CategorySeed): string {
  const lines = [
    `本题可以按“表态-分析-行动-总结”的结构作答。${seed.frameIntro}`,
  ];
  seed.answerPoints.forEach((point, index) => {
    const prefix = index === 0 ? '第一，' : index === 1 ? '第二，' : index === 2 ? '第三，' : '第四，';
    lines.push(`${prefix}${point}。结合“${q.title}”中的具体情境展开，避免只说空泛原则。`);
  });
  lines.push('结尾可回到岗位职责和公共服务目标，强调依法依规、主动沟通、闭环落实。');
  return lines.join('');
}

const categorySeeds: CategorySeed[] = [
  {
    category: '社会现象',
    type: '综合分析',
    subjectsByStage: {
      国考: ['综合管理', '行政执法', '公共服务'],
      省考: ['综合管理', '基层治理', '行政执法'],
      事业单位: ['公共服务', '综合管理', '文字综合'],
      选调生: ['基层治理', '综合管理', '乡村振兴'],
    },
    templates: [
      '近年来“{topic}”受到关注，请谈谈你的看法。',
      '有人认为推进“{topic}”会增加基层负担，你怎么看？',
      '针对“{topic}”推进过程中出现的争议，请进行分析。',
      '如果你是{position}工作人员，如何理解“{topic}”的治理价值？',
    ],
    prompt: '请围绕背景意义、问题原因、治理思路和落地保障作答。',
    answerPoints: ['明确态度并点明公共价值', '分析问题背后的多方原因', '提出可执行的治理措施', '强调协同落实与效果反馈'],
    frameIntro: '综合分析题要先给出清晰判断，再展开原因和对策。',
  },
  {
    category: '政策理解',
    type: '综合分析',
    subjectsByStage: {
      国考: ['综合管理', '行政执法', '文字综合'],
      省考: ['综合管理', '基层治理', '公共服务'],
      事业单位: ['综合管理', '公共服务', '财经管理'],
      选调生: ['基层治理', '乡村振兴', '综合管理'],
    },
    templates: [
      '请谈谈你对“{topic}”相关政策导向的理解。',
      '某地围绕“{topic}”推出新举措，你认为应如何评价？',
      '有人说“{topic}”重在宣传，难在落实，你怎么看？',
      '结合报考岗位，谈谈如何在工作中落实“{topic}”。',
    ],
    prompt: '请体现政策目标、现实约束、执行路径和群众获得感。',
    answerPoints: ['说明政策目标和现实意义', '看到执行中的难点和风险', '结合岗位提出落地动作', '用群众满意度检验成效'],
    frameIntro: '政策理解题不要背口号，要把政策目标转化成岗位动作。',
  },
  {
    category: '活动组织',
    type: '组织计划',
    subjectsByStage: {
      国考: ['综合管理', '公共服务', '行政执法'],
      省考: ['基层治理', '综合管理', '公共服务'],
      事业单位: ['公共服务', '综合管理', '文字综合'],
      选调生: ['基层治理', '乡村振兴', '公共服务'],
    },
    templates: [
      '单位准备开展一次“{topic}”主题宣传活动，领导交给你负责，你如何组织？',
      '你所在部门要面向群众开展政策说明会，主题是“{topic}”，你怎么安排？',
      '社区计划开展“{topic}”调研，你作为负责人会如何推进？',
      '单位要组织一次面向青年干部的“{topic}”交流活动，你如何策划？',
    ],
    prompt: '请从前期准备、过程推进、风险预案和总结反馈四方面作答。',
    answerPoints: ['明确目标对象和资源分工', '细化流程安排和沟通协调', '准备风险预案和现场保障', '做好复盘总结和成果转化'],
    frameIntro: '组织计划题要体现流程感，避免只罗列“事前事中事后”。',
  },
  {
    category: '突发处置',
    type: '应急应变',
    subjectsByStage: {
      国考: ['行政执法', '公共服务', '综合管理'],
      省考: ['基层治理', '行政执法', '公共服务'],
      事业单位: ['公共服务', '综合管理', '财经管理'],
      选调生: ['基层治理', '乡村振兴', '综合管理'],
    },
    templates: [
      '办事现场出现“{event}”，领导不在，你会怎么办？',
      '你负责的活动中突然发生“{event}”，你如何处理？',
      '群众因“{event}”在大厅聚集，你作为工作人员怎么办？',
      '你正在推进一项重点工作，突然遇到“{event}”，如何应对？',
    ],
    prompt: '请体现控制局面、查明情况、分级处置和后续复盘。',
    answerPoints: ['第一时间稳定现场秩序', '快速核实事实和风险等级', '按职责流程协调处置', '回应关切并复盘改进'],
    frameIntro: '应急应变题的关键是先稳住局面，再分清轻重缓急。',
  },
  {
    category: '沟通协调',
    type: '人际关系',
    subjectsByStage: {
      国考: ['综合管理', '行政执法', '公共服务'],
      省考: ['基层治理', '综合管理', '行政执法'],
      事业单位: ['公共服务', '综合管理', '文字综合'],
      选调生: ['基层治理', '乡村振兴', '综合管理'],
    },
    templates: [
      '你和同事共同负责一项工作，但出现“{event}”，你会怎么沟通？',
      '群众对你的解释不认可，并提到“{event}”，你如何处理？',
      '领导安排你协调多个部门，但大家对“{topic}”意见不一致，你怎么办？',
      '新同事在工作中因“{event}”产生畏难情绪，你如何帮助他？',
    ],
    prompt: '请体现换位思考、目标一致、有效沟通和关系维护。',
    answerPoints: ['先理解对方诉求和情绪', '围绕共同目标澄清分歧', '提出可接受的协作方案', '保持跟进并维护工作关系'],
    frameIntro: '人际关系题不要站队，要围绕工作目标和沟通方法展开。',
  },
  {
    category: '岗位匹配',
    type: '岗位认知',
    subjectsByStage: {
      国考: ['综合管理', '行政执法', '文字综合'],
      省考: ['综合管理', '基层治理', '行政执法'],
      事业单位: ['公共服务', '财经管理', '文字综合'],
      选调生: ['基层治理', '乡村振兴', '综合管理'],
    },
    templates: [
      '请结合{position}，谈谈你对岗位职责的理解。',
      '如果进入{position}，你认为自己最需要提升哪方面能力？',
      '基层工作任务繁杂，作为{position}人员你如何保持状态？',
      '请谈谈你为什么适合{position}，以及入职后的工作计划。',
    ],
    prompt: '请结合岗位职责、个人能力、服务意识和长期成长作答。',
    answerPoints: ['准确理解岗位职责和边界', '结合经历说明能力匹配', '体现服务意识和纪律意识', '提出务实的成长计划'],
    frameIntro: '岗位认知题要避免自我夸奖堆砌，重点是岗位理解和可验证的行动。',
  },
  {
    category: '现场表达',
    type: '情景模拟',
    subjectsByStage: {
      国考: ['公共服务', '行政执法', '综合管理'],
      省考: ['基层治理', '公共服务', '行政执法'],
      事业单位: ['公共服务', '综合管理', '文字综合'],
      选调生: ['基层治理', '乡村振兴', '公共服务'],
    },
    templates: [
      '请现场模拟安抚一位因“{event}”不满的群众。',
      '请模拟向同事说明“{topic}”工作调整方案。',
      '请模拟向领导汇报“{event}”的初步处置情况。',
      '请模拟在活动开场时介绍“{topic}”的安排和注意事项。',
    ],
    prompt: '请用第一人称表达，注意语气、信息顺序和行动承诺。',
    answerPoints: ['开场先表达理解和重视', '说明事实依据和处理边界', '给出清晰下一步安排', '用礼貌语言收束并承诺反馈'],
    frameIntro: '情景模拟题要像真实沟通，不要变成旁观者分析。',
  },
];

function buildQuestions(): InterviewQuestion[] {
  const list: InterviewQuestion[] = [];
  let id = 1;
  const variantCount = 3;

  categorySeeds.forEach((seed, seedIdx) => {
    allStages.forEach((stage) => {
      const subjects = seed.subjectsByStage[stage] || [];
      subjects.forEach((subject, subjectIdx) => {
        seed.templates.forEach((template, templateIdx) => {
          difficultyList.forEach((difficulty, difficultyIdx) => {
            for (let v = 0; v < variantCount; v += 1) {
              const fillIndex = id + seedIdx * 17 + subjectIdx * 7 + templateIdx * 5 + difficultyIdx * 3 + v;
              const question: InterviewQuestion = {
                id,
                title: fillTemplate(template, fillIndex, subject),
                type: seed.type,
                stage,
                subject,
                difficulty,
                category: seed.category,
                prompt: seed.prompt,
                answerPoints: seed.answerPoints,
                duration: seed.type === '情景模拟' ? 240 : 180,
              };
              (question as InterviewQuestionWithFrame).referenceFrame = buildReferenceFrame(question, seed);
              list.push(question);
              id += 1;
            }
          });
        });
      });
    });
  });

  return list;
}

export const interviewQuestions: InterviewQuestion[] = buildQuestions();

export interface InterviewQuestionWithFrame extends InterviewQuestion {
  referenceFrame: string;
}

export const questionCategories: string[] = Array.from(new Set(interviewQuestions.map((q) => q.category)));
export const questionTypes: QuestionType[] = ['综合分析', '组织计划', '应急应变', '人际关系', '岗位认知', '情景模拟'];
export const questionStages: ExamStage[] = ['国考', '省考', '事业单位', '选调生'];
export const questionDifficulties: Difficulty[] = ['入门', '进阶', '冲刺'];
export const questionSubjects: string[] = Array.from(new Set(interviewQuestions.map((q) => q.subject)));

function buildSeedReport(question: InterviewQuestion, totalScore: number, summary: string): InterviewScoreReport {
  const level = totalScore >= 85 ? '优秀' : totalScore >= 75 ? '良好' : totalScore >= 60 ? '合格' : '待提升';
  return {
    reportId: `seed_${question.id}`,
    questionId: question.id,
    questionTitle: question.title,
    totalScore,
    level,
    summary,
    dimensions: [
      { name: '审题准确度', score: Math.min(20, Math.round(totalScore * 0.2)), maxScore: 20, comment: '能基本抓住题干任务和岗位语境' },
      { name: '逻辑结构', score: Math.min(20, Math.round(totalScore * 0.2)), maxScore: 20, comment: '分点表达较清楚，层次还可继续压实' },
      { name: '分析深度', score: Math.min(20, Math.round(totalScore * 0.19)), maxScore: 20, comment: '能展开原因分析，但现实约束可再补充' },
      { name: '对策可行性', score: Math.min(25, Math.round(totalScore * 0.25)), maxScore: 25, comment: '有行动方案，建议进一步明确责任和反馈' },
      { name: '表达规范度', score: Math.min(15, Math.round(totalScore * 0.16)), maxScore: 15, comment: '表达稳健，具备公共服务场景意识' },
    ],
    strengths: ['整体作答能围绕题干展开，结构意识较好', '能结合岗位职责回应问题，表达较稳'],
    weaknesses: ['部分对策仍偏概括，可补充具体执行步骤', '结尾可进一步回扣群众需求和工作成效'],
    suggestions: [
      '开头先点明核心矛盾，再进入分点作答。',
      '对策部分补充责任主体、执行动作和反馈方式。',
      '结尾用一句话回到岗位职责，增强工具化复盘效果。',
    ],
    improvedAnswer: [
      `针对“${question.title}”，可以按以下框架优化：`,
      `首先，${question.answerPoints[0] || '明确问题核心和目标'}。`,
      `其次，${question.answerPoints[1] || '分析原因和现实约束'}。`,
      `然后，${question.answerPoints[2] || '提出可执行措施'}。`,
      `最后，${question.answerPoints[3] || '做好反馈和复盘'}。`,
    ].join(''),
  };
}

const seedReportOne = buildSeedReport(interviewQuestions[0], 82, '结构清晰，对策部分还可以更具体');
const seedReportTwo = buildSeedReport(interviewQuestions[18], 76, '处置顺序基本合理，现场回应略显笼统');
const seedReportThree = buildSeedReport(interviewQuestions[36], 88, '岗位理解较充分，表达有服务意识');

export const interviewRecords: InterviewRecord[] = [
  { id: 1, date: '06-22', title: seedReportOne.questionTitle, score: seedReportOne.totalScore, comment: seedReportOne.summary, report: seedReportOne },
  { id: 2, date: '06-20', title: seedReportTwo.questionTitle, score: seedReportTwo.totalScore, comment: seedReportTwo.summary, report: seedReportTwo },
  { id: 3, date: '06-18', title: seedReportThree.questionTitle, score: seedReportThree.totalScore, comment: seedReportThree.summary, report: seedReportThree },
];
