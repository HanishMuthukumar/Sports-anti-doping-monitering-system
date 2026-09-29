import api from './axiosInstance';
import { User, Athlete, DopingControlOfficer, Laboratory, LaboratoryStaff } from '../types';

export const userApi = {
  list: async () => {
    const res = await api.get('/api/users/');
    const data = res.data;
    return (data.results || data) as User[];
  },
  create: async (payload: any) => {
    const res = await api.post('/api/users/', payload);
    return res.data as User;
  },
  get: async (id: string) => {
    const res = await api.get(`/api/users/${id}/`);
    return res.data as User;
  },
  update: async (id: string, payload: any) => {
    const res = await api.patch(`/api/users/${id}/`, payload);
    return res.data as User;
  },
  deactivate: async (id: string) => {
    const res = await api.delete(`/api/users/${id}/`);
    return res.data;
  },
};

export const athleteApi = {
  list: async () => {
    const res = await api.get('/api/athletes/');
    const data = res.data;
    return (data.results || data) as Athlete[];
  },
  create: async (payload: any) => {
    const res = await api.post('/api/athletes/', payload);
    return res.data as Athlete;
  },
  get: async (id: string) => {
    const res = await api.get(`/api/athletes/${id}/`);
    return res.data as Athlete;
  },
  update: async (id: string, payload: any) => {
    const res = await api.patch(`/api/athletes/${id}/`, payload);
    return res.data as Athlete;
  },
  deactivate: async (id: string) => {
    const res = await api.delete(`/api/athletes/${id}/`);
    return res.data;
  },
};

export const officerApi = {
  list: async () => {
    const res = await api.get('/api/officers/');
    const data = res.data;
    return (data.results || data) as DopingControlOfficer[];
  },
  create: async (payload: any) => {
    const res = await api.post('/api/officers/', payload);
    return res.data as DopingControlOfficer;
  },
  get: async (id: string) => {
    const res = await api.get(`/api/officers/${id}/`);
    return res.data as DopingControlOfficer;
  },
  update: async (id: string, payload: any) => {
    const res = await api.patch(`/api/officers/${id}/`, payload);
    return res.data as DopingControlOfficer;
  },
  deactivate: async (id: string) => {
    const res = await api.delete(`/api/officers/${id}/`);
    return res.data;
  },
};

export const laboratoryApi = {
  list: async () => {
    const res = await api.get('/api/laboratories/');
    const data = res.data;
    return (data.results || data) as Laboratory[];
  },
  create: async (payload: any) => {
    const res = await api.post('/api/laboratories/', payload);
    return res.data as Laboratory;
  },
  get: async (id: string) => {
    const res = await api.get(`/api/laboratories/${id}/`);
    return res.data as Laboratory;
  },
  listStaff: async () => {
    const res = await api.get('/api/laboratories/staff/');
    const data = res.data;
    return (data.results || data) as LaboratoryStaff[];
  },
  createStaff: async (payload: any) => {
    const res = await api.post('/api/laboratories/staff/', payload);
    return res.data as LaboratoryStaff;
  },
};
