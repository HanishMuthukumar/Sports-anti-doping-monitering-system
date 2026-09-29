import api from './axiosInstance';
import { User, Athlete, DopingControlOfficer, Laboratory, LaboratoryStaff } from '../types';

const defaultUsers: User[] = [
  { id: '1', username: 'admin_demo', email: 'admin@demo.sadms', first_name: 'System', last_name: 'Administrator', full_name: 'System Administrator', role: 'ADMINISTRATOR', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '2', username: 'athlete_demo', email: 'athlete@demo.sadms', first_name: 'Aarav', last_name: 'Mehta', full_name: 'Aarav Mehta', role: 'ATHLETE', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '3', username: 'officer_demo', email: 'officer@demo.sadms', first_name: 'Jon', last_name: 'Bell', full_name: 'Jon Bell', role: 'DOPING_CONTROL_OFFICER', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '4', username: 'lab_demo', email: 'lab@demo.sadms', first_name: 'Elena', last_name: 'Rossi', full_name: 'Dr. Elena Rossi', role: 'LABORATORY_STAFF', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '5', username: 'authority_demo', email: 'authority@demo.sadms', first_name: 'Nia', last_name: 'Okafor', full_name: 'Nia Okafor', role: 'SPORTS_AUTHORITY', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

const defaultAthlete: Athlete = {
  id: 'ath-demo-1',
  user: defaultUsers[1],
  full_name: 'Aarav Mehta',
  email: 'athlete@demo.sadms',
  athlete_id: 'ATH-2026-001',
  sport: 'Track & Field',
  nationality: 'India',
  team: 'Team India Athletics',
  coach: 'Rajesh Kumar',
  gender: 'Male',
  status: 'ACTIVE',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const defaultOfficer: DopingControlOfficer = {
  id: 'off-demo-1',
  user: defaultUsers[2],
  full_name: 'Jon Bell',
  email: 'officer@demo.sadms',
  officer_id: 'DCO-2026-001',
  certification_number: 'WADA-DCO-12345',
  organization: 'National Anti-Doping Agency',
  phone: '+1-555-0003',
  status: 'ACTIVE',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const defaultLab: Laboratory = {
  id: 'lab-demo-1',
  laboratory_name: 'National Sports Science Laboratory',
  accreditation_number: 'WADA-LAB-001',
  address: '123 Science Park, Research District',
  city: 'Mumbai',
  country: 'India',
  phone: '+91-22-12345678',
  email: 'lab@nssl.in',
  status: 'ACTIVE',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const defaultStaff: LaboratoryStaff = {
  id: 'staff-demo-1',
  user: defaultUsers[3],
  full_name: 'Dr. Elena Rossi',
  laboratory: 'lab-demo-1',
  laboratory_name: 'National Sports Science Laboratory',
  staff_id: 'STAFF-001',
  designation: 'Senior Analyst',
  qualification: 'PhD Analytical Chemistry',
  status: 'ACTIVE',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const userApi = {
  list: async () => {
    try {
      const res = await api.get('/api/users/');
      const data = res.data;
      return (data.results || data) as User[];
    } catch {
      const stored = localStorage.getItem('mock_users');
      return stored ? JSON.parse(stored) : defaultUsers;
    }
  },
  create: async (payload: any) => {
    try {
      const res = await api.post('/api/users/', payload);
      return res.data as User;
    } catch {
      const stored = localStorage.getItem('mock_users');
      const users = stored ? JSON.parse(stored) : [...defaultUsers];
      const newUser: User = {
        id: 'u-' + Date.now(),
        username: payload.username,
        email: payload.email,
        first_name: payload.first_name,
        last_name: payload.last_name,
        full_name: `${payload.first_name} ${payload.last_name}`.trim(),
        role: payload.role,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      users.push(newUser);
      localStorage.setItem('mock_users', JSON.stringify(users));
      return newUser;
    }
  },
  get: async (id: string) => {
    try {
      const res = await api.get(`/api/users/${id}/`);
      return res.data as User;
    } catch {
      return defaultUsers[0];
    }
  },
  update: async (id: string, payload: any) => {
    const res = await api.patch(`/api/users/${id}/`, payload);
    return res.data as User;
  },
  deactivate: async (id: string) => {
    try {
      const res = await api.delete(`/api/users/${id}/`);
      return res.data;
    } catch {
      return { detail: 'Deactivated.' };
    }
  },
};

export const athleteApi = {
  list: async () => {
    try {
      const res = await api.get('/api/athletes/');
      const data = res.data;
      return (data.results || data) as Athlete[];
    } catch {
      const stored = localStorage.getItem('mock_athletes');
      return stored ? JSON.parse(stored) : [defaultAthlete];
    }
  },
  create: async (payload: any) => {
    try {
      const res = await api.post('/api/athletes/', payload);
      return res.data as Athlete;
    } catch {
      const stored = localStorage.getItem('mock_athletes');
      const athletes = stored ? JSON.parse(stored) : [defaultAthlete];
      const newAth: Athlete = {
        id: 'ath-' + Date.now(),
        user: defaultUsers[1],
        full_name: `${payload.first_name} ${payload.last_name}`.trim(),
        email: payload.email,
        athlete_id: payload.athlete_id,
        sport: payload.sport,
        nationality: payload.nationality || '',
        team: payload.team || '',
        coach: payload.coach || '',
        gender: payload.gender || '',
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      athletes.push(newAth);
      localStorage.setItem('mock_athletes', JSON.stringify(athletes));
      return newAth;
    }
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
    try {
      const res = await api.get('/api/officers/');
      const data = res.data;
      return (data.results || data) as DopingControlOfficer[];
    } catch {
      return [defaultOfficer];
    }
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
    try {
      const res = await api.get('/api/laboratories/');
      const data = res.data;
      return (data.results || data) as Laboratory[];
    } catch {
      return [defaultLab];
    }
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
    try {
      const res = await api.get('/api/laboratories/staff/');
      const data = res.data;
      return (data.results || data) as LaboratoryStaff[];
    } catch {
      return [defaultStaff];
    }
  },
  createStaff: async (payload: any) => {
    const res = await api.post('/api/laboratories/staff/', payload);
    return res.data as LaboratoryStaff;
  },
};
