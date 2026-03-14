# Deployment Guide for Sahayata

## Quick Start

The Sahayata platform is now ready for deployment. Follow these steps to get it running.

## Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment variables are already configured** in `.env` file with your Supabase credentials.

3. **Database is ready**: The migration has been applied to create all necessary tables.

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Open** `http://localhost:3000` in your browser.

## Creating Your First Admin User

Since the application requires an admin to manage users and complaints, you'll need to create an admin user:

1. **Register a new account** at `/register`
2. Choose either "Worker" or "Employer" role (you'll change this)
3. **After registration**, go to your Supabase dashboard:
   - Navigate to Table Editor
   - Open the `user_profiles` table
   - Find your newly created user
   - Change the `role` field from `worker` or `employer` to `admin`
4. **Log out and log back in** to access the admin dashboard

## Deploy to Vercel (Recommended)

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo>
   git push -u origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Vercel will auto-detect Next.js settings

3. **Configure Environment Variables** in Vercel:
   - Go to Project Settings > Environment Variables
   - Add these variables:
     ```
     NEXT_PUBLIC_SUPABASE_URL=https://wqprwlqhztgeuxgeufsa.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-key>
     ```

4. **Deploy**: Click "Deploy" and wait for the build to complete.

5. **Your app is live**! Visit the provided Vercel URL.

## Post-Deployment Steps

1. **Create admin account** (as described above)
2. **Test the application**:
   - Register a worker account
   - Register an employer account
   - Post a test job as employer
   - Apply to the job as worker
   - Review the application as employer

3. **Update metadata** in `app/layout.tsx`:
   - Change the title and description to match your branding
   - Update Open Graph images if needed

## Database Backup (Important!)

Your data is stored in Supabase. To backup:

1. Go to Supabase Dashboard
2. Navigate to Database > Backups
3. Enable automatic backups (recommended)
4. You can also download manual backups as needed

## Monitoring

- **Supabase Dashboard**: Monitor database usage, queries, and auth
- **Vercel Dashboard**: Monitor deployments, analytics, and performance
- **Error Tracking**: Consider adding Sentry for production error tracking

## Scaling Considerations

The application is built to scale:
- **Database**: Supabase PostgreSQL scales automatically
- **Frontend**: Vercel's edge network handles traffic globally
- **Authentication**: Supabase Auth handles authentication at scale

## Security Checklist

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Authentication required for sensitive operations
- ✅ Role-based access control implemented
- ✅ Password hashing via Supabase Auth
- ✅ Protected API routes
- ✅ Input validation on forms

## Support

For issues or questions:
1. Check the README.md file
2. Review the Supabase documentation
3. Check Next.js documentation
4. Open an issue on GitHub (if applicable)

## Next Steps

After deployment:
1. Customize the branding and colors in `globals.css`
2. Add your own logo and images
3. Configure email templates in Supabase for auth emails
4. Set up analytics (Google Analytics, Plausible, etc.)
5. Add SEO optimizations
6. Consider adding payment integration if needed

Your Sahayata platform is now ready for production use!
