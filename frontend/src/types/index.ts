export type Role =
  | 'ADMINISTRATOR'
  | 'ATHLETE'
  | 'DOPING_CONTROL_OFFICER'
  | 'LABORATORY_STAFF'
  | 'SPORTS_AUTHORITY';

export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone?: string;
  role: Role;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Athlete {
  id: string;
  user: User;
  full_name: string;
  email: string;
  athlete_id: string;
  date_of_birth?: string;
  gender?: string;
  sport: string;
  nationality?: string;
  team?: string;
  coach?: string;
  address?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  created_at: string;
  updated_at: string;
}

export interface DopingControlOfficer {
  id: string;
  user: User;
  full_name: string;
  email: string;
  officer_id: string;
  certification_number?: string;
  organization?: string;
  phone?: string;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
  updated_at: string;
}

export interface Laboratory {
  id: string;
  laboratory_name: string;
  accreditation_number: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
  updated_at: string;
}

export interface LaboratoryStaff {
  id: string;
  user: User;
  full_name: string;
  laboratory: string;
  laboratory_name: string;
  staff_id: string;
  designation?: string;
  qualification?: string;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
  updated_at: string;
}

export type TestStatus =
  | 'SCHEDULED'
  | 'SAMPLE_COLLECTED'
  | 'SAMPLE_SUBMITTED'
  | 'UNDER_ANALYSIS'
  | 'RESULT_GENERATED'
  | 'COMPLETED'
  | 'CANCELLED';

export type TestType =
  | 'IN_COMPETITION'
  | 'OUT_OF_COMPETITION'
  | 'TARGETED'
  | 'FOLLOW_UP';

export interface DopingTest {
  id: string;
  test_number: string;
  athlete: string;
  athlete_name: string;
  athlete_id_code: string;
  officer?: string;
  officer_name?: string;
  sport: string;
  scheduled_date: string;
  scheduled_time?: string;
  test_type: TestType;
  location: string;
  reason?: string;
  status: TestStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type SampleStatus =
  | 'COLLECTED'
  | 'SUBMITTED'
  | 'RECEIVED'
  | 'UNDER_ANALYSIS'
  | 'ANALYZED'
  | 'INVALID';

export type SampleType = 'URINE' | 'BLOOD' | 'OTHER';

export interface Sample {
  id: string;
  sample_number: string;
  doping_test: string;
  test_number: string;
  athlete_name: string;
  sample_type: SampleType;
  collection_date: string;
  collection_time?: string;
  collected_by?: string;
  collected_by_name?: string;
  submitted_at?: string;
  received_at?: string;
  received_by?: string;
  received_by_name?: string;
  status: SampleStatus;
  chain_of_custody_notes?: string;
  created_at: string;
  updated_at: string;
}

export type ResultStatus = 'NEGATIVE' | 'POSITIVE' | 'INVALID' | 'INCONCLUSIVE';

export interface LaboratoryResult {
  id: string;
  sample: string;
  sample_number: string;
  athlete_name: string;
  laboratory?: string;
  laboratory_name?: string;
  analyst?: string;
  analyst_name?: string;
  result_status: ResultStatus;
  test_method: string;
  findings: string;
  comments?: string;
  report_reference?: string;
  analyzed_at: string;
  created_at: string;
  updated_at: string;
}

export type ViolationStatus =
  | 'OPEN'
  | 'UNDER_REVIEW'
  | 'ACTION_TAKEN'
  | 'CLOSED';

export interface Violation {
  id: string;
  violation_number: string;
  athlete: string;
  athlete_name: string;
  athlete_id_code: string;
  sport: string;
  doping_test?: string;
  test_number?: string;
  sample?: string;
  sample_number?: string;
  laboratory_result?: string;
  description: string;
  status: ViolationStatus;
  reviewed_by?: string;
  reviewed_by_name?: string;
  reviewed_at?: string;
  action_taken?: string;
  action_date?: string;
  remarks?: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  related_object_type?: string;
  related_object_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface DashboardSummary {
  total_users?: number;
  total_athletes?: number;
  total_officers?: number;
  total_laboratories?: number;
  total_lab_staff?: number;
  scheduled_tests?: number;
  completed_tests?: number;
  total_samples?: number;
  positive_results?: number;
  total_violations?: number;
  open_violations?: number;
  under_review_violations?: number;
  // Role-specific properties
  role?: Role;
  total_tests?: number;
  upcoming_tests?: number;
  assigned_tests?: number;
  samples_received?: number;
  under_analysis?: number;
  results_generated?: number;
  violations?: number;
}
