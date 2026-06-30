import React, { useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useReportStore } from '@/store/report';
import styles from './index.module.scss';

const ResultPage: React.FC = () => {
  const report = useReportStore((state) => state.currentReport);

  useEffect(() => {
    if (!report) {
      console.error('[Result] 未找到报告数据，返回模拟页');
      Taro.redirectTo({ url: '/pages/practice/index' });
    }
  }, [report]);

  const backPractice = () => {
    console.info('[Result] 返回继续练习');
    Taro.switchTab({ url: '/pages/practice/index' });
  };

  const backHome = () => {
    console.info('[Result] 返回首页');
    Taro.switchTab({ url: '/pages/index/index' });
  };

  if (!report) {
    return (
      <View className={styles.container}>
        <View className={styles.emptyCard}>
          <Text className={styles.emptyText}>正在加载报告...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.container}>
      <View className={styles.scoreCard}>
        <Text className={styles.reportLabel}>AI复盘报告</Text>
        <Text className={styles.scoreValue}>{report.totalScore}</Text>
        <Text className={styles.scoreLevel}>{report.level}</Text>
        <Text className={styles.scoreDesc}>{report.summary}</Text>
      </View>

      <View className={styles.noticeCard}>
        <Text className={styles.noticeText}>本报告由 AI 生成，仅供练习复盘参考，不代表真实评审结果或实际面试表现。</Text>
      </View>

      <View className={styles.sectionCard}>
        <Text className={styles.sectionTitle}>本次题目</Text>
        <Text className={styles.questionTitle}>{report.questionTitle}</Text>
      </View>

      <View className={styles.sectionCard}>
        <Text className={styles.sectionTitle}>能力拆解</Text>
        {report.dimensions.map((dim) => (
          <View className={styles.dimensionItem} key={dim.name}>
            <View className={styles.dimensionMain}>
              <Text className={styles.dimensionName}>{dim.name}</Text>
              <Text className={styles.dimensionComment}>{dim.comment}</Text>
            </View>
            <Text className={styles.dimensionScore}>{dim.score}<Text className={styles.dimensionMax}>/{dim.maxScore}</Text></Text>
          </View>
        ))}
      </View>

      <View className={styles.sectionCard}>
        <Text className={styles.sectionTitle}>表现亮点</Text>
        {report.strengths.map((item, index) => (
          <Text className={styles.bullet} key={index}>· {item}</Text>
        ))}
      </View>

      <View className={styles.sectionCard}>
        <Text className={styles.sectionTitle}>待提升点</Text>
        {report.weaknesses.map((item, index) => (
          <Text className={styles.bulletWarn} key={index}>· {item}</Text>
        ))}
      </View>

      <View className={styles.sectionCard}>
        <Text className={styles.sectionTitle}>改进建议</Text>
        {report.suggestions.map((item, index) => (
          <Text className={styles.suggestion} key={index}>{index + 1}. {item}</Text>
        ))}
      </View>

      <View className={styles.sectionCard}>
        <Text className={styles.sectionTitle}>参考框架</Text>
        <Text className={styles.improved}>{report.improvedAnswer}</Text>
      </View>

      <View className={styles.actionRow}>
        <View className={styles.secondaryButton} onClick={backHome}>
          <Text>返回首页</Text>
        </View>
        <View className={styles.primaryButton} onClick={backPractice}>
          <Text>继续练习</Text>
        </View>
      </View>
    </View>
  );
};

export default ResultPage;
