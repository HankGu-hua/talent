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

function getDifficultyAdvice(difficulty: Difficulty): string {
  const map: Record<Difficulty, string> = {
    入门: '作答时优先保证结构完整，语言简洁清楚，先把核心任务说准。',
    进阶: '作答时要补充原因、约束和执行细节，让观点和措施之间形成衔接。',
    冲刺: '作答时要体现岗位意识、风险预判和闭环反馈，避免只停留在原则表态。',
  };
  return map[difficulty];
}

function buildPointLine(point: string, index: number, q: InterviewQuestion): string {
  const prefix = ['一', '二', '三', '四', '五'][index] || `${index + 1}`;
  const stageHint = q.stage === '事业单位' ? '公共服务场景' : `${q.stage}结构化场景`;
  return `${prefix}、${point}。结合${stageHint}和${q.subject}岗位，把“${q.title}”中的任务、对象和限制条件说具体。`;
}

function buildReferenceFrame(q: InterviewQuestion, seed: CategorySeed): string {
  const context = `题干聚焦“${q.title}”，岗位方向为${q.subject}，练习难度为${q.difficulty}。`;
  const difficultyAdvice = getDifficultyAdvice(q.difficulty);
  let lines: string[] = [];

  if (seed.type === '综合分析' && seed.category === '社会现象') {
    lines = [
      `${context}可按“判断态度-价值意义-现实问题-治理建议”的框架组织。${seed.frameIntro}`,
      buildPointLine(seed.answerPoints[0], 0, q),
      `二、从群众体验、基层执行、资源配置三个角度分析现象成因，避免简单评价好坏。`,
      `三、围绕宣传引导、流程优化、部门协同、数据反馈提出可落地做法。`,
      `四、结尾回到公共服务目标，说明如何用群众感受和工作成效检验改进。`,
    ];
  } else if (seed.type === '综合分析' && seed.category === '政策理解') {
    lines = [
      `${context}可按“政策目标-执行难点-岗位动作-效果评估”的框架作答。${seed.frameIntro}`,
      `一、先说明政策导向要解决什么问题，以及对群众、基层和治理效率的意义。`,
      `二、分析推进中可能遇到的认知偏差、资源不足、流程衔接和监督反馈问题。`,
      `三、结合${q.subject}岗位，把政策要求转化为宣传解释、材料审核、协同办理或跟踪反馈等具体动作。`,
      `四、用服务对象满意度、办理效率、问题复发率等指标说明后续复盘方式。`,
    ];
  } else if (seed.type === '组织计划') {
    lines = [
      `${context}可按“目标拆解-资源安排-流程推进-风险预案-复盘沉淀”的框架作答。${seed.frameIntro}`,
      `一、明确活动或调研的目标、对象、时间节点和成果形式，先把任务边界说清楚。`,
      `二、细化人员分工、物料准备、通知渠道和现场秩序，体现统筹能力。`,
      `三、过程推进中设置签到、答疑、记录、反馈收集等环节，让活动不流于形式。`,
      `四、提前准备人数超预期、设备故障、群众疑问集中等预案，结束后形成清单和改进建议。`,
    ];
  } else if (seed.type === '应急应变') {
    lines = [
      `${context}可按“稳住现场-核实情况-分类处置-公开回应-复盘改进”的框架作答。${seed.frameIntro}`,
      `一、第一时间控制秩序、安抚情绪，保护群众安全和现场基本运行。`,
      `二、快速核实事件原因、影响范围、责任边界和是否需要上报，避免未经核实就表态。`,
      `三、按轻重缓急协调人员、设备、部门或平台资源，给出可执行的临时处理方案。`,
      `四、向相关对象说明处理进度和后续安排，事后复盘流程漏洞并补充预案。`,
    ];
  } else if (seed.type === '人际关系') {
    lines = [
      `${context}可按“理解情绪-澄清目标-沟通协商-落实跟进”的框架作答。${seed.frameIntro}`,
      `一、先认可对方合理诉求或工作压力，避免一上来评价对错。`,
      `二、围绕共同工作目标核实分歧来源，区分信息误差、流程误解和资源冲突。`,
      `三、提出可接受的协作方案，比如重新分工、补充说明、请示协调或阶段性反馈。`,
      `四、后续保持沟通记录和结果跟进，既解决当前问题，也维护长期配合关系。`,
    ];
  } else if (seed.type === '岗位认知') {
    lines = [
      `${context}可按“职责理解-能力匹配-短板改进-行动计划”的框架作答。${seed.frameIntro}`,
      `一、说明${q.subject}岗位与群众服务、政策执行、协调保障之间的关系。`,
      `二、结合过往经历或能力特点，讲清自己能匹配哪些具体工作要求。`,
      `三、客观看到需要提升的地方，如政策学习、沟通协调、文字表达或现场处置。`,
      `四、给出入职后的学习计划、工作方法和复盘机制，体现稳定、务实和纪律意识。`,
    ];
  } else {
    lines = [
      `${context}可按“礼貌开场-共情回应-解释边界-给出安排-确认反馈”的框架表达。${seed.frameIntro}`,
      `一、用第一人称开场，先表达理解、重视和愿意协助的态度。`,
      `二、围绕题干情境说明事实依据、政策边界或工作安排，语言要自然，不要像背材料。`,
      `三、给出下一步处理动作，包括谁来办、多久反馈、需要对方配合什么。`,
      `四、结尾用礼貌语言确认对方是否理解，并承诺持续跟进。`,
    ];
  }

  lines.push(`评分关注点：审题是否准确、结构是否清晰、措施是否具体、表达是否符合岗位场景。${difficultyAdvice}`);
  lines.push('以上内容为练习参考框架，可根据个人经历和现场表达习惯调整。');
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
