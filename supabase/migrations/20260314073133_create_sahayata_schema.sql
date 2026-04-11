/*
  # Sahayata Platform Database Schema

  This migration creates the complete database schema for the Sahayata platform,
  a job marketplace connecting daily wage workers with employers.

  ## New Tables
  
  1. `user_profiles`
     - Extends Supabase auth.users with additional profile information
     - Fields: user_id, role, name, phone, skills, location, availability, experience, rating, average_rating, total_ratings, created_at, updated_at
     - Roles: 'worker', 'employer', 'admin'
  
  2. `jobs`
     - Stores job postings created by employers
     - Fields: id, title, description, wage, location, required_skills, employer_id, status, date_time, created_at, updated_at
     - Status: 'open', 'in_progress', 'completed', 'cancelled'
  
  3. `job_applications`
     - Tracks worker applications to jobs
     - Fields: id, job_id, worker_id, status, created_at, updated_at
     - Status: 'pending', 'accepted', 'rejected', 'completed'
  
  4. `reviews`
     - Stores ratings and reviews between users
     - Fields: id, reviewer_id, reviewee_id, job_id, rating, comment, created_at
  
  5. `complaints`
     - Grievance/complaint system
     - Fields: id, user_id, subject, description, job_id, status, admin_response, created_at, resolved_at
     - Status: 'pending', 'in_progress', 'resolved'

  ## Security
  - Enable RLS on all tables
  - Policies for each role (worker, employer, admin)
  - Users can only access their own data unless they're admin
  - Public read access for job listings and worker profiles (for discovery)
*/

-- Create enum types
CREATE TYPE user_role AS ENUM ('worker', 'employer', 'admin');
CREATE TYPE job_status AS ENUM ('open', 'in_progress', 'completed', 'cancelled');
CREATE TYPE application_status AS ENUM ('pending', 'accepted', 'rejected', 'completed');
CREATE TYPE complaint_status AS ENUM ('pending', 'in_progress', 'resolved');

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'worker',
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  skills text[] DEFAULT ARRAY[]::text[],
  location text,
  availability text DEFAULT open ,
  experience integer DEFAULT 0,
  average_rating numeric(3,2) DEFAULT 0.00,
  total_ratings integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Jobs Table
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  wage numeric(10,2) NOT NULL,
  location text NOT NULL,
  required_skills text[] DEFAULT ARRAY[]::text[],
  employer_id uuid REFERENCES user_profiles(user_id) ON DELETE CASCADE NOT NULL,
  assigned_worker_id uuid REFERENCES user_profiles(user_id),
  status job_status DEFAULT 'open',
  date_time timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Job Applications Table
CREATE TABLE IF NOT EXISTS job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  worker_id uuid REFERENCES user_profiles(user_id) ON DELETE CASCADE NOT NULL,
  status application_status DEFAULT 'pending',
   is_shortlisted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(job_id, worker_id)
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id uuid REFERENCES user_profiles(user_id) ON DELETE CASCADE NOT NULL,
  reviewee_id uuid REFERENCES user_profiles(user_id) ON DELETE CASCADE NOT NULL,
  job_id uuid REFERENCES jobs(id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  CONSTRAINT no_self_review CHECK (reviewer_id <> reviewee_id),
  comment text,
  created_at timestamptz DEFAULT now()
);

-- Complaints Table
CREATE TABLE IF NOT EXISTS complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(user_id) ON DELETE CASCADE NOT NULL,
  subject text NOT NULL,
  description text NOT NULL,
  job_id uuid REFERENCES jobs(id) ON DELETE SET NULL,
  status complaint_status DEFAULT 'pending',
  admin_response text,
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_location ON user_profiles(location);
CREATE INDEX IF NOT EXISTS idx_jobs_employer_id ON jobs(employer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_worker_id ON job_applications(worker_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_complaints_user_id ON complaints(user_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles

-- Workers and employers can view all profiles for discovery
CREATE POLICY "Users can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admins can delete any profile
CREATE POLICY "Admins can delete profiles"
  ON user_profiles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for jobs

-- Anyone can view open jobs
CREATE POLICY "Anyone can view jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (true);

-- Employers can create jobs
CREATE POLICY "Employers can create jobs"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = employer_id AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'employer'
    )
  );

-- Employers can update their own jobs
CREATE POLICY "Employers can update own jobs"
  ON jobs FOR UPDATE
  TO authenticated
  USING (auth.uid() = employer_id)
  WITH CHECK (auth.uid() = employer_id);

-- Employers can delete their own jobs
CREATE POLICY "Employers can delete own jobs"
  ON jobs FOR DELETE
  TO authenticated
  USING (auth.uid() = employer_id);

-- RLS Policies for job_applications

-- Workers and employers can view applications related to them
CREATE POLICY "Users can view related applications"
  ON job_applications FOR SELECT
  TO authenticated
  USING (
    auth.uid() = worker_id OR
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = job_applications.job_id AND jobs.employer_id = auth.uid()
    )
  );

-- Workers can create applications
CREATE POLICY "Workers can create applications"
  ON job_applications FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = worker_id AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'worker'
    )
  );

-- Employers can update application status
CREATE POLICY "Employers can update application status"
  ON job_applications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = job_applications.job_id AND jobs.employer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = job_applications.job_id AND jobs.employer_id = auth.uid()
    )
  );

-- Workers can delete their own applications
CREATE POLICY "Workers can delete own applications"
  ON job_applications FOR DELETE
  TO authenticated
  USING (auth.uid() = worker_id);

-- RLS Policies for reviews

-- Anyone can view reviews
CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (true);

-- Users can create reviews
CREATE POLICY "Users can create reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reviewer_id);

-- Users cannot update or delete reviews (permanent record)

-- RLS Policies for complaints

-- Users can view their own complaints, admins can view all
CREATE POLICY "Users can view own complaints"
  ON complaints FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Users can create complaints
CREATE POLICY "Users can create complaints"
  ON complaints FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admins can update complaints
CREATE POLICY "Admins can update complaints"
  ON complaints FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Function to update average rating
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_profiles
  SET 
    average_rating = (
      SELECT AVG(rating)::numeric(3,2)
      FROM reviews
      WHERE reviewee_id = NEW.reviewee_id
    ),
    total_ratings = (
      SELECT COUNT(*)
      FROM reviews
      WHERE reviewee_id = NEW.reviewee_id
    )
  WHERE user_id = NEW.reviewee_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update ratings
CREATE TRIGGER update_rating_trigger
AFTER INSERT ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_user_rating();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
BEFORE UPDATE ON jobs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_applications_updated_at
BEFORE UPDATE ON job_applications
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();