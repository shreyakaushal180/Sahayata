'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase, Job } from '@/lib/supabase';
import { toast } from 'sonner';
import { Briefcase, MapPin, DollarSign, Calendar, Search, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function JobsPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('');

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*, employer:user_profiles!employer_id(*)')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const applyToJob = async (jobId: string) => {
    if (!user) {
      toast.error('Please login to apply');
      router.push('/login');
      return;
    }

    if (profile?.role !== 'worker') {
      toast.error('Only workers can apply to jobs');
      return;
    }

    try {
      const { error } = await supabase
        .from('job_applications')
        .insert({
          job_id: jobId,
          worker_id: profile.user_id,
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('You have already applied to this job');
        } else {
          throw error;
        }
      } else {
        toast.success('Application submitted successfully');
        loadJobs();
      }
    } catch (error) {
      toast.error('Failed to submit application');
    }
  };

  const filteredJobs = jobs.filter((job: any) => {
    const matchesSearch = job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = !locationFilter || job.location?.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesSkill = !skillFilter || job.required_skills?.some((skill: string) =>
      skill.toLowerCase().includes(skillFilter.toLowerCase())
    );
    return matchesSearch && matchesLocation && matchesSkill;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Browse Jobs</h1>
          <p className="text-gray-600">Find your next opportunity</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
            <CardDescription>Find jobs that match your preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Job title or description..."
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  placeholder="e.g., Mumbai"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="skill">Required Skill</Label>
                <Input
                  id="skill"
                  value={skillFilter}
                  onChange={(e) => setSkillFilter(e.target.value)}
                  placeholder="e.g., Plumber"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-4 text-gray-600">
          Showing {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'}
        </div>

        <div className="space-y-4">
          {filteredJobs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <Briefcase className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-semibold mb-2">No jobs found</p>
                <p>Try adjusting your search filters</p>
              </CardContent>
            </Card>
          ) : (
            filteredJobs.map((job: any) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{job.title}</CardTitle>
                      <CardDescription className="flex items-center mt-2">
                        <span className="font-semibold mr-1">{job.employer?.name}</span>
                        {job.employer?.average_rating > 0 && (
                          <span className="flex items-center ml-2">
                            <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                            {job.employer.average_rating.toFixed(1)}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <Badge variant="default" className="ml-4">
                      {job.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700">{job.description}</p>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center text-green-600 font-semibold">
                      <DollarSign className="h-5 w-5 mr-1" />
                      ₹{job.wage} per day
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      {job.location}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(job.date_time).toLocaleDateString()} at{' '}
                      {new Date(job.date_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {job.required_skills && job.required_skills.length > 0 && (
                    <div>
                      <Label className="text-sm text-gray-500 mb-2">Required Skills:</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {job.required_skills.map((skill: string, index: number) => (
                          <Badge key={index} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4">
                    {user && profile?.role === 'worker' ? (
                      <Button onClick={() => applyToJob(job.id)} className="w-full">
                        Apply Now
                      </Button>
                    ) : user && profile?.role === 'employer' ? (
                      <Button disabled className="w-full">
                        Employers cannot apply
                      </Button>
                    ) : (
                      <Button onClick={() => router.push('/login')} variant="outline" className="w-full">
                        Login to Apply
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
