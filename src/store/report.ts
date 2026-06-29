import { create } from 'zustand';
import Taro from '@tarojs/taro';
import { InterviewScoreReport, InterviewRecord } from '@/types/interview';
import { interviewRecords as seedRecords } from '@/data/interview';

const RECORD_STORAGE_KEY = 'tailing_interview_records';

interface ReportState {
  // 当前查看的报告（从模拟页提交后写入，报告页读取）
  currentReport: InterviewScoreReport | null;
  // 历史练习记录
  records: InterviewRecord[];
  setCurrentReport: (report: InterviewScoreReport) => void;
  addRecord: (report: InterviewScoreReport) => void;
  openRecordReport: (recordId: number) => InterviewScoreReport | null;
  clearRecords: () => void;
}

function formatDate(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${month}-${day}`;
}

function loadRecords(): InterviewRecord[] {
  try {
    const stored = Taro.getStorageSync<InterviewRecord[]>(RECORD_STORAGE_KEY);
    return Array.isArray(stored) ? stored : seedRecords;
  } catch (error) {
    console.warn('[ReportStore] 读取本地练习记录失败:', error);
    return seedRecords;
  }
}

function saveRecords(records: InterviewRecord[]) {
  try {
    Taro.setStorageSync(RECORD_STORAGE_KEY, records);
  } catch (error) {
    console.warn('[ReportStore] 保存本地练习记录失败:', error);
  }
}

const initialRecords = loadRecords();
let recordId = Math.max(0, ...initialRecords.map((item) => item.id)) + 1;

export const useReportStore = create<ReportState>((set, get) => ({
  currentReport: null,
  records: initialRecords,
  setCurrentReport: (report) => set({ currentReport: report }),
  addRecord: (report) =>
    set((state) => {
      const record: InterviewRecord = {
        id: recordId++,
        date: formatDate(),
        title: report.questionTitle,
        score: report.totalScore,
        comment: report.summary,
        report,
      };
      const records = [record, ...state.records];
      saveRecords(records);
      return { records };
    }),
  openRecordReport: (recordId) => {
    const record = get().records.find((item) => item.id === recordId);
    const targetReport = record?.report || null;
    if (targetReport) {
      set({ currentReport: targetReport });
    }
    return targetReport;
  },
  clearRecords: () => {
    saveRecords([]);
    set({ records: [], currentReport: null });
  },
}));
