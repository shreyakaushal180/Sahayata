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

const getCategoryStyles = (skills: string[] = []) => {
  const s = skills.join(' ').toLowerCase();
  if (s.includes('cook')) return { borderL: 'border-l-4 border-l-blue-500', bg: 'bg-blue-100', text: 'text-blue-600', icon: '🍳' };
  if (s.includes('plumb')) return { borderL: 'border-l-4 border-l-green-500', bg: 'bg-green-100', text: 'text-green-600', icon: '🔧' };
  if (s.includes('electr')) return { borderL: 'border-l-4 border-l-amber-500', bg: 'bg-amber-100', text: 'text-amber-600', icon: '⚡' };
  if (s.includes('clean')) return { borderL: 'border-l-4 border-l-rose-500', bg: 'bg-rose-100', text: 'text-rose-600', icon: '✨' };
  if (s.includes('nann') || s.includes('child')) return { borderL: 'border-l-4 border-l-purple-500', bg: 'bg-purple-100', text: 'text-purple-600', icon: '👶' };
  if (s.includes('construct') || s.includes('build')) return { borderL: 'border-l-4 border-l-orange-500', bg: 'bg-orange-100', text: 'text-orange-600', icon: '👷' };
  return { borderL: 'border-l-4 border-l-gray-300', bg: 'bg-gray-100', text: 'text-gray-600', icon: '💼' };
};

export default function JobsPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category');
    if (category) {
      setSkillFilter(category);
    }
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

        <div className="flex gap-3 overflow-x-auto pb-4 mb-4 snap-x [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
          <Button
            variant={skillFilter === '' ? 'default' : 'outline'}
            onClick={() => setSkillFilter('')}
            className={`rounded-full snap-start shrink-0 h-10 ${skillFilter === '' ? 'bg-amber-600 hover:bg-amber-700' : 'text-gray-700'}`}
          >
            All Jobs
          </Button>
          {[
            { name: 'Cooking', icon: '🍳' },
            { name: 'Cleaning', icon: '✨' },
            { name: 'Plumbing', icon: '🔧' },
            { name: 'Electrical', icon: '⚡' },
            { name: 'Nanny', icon: '👶' },
            { name: 'Construction', icon: '👷' },
          ].map(cat => (
            <Button
              key={cat.name}
              variant={skillFilter.toLowerCase() === cat.name.toLowerCase() ? 'default' : 'outline'}
              onClick={() => setSkillFilter(cat.name)}
              className={`rounded-full snap-start shrink-0 flex items-center space-x-2 h-10 ${skillFilter.toLowerCase() === cat.name.toLowerCase() ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'text-gray-700'}`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </Button>
          ))}
        </div>

        <div className="mb-4 text-gray-600 font-medium">
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
            filteredJobs.map((job: any) => {
              const catStyle = getCategoryStyles(job.required_skills);
              return (
                <Card key={job.id} className={`${catStyle.borderL} hover:shadow-lg transition-shadow overflow-hidden`}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-1 items-start space-x-4">
                        <div className={`mt-1 h-14 w-14 rounded-full flex items-center justify-center text-2xl shrink-0 ${catStyle.bg}`}>
                          {catStyle.icon}
                        </div>
                        <div>
                          <CardTitle className="text-2xl font-bold">{job.title}</CardTitle>
                          <CardDescription className="flex items-center mt-2 text-gray-600">
                            <span className="font-semibold mr-1 text-gray-800">{job.employer?.name}</span>
                            {job.employer?.average_rating > 0 && (
                              <span className="flex items-center ml-2 border-l pl-2 border-gray-300">
                                <Star className="h-4 w-4 text-amber-500 fill-current mr-1" />
                                {job.employer.average_rating.toFixed(1)}
                              </span>
                            )}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className={job.status === 'open' ? 'bg-green-100 text-green-800 hover:bg-green-200 border-none px-3 py-1 ml-4' : 'bg-red-100 text-red-800 hover:bg-red-200 border-none px-3 py-1 ml-4'}>
                        {job.status === 'open' ? 'Open' : 'Closed'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <p className="text-gray-700 text-lg">{job.description}</p>

                    <div className="flex flex-wrap gap-5 text-sm items-center bg-gray-50 p-4 rounded-xl">
                      <div className="flex items-center text-teal-600 font-bold text-2xl">
                        ₹{job.wage} <span className="text-sm font-normal text-gray-500 ml-2 mt-1">per day</span>
                      </div>
                      <div className="w-px h-8 bg-gray-200 hidden sm:block"></div>
                      <div className="flex items-center text-gray-700 font-medium text-base">
                        <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                        {job.location}
                      </div>
                      <div className="flex items-center text-gray-700 font-medium text-base">
                        <Calendar className="h-5 w-5 mr-2 text-amber-600" />
                        {new Date(job.date_time).toLocaleDateString()} at{' '}
                        {new Date(job.date_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    {job.required_skills && job.required_skills.length > 0 && (
                      <div className="pt-2">
                        <div className="flex flex-wrap gap-2">
                          {job.required_skills.map((skill: string, index: number) => (
                            <Badge key={index} variant="outline" className="bg-white text-gray-700 border-gray-300 px-3 py-1">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-6">
                      {user && profile?.role === 'worker' ? (
                        <Button onClick={() => applyToJob(job.id)} className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-7 text-xl rounded-xl transition-all shadow-md">
                          Apply Now
                        </Button>
                      ) : user && profile?.role === 'employer' ? (
                        <Button disabled className="w-full py-7 text-xl rounded-xl bg-gray-100 text-gray-400">
                          Employers cannot apply
                        </Button>
                      ) : (
                        <Button onClick={() => router.push('/login')} variant="outline" className="w-full py-7 text-xl font-medium border-2 rounded-xl">
                          Login to Apply
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  );
}
