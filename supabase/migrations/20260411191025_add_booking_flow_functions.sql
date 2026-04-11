/*
  # Worker Booking Flow — Atomic Backend Functions

  ## Summary
  Adds three SECURITY DEFINER functions that implement the booking lifecycle
  atomically at the database level. No frontend or API structure is changed.

  ## Functions

  ### shortlist_worker(p_application_id uuid)
  - Validates caller is the employer of the related job
  - Sets job_applications.is_shortlisted = true

  ### book_worker(p_job_id uuid, p_application_id uuid)
  - Validates caller is the employer of the job
  - Raises exception if worker.availability != 'open'
  - Raises exception if a worker is already assigned to the job
  - Sets jobs.assigned_worker_id = worker_id
  - Sets jobs.status = 'in_progress'
  - Sets user_profiles.availability = 'booked'
  - Sets job_applications.status = 'accepted' for this application
  - Sets job_applications.status = 'rejected' for all other pending applications on this job

  ### complete_job(p_job_id uuid)
  - Validates caller is the employer of the job
  - Sets jobs.status = 'completed'
  - Sets user_profiles.availability = 'open' for the assigned worker
  - Sets job_applications.status = 'completed' for the accepted application

  ## Security
  - All functions are SECURITY DEFINER and validate auth.uid() internally
  - Granted EXECUTE only to the authenticated role
*/

-- ─────────────────────────────────────────────
-- Function: shortlist_worker
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION shortlist_worker(p_application_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_employer_id uuid;
BEGIN
  SELECT j.employer_id
  INTO v_employer_id
  FROM job_applications ja
  JOIN jobs j ON j.id = ja.job_id
  WHERE ja.id = p_application_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found';
  END IF;

  IF v_employer_id <> auth.uid() THEN
    RAISE EXCEPTION 'Only the job employer can shortlist workers';
  END IF;

  UPDATE job_applications
  SET is_shortlisted = true
  WHERE id = p_application_id;
END;
$$;

-- ─────────────────────────────────────────────
-- Function: book_worker
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION book_worker(p_job_id uuid, p_application_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_employer_id   uuid;
  v_assigned      uuid;
  v_worker_id     uuid;
  v_app_job_id    uuid;
  v_availability  text;
BEGIN
  -- Lock and read the job row
  SELECT employer_id, assigned_worker_id
  INTO v_employer_id, v_assigned
  FROM jobs
  WHERE id = p_job_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Job not found';
  END IF;

  IF v_employer_id <> auth.uid() THEN
    RAISE EXCEPTION 'Only the job employer can book a worker';
  END IF;

  IF v_assigned IS NOT NULL THEN
    RAISE EXCEPTION 'A worker is already assigned to this job';
  END IF;

  -- Lock and read the application row
  SELECT worker_id, job_id
  INTO v_worker_id, v_app_job_id
  FROM job_applications
  WHERE id = p_application_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found';
  END IF;

  IF v_app_job_id <> p_job_id THEN
    RAISE EXCEPTION 'Application does not belong to this job';
  END IF;

  -- Lock and read the worker profile
  SELECT availability
  INTO v_availability
  FROM user_profiles
  WHERE user_id = v_worker_id
  FOR UPDATE;

  IF v_availability <> 'open' THEN
    RAISE EXCEPTION 'Worker is not available for booking';
  END IF;

  -- Perform all updates atomically
  UPDATE jobs
  SET assigned_worker_id = v_worker_id,
      status = 'in_progress'
  WHERE id = p_job_id;

  UPDATE user_profiles
  SET availability = 'booked'
  WHERE user_id = v_worker_id;

  UPDATE job_applications
  SET status = 'accepted'
  WHERE id = p_application_id;

  -- Reject all other pending applications for this job
  UPDATE job_applications
  SET status = 'rejected'
  WHERE job_id = p_job_id
    AND id <> p_application_id
    AND status = 'pending';
END;
$$;

-- ─────────────────────────────────────────────
-- Function: complete_job
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION complete_job(p_job_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_employer_id     uuid;
  v_assigned_worker uuid;
BEGIN
  SELECT employer_id, assigned_worker_id
  INTO v_employer_id, v_assigned_worker
  FROM jobs
  WHERE id = p_job_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Job not found';
  END IF;

  IF v_employer_id <> auth.uid() THEN
    RAISE EXCEPTION 'Only the job employer can mark a job as completed';
  END IF;

  IF v_assigned_worker IS NULL THEN
    RAISE EXCEPTION 'No worker is assigned to this job';
  END IF;

  UPDATE jobs
  SET status = 'completed'
  WHERE id = p_job_id;

  UPDATE user_profiles
  SET availability = 'open'
  WHERE user_id = v_assigned_worker;

  UPDATE job_applications
  SET status = 'completed'
  WHERE job_id = p_job_id
    AND worker_id = v_assigned_worker
    AND status = 'accepted';
END;
$$;

-- ─────────────────────────────────────────────
-- Grant execute to authenticated role only
-- ─────────────────────────────────────────────
GRANT EXECUTE ON FUNCTION shortlist_worker(uuid)        TO authenticated;
GRANT EXECUTE ON FUNCTION book_worker(uuid, uuid)       TO authenticated;
GRANT EXECUTE ON FUNCTION complete_job(uuid)            TO authenticated;
