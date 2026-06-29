import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import {
  interviewQuestions,
  questionCategories,
  questionTypes,
  questionStages,
  questionSubjects,
  questionDifficulties,
} from '@/data/interview';
import styles from './index.module.scss';

const FREE_LIMIT = 100;

const QuestionBankPage: React.FC = () => {
  const [stageFilter, setStageFilter] = useState('全部');
  const [subjectFilter, setSubjectFilter] = useState('全部');
  const [typeFilter, setTypeFilter] = useState('全部');
  const [categoryFilter, setCategoryFilter] = useState('全部');
  const [difficultyFilter, setDifficultyFilter] = useState('全部');
  const [unlocked, setUnlocked] = useState(false);

  const questions = useMemo(() => {
    let list = interviewQuestions;
    // 已解锁才实际筛，未解锁时筛选保持默认"全部"
    if (unlocked) {
      if (stageFilter !== '全部') list = list.filter((q) => q.stage === stageFilter);
      if (subjectFilter !== '全部') list = list.filter((q) => q.subject === subjectFilter);
      if (typeFilter !== '全部') list = list.filter((q) => q.type === typeFilter);
      if (categoryFilter !== '全部') list = list.filter((q) => q.category === categoryFilter);
      if (difficultyFilter !== '全部') list = list.filter((q) => q.difficulty === difficultyFilter);
    }
    return list;
  }, [stageFilter, subjectFilter, typeFilter, categoryFilter, difficultyFilter, unlocked]);

  const displayQuestions = unlocked ? questions : questions.slice(0, FREE_LIMIT);
  const hiddenCount = Math.max(interviewQuestions.length - FREE_LIMIT, 0);

  const openQuestion = (questionId: number) => {
    Taro.navigateTo({ url: `/pages/question-detail/index?id=${questionId}` });
  };

  const handleUnlock = () => {
    Taro.showModal({
      title: '解锁专项练习库',
      content: `解锁全部 ${interviewQuestions.length} 题练习及参考框架。`,
      confirmText: '立即解锁',
      cancelText: '稍后再说',
      success: (res) => {
        if (res.confirm) {
          setUnlocked(true);
          Taro.showToast({ title: '解锁成功！', icon: 'success' });
        }
      },
    });
  };

  // 未付费点击筛选项 → 提示解锁
  const handleFilterTap = (setter: (v: string) => void, value: string) => {
    if (!unlocked) {
      Taro.showToast({ title: '请先解锁专项练习库', icon: 'none', duration: 1500 });
      return;
    }
    setter(value);
  };

  const FilterRow = ({ label, options, active, onSelect }: {
    label: string; options: string[]; active: string; onSelect: (v: string) => void;
  }) => (
    <>
      <Text className={styles.filterLabel}>{label}</Text>
      <ScrollView className={styles.filterScroll} scrollX>
        {['全部', ...options].map((s) => (
          <View key={s}
            className={`${styles.filterItem} ${!unlocked ? styles.filterLocked : ''} ${s === active ? styles.filterActive : ''}`}
            onClick={() => handleFilterTap(onSelect, s)}>
            <Text>{s}</Text>
          </View>
        ))}
      </ScrollView>
    </>
  );

  return (
    <View className={styles.container}>
      <View className={styles.headerCard}>
        <Text className={styles.headerTitle}>结构化面试练习库</Text>
        <Text className={styles.headerDesc}>
          共 {interviewQuestions.length} 题练习 · {questionCategories.length} 类场景 · {questionStages.length} 类考试 · {questionSubjects.length} 个岗位方向
        </Text>
        {!unlocked && (
          <View className={styles.unlockTop} onClick={handleUnlock}>
            <Text className={styles.unlockTopText}>解锁专项练习库</Text>
          </View>
        )}
        {unlocked && (
          <Text className={styles.unlockedTag}>已解锁专项练习库</Text>
        )}
      </View>

      <FilterRow label="考试类型" options={questionStages} active={stageFilter} onSelect={setStageFilter} />
      <FilterRow label="岗位方向" options={questionSubjects} active={subjectFilter} onSelect={setSubjectFilter} />
      <FilterRow label="题型" options={questionTypes} active={typeFilter} onSelect={setTypeFilter} />
      <FilterRow label="考点" options={questionCategories} active={categoryFilter} onSelect={setCategoryFilter} />
      <FilterRow label="难度" options={questionDifficulties} active={difficultyFilter} onSelect={setDifficultyFilter} />

      <View className={styles.resultBar}>
        <Text className={styles.resultInfo}>
          展示 {displayQuestions.length} / {questions.length} 题
        </Text>
      </View>

      <View className={styles.questionList}>
        {displayQuestions.map((question) => (
          <View className={styles.questionCard} key={question.id} onClick={() => openQuestion(question.id)}>
            <View className={styles.cardTop}>
              <Text className={styles.typeTag}>{question.category}</Text>
              <Text className={styles.typeTag}>{question.type}</Text>
              <Text className={styles.difficulty}>{question.difficulty}</Text>
            </View>
            <Text className={styles.questionTitle}>{question.title}</Text>
            <Text className={styles.questionPrompt}>{question.prompt}</Text>
            <View className={styles.metaRow}>
              <Text className={styles.metaText}>{question.stage}</Text>
              <Text className={styles.metaText}>{question.subject}</Text>
              <Text className={styles.metaText}>{Math.floor(question.duration / 60)}分钟</Text>
            </View>
            {(question as any).referenceFrame && (
              <View className={styles.refAnswer}>
                <Text className={styles.refLabel}>参考框架:</Text>
                <Text className={styles.refText}>{(question as any).referenceFrame}</Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {!unlocked && (
        <Text className={styles.lockHint}>未解锁全部题目，当前隐藏 {hiddenCount} 题专项练习</Text>
      )}
    </View>
  );
};

export default QuestionBankPage;
