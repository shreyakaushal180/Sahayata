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
import { supabase, Job, JobApplication } from '@/lib/supabase';
import { toast } from 'sonner';
import { Star, MapPin, Calendar, DollarSign, X, Briefcase, User } from 'lucide-react';
import Link from 'next/link';
import { updateUserProfile } from '@/lib/auth';

const getCategoryStyles = (skills: string[] = []) => {
  const s = skills.join(' ').toLowerCase();
  if (s.includes('cook')) return { border: 'border-l-4 border-l-blue-500', bg: 'bg-blue-100', text: 'text-blue-600', icon: '🍳' };
  if (s.includes('plumb')) return { border: 'border-l-4 border-l-green-500', bg: 'bg-green-100', text: 'text-green-600', icon: '🔧' };
  if (s.includes('electr')) return { border: 'border-l-4 border-l-amber-500', bg: 'bg-amber-100', text: 'text-amber-600', icon: '⚡' };
  if (s.includes('clean')) return { border: 'border-l-4 border-l-rose-500', bg: 'bg-rose-100', text: 'text-rose-600', icon: '✨' };
  if (s.includes('nann') || s.includes('child')) return { border: 'border-l-4 border-l-purple-500', bg: 'bg-purple-100', text: 'text-purple-600', icon: '👶' };
  if (s.includes('construct') || s.includes('build')) return { border: 'border-l-4 border-l-orange-500', bg: 'bg-orange-100', text: 'text-orange-600', icon: '👷' };
  return { border: 'border-l-4 border-l-gray-300', bg: 'bg-gray-100', text: 'text-gray-600', icon: '💼' };
};

