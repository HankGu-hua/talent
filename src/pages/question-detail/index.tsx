import React, { useEffect, useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { interviewQuestions, InterviewQuestionWithFrame } from '@/data/interview';
import styles from './index.module.scss';

const QuestionDetailPage: React.FC = () => {
  const params = Taro.getCurrentInstance().router?.params || {};
  const questionId = Number(params.id);

  const question = useMemo(
    () => interviewQuestions.find((item) => item.id === questionId) as InterviewQuestionWithFrame | undefined,
    [questionId],
  );

  useEffect(() => {
    if (question) {
      Taro.setNavigationBarTitle({ title: '题目详情' });
    }
  }, [question]);

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
    </View>
  );
};

export default QuestionDetailPage;
