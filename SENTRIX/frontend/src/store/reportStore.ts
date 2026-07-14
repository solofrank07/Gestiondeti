import { create } from 'zustand';
import { Report } from '@/types/report';

interface DraftReport {
  lat?: number;
  lng?: number;
  address?: string;
  isAnonymous: boolean;
  crimeType?: string;
  description?: string;
  evidence?: string[];
  incidentDate?: string;
  radius?: number;
}

interface ReportState {
  reports: Report[];
  selectedReport: Report | null;
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  // Draft for create flow
  draft: DraftReport;
  setLocation: (loc: { lat: number; lng: number }) => void;
  setAddress: (addr: string) => void;
  setAnonymous: (val: boolean) => void;
  setCrimeType: (type: string) => void;
  setDescription: (desc: string) => void;
  setIncidentDate: (date: string) => void;
  setRadius: (r: number) => void;
  addEvidence: (uri: string) => void;
  resetDraft: () => void;
  // Existing
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

const defaultDraft: DraftReport = {
  isAnonymous: false,
};

export const useReportStore = create<ReportState>((set) => ({
  reports: [],
  selectedReport: null,
  totalPages: 1,
  currentPage: 1,
  isLoading: false,
  draft: { ...defaultDraft },
  setLocation: (loc) => set((s) => ({ draft: { ...s.draft, lat: loc.lat, lng: loc.lng } })),
  setAddress: (address) => set((s) => ({ draft: { ...s.draft, address } })),
  setAnonymous: (isAnonymous) => set((s) => ({ draft: { ...s.draft, isAnonymous } })),
  setCrimeType: (crimeType) => set((s) => ({ draft: { ...s.draft, crimeType } })),
  setDescription: (description) => set((s) => ({ draft: { ...s.draft, description } })),
  setIncidentDate: (incidentDate) => set((s) => ({ draft: { ...s.draft, incidentDate } })),
  setRadius: (radius) => set((s) => ({ draft: { ...s.draft, radius } })),
  addEvidence: (uri) => set((s) => ({ draft: { ...s.draft, evidence: [...(s.draft.evidence || []), uri] } })),
  resetDraft: () => set({ draft: { ...defaultDraft } }),
  // Original methods
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
