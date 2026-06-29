import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useReportStore } from '@/store/report';
import styles from './index.module.scss';

const ProfilePage: React.FC = () => {
  const records = useReportStore((state) => state.records);
  const openRecordReport = useReportStore((state) => state.openRecordReport);
  const clearRecords = useReportStore((state) => state.clearRecords);
  const averageScore = records.length > 0
    ? Math.round(records.reduce((sum, item) => sum + item.score, 0) / records.length)
    : 0;

  const level = averageScore >= 85 ? 'A' : averageScore >= 75 ? 'B+' : averageScore >= 60 ? 'B' : 'C';

  const viewRecord = (recordId: number) => {
    const report = openRecordReport(recordId);
    if (!report) {
      Taro.showToast({ title: '暂无可查看的报告', icon: 'none' });
      return;
    }
    Taro.navigateTo({ url: '/pages/result/index' });
  };

  const openLegal = (type: 'privacy' | 'agreement' | 'ai') => {
    Taro.navigateTo({ url: `/pages/legal/index?type=${type}` });
  };

  const confirmClearRecords = () => {
    if (records.length === 0) {
      Taro.showToast({ title: '暂无练习记录', icon: 'none' });
      return;
    }
    Taro.showModal({
      title: '清空练习记录',
      content: '清空后，本机保存的历史报告将无法恢复。确认清空？',
      confirmText: '清空',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          clearRecords();
          Taro.showToast({ title: '已清空', icon: 'success' });
        }
      },
    });
  };

  return (
    <View className={styles.container}>
      <View className={styles.profileCard}>
        <View className={styles.avatar}>太</View>
        <View>
          <Text className={styles.userName}>太灵面试练习用户</Text>
          <Text className={styles.userDesc}>累计{records.length}次练习，当前表现 {level}</Text>
        </View>
      </View>

      <View className={styles.metricGrid}>
        <View className={styles.metricCard}>
          <Text className={styles.metricValue}>{records.length}</Text>
          <Text className={styles.metricLabel}>练习次数</Text>
        </View>
        <View className={styles.metricCard}>
          <Text className={styles.metricValue}>{averageScore}</Text>
          <Text className={styles.metricLabel}>平均得分</Text>
        </View>
        <View className={styles.metricCard}>
          <Text className={styles.metricValue}>{level}</Text>
          <Text className={styles.metricLabel}>当前水平</Text>
        </View>
      </View>

      <View className={styles.sectionHeader}>
        <Text className={styles.sectionTitle}>练习记录</Text>
        <Text className={styles.sectionAction} onClick={confirmClearRecords}>清空</Text>
      </View>
      <View className={styles.recordList}>
        {records.length === 0 ? (
          <View className={styles.emptyRecord}>
            <Text className={styles.emptyRecordText}>快去完成第一次模拟练习吧</Text>
          </View>
        ) : (
          records.map((record) => (
            <View className={styles.recordItem} key={record.id} onClick={() => viewRecord(record.id)}>
              <View>
                <Text className={styles.recordTitle}>{record.title}</Text>
                <Text className={styles.recordDesc}>{record.date} · {record.comment}</Text>
              </View>
              <Text className={styles.recordScore}>{record.score}</Text>
            </View>
          ))
        )}
      </View>

      <View className={styles.sectionHeader}>
        <Text className={styles.sectionTitle}>服务说明</Text>
      </View>
      <View className={styles.linkList}>
        <View className={styles.linkItem} onClick={() => openLegal('privacy')}>
          <Text className={styles.linkTitle}>隐私政策</Text>
          <Text className={styles.linkArrow}>›</Text>
        </View>
        <View className={styles.linkItem} onClick={() => openLegal('agreement')}>
          <Text className={styles.linkTitle}>用户协议</Text>
          <Text className={styles.linkArrow}>›</Text>
        </View>
        <View className={styles.linkItem} onClick={() => openLegal('ai')}>
          <Text className={styles.linkTitle}>AI生成内容说明</Text>
          <Text className={styles.linkArrow}>›</Text>
        </View>
      </View>
    </View>
  );
};

export default ProfilePage;
