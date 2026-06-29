import React, { useMemo, useState } from 'react';
import { View, Text, Textarea, ScrollView, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { interviewQuestions, questionTypes, questionStages, questionSubjects } from '@/data/interview';
import { scoreInterview } from '@/services/interview';
import { useReportStore } from '@/store/report';
import { ExamStage, InterviewQuestion, InterviewScoreReport, QuestionType } from '@/types/interview';
import styles from './index.module.scss';

type PracticePhase = 'configure' | 'answering' | 'summary';

const stageOptions: Array<ExamStage | '全部'> = ['全部', ...questionStages];
const typeOptions: Array<QuestionType | '全部'> = ['全部', ...questionTypes];
const PRESET_COUNTS = [5, 10, 15, 20];
const MAX_QUESTION_COUNT = 100;
const DEFAULT_QUESTION_COUNT = 5;
const MIN_ANSWER_LENGTH = 20; // 触发评分的最小作答字数

interface QuestionSession {
  question: InterviewQuestion;
  answer: string;
  report: InterviewScoreReport | null;
}

// 三态作答统计
interface AnswerStats {
  total: number;
  scored: number; // 已评分
  answeredUnscored: number; // 已作答待评分
  unanswered: number; // 真正未作答
}

function shuffle<T>(arr: T[]): T[] {
  const list = [...arr];
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

// 基于 sessions 计算三态统计（answer 已含当前输入则传入更新后的数组）
function computeStats(sessArr: QuestionSession[]): AnswerStats {
  let scored = 0;
  let answeredUnscored = 0;
  let unanswered = 0;
  sessArr.forEach((s) => {
    if (s.report !== null) {
      scored += 1;
    } else if (s.answer.trim().length > 0) {
      answeredUnscored += 1;
    } else {
      unanswered += 1;
    }
  });
  return { total: sessArr.length, scored, answeredUnscored, unanswered };
}

const PracticePage: React.FC = () => {
  // ---- 配置 ----
  const [phase, setPhase] = useState<PracticePhase>('configure');
  const [stageFilter, setStageFilter] = useState<ExamStage | '全部'>('全部');
  const [subjectFilter, setSubjectFilter] = useState<string>('全部');
  const [typeFilter, setTypeFilter] = useState<string>('全部');
  const [questionCount, setQuestionCount] = useState(DEFAULT_QUESTION_COUNT);
  const [countInput, setCountInput] = useState(String(DEFAULT_QUESTION_COUNT));
  const [customMode, setCustomMode] = useState(false);

  // ---- 答题 ----
  const [sessions, setSessions] = useState<QuestionSession[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [jumpInput, setJumpInput] = useState('');
  const [showJump, setShowJump] = useState(false);

  // ---- 存储 ----
  const setCurrentReport = useReportStore((state) => state.setCurrentReport);
  const addRecord = useReportStore((state) => state.addRecord);
  const subjects = useMemo(() => questionSubjects, []);

  // 预设题数点击
  const selectPreset = (n: number) => {
    setCustomMode(false);
    setQuestionCount(n);
    setCountInput(String(n));
  };

  const enableCustom = () => {
    setCustomMode(true);
    setCountInput(String(questionCount));
  };

  const parseCount = (value: string) => {
    setCountInput(value);
    const num = parseInt(value, 10);
    if (!Number.isNaN(num) && num >= 1 && num <= MAX_QUESTION_COUNT) {
      setQuestionCount(num);
    }
  };

  const countError = (() => {
    if (!customMode) return '';
    const num = parseInt(countInput, 10);
    if (countInput.trim() === '') return '';
    if (Number.isNaN(num)) return '请输入正整数';
    if (num < 1) return '至少 1 题';
    if (num > MAX_QUESTION_COUNT) return `最多 ${MAX_QUESTION_COUNT} 题`;
    return '';
  })();

  // ---- 抽题 ----
  const startExam = () => {
    if (questionCount < 1 || questionCount > MAX_QUESTION_COUNT) {
      Taro.showToast({ title: `请输入 1~${MAX_QUESTION_COUNT} 的题数`, icon: 'none' });
      return;
    }
    let pool = interviewQuestions;
    if (stageFilter !== '全部') pool = pool.filter((q) => q.stage === stageFilter);
    if (subjectFilter !== '全部') pool = pool.filter((q) => q.subject === subjectFilter);
    if (typeFilter !== '全部') pool = pool.filter((q) => q.type === typeFilter);
    if (pool.length === 0) {
      Taro.showToast({ title: '筛选后无可用题目，请放宽条件', icon: 'none' });
      return;
    }
    const count = Math.min(questionCount, pool.length);
    const selected = shuffle(pool).slice(0, count);
    setSessions(selected.map((q) => ({ question: q, answer: '', report: null })));
    setCurrentStep(0);
    setCurrentAnswer('');
    setPhase('answering');
  };

  const currentSession = sessions[currentStep] || null;

  // 保存当前输入到 sessions，并返回更新后的数组（避免 stale state）
  const saveAndGetUpdated = (): QuestionSession[] => {
    if (!currentSession || currentSession.report) return sessions;
    const trimmed = currentAnswer.trim();
    if (trimmed === currentSession.answer) return sessions;
    const updated = [...sessions];
    updated[currentStep] = { ...updated[currentStep], answer: trimmed };
    setSessions(updated);
    return updated;
  };

  // ---- 导航 ----
  const goPrev = () => {
    if (currentStep <= 0) return;
    const updated = saveAndGetUpdated();
    const prev = currentStep - 1;
    setCurrentStep(prev);
    setCurrentAnswer(updated[prev].answer);
    setShowJump(false);
  };

  const goNext = () => {
    if (currentStep >= sessions.length - 1) return;
    const updated = saveAndGetUpdated();
    const next = currentStep + 1;
    setCurrentStep(next);
    setCurrentAnswer(updated[next].answer);
    setShowJump(false);
  };

  const handleJump = () => {
    const target = parseInt(jumpInput, 10);
    if (Number.isNaN(target) || target < 1 || target > sessions.length) {
      Taro.showToast({ title: `请输入 1~${sessions.length}`, icon: 'none' });
      return;
    }
    const updated = saveAndGetUpdated();
    const idx = target - 1;
    setCurrentStep(idx);
    setCurrentAnswer(updated[idx].answer);
    setShowJump(false);
    setJumpInput('');
  };

  // 非末题：确认作答 → 保存并跳下一题
  const confirmAnswer = () => {
    if (!currentSession || currentSession.report) return;
    const updated = saveAndGetUpdated();
    if (currentStep < sessions.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      setCurrentAnswer(updated[next].answer);
      setShowJump(false);
    }
  };

  // ---- 批量统一评分 + 生成综合报告 ----
  const scoreAllAndSummary = async (sessArr: QuestionSession[]) => {
    if (submitting) return;

    // 收集所有"已作答（>=最小字数）但未评分"的题目
    const pending: number[] = [];
    sessArr.forEach((s, idx) => {
      if (s.report === null && s.answer.trim().length >= MIN_ANSWER_LENGTH) {
        pending.push(idx);
      }
    });

    // 没有任何待评分且没有已评分 → 无法生成报告
    const alreadyScored = sessArr.filter((s) => s.report !== null).length;
    if (pending.length === 0 && alreadyScored === 0) {
      Taro.showToast({ title: '请至少完整作答一题', icon: 'none' });
      return;
    }

    let latest = [...sessArr];

    if (pending.length > 0) {
      setSubmitting(true);
      let hasError = false;
      for (let i = 0; i < pending.length; i += 1) {
        const idx = pending[i];
        Taro.showLoading({ title: `生成报告中 (${i + 1}/${pending.length})...` });
        try {
          const report = await scoreInterview({ question: latest[idx].question, answer: latest[idx].answer });
          latest = [...latest];
          latest[idx] = { ...latest[idx], report };
          setSessions(latest);
        } catch (error) {
          console.error('[Practice] 单题评分失败', error);
          hasError = true;
        }
      }
      Taro.hideLoading();
      setSubmitting(false);
      if (hasError) {
        Taro.showToast({ title: '部分题目评分失败', icon: 'none' });
      }
    }

    const completed = latest.filter((s) => s.report !== null);
    if (completed.length === 0) {
      Taro.showToast({ title: '评分失败，请重试', icon: 'none' });
      return;
    }

    // 写入存储：综合报告以最后一题为代表 report，逐题记录入历史
    setCurrentReport(completed[completed.length - 1].report!);
    completed.forEach((s) => addRecord(s.report!));
    setPhase('summary');
  };

  // ---- 提交确认（末题提交 / 提前结束 共用）----
  const confirmAndSubmit = () => {
    const updated = saveAndGetUpdated();
    const stats = computeStats(updated);

    // 构造准确的确认文案
    let content = '';
    if (stats.unanswered === 0 && stats.answeredUnscored === 0) {
      content = `已完成全部 ${stats.total} 题，确认提交并生成综合评分报告？`;
    } else {
      const parts: string[] = [];
      if (stats.scored > 0) parts.push(`已评分 ${stats.scored} 题`);
      if (stats.answeredUnscored > 0) parts.push(`已作答待评分 ${stats.answeredUnscored} 题`);
      if (stats.unanswered > 0) parts.push(`未作答 ${stats.unanswered} 题`);
      content = `${parts.join('，')}。确认提交后将统一评分并生成综合报告，是否继续？`;
    }

    Taro.showModal({
      title: '提交确认',
      content,
      confirmText: '确认提交',
      cancelText: '继续作答',
      success: (res) => {
        if (res.confirm) {
          scoreAllAndSummary(updated);
        }
      },
    });
  };

  const resetExam = () => {
    setPhase('configure');
    setSessions([]);
    setCurrentStep(0);
    setCurrentAnswer('');
    setShowJump(false);
  };

  // ---- 汇总阶段派生数据 ----
  const completedSessions = sessions.filter((s) => s.report !== null);
  const totalScore = completedSessions.reduce((sum, s) => sum + (s.report?.totalScore || 0), 0);
  const avgScore = completedSessions.length > 0 ? Math.round(totalScore / completedSessions.length) : 0;
  const overallLevel = avgScore >= 85 ? '优秀' : avgScore >= 75 ? '良好' : avgScore >= 60 ? '合格' : '待提升';

  // 维度聚合：各维度取所有已评分题目的平均分
  const aggregatedDimensions = useMemo(() => {
    if (completedSessions.length === 0) return [];
    const dimMap: Record<string, { total: number; max: number; count: number }> = {};
    completedSessions.forEach((s) => {
      s.report!.dimensions.forEach((d) => {
        if (!dimMap[d.name]) dimMap[d.name] = { total: 0, max: d.maxScore, count: 0 };
        dimMap[d.name].total += d.score;
        dimMap[d.name].count += 1;
      });
    });
    return Object.entries(dimMap).map(([name, val]) => ({
      name,
      avgScore: Math.round(val.total / val.count),
      maxScore: val.max,
      count: val.count,
    }));
  }, [completedSessions]);

  // ======================== 配置阶段 ========================
  if (phase === 'configure') {
    return (
      <View className={styles.container}>
        <View className={styles.configCard}>
          <Text className={styles.configTitle}>结构化面试配置</Text>
          <Text className={styles.configDesc}>选择考试类型、岗位方向和题型，AI将从练习库中随机抽取题目进行模拟。</Text>
        </View>

        <Text className={styles.optionLabel}>考试类型</Text>
        <ScrollView className={styles.optionScroll} scrollX>
          {stageOptions.map((s) => (
            <View key={s} className={s === stageFilter ? styles.optionActive : styles.optionItem} onClick={() => setStageFilter(s)}>
              <Text>{s}</Text>
            </View>
          ))}
        </ScrollView>

        <Text className={styles.optionLabel}>岗位方向</Text>
        <ScrollView className={styles.optionScroll} scrollX>
          {['全部', ...subjects].map((s) => (
            <View key={s} className={s === subjectFilter ? styles.optionActive : styles.optionItem} onClick={() => setSubjectFilter(s)}>
              <Text>{s}</Text>
            </View>
          ))}
        </ScrollView>

        <Text className={styles.optionLabel}>题型</Text>
        <ScrollView className={styles.optionScroll} scrollX>
          {typeOptions.map((s) => (
            <View key={s} className={s === typeFilter ? styles.optionActive : styles.optionItem} onClick={() => setTypeFilter(s)}>
              <Text>{s}</Text>
            </View>
          ))}
        </ScrollView>

        <Text className={styles.optionLabel}>题目数量（1~{MAX_QUESTION_COUNT}）</Text>
        <View className={styles.countOptionRow}>
          {PRESET_COUNTS.map((n) => (
            <View key={n}
              className={!customMode && n === questionCount ? styles.countOptionActive : styles.countOption}
              onClick={() => selectPreset(n)}>
              <Text>{n} 题</Text>
            </View>
          ))}
          <View className={customMode ? styles.countOptionActive : styles.countOption} onClick={enableCustom}>
            <Text>自定义</Text>
          </View>
        </View>

        {customMode && (
          <>
            <View className={styles.countRow}>
              <Input
                className={styles.countInput}
                type="number"
                value={countInput}
                placeholder={`${DEFAULT_QUESTION_COUNT}`}
                onInput={(event) => parseCount(event.detail.value)}
                onBlur={() => {
                  if (countError || countInput.trim() === '') {
                    setCountInput(String(questionCount));
                  }
                }}
              />
              <Text className={styles.countUnit}>题</Text>
            </View>
            {countError !== '' && <Text className={styles.countError}>{countError}</Text>}
          </>
        )}
        <Text className={styles.countHint}>练习库匹配 {interviewQuestions.length} 题，支持一次模拟最多 {MAX_QUESTION_COUNT} 题</Text>

        <View className={styles.startButton} onClick={startExam}>
          <Text>开始模拟面试</Text>
        </View>
      </View>
    );
  }

  // ======================== 答题阶段 ========================
  if (phase === 'answering') {
    const session = currentSession!;
    const isFirst = currentStep === 0;
    const isLast = currentStep >= sessions.length - 1;
    const answeredCount = sessions.filter((s) => s.report !== null || s.answer.trim().length > 0).length;

    return (
      <View className={styles.container}>
        {/* 顶部：提前结束 + 进度条 */}
        <View className={styles.topBar}>
          <View className={styles.endEarlyBtn} onClick={confirmAndSubmit}>
            <Text>提前结束</Text>
          </View>
          <View className={styles.progressCard}>
            <View className={styles.progressTrack}>
              <View className={styles.progressFill} style={{ width: `${(answeredCount / sessions.length) * 100}%` }} />
            </View>
            <View className={styles.progressClick} onClick={() => setShowJump(true)}>
              <Text className={styles.progressText}>{currentStep + 1} / {sessions.length}</Text>
            </View>
          </View>
        </View>

        {showJump && (
          <View className={styles.jumpOverlay} onClick={() => setShowJump(false)}>
            <View className={styles.jumpPanel} onClick={(e) => e.stopPropagation()}>
              <Text className={styles.jumpTitle}>跳转到指定题号</Text>
              <View className={styles.jumpRow}>
                <Input
                  className={styles.jumpInput}
                  type="number"
                  value={jumpInput}
                  placeholder="输入题号"
                  onInput={(e) => setJumpInput(e.detail.value)}
                />
                <Text className={styles.jumpRange}>/ {sessions.length}</Text>
              </View>
              <View className={styles.jumpActions}>
                <View className={styles.jumpCancel} onClick={() => { setShowJump(false); setJumpInput(''); }}>
                  <Text>取消</Text>
                </View>
                <View className={styles.jumpConfirm} onClick={handleJump}>
                  <Text>跳转</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <View className={styles.examPanel}>
          <Text className={styles.panelLabel}>{session.question.category} · {session.question.difficulty}</Text>
          <Text className={styles.panelTitle}>{session.question.type}</Text>
          <View className={styles.metaRow}>
            <Text className={styles.metaTag}>{session.question.stage}</Text>
            <Text className={styles.metaTag}>{session.question.subject}</Text>
          </View>
        </View>

        <View className={styles.questionCard}>
          <View className={styles.cardHeader}><Text className={styles.cardTitle}>考官提问</Text></View>
          <Text className={styles.questionTitle}>{session.question.title}</Text>
          <Text className={styles.questionPrompt}>{session.question.prompt}</Text>
        </View>

        {session.report ? (
          <View className={styles.doneCard}>
            <Text className={styles.cardTitle}>本题得分：{session.report.totalScore} 分</Text>
            <Text className={styles.aiText}>{session.report.summary}</Text>
          </View>
        ) : (
          <>
            <View className={styles.answerCard}>
              <View className={styles.cardHeader}>
                <Text className={styles.cardTitle}>我的回答</Text>
                <Text className={styles.wordCount}>{currentAnswer.trim().length}字</Text>
              </View>
              <Textarea
                className={styles.answerInput}
                value={currentAnswer}
                maxlength={800}
                placeholder="请输入你的作答内容（建议不少于20字）..."
                onInput={(event) => setCurrentAnswer(event.detail.value)}
              />
            </View>
            <View className={styles.bottomActions}>
              {isLast ? (
                <View className={submitting ? styles.submitButtonDisabled : styles.submitButton} onClick={confirmAndSubmit}>
                  <Text>{submitting ? '生成报告中...' : '提交评分'}</Text>
                </View>
              ) : (
                <View className={styles.confirmButton} onClick={confirmAnswer}>
                  <Text>确认作答</Text>
                </View>
              )}
            </View>
          </>
        )}

        <View className={styles.navRow}>
          <View className={`${styles.navButton} ${isFirst ? styles.navButtonDisabled : ''}`} onClick={() => { if (!isFirst) goPrev(); }}>
            <Text>上一题</Text>
          </View>
          <View className={styles.navSpacer} />
          <View className={`${styles.navButton} ${isLast ? styles.navButtonDisabled : ''}`} onClick={() => { if (!isLast) goNext(); }}>
            <Text>下一题</Text>
          </View>
        </View>
      </View>
    );
  }

  // ======================== 综合评分报告阶段 ========================
  return (
    <View className={styles.container}>
      <View className={styles.summaryHero}>
        <Text className={styles.summaryLabel}>综合评分报告</Text>
        <Text className={styles.summaryScore}>{avgScore}</Text>
        <Text className={styles.summaryLevel}>{overallLevel}</Text>
        <Text className={styles.summaryDesc}>共完成 {completedSessions.length}/{sessions.length} 题，综合评分 {avgScore} 分</Text>
      </View>

      {aggregatedDimensions.length > 0 && (
        <View className={styles.sectionCard}>
          <Text className={styles.sectionTitle}>能力维度分析</Text>
          {aggregatedDimensions.map((dim) => (
            <View className={styles.dimensionRow} key={dim.name}>
              <View className={styles.dimHeader}>
                <Text className={styles.dimName}>{dim.name}</Text>
                <Text className={styles.dimScore}>{dim.avgScore}/{dim.maxScore}</Text>
              </View>
              <View className={styles.dimTrack}>
                <View className={styles.dimFill} style={{ width: `${(dim.avgScore / dim.maxScore) * 100}%` }} />
              </View>
            </View>
          ))}
        </View>
      )}

      <View className={styles.sectionCard}>
        <Text className={styles.sectionTitle}>每题得分明细</Text>
        {sessions.map((s, idx) => (
          <View className={styles.scoreDetailRow} key={idx}>
            <View className={styles.scoreRow}>
              <View className={styles.scoreRowLeft}>
                <Text className={styles.rowIndex}>第{idx + 1}题</Text>
                <Text className={styles.rowTitle}>{s.question.title}</Text>
              </View>
              {s.report ? (
                <Text className={styles.rowScore}>{s.report.totalScore}</Text>
              ) : s.answer.trim().length > 0 ? (
                <Text className={styles.rowSkipped}>未评分</Text>
              ) : (
                <Text className={styles.rowSkipped}>未答</Text>
              )}
            </View>
            {s.report && (
              <Text className={styles.rowComment}>{s.report.summary}</Text>
            )}
          </View>
        ))}
      </View>

      <View className={styles.sectionCard}>
        <Text className={styles.sectionTitle}>综合建议</Text>
        <Text className={styles.summaryTip}>1. 开头先判断题干核心任务，再分步骤展开分析和处理。</Text>
        <Text className={styles.summaryTip}>2. 对策部分建议包含责任主体、执行动作、反馈机制。</Text>
        <Text className={styles.summaryTip}>3. 结尾回到岗位职责、群众需求和工作成效，避免机械套话。</Text>
      </View>

      <View className={styles.actionRow}>
        <View className={styles.secondaryButton} onClick={resetExam}><Text>再来一次</Text></View>
        <View className={styles.primaryButton} onClick={() => Taro.switchTab({ url: '/pages/index/index' })}><Text>返回首页</Text></View>
      </View>
    </View>
  );
};

export default PracticePage;
