'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase, Job, JobApplication, UserProfile } from '@/lib/supabase';
import { toast } from 'sonner';
import { Star, MapPin, Calendar, DollarSign, X, Briefcase, Users, Plus } from 'lucide-react';

function EmployerDashboardContent() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [workers, setWorkers] = useState<UserProfile[]>([]);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [showJobDialog, setShowJobDialog] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [jobFormData, setJobFormData] = useState({
    title: '',
    description: '',
    wage: '',
    location: '',
    required_skills: [] as string[],
    date_time: '',
  });

  useEffect(() => {
    if (profile) {
      loadJobs();
      loadWorkers();
    }
  }, [profile]);

  const loadJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('employer_id', profile?.user_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  };

  const loadWorkers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('role', 'worker')
        .order('average_rating', { ascending: false });

      if (error) throw error;
      setWorkers(data || []);
    } catch (error) {
      console.error('Error loading workers:', error);
    }
  };

  const loadApplications = async (jobId: string) => {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select('*, worker:user_profiles!worker_id(*)')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  };

  const handleCreateJob = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('jobs')
        .insert({
          ...jobFormData,
          wage: parseFloat(jobFormData.wage),
          employer_id: profile.user_id,
        });

      if (error) throw error;
      toast.success('Job posted successfully');
      setShowJobDialog(false);
      setJobFormData({
        title: '',
        description: '',
        wage: '',
        location: '',
        required_skills: [],
        date_time: '',
      });
      loadJobs();
    } catch (error) {
      toast.error('Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ status })
        .eq('id', applicationId);

      if (error) throw error;
      toast.success(`Application ${status}`);
      if (selectedJob) {
        loadApplications(selectedJob.id);
      }
    } catch (error) {
      toast.error('Failed to update application');
    }
  };

  const addSkillToJob = () => {
    if (skillInput.trim() && !jobFormData.required_skills.includes(skillInput.trim())) {
      setJobFormData({
        ...jobFormData,
        required_skills: [...jobFormData.required_skills, skillInput.trim()],
      });
      setSkillInput('');
    }
  };

  const removeSkillFromJob = (skill: string) => {
    setJobFormData({
      ...jobFormData,
      required_skills: jobFormData.required_skills.filter((s) => s !== skill),
    });
  };

  const filteredWorkers = workers.filter((worker) => {
    const matchesSearch = worker.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         worker.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSkill = !skillFilter || worker.skills?.some((skill) =>
      skill.toLowerCase().includes(skillFilter.toLowerCase())
    );
    return matchesSearch && matchesSkill;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Employer Dashboard</h1>
            <p className="text-gray-600">Post jobs and manage applications</p>
          </div>
          <Dialog open={showJobDialog} onOpenChange={setShowJobDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Post New Job
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Post a New Job</DialogTitle>
                <DialogDescription>Fill in the details to post a job listing</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    value={jobFormData.title}
                    onChange={(e) => setJobFormData({ ...jobFormData, title: e.target.value })}
                    placeholder="e.g., Construction Worker, Electrician"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={jobFormData.description}
                    onChange={(e) => setJobFormData({ ...jobFormData, description: e.target.value })}
                    placeholder="Describe the job requirements and responsibilities"
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="wage">Daily Wage (₹)</Label>
                    <Input
                      id="wage"
                      type="number"
                      value={jobFormData.wage}
                      onChange={(e) => setJobFormData({ ...jobFormData, wage: e.target.value })}
                      placeholder="500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date_time">Date & Time</Label>
                    <Input
                      id="date_time"
                      type="datetime-local"
                      value={jobFormData.date_time}
                      onChange={(e) => setJobFormData({ ...jobFormData, date_time: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={jobFormData.location}
                    onChange={(e) => setJobFormData({ ...jobFormData, location: e.target.value })}
                    placeholder="e.g., Mumbai, Maharashtra"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Required Skills</Label>
                  <div className="flex gap-2">
                    <Input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkillToJob())}
                      placeholder="Add a skill and press Enter"
                    />
                    <Button type="button" onClick={addSkillToJob}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {jobFormData.required_skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                        <X
                          className="h-3 w-3 ml-1 cursor-pointer"
                          onClick={() => removeSkillFromJob(skill)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button onClick={handleCreateJob} disabled={loading} className="w-full">
                  {loading ? 'Posting...' : 'Post Job'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList>
            <TabsTrigger value="jobs">
              <Briefcase className="h-4 w-4 mr-2" />
              My Jobs
            </TabsTrigger>
            <TabsTrigger value="workers">
              <Users className="h-4 w-4 mr-2" />
              Find Workers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jobs">
            <div className="space-y-4">
              {jobs.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-gray-500">
                    <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>You haven&apos;t posted any jobs yet.</p>
                    <Button className="mt-4" onClick={() => setShowJobDialog(true)}>
                      Post Your First Job
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                jobs.map((job) => (
                  <Card key={job.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{job.title}</CardTitle>
                          <CardDescription>
                            Posted on {new Date(job.created_at || '').toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Badge variant={job.status === 'open' ? 'default' : 'secondary'}>
                          {job.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-gray-700">{job.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          ₹{job.wage}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {job.location}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(job.date_time).toLocaleDateString()}
                        </div>
                      </div>
                      {job.required_skills && job.required_skills.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {job.required_skills.map((skill, index) => (
                            <Badge key={index} variant="outline">{skill}</Badge>
                          ))}
                        </div>
                      )}
                      <Button
                        onClick={() => {
                          setSelectedJob(job);
                          loadApplications(job.id);
                        }}
                        variant="outline"
                        className="w-full"
                      >
                        View Applications
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="workers">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Search Workers</CardTitle>
                  <CardDescription>Find skilled workers for your jobs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Search by name or location</Label>
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search workers..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Filter by skill</Label>
                      <Input
                        value={skillFilter}
                        onChange={(e) => setSkillFilter(e.target.value)}
                        placeholder="e.g., Plumber, Electrician"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {filteredWorkers.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No workers found matching your criteria.</p>
                  </CardContent>
                </Card>
              ) : (
                filteredWorkers.map((worker) => (
                  <Card key={worker.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{worker.name}</CardTitle>
                          <CardDescription>
                            {worker.experience || 0} years of experience
                          </CardDescription>
                        </div>
                        <div className="flex items-center">
                          <Star className="h-5 w-5 text-yellow-400 fill-current" />
                          <span className="ml-1 font-semibold">
                            {worker.average_rating?.toFixed(1) || '0.0'}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        {worker.location && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {worker.location}
                          </div>
                        )}
                        {worker.phone && (
                          <div className="flex items-center">
                            📞 {worker.phone}
                          </div>
                        )}
                      </div>
                      {worker.skills && worker.skills.length > 0 && (
                        <div>
                          <Label className="text-sm">Skills:</Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {worker.skills.map((skill, index) => (
                              <Badge key={index} variant="secondary">{skill}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {selectedJob && (
          <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Applications for {selectedJob.title}</DialogTitle>
                <DialogDescription>
                  Review and manage applications for this job
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {applications.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No applications yet</p>
                ) : (
                  applications.map((app: any) => (
                    <Card key={app.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{app.worker?.name}</CardTitle>
                            <CardDescription>
                              Applied on {new Date(app.created_at).toLocaleDateString()}
                            </CardDescription>
                          </div>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="ml-1 text-sm font-semibold">
                              {app.worker?.average_rating?.toFixed(1) || '0.0'}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {app.worker?.location || 'Not specified'}
                          </div>
                          <div>
                            Experience: {app.worker?.experience || 0} years
                          </div>
                        </div>
                        {app.worker?.skills && app.worker.skills.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {app.worker.skills.map((skill: string, index: number) => (
                              <Badge key={index} variant="secondary">{skill}</Badge>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button
                            onClick={() => updateApplicationStatus(app.id, 'accepted')}
                            disabled={app.status === 'accepted'}
                            className="flex-1"
                          >
                            Accept
                          </Button>
                          <Button
                            onClick={() => updateApplicationStatus(app.id, 'rejected')}
                            disabled={app.status === 'rejected'}
                            variant="destructive"
                            className="flex-1"
                          >
                            Reject
                          </Button>
                        </div>
                        <Badge variant={
                          app.status === 'accepted' ? 'default' :
                          app.status === 'rejected' ? 'destructive' :
                          'secondary'
                        }>
                          Status: {app.status}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}

export default function EmployerDashboard() {
  return (
    <ProtectedRoute requiredRole="employer">
      <EmployerDashboardContent />
    </ProtectedRoute>
  );
}
