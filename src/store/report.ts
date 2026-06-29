import { create } from 'zustand';
import { InterviewScoreReport, InterviewRecord } from '@/types/interview';
import { interviewRecords as seedRecords } from '@/data/interview';

interface ReportState {
  // 当前查看的报告（从模拟页提交后写入，报告页读取）
  currentReport: InterviewScoreReport | null;
  // 历史练习记录
  records: InterviewRecord[];
  setCurrentReport: (report: InterviewScoreReport) => void;
  addRecord: (report: InterviewScoreReport) => void;
  openRecordReport: (recordId: number) => InterviewScoreReport | null;
}

function formatDate(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${month}-${day}`;
}

let recordId = seedRecords.length + 1;

export const useReportStore = create<ReportState>((set, get) => ({
  currentReport: null,
  records: seedRecords,
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
      return { records: [record, ...state.records] };
    }),
  openRecordReport: (recordId) => {
    const record = get().records.find((item) => item.id === recordId);
    const targetReport = record?.report || null;
    if (targetReport) {
      set({ currentReport: targetReport });
    }
    return targetReport;
  },
}));
