# Sahayata - Job Marketplace Platform

A production-ready full-stack web application that connects daily wage workers with employers for transparent job opportunities.

## Features

### For Workers
- Create and manage professional profiles
- Add skills, location, and availability
- Browse recommended jobs based on skills and location
- Apply to jobs instantly
- Track application status
- Rate employers after job completion
- View past jobs and earnings

### For Employers
- Post job listings with detailed requirements
- Search workers by skills and location
- View worker profiles with ratings and reviews
- Manage job applications
- Accept or reject applications
- Rate workers after job completion

### For Admins
- View and manage all users
- Monitor job postings
- Handle complaints and grievances
- Delete or suspend accounts
- View platform statistics

### Additional Features
- Smart job matching based on skills and location
- Ratings and reviews system
- Complaint/grievance management
- Mobile-responsive design
- Real-time updates
- Secure authentication with Supabase

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **UI Components**: ShadCN UI
- **Backend**: Supabase (PostgreSQL + Auth)
- **Authentication**: Supabase Auth with JWT
- **Database**: PostgreSQL with Row Level Security
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd sahayata
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env` file in the root directory with your Supabase credentials (already available in `.env` file):

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. The database schema has already been created. If you need to reset or recreate:
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Run the migration from `supabase/migrations/`

5. Create an admin user:
   - Register a new account through the application
   - In Supabase dashboard, go to Table Editor
   - Find `user_profiles` table
   - Update the user's role to 'admin'

### Running the Application

Development mode:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

Build for production:
```bash
npm run build
npm start
```

### Default Test Credentials

To test the application, you'll need to:

1. Register at least one worker account
2. Register at least one employer account
3. Register at least one admin account (manually update role in database)

Recommended test data:
- Worker: test-worker@example.com
- Employer: test-employer@example.com
- Admin: test-admin@example.com

## Project Structure

```
sahayata/
├── app/                      # Next.js App Router pages
│   ├── admin/               # Admin dashboard
│   ├── employer/            # Employer dashboard
│   ├── worker/              # Worker dashboard
│   ├── jobs/                # Public jobs listing
│   ├── workers/             # Public workers listing
│   ├── complaints/          # Complaints page
│   ├── login/               # Login page
│   ├── register/            # Registration page
│   └── page.tsx             # Landing page
├── components/              # Reusable components
│   ├── ui/                  # ShadCN UI components
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   └── ProtectedRoute.tsx
├── contexts/                # React contexts
│   └── AuthContext.tsx      # Authentication context
├── lib/                     # Utility functions
│   ├── supabase.ts          # Supabase client
│   ├── auth.ts              # Auth helpers
│   └── utils.ts             # General utilities
└── public/                  # Static assets
```

## Database Schema

### Tables

1. **user_profiles** - Extended user information
   - id, user_id, role, name, email, phone
   - skills[], location, availability
   - experience, average_rating, total_ratings

2. **jobs** - Job postings
   - id, title, description, wage
   - location, required_skills[]
   - employer_id, status, date_time

3. **job_applications** - Worker applications
   - id, job_id, worker_id, status

4. **reviews** - Ratings and reviews
   - id, reviewer_id, reviewee_id
   - job_id, rating, comment

5. **complaints** - User complaints
   - id, user_id, subject, description
   - job_id, status, admin_response

## Key Pages

- `/` - Landing page
- `/login` - Login page
- `/register` - Registration page
- `/jobs` - Browse all jobs
- `/workers` - Browse all workers
- `/complaints` - Submit and view complaints
- `/worker/dashboard` - Worker dashboard
- `/employer/dashboard` - Employer dashboard
- `/admin/dashboard` - Admin dashboard

## Security Features

- Row Level Security (RLS) on all tables
- Role-based access control
- Protected routes
- JWT authentication
- Secure password hashing
- Input validation

## Deployment

### Deploy to Vercel

1. Push your code to GitHub

2. Import the project in Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

3. Configure environment variables:
   - Add `NEXT_PUBLIC_SUPABASE_URL`
   - Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. Deploy!

The application will be automatically deployed and available at your Vercel URL.


