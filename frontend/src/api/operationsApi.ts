import api from './axiosInstance';
import {
  DopingTest,
  Sample,
  LaboratoryResult,
  Violation,
  Notification,
  DashboardSummary,
} from '../types';

export const testApi = {
  list: async (params?: Record<string, string>) => {
    const res = await api.get('/api/tests/', { params });
    const data = res.data;
    return (data.results || data) as DopingTest[];
  },
  get: async (id: string) => {
    const res = await api.get(`/api/tests/${id}/`);
    return res.data as DopingTest;
  },
  create: async (payload: any) => {
    const res = await api.post('/api/tests/', payload);
    return res.data as DopingTest;
  },
  updateStatus: async (id: string, status: string, notes?: string) => {
    const res = await api.post(`/api/tests/${id}/update-status/`, { status, notes });
    return res.data as DopingTest;
  },
};

export const sampleApi = {
  list: async () => {
    const res = await api.get('/api/samples/');
    const data = res.data;
    return (data.results || data) as Sample[];
  },
  get: async (id: string) => {
    const res = await api.get(`/api/samples/${id}/`);
    return res.data as Sample;
  },
  create: async (payload: any) => {
    const res = await api.post('/api/samples/', payload);
    return res.data as Sample;
  },
  transition: async (id: string, status: string, notes?: string, received_by?: string) => {
    const res = await api.post(`/api/samples/${id}/transition/`, {
      status,
      notes,
      received_by,
    });
    return res.data as Sample;
  },
};

export const resultApi = {
  list: async () => {
    const res = await api.get('/api/results/');
    const data = res.data;
    return (data.results || data) as LaboratoryResult[];
  },
  get: async (id: string) => {
    const res = await api.get(`/api/results/${id}/`);
    return res.data as LaboratoryResult;
  },
  create: async (payload: any) => {
    const res = await api.post('/api/results/', payload);
    return res.data as LaboratoryResult;
  },
};

export const violationApi = {
  list: async (params?: Record<string, string>) => {
    const res = await api.get('/api/violations/', { params });
    const data = res.data;
    return (data.results || data) as Violation[];
  },
  get: async (id: string) => {
    const res = await api.get(`/api/violations/${id}/`);
    return res.data as Violation;
  },
  review: async (id: string, payload: { status: string; remarks?: string; action_taken?: string; action_date?: string }) => {
    const res = await api.post(`/api/violations/${id}/review/`, payload);
    return res.data as Violation;
  },
};

export const notificationApi = {
  list: async () => {
    const res = await api.get('/api/notifications/');
    const data = res.data;
    return (data.results || data) as Notification[];
  },
  unreadCount: async () => {
    const res = await api.get('/api/notifications/unread-count/');
    return res.data as { count: number };
  },
  markRead: async (id: string) => {
    const res = await api.post(`/api/notifications/${id}/mark-read/`);
    return res.data as Notification;
  },
  markAllRead: async () => {
    const res = await api.post('/api/notifications/mark-all-read/');
    return res.data;
  },
};

export const reportApi = {
  getDashboardSummary: async () => {
    const res = await api.get('/api/reports/dashboard/');
    return res.data as DashboardSummary;
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
    const res = await api.get('/api/reports/monthly/');
    return res.data as Array<{ month: string; tests: number; positive: number; negative: number; violations: number }>;
  },
  getLaboratoryReport: async () => {
    const res = await api.get('/api/reports/laboratories/');
    return res.data as Array<any>;
  },
};
