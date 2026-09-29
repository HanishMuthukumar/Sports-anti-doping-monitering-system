import api from './axiosInstance';
import {
  DopingTest,
  Sample,
  LaboratoryResult,
  Violation,
  Notification,
  DashboardSummary,
} from '../types';

const defaultTest: DopingTest = {
  id: 'test-demo-1',
  test_number: 'DST-2026-DEMO',
  athlete: 'ath-demo-1',
  athlete_name: 'Aarav Mehta',
  athlete_id_code: 'ATH-2026-001',
  officer: 'off-demo-1',
  officer_name: 'Jon Bell',
  sport: 'Track & Field',
  scheduled_date: '2026-10-15',
  test_type: 'IN_COMPETITION',
  location: 'National Athletics Stadium',
  reason: 'Routine in-competition test',
  status: 'SCHEDULED',
  notes: 'Pre-event testing protocol',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const defaultSample: Sample = {
  id: 'smp-demo-1',
  sample_number: 'SMP-DEMO01',
  doping_test: 'test-demo-1',
  test_number: 'DST-2026-DEMO',
  athlete_name: 'Aarav Mehta',
  sample_type: 'URINE',
  collection_date: '2026-10-15',
  collected_by_name: 'Jon Bell',
  status: 'COLLECTED',
  chain_of_custody_notes: '[2026-10-15] Jon Bell: COLLECTED',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const testApi = {
  list: async (params?: Record<string, string>) => {
    try {
      const res = await api.get('/api/tests/', { params });
      const data = res.data;
      return (data.results || data) as DopingTest[];
    } catch {
      const stored = localStorage.getItem('mock_tests');
      return stored ? JSON.parse(stored) : [defaultTest];
    }
  },
  get: async (id: string) => {
    try {
      const res = await api.get(`/api/tests/${id}/`);
      return res.data as DopingTest;
    } catch {
      const stored = localStorage.getItem('mock_tests');
      const tests = stored ? JSON.parse(stored) : [defaultTest];
      return tests.find((t: any) => t.id === id) || defaultTest;
    }
  },
  create: async (payload: any) => {
    try {
      const res = await api.post('/api/tests/', payload);
      return res.data as DopingTest;
    } catch {
      const stored = localStorage.getItem('mock_tests');
      const tests = stored ? JSON.parse(stored) : [defaultTest];
      const newTest: DopingTest = {
        id: 'test-' + Date.now(),
        test_number: 'DST-2026-' + Math.floor(1000 + Math.random() * 9000),
        athlete: payload.athlete,
        athlete_name: 'Aarav Mehta',
        athlete_id_code: 'ATH-2026-001',
        sport: 'Track & Field',
        scheduled_date: payload.scheduled_date,
        test_type: payload.test_type,
        location: payload.location,
        reason: payload.reason || '',
        status: 'SCHEDULED',
        notes: payload.notes || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      tests.unshift(newTest);
      localStorage.setItem('mock_tests', JSON.stringify(tests));
      return newTest;
    }
  },
  updateStatus: async (id: string, status: string, notes?: string) => {
    try {
      const res = await api.post(`/api/tests/${id}/update-status/`, { status, notes });
      return res.data as DopingTest;
    } catch {
      const stored = localStorage.getItem('mock_tests');
      const tests = stored ? JSON.parse(stored) : [defaultTest];
      const idx = tests.findIndex((t: any) => t.id === id);
      if (idx !== -1) {
        tests[idx].status = status;
        if (notes) tests[idx].notes = notes;
        localStorage.setItem('mock_tests', JSON.stringify(tests));
        return tests[idx];
      }
      return defaultTest;
    }
  },
};

export const sampleApi = {
  list: async () => {
    try {
      const res = await api.get('/api/samples/');
      const data = res.data;
      return (data.results || data) as Sample[];
    } catch {
      const stored = localStorage.getItem('mock_samples');
      return stored ? JSON.parse(stored) : [defaultSample];
    }
  },
  get: async (id: string) => {
    try {
      const res = await api.get(`/api/samples/${id}/`);
      return res.data as Sample;
    } catch {
      const stored = localStorage.getItem('mock_samples');
      const samples = stored ? JSON.parse(stored) : [defaultSample];
      return samples.find((s: any) => s.id === id) || defaultSample;
    }
  },
  create: async (payload: any) => {
    try {
      const res = await api.post('/api/samples/', payload);
      return res.data as Sample;
    } catch {
      const stored = localStorage.getItem('mock_samples');
      const samples = stored ? JSON.parse(stored) : [defaultSample];
      const newSample: Sample = {
        id: 'smp-' + Date.now(),
        sample_number: 'SMP-' + Math.floor(100000 + Math.random() * 900000),
        doping_test: payload.doping_test,
        test_number: 'DST-2026-DEMO',
        athlete_name: 'Aarav Mehta',
        sample_type: payload.sample_type,
        collection_date: payload.collection_date,
        collected_by_name: 'Jon Bell',
        status: 'COLLECTED',
        chain_of_custody_notes: payload.chain_of_custody_notes || 'Collected under observation',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      samples.unshift(newSample);
      localStorage.setItem('mock_samples', JSON.stringify(samples));
      return newSample;
    }
  },
  transition: async (id: string, status: string, notes?: string, received_by?: string) => {
    try {
      const res = await api.post(`/api/samples/${id}/transition/`, {
        status,
        notes,
        received_by,
      });
      return res.data as Sample;
    } catch {
      const stored = localStorage.getItem('mock_samples');
      const samples = stored ? JSON.parse(stored) : [defaultSample];
      const idx = samples.findIndex((s: any) => s.id === id);
      if (idx !== -1) {
        samples[idx].status = status;
        if (notes) {
          samples[idx].chain_of_custody_notes = `${samples[idx].chain_of_custody_notes}\n[${status}] ${notes}`.trim();
        }
        localStorage.setItem('mock_samples', JSON.stringify(samples));
        return samples[idx];
      }
      return defaultSample;
    }
  },
};

export const resultApi = {
  list: async () => {
    try {
      const res = await api.get('/api/results/');
      const data = res.data;
      return (data.results || data) as LaboratoryResult[];
    } catch {
      const stored = localStorage.getItem('mock_results');
      return stored ? JSON.parse(stored) : [];
    }
  },
  get: async (id: string) => {
    const res = await api.get(`/api/results/${id}/`);
    return res.data as LaboratoryResult;
  },
  create: async (payload: any) => {
    try {
      const res = await api.post('/api/results/', payload);
      return res.data as LaboratoryResult;
    } catch {
      const stored = localStorage.getItem('mock_results');
      const results = stored ? JSON.parse(stored) : [];
      const newResult: LaboratoryResult = {
        id: 'res-' + Date.now(),
        sample: payload.sample,
        sample_number: 'SMP-DEMO01',
        athlete_name: 'Aarav Mehta',
        laboratory_name: 'National Sports Science Laboratory',
        analyst_name: 'Dr. Elena Rossi',
        result_status: payload.result_status,
        test_method: payload.test_method,
        findings: payload.findings,
        comments: payload.comments || '',
        report_reference: payload.report_reference || 'LAB-REF-001',
        analyzed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      results.unshift(newResult);
      localStorage.setItem('mock_results', JSON.stringify(results));

      if (payload.result_status === 'POSITIVE') {
        const storedViolations = localStorage.getItem('mock_violations');
        const violations = storedViolations ? JSON.parse(storedViolations) : [];
        violations.unshift({
          id: 'v-' + Date.now(),
          violation_number: 'ADR-2026-' + Math.floor(1000 + Math.random() * 9000),
          athlete: 'ath-demo-1',
          athlete_name: 'Aarav Mehta',
          athlete_id_code: 'ATH-2026-001',
          sport: 'Track & Field',
          description: payload.findings,
          status: 'OPEN',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        localStorage.setItem('mock_violations', JSON.stringify(violations));
      }

      return newResult;
    }
  },
};

export const violationApi = {
  list: async (params?: Record<string, string>) => {
    try {
      const res = await api.get('/api/violations/', { params });
      const data = res.data;
      return (data.results || data) as Violation[];
    } catch {
      const stored = localStorage.getItem('mock_violations');
      return stored ? JSON.parse(stored) : [];
    }
  },
  get: async (id: string) => {
    try {
      const res = await api.get(`/api/violations/${id}/`);
      return res.data as Violation;
    } catch {
      const stored = localStorage.getItem('mock_violations');
      const violations = stored ? JSON.parse(stored) : [];
      return violations.find((v: any) => v.id === id) || null;
    }
  },
  review: async (id: string, payload: { status: string; remarks?: string; action_taken?: string; action_date?: string }) => {
    try {
      const res = await api.post(`/api/violations/${id}/review/`, payload);
      return res.data as Violation;
    } catch {
      const stored = localStorage.getItem('mock_violations');
      const violations = stored ? JSON.parse(stored) : [];
      const idx = violations.findIndex((v: any) => v.id === id);
      if (idx !== -1) {
        violations[idx].status = payload.status;
        if (payload.remarks) violations[idx].remarks = payload.remarks;
        if (payload.action_taken) violations[idx].action_taken = payload.action_taken;
        if (payload.action_date) violations[idx].action_date = payload.action_date;
        violations[idx].reviewed_by_name = 'Nia Okafor';
        localStorage.setItem('mock_violations', JSON.stringify(violations));
        return violations[idx];
      }
      return null;
    }
  },
};

export const notificationApi = {
  list: async () => {
    try {
      const res = await api.get('/api/notifications/');
      const data = res.data;
      return (data.results || data) as Notification[];
    } catch {
      return [
        {
          id: 'n-1',
          title: 'Welcome to Sports Anti-Doping Monitor',
          message: 'Your account has been set up. A testing mission has been scheduled for you.',
          notification_type: 'TEST_SCHEDULED',
          is_read: false,
          created_at: new Date().toISOString(),
        },
      ];
    }
  },
  unreadCount: async () => {
    try {
      const res = await api.get('/api/notifications/unread-count/');
      return res.data as { count: number };
    } catch {
      return { count: 1 };
    }
  },
  markRead: async (id: string) => {
    try {
      const res = await api.post(`/api/notifications/${id}/mark-read/`);
      return res.data as Notification;
    } catch {
      return {} as any;
    }
  },
  markAllRead: async () => {
    try {
      const res = await api.post('/api/notifications/mark-all-read/');
      return res.data;
    } catch {
      return { detail: 'Marked read.' };
    }
  },
};

export const reportApi = {
  getDashboardSummary: async () => {
    try {
      const res = await api.get('/api/reports/dashboard/');
      return res.data as DashboardSummary;
    } catch {
      return {
        total_users: 5,
        total_athletes: 1,
        total_officers: 1,
        total_laboratories: 1,
        total_lab_staff: 1,
        scheduled_tests: 1,
        completed_tests: 0,
        total_samples: 1,
        positive_results: 0,
        total_violations: 0,
        open_violations: 0,
        under_review_violations: 0,
      } as DashboardSummary;
    }
  },
  getTestingReport: async (params?: Record<string, string>) => {
    const res = await api.get('/api/reports/testing/', { params });
    return res.data;
  },
  getViolationsReport: async (params?: Record<string, string>) => {
    const res = await api.get('/api/reports/violations/', { params });
    return res.data;
  },
  getMonthlySummary: async () => {
    try {
      const res = await api.get('/api/reports/monthly/');
      return res.data as Array<{ month: string; tests: number; positive: number; negative: number; violations: number }>;
    } catch {
      return [
        { month: 'May 2026', tests: 4, negative: 4, positive: 0, violations: 0 },
        { month: 'Jun 2026', tests: 8, negative: 7, positive: 1, violations: 1 },
        { month: 'Jul 2026', tests: 12, negative: 12, positive: 0, violations: 0 },
        { month: 'Aug 2026', tests: 15, negative: 14, positive: 1, violations: 1 },
        { month: 'Sep 2026', tests: 6, negative: 6, positive: 0, violations: 0 },
        { month: 'Oct 2026', tests: 1, negative: 1, positive: 0, violations: 0 },
      ];
    }
  },
  getLaboratoryReport: async () => {
    try {
      const res = await api.get('/api/reports/laboratories/');
      return res.data as Array<any>;
    } catch {
      return [
        {
          id: 'lab-1',
          name: 'National Sports Science Laboratory',
          accreditation: 'WADA-LAB-001',
          city: 'Mumbai',
          country: 'India',
          total_analyzed: 14,
          positive: 1,
          negative: 13,
        },
      ];
    }
  },
};
