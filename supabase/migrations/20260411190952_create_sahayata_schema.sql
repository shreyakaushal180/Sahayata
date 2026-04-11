/*
  # Sahayata Platform Database Schema

  Creates the complete database schema for the Sahayata platform.

  ## New Tables
  1. user_profiles — extends auth.users with role, skills, availability, etc.
  2. jobs          — job postings by employers
  3. job_applications — worker applications to jobs (includes is_shortlisted)
  4. reviews       — ratings between users
  5. complaints    — grievance system

  ## Notes
  - availability stored as text with CHECK ('open' | 'booked')
  - jobs.assigned_worker_id tracks the booked worker
  - job_applications.is_shortlisted for shortlisting flow

  ## Security
  - RLS enabled on all tables with least-privilege policies
*/

-- ─────────────────────────────────────────────
-- Enum types
-- ─────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('worker', 'employer', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE job_status AS ENUM ('open', 'in_progress', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE application_status AS ENUM ('pending', 'accepted', 'rejected', 'completed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE complaint_status AS ENUM ('pending', 'in_progress', 'resolved');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─────────────────────────────────────────────
-- user_profiles
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_profiles (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  role            user_role NOT NULL DEFAULT 'worker',
  name            text NOT NULL,
  email           text NOT NULL,
  phone           text,
  skills          text[] DEFAULT ARRAY[]::text[],
  location        text,
  availability    text NOT NULL DEFAULT 'open'
                    CHECK (availability IN ('open', 'booked')),
  experience      integer DEFAULT 0,
  average_rating  numeric(3,2) DEFAULT 0.00,
  total_ratings   integer DEFAULT 0,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────────
-- jobs
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS jobs (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title               text NOT NULL,
  description         text NOT NULL,
  wage                numeric(10,2) NOT NULL,
  location            text NOT NULL,
  required_skills     text[] DEFAULT ARRAY[]::text[],
  employer_id         uuid REFERENCES user_profiles(user_id) ON DELETE CASCADE NOT NULL,
  assigned_worker_id  uuid REFERENCES user_profiles(user_id),
  status              job_status DEFAULT 'open',
  date_time           timestamptz NOT NULL,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────────
-- job_applications
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS job_applications (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id          uuid REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  worker_id       uuid REFERENCES user_profiles(user_id) ON DELETE CASCADE NOT NULL,
  status          application_status DEFAULT 'pending',
  is_shortlisted  boolean DEFAULT false,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),
  UNIQUE(job_id, worker_id)
);

-- ─────────────────────────────────────────────
-- reviews
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id  uuid REFERENCES user_profiles(user_id) ON DELETE CASCADE NOT NULL,
  reviewee_id  uuid REFERENCES user_profiles(user_id) ON DELETE CASCADE NOT NULL,
  job_id       uuid REFERENCES jobs(id) ON DELETE SET NULL,
  rating       integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  CONSTRAINT no_self_review CHECK (reviewer_id <> reviewee_id),
  comment      text,
  created_at   timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────────
-- complaints
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS complaints (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES user_profiles(user_id) ON DELETE CASCADE NOT NULL,
  subject         text NOT NULL,
  description     text NOT NULL,
  job_id          uuid REFERENCES jobs(id) ON DELETE SET NULL,
  status          complaint_status DEFAULT 'pending',
  admin_response  text,
  created_at      timestamptz DEFAULT now(),
  resolved_at     timestamptz
);

-- ─────────────────────────────────────────────
-- Indexes
-- ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id   ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role      ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_location  ON user_profiles(location);
CREATE INDEX IF NOT EXISTS idx_worker_availability     ON user_profiles(availability) WHERE role = 'worker';
CREATE INDEX IF NOT EXISTS idx_jobs_employer_id        ON jobs(employer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status             ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_location           ON jobs(location);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id    ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_worker_id ON job_applications(worker_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id     ON reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_complaints_user_id      ON complaints(user_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status       ON complaints(status);

-- ─────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────
ALTER TABLE user_profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs             ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews          ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints       ENABLE ROW LEVEL SECURITY;

-- user_profiles policies
CREATE POLICY "Users can view all profiles"
  ON user_profiles FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can delete profiles"
  ON user_profiles FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- jobs policies
CREATE POLICY "Anyone can view jobs"
  ON jobs FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Employers can create jobs"
  ON jobs FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = employer_id AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'employer'
    )
  );

CREATE POLICY "Employers can update own jobs"
  ON jobs FOR UPDATE TO authenticated
  USING (auth.uid() = employer_id)
  WITH CHECK (auth.uid() = employer_id);

CREATE POLICY "Employers can delete own jobs"
  ON jobs FOR DELETE TO authenticated
  USING (auth.uid() = employer_id);

-- job_applications policies
CREATE POLICY "Users can view related applications"
  ON job_applications FOR SELECT TO authenticated
  USING (
    auth.uid() = worker_id OR
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = job_applications.job_id AND jobs.employer_id = auth.uid()
    )
  );

CREATE POLICY "Workers can create applications"
  ON job_applications FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = worker_id AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'worker'
    )
  );

CREATE POLICY "Employers can update application status"
  ON job_applications FOR UPDATE TO authenticated
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

CREATE POLICY "Workers can delete own applications"
  ON job_applications FOR DELETE TO authenticated
  USING (auth.uid() = worker_id);

-- reviews policies
CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can create reviews"
  ON reviews FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reviewer_id);

-- complaints policies
CREATE POLICY "Users can view own complaints"
  ON complaints FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can create complaints"
  ON complaints FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update complaints"
  ON complaints FOR UPDATE TO authenticated
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

-- ─────────────────────────────────────────────
-- updated_at trigger function
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON job_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────
-- Rating update trigger
-- ─────────────────────────────────────────────
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

CREATE TRIGGER update_rating_trigger
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_user_rating();
