import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { interviewQuestions, questionCategories, questionSubjects } from '@/data/interview';
import { useReportStore } from '@/store/report';
import styles from './index.module.scss';

const IndexPage: React.FC = () => {
  const records = useReportStore((state) => state.records);
  const openRecordReport = useReportStore((state) => state.openRecordReport);
  const featuredQuestion = interviewQuestions[Math.floor(Math.random() * interviewQuestions.length)];
  const recentRecords = records.slice(0, 3);

  const goPractice = () => {
    console.info('[Home] 前往模拟面试');
    Taro.switchTab({ url: '/pages/practice/index' });
  };

  const goQuestionBank = () => {
    console.info('[Home] 前往练习库');
    Taro.switchTab({ url: '/pages/question-bank/index' });
  };

  const viewRecord = (recordId: number) => {
    const report = openRecordReport(recordId);
    if (!report) {
      Taro.showToast({ title: '暂无可查看的报告', icon: 'none' });
      return;
    }
    Taro.navigateTo({ url: '/pages/result/index' });
  };

  return (
    <View className={styles.container}>
      <View className={styles.heroCard}>
        <View className={styles.brandRow}>
          <View className={styles.logoBox}><Text className={styles.logoText}>太</Text></View>
          <View>
            <Text className={styles.brandName}>太灵面试练习助手</Text>
            <Text className={styles.brandDesc}>{interviewQuestions.length}题练习 + AI智能复盘，结构化面试练得更有章法</Text>
          </View>
        </View>
        <Text className={styles.heroTitle}>AI陪你做面试练习，复盘每一次表达</Text>
        <Text className={styles.heroDesc}>太灵面试练习助手覆盖{questionCategories.length}类常见题型、{questionSubjects.length}个岗位方向，作答后生成AI复盘报告。</Text>
        <View className={styles.primaryButton} onClick={goPractice}>
          <Text>开始一次模拟</Text>
        </View>
      </View>

      <View className={styles.statsGrid}>
        <View className={styles.statCard}>
          <Text className={styles.statValue}>{interviewQuestions.length}+</Text>
          <Text className={styles.statLabel}>练习题</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statValue}>{questionCategories.length}</Text>
          <Text className={styles.statLabel}>题型场景</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statValue}>{questionSubjects.length}</Text>
          <Text className={styles.statLabel}>岗位方向</Text>
        </View>
      </View>

      <View className={styles.sectionHeader}>
        <Text className={styles.sectionTitle}>今日推荐</Text>
        <Text className={styles.sectionAction} onClick={goQuestionBank}>查看练习库</Text>
      </View>
      <View className={styles.questionCard} onClick={goPractice}>
        <View className={styles.tagRow}>
          <Text className={styles.tag}>{featuredQuestion.category}</Text>
          <Text className={styles.tag}>{featuredQuestion.type}</Text>
          <Text className={styles.difficulty}>{featuredQuestion.difficulty}</Text>
        </View>
        <Text className={styles.questionTitle}>{featuredQuestion.title}</Text>
        <Text className={styles.questionDesc}>{featuredQuestion.prompt}</Text>
      </View>

      <View className={styles.sectionHeader}>
        <Text className={styles.sectionTitle}>最近练习</Text>
        <Text className={styles.sectionMuted}>AI评分记录</Text>
      </View>
      <View className={styles.recordList}>
        {recentRecords.length === 0 ? (
          <View className={styles.emptyRecord}>
            <Text className={styles.emptyRecordText}>暂无练习记录，开始第一次模拟吧</Text>
          </View>
        ) : (
          recentRecords.map((record) => (
            <View className={styles.recordItem} key={record.id} onClick={() => viewRecord(record.id)}>
              <View>
                <Text className={styles.recordTitle}>{record.title}</Text>
                <Text className={styles.recordComment}>{record.date} · {record.comment}</Text>
              </View>
              <Text className={styles.recordScore}>{record.score}</Text>
            </View>
          ))
        )}
      </View>
    </View>
  );
};

export default IndexPage;
