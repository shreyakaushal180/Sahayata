import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'worker' | 'employer' | 'admin';

export interface UserProfile {
  id: string;
  user_id: string;
  role: UserRole;
  name: string;
  email: string;
  phone?: string;
  skills?: string[];
  location?: string;
  availability?: boolean;
  experience?: number;
  average_rating?: number;
  total_ratings?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  wage: number;
  location: string;
  required_skills?: string[];
  employer_id: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  date_time: string;
  created_at?: string;
  updated_at?: string;
  employer?: UserProfile;
}

export interface JobApplication {
  id: string;
  job_id: string;
  worker_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  created_at?: string;
  updated_at?: string;
  job?: Job;
  worker?: UserProfile;
}

export interface Review {
  id: string;
  reviewer_id: string;
  reviewee_id: string;
  job_id?: string;
  rating: number;
  comment?: string;
  created_at?: string;
  reviewer?: UserProfile;
}

export interface Complaint {
  id: string;
  user_id: string;
  subject: string;
  description: string;
  job_id?: string;
  status: 'pending' | 'in_progress' | 'resolved';
  admin_response?: string;
  created_at?: string;
  resolved_at?: string;
  user?: UserProfile;
  job?: Job;
}
