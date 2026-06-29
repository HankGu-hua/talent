import React, { useEffect, useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';

type LegalType = 'privacy' | 'agreement' | 'ai';

interface LegalSection {
  title: string;
  paragraphs: string[];
}

const contentMap: Record<LegalType, { title: string; sections: LegalSection[] }> = {
  privacy: {
    title: '隐私政策',
    sections: [
      {
        title: '信息收集',
        paragraphs: [
          '太灵面试练习助手会在本地保存你的练习记录、作答内容和 AI 复盘报告，用于展示历史练习和继续查看报告。',
          '当前版本不主动收集手机号、身份证号、通讯录、精确定位等敏感个人信息。',
        ],
      },
      {
        title: '信息使用',
        paragraphs: [
          '练习数据仅用于生成练习复盘、展示历史记录和优化本工具的使用体验。',
          '请勿在作答内容中填写身份证号、银行卡号、住址、联系方式等敏感信息。',
        ],
      },
      {
        title: '信息管理',
        paragraphs: [
          '你可以在“我的”页面清空本地练习记录。清空后，本机已保存的历史报告将无法恢复。',
          '后续如接入云端同步，将在上线前补充云端数据删除和反馈入口。',
        ],
      },
    ],
  },
  agreement: {
    title: '用户协议',
    sections: [
      {
        title: '服务定位',
        paragraphs: [
          '本工具用于面试练习、结构化表达训练和练习复盘，不提供课程服务，不承诺通过或分数提升结果。',
          '题目、参考框架和复盘建议仅用于个人练习参考，不代表任何官方机构意见。',
        ],
      },
      {
        title: '用户责任',
        paragraphs: [
          '请合理使用本工具，不提交违法、侵权、攻击、歧视、泄露他人隐私或其他不适宜内容。',
          '因用户自行输入或传播不当内容产生的责任，由用户自行承担。',
        ],
      },
      {
        title: '服务调整',
        paragraphs: [
          '我们可能根据产品迭代对题库、评分维度、页面功能进行调整。',
          '如后续增加新的服务能力，将另行提供明确说明、记录查询和反馈入口。',
        ],
      },
    ],
  },
  ai: {
    title: 'AI生成内容说明',
    sections: [
      {
        title: 'AI复盘边界',
        paragraphs: [
          'AI 复盘报告由系统根据你的作答内容和预设评分维度生成，仅供练习复盘参考。',
          'AI 结果不代表真实评审结果、实际面试表现或任何确定性承诺。',
        ],
      },
      {
        title: '内容安全',
        paragraphs: [
          '请勿提交涉密、违法、暴力、歧视、攻击、隐私泄露等内容。',
          '如 AI 生成内容存在明显不准确或不适宜表达，请以人工判断为准，并停止传播相关内容。',
        ],
      },
      {
        title: '使用建议',
        paragraphs: [
          '建议将 AI 报告作为练习反馈工具，重点关注结构、逻辑、表达规范和可执行建议。',
          '真实面试表现受岗位、考场、题目、表达状态等多种因素影响，请保持独立判断。',
        ],
      },
    ],
  },
};

function normalizeType(value?: string): LegalType {
  if (value === 'privacy' || value === 'agreement' || value === 'ai') {
    return value;
  }
  return 'privacy';
}

const LegalPage: React.FC = () => {
  const params = Taro.getCurrentInstance().router?.params || {};
  const type = normalizeType(params.type);
  const content = useMemo(() => contentMap[type], [type]);

  useEffect(() => {
    Taro.setNavigationBarTitle({ title: content.title });
  }, [content.title]);

  return (
    <View className={styles.container}>
      <View className={styles.headerCard}>
        <Text className={styles.title}>{content.title}</Text>
        <Text className={styles.desc}>太灵面试练习助手</Text>
      </View>

      {content.sections.map((section) => (
        <View className={styles.sectionCard} key={section.title}>
          <Text className={styles.sectionTitle}>{section.title}</Text>
          {section.paragraphs.map((paragraph) => (
            <Text className={styles.paragraph} key={paragraph}>{paragraph}</Text>
          ))}
        </View>
      ))}
    </View>
  );
};

export default LegalPage;
