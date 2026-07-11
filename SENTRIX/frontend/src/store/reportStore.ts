import { create } from 'zustand';
import { Report } from '@/types/report';

interface ReportState {
  reports: Report[];
  selectedReport: Report | null;
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  setReports: (reports: Report[]) => void;
  addReport: (report: Report) => void;
  updateReport: (id: number, data: Partial<Report>) => void;
  removeReport: (id: number) => void;
  setSelectedReport: (report: Report | null) => void;
  setPage: (page: number) => void;
  setTotalPages: (total: number) => void;
  setLoading: (loading: boolean) => void;
  clear: () => void;
}

export const useReportStore = create<ReportState>((set) => ({
  reports: [],
  selectedReport: null,
  totalPages: 1,
  currentPage: 1,
  isLoading: false,
  setReports: (reports) => set({ reports }),
  addReport: (report) => set((state) => ({ reports: [report, ...state.reports] })),
  updateReport: (id, data) =>
    set((state) => ({
      reports: state.reports.map((r) => (r.id === id ? { ...r, ...data } : r)),
    })),
  removeReport: (id) =>
    set((state) => ({ reports: state.reports.filter((r) => r.id !== id) })),
  setSelectedReport: (selectedReport) => set({ selectedReport }),
  setPage: (currentPage) => set({ currentPage }),
  setTotalPages: (totalPages) => set({ totalPages }),
  setLoading: (isLoading) => set({ isLoading }),
  clear: () =>
    set({
      reports: [],
      selectedReport: null,
      currentPage: 1,
      totalPages: 1,
    }),
}));