function WorkerDashboardContent() {
  const { profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    phone: profile?.phone || '',
    location: profile?.location || '',
    experience: profile?.experience || 0,
    skills: profile?.skills || [],
    availability: profile?.availability !== false,
  });

  const [activeTab, setActiveTab] = useState('recommended');

  useEffect(() => {
    if (profile) {
      loadRecommendedJobs();
      loadApplications();
    }
    
    // Check if there's a tab specified in the URL
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [profile]);

  const loadRecommendedJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*, employer:user_profiles!employer_id(*)')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const filtered = (data || []).filter((job: any) => {
        const hasSkillMatch = job.required_skills?.some((skill: string) =>
          profile?.skills?.some((userSkill: string) =>
            userSkill.toLowerCase().includes(skill.toLowerCase())
          )
        );
        const hasLocationMatch = job.location?.toLowerCase().includes(profile?.location?.toLowerCase() || '');
        return hasSkillMatch || hasLocationMatch;
      });

      setRecommendedJobs(filtered);
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  };

  const loadApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select('*, job:jobs(*, employer:user_profiles!employer_id(*))')
        .eq('worker_id', profile?.user_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      await updateUserProfile(profile.user_id, formData);
      await refreshProfile();
      toast.success('Profile updated successfully');
      setEditMode(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()],
      });
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skill),
    });
  };

  const applyToJob = async (jobId: string) => {
    if (!profile) return;
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
        loadRecommendedJobs();
        loadApplications();
      }
    } catch (error) {
      toast.error('Failed to submit application');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Worker Dashboard</h1>
          <p className="text-gray-600">Manage your profile and find jobs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-[#f5f0e8] border-none shadow-sm">
            <CardContent className="p-6">
              <p className="text-gray-600 text-sm font-medium mb-1 uppercase tracking-wider">Applications Sent</p>
              <p className="text-4xl font-serif font-bold text-gray-900">{applications.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-[#f5f0e8] border-none shadow-sm">
            <CardContent className="p-6">
              <p className="text-gray-600 text-sm font-medium mb-1 uppercase tracking-wider">Accepted</p>
              <p className="text-4xl font-serif font-bold text-gray-900">
                {applications.filter(a => a.status === 'accepted').length}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-[#f5f0e8] border-none shadow-sm">
            <CardContent className="p-6">
              <p className="text-gray-600 text-sm font-medium mb-1 uppercase tracking-wider">Rating</p>
              <div className="flex items-center space-x-2">
                <p className="text-4xl font-serif font-bold text-gray-900">
                  {profile?.average_rating?.toFixed(1) || '0.0'}
                </p>
                <Star className="h-6 w-6 text-amber-500 fill-current mb-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-gray-100 p-2 h-auto rounded-[1.25rem] flex flex-wrap gap-2 justify-start sm:justify-center overflow-x-auto shadow-inner border border-gray-200 w-full sm:w-fit mx-auto">
            <TabsTrigger 
              value="profile"
              className="px-6 py-3 text-base sm:text-lg rounded-xl data-[state=active]:bg-amber-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-gray-200 data-[state=active]:hover:bg-amber-600 transition-all font-semibold active:scale-95"
            >
              <User className="h-5 w-5 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger 
              value="recommended"
              className="px-6 py-3 text-base sm:text-lg rounded-xl data-[state=active]:bg-amber-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-gray-200 data-[state=active]:hover:bg-amber-600 transition-all font-semibold active:scale-95"
            >
              <Briefcase className="h-5 w-5 mr-2" />
              Recommended Jobs
            </TabsTrigger>
            <TabsTrigger 
              value="applications"
              className="px-6 py-3 text-base sm:text-lg rounded-xl data-[state=active]:bg-amber-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-gray-200 data-[state=active]:hover:bg-amber-600 transition-all font-semibold active:scale-95"
            >
              <Calendar className="h-5 w-5 mr-2" />
              My Applications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your profile to get better job matches</CardDescription>
                  </div>
                  <Button onClick={() => editMode ? handleUpdateProfile() : setEditMode(true)} disabled={loading}>
                    {editMode ? (loading ? 'Saving...' : 'Save Changes') : 'Edit Profile'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    {editMode ? (
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    ) : (
                      <p className="text-lg">{profile?.name}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    {editMode ? (
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    ) : (
                      <p className="text-lg">{profile?.phone || 'Not provided'}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    {editMode ? (
                      <Input
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      />
                    ) : (
                      <p className="text-lg">{profile?.location || 'Not provided'}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Experience (years)</Label>
                    {editMode ? (
                      <Input
                        type="number"
                        value={formData.experience}
                        onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })}
                      />
                    ) : (
                      <p className="text-lg">{profile?.experience || 0} years</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Skills</Label>
                  {editMode && (
                    <div className="flex gap-2">
                      <Input
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                        placeholder="Add a skill and press Enter"
                      />
                      <Button type="button" onClick={addSkill}>Add</Button>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        {skill}
                        {editMode && (
                          <X
                            className="h-3 w-3 ml-1 cursor-pointer"
                            onClick={() => removeSkill(skill)}
                          />
                        )}
                      </Badge>
                    ))}
                    {formData.skills.length === 0 && <p className="text-gray-500">No skills added</p>}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Label>Rating:</Label>
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="ml-1 font-semibold">
                      {profile?.average_rating?.toFixed(1) || '0.0'}
                    </span>
                    <span className="ml-1 text-gray-500">
                      ({profile?.total_ratings || 0} reviews)
                    </span>
                  </div>
                </div>

                {editMode && (
                  <div className="flex gap-2">
                    <Button onClick={handleUpdateProfile} disabled={loading}>
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button variant="outline" onClick={() => setEditMode(false)}>
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommended">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recommended Jobs</CardTitle>
                  <CardDescription>Jobs matching your skills and location</CardDescription>
                </CardHeader>
              </Card>

              {recommendedJobs.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-gray-500">
                    <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No recommended jobs found. Try updating your skills and location.</p>
                  </CardContent>
                </Card>
              ) : (
                recommendedJobs.map((job: any) => {
                  const catStyle = getCategoryStyles(job.required_skills);
                  return (
                    <Card key={job.id} className={`${catStyle.border} shadow-sm overflow-hidden`}>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start space-x-3">
                            <div className={`mt-1 h-10 w-10 rounded-full flex items-center justify-center text-lg ${catStyle.bg}`}>
                              {catStyle.icon}
                            </div>
                            <div>
                              <CardTitle className="text-xl font-bold">{job.title}</CardTitle>
                              <CardDescription>Posted by {job.employer?.name}</CardDescription>
                            </div>
                          </div>
                          <Badge variant={job.status === 'open' ? 'default' : 'secondary'}>
                            {job.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-gray-700">{job.description}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 items-center">
                          <div className="flex items-center text-teal-600 font-bold text-xl">
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
                          <div className="flex flex-wrap gap-2 pt-2">
                            {job.required_skills.map((skill: string, index: number) => (
                              <Badge key={index} variant="outline" className="bg-gray-50">{skill}</Badge>
                            ))}
                          </div>
                        )}
                        <Button onClick={() => applyToJob(job.id)} className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-5 mt-2">
                          Apply Now
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="applications">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>My Applications</CardTitle>
                  <CardDescription>Track your job applications</CardDescription>
                </CardHeader>
              </Card>

              {applications.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>You haven&apos;t applied to any jobs yet.</p>
                  </CardContent>
                </Card>
              ) : (
                applications.map((app: any) => {
                  const catStyle = getCategoryStyles(app.job?.required_skills || []);
                  return (
                    <Card key={app.id} className={`${catStyle.border} shadow-sm overflow-hidden`}>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start space-x-3">
                            <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center text-sm ${catStyle.bg}`}>
                              {catStyle.icon}
                            </div>
                            <div>
                              <CardTitle className="text-xl font-bold">{app.job?.title}</CardTitle>
                              <CardDescription>Employer: {app.job?.employer?.name}</CardDescription>
                            </div>
                          </div>
                          <Badge variant={
                            app.status === 'accepted' ? 'default' :
                              app.status === 'rejected' ? 'destructive' :
                                'secondary'
                          }>
                            {app.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-gray-700">{app.job?.description}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 items-center">
                          <div className="flex items-center text-teal-600 font-bold text-lg">
                            ₹{app.job?.wage}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {app.job?.location}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Applied on {new Date(app.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function WorkerDashboard() {
  return (
    <ProtectedRoute requiredRole="worker">
      <WorkerDashboardContent />
    </ProtectedRoute>
  );
}
