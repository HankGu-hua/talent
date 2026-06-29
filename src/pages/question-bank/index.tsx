import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro, { usePageScroll } from '@tarojs/taro';
import {
  interviewQuestions,
  questionCategories,
  questionTypes,
  questionStages,
  questionSubjects,
  questionDifficulties,
} from '@/data/interview';
import styles from './index.module.scss';

const DEFAULT_PAGE_SIZE = 20;
const PAGE_SIZE_OPTIONS = [10, 20, 30, 50];
const FRAME_SUMMARY_LENGTH = 88;

function buildFrameSummary(frame?: string): string {
  if (!frame) return '';
  const normalized = frame.replace(/\s+/g, '');
  return normalized.length > FRAME_SUMMARY_LENGTH
    ? `${normalized.slice(0, FRAME_SUMMARY_LENGTH)}...`
    : normalized;
}

const QuestionBankPage: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [stageFilter, setStageFilter] = useState('全部');
  const [subjectFilter, setSubjectFilter] = useState('全部');
  const [typeFilter, setTypeFilter] = useState('全部');
  const [categoryFilter, setCategoryFilter] = useState('全部');
  const [difficultyFilter, setDifficultyFilter] = useState('全部');
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [currentPage, setCurrentPage] = useState(1);
  const [showBackTop, setShowBackTop] = useState(false);

  const questions = useMemo(() => {
    let list = interviewQuestions;
    const searchText = keyword.trim().toLowerCase();
    if (searchText !== '') {
      list = list.filter((q) => {
        const frame = (q as any).referenceFrame || '';
        return [
          q.title,
          q.prompt,
          q.category,
          q.type,
          q.stage,
          q.subject,
          q.difficulty,
          frame,
        ].some((value) => String(value).toLowerCase().includes(searchText));
      });
    }
    if (stageFilter !== '全部') list = list.filter((q) => q.stage === stageFilter);
    if (subjectFilter !== '全部') list = list.filter((q) => q.subject === subjectFilter);
    if (typeFilter !== '全部') list = list.filter((q) => q.type === typeFilter);
    if (categoryFilter !== '全部') list = list.filter((q) => q.category === categoryFilter);
    if (difficultyFilter !== '全部') list = list.filter((q) => q.difficulty === difficultyFilter);
    return list;
  }, [keyword, stageFilter, subjectFilter, typeFilter, categoryFilter, difficultyFilter]);

  const pageCount = Math.max(1, Math.ceil(questions.length / pageSize));
  const pageStart = (currentPage - 1) * pageSize;
  const pageEnd = Math.min(pageStart + pageSize, questions.length);

  const visibleQuestions = useMemo(() => (
    questions.slice(pageStart, pageStart + pageSize)
  ), [questions, pageStart, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [keyword, stageFilter, subjectFilter, typeFilter, categoryFilter, difficultyFilter, pageSize]);

  usePageScroll(({ scrollTop }) => {
    setShowBackTop(scrollTop > 600);
  });

  const openQuestion = (questionId: number) => {
    Taro.navigateTo({ url: `/pages/question-detail/index?id=${questionId}` });
  };

  const goTop = () => {
    Taro.pageScrollTo({ scrollTop: 0, duration: 240 });
  };

  const goPrevPage = () => {
    if (currentPage <= 1) return;
    setCurrentPage((page) => page - 1);
    goTop();
  };

  const goNextPage = () => {
    if (currentPage >= pageCount) return;
    setCurrentPage((page) => page + 1);
    goTop();
  };

  const handleFilterTap = (setter: (v: string) => void, value: string) => {
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
            className={`${styles.filterItem} ${s === active ? styles.filterActive : ''}`}
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
        <Text className={styles.headerNote}>当前版本为免费练习工具，参考框架仅用于表达复盘。</Text>
      </View>

      <View className={styles.searchBox}>
        <Input
          className={styles.searchInput}
          value={keyword}
          placeholder="搜索题目关键词、题型、岗位方向"
          confirmType="search"
          onInput={(event) => setKeyword(event.detail.value)}
        />
        {keyword.trim() !== '' && (
          <View className={styles.clearSearch} onClick={() => setKeyword('')}>
            <Text>清空</Text>
          </View>
        )}
      </View>

      <FilterRow label="考试类型" options={questionStages} active={stageFilter} onSelect={setStageFilter} />
      <FilterRow label="岗位方向" options={questionSubjects} active={subjectFilter} onSelect={setSubjectFilter} />
      <FilterRow label="题型" options={questionTypes} active={typeFilter} onSelect={setTypeFilter} />
      <FilterRow label="考点" options={questionCategories} active={categoryFilter} onSelect={setCategoryFilter} />
      <FilterRow label="难度" options={questionDifficulties} active={difficultyFilter} onSelect={setDifficultyFilter} />

      <View className={styles.resultBar}>
        <Text className={styles.resultInfo}>
          第 {currentPage} / {pageCount} 页 · 展示 {questions.length} / {interviewQuestions.length} 题
        </Text>
      </View>

      <View className={styles.pageSizeRow}>
        <Text className={styles.pageSizeLabel}>每页题数</Text>
        {PAGE_SIZE_OPTIONS.map((size) => (
          <View
            key={size}
            className={size === pageSize ? styles.pageSizeActive : styles.pageSizeItem}
            onClick={() => setPageSize(size)}
          >
            <Text>{size}</Text>
          </View>
        ))}
      </View>

      <View className={styles.questionList}>
        {visibleQuestions.map((question) => (
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
                <Text className={styles.refLabel}>参考框架摘要</Text>
                <Text className={styles.refText}>{buildFrameSummary((question as any).referenceFrame)}</Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {questions.length === 0 && (
        <View className={styles.emptyCard}>
          <Text className={styles.emptyText}>未找到匹配题目，请调整关键词或筛选条件</Text>
        </View>
      )}

      {questions.length > 0 && (
        <View className={styles.pagination}>
          <View className={`${styles.pageButton} ${currentPage <= 1 ? styles.pageButtonDisabled : ''}`} onClick={goPrevPage}>
            <Text>上一页</Text>
          </View>
          <Text className={styles.pageText}>{pageStart + 1}-{pageEnd}</Text>
          <View className={`${styles.pageButton} ${currentPage >= pageCount ? styles.pageButtonDisabled : ''}`} onClick={goNextPage}>
            <Text>下一页</Text>
          </View>
        </View>
      )}

      {showBackTop && (
        <View className={styles.backTop} onClick={goTop}>
          <Text>顶部</Text>
        </View>
      )}
    </View>
  );
};

export default QuestionBankPage;
