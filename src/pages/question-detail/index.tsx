import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { interviewQuestions, InterviewQuestionWithFrame } from '@/data/interview';
import styles from './index.module.scss';

const QuestionDetailPage: React.FC = () => {
  const params = Taro.getCurrentInstance().router?.params || {};
  const questionId = Number(params.id);
  const [jumpInput, setJumpInput] = useState('');

  const question = useMemo(
    () => interviewQuestions.find((item) => item.id === questionId) as InterviewQuestionWithFrame | undefined,
    [questionId],
  );
  const currentIndex = useMemo(
    () => interviewQuestions.findIndex((item) => item.id === questionId),
    [questionId],
  );
  const currentNo = currentIndex >= 0 ? currentIndex + 1 : 0;

  useEffect(() => {
    if (question) {
      Taro.setNavigationBarTitle({ title: '题目详情' });
      setJumpInput(String(currentNo));
    }
  }, [question, currentNo]);

  const goQuestionByIndex = (index: number) => {
    const target = interviewQuestions[index];
    if (!target) return;
    Taro.redirectTo({ url: `/pages/question-detail/index?id=${target.id}` });
  };

  const goPrev = () => {
    if (currentIndex <= 0) return;
    goQuestionByIndex(currentIndex - 1);
  };

  const goNext = () => {
    if (currentIndex >= interviewQuestions.length - 1) return;
    goQuestionByIndex(currentIndex + 1);
  };

  const jumpToQuestion = () => {
    const targetNo = parseInt(jumpInput, 10);
    if (Number.isNaN(targetNo) || targetNo < 1 || targetNo > interviewQuestions.length) {
      Taro.showToast({ title: `请输入 1~${interviewQuestions.length}`, icon: 'none' });
      return;
    }
    goQuestionByIndex(targetNo - 1);
  };

  if (!question) {
    return (
      <View className={styles.container}>
        <View className={styles.emptyCard}>
          <Text className={styles.emptyText}>未找到该题目</Text>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.container}>
      <View className={styles.heroCard}>
        <View className={styles.tagRow}>
          <Text className={styles.tag}>第 {currentNo} / {interviewQuestions.length} 题</Text>
          <Text className={styles.tag}>{question.category}</Text>
          <Text className={styles.tag}>{question.type}</Text>
          <Text className={styles.difficulty}>{question.difficulty}</Text>
        </View>
        <Text className={styles.title}>{question.title}</Text>
        <View className={styles.metaRow}>
          <Text className={styles.meta}>{question.stage}</Text>
          <Text className={styles.meta}>{question.subject}</Text>
          <Text className={styles.meta}>{Math.floor(question.duration / 60)}分钟</Text>
        </View>
      </View>

      <View className={styles.sectionCard}>
        <Text className={styles.sectionTitle}>作答要求</Text>
        <Text className={styles.paragraph}>{question.prompt}</Text>
      </View>

      <View className={styles.sectionCard}>
        <Text className={styles.sectionTitle}>评分关注点</Text>
        {question.answerPoints.map((point, index) => (
          <Text className={styles.point} key={point}>{index + 1}. {point}</Text>
        ))}
      </View>

      <View className={styles.sectionCard}>
        <Text className={styles.sectionTitle}>参考框架</Text>
        <Text className={styles.frame}>{question.referenceFrame}</Text>
      </View>

      <View className={styles.jumpCard}>
        <Text className={styles.jumpTitle}>题号跳转</Text>
        <View className={styles.jumpRow}>
          <Input
            className={styles.jumpInput}
            type="number"
            value={jumpInput}
            placeholder="输入题号"
            onInput={(event) => setJumpInput(event.detail.value)}
          />
          <Text className={styles.jumpTotal}>/ {interviewQuestions.length}</Text>
          <View className={styles.jumpButton} onClick={jumpToQuestion}>
            <Text>跳转</Text>
          </View>
        </View>
      </View>

      <View className={styles.navRow}>
        <View className={`${styles.navButton} ${currentIndex <= 0 ? styles.navButtonDisabled : ''}`} onClick={goPrev}>
          <Text>上一题</Text>
        </View>
        <View className={`${styles.navButton} ${currentIndex >= interviewQuestions.length - 1 ? styles.navButtonDisabled : ''}`} onClick={goNext}>
          <Text>下一题</Text>
        </View>
      </View>
    </View>
  );
};

export default QuestionDetailPage;
