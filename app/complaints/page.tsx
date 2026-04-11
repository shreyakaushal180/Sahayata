'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase, Complaint, Job } from '@/lib/supabase';
import { toast } from 'sonner';
import { CircleAlert as AlertCircle, CircleCheck as CheckCircle, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ComplaintsPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    job_id: '',
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      loadComplaints();
      loadJobs();
    }
  }, [user]);

  const loadComplaints = async () => {
    if (!profile) return;
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select('*, job:jobs(*)')
        .eq('user_id', profile.user_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComplaints(data || []);
    } catch (error) {
      console.error('Error loading complaints:', error);
    }
  };

  const loadJobs = async () => {
    if (!profile) return;
    try {
      let query = supabase.from('jobs').select('*');

      if (profile.role === 'worker') {
        const { data: applications } = await supabase
          .from('job_applications')
          .select('job_id')
          .eq('worker_id', profile.user_id);

        const jobIds = applications?.map(app => app.job_id) || [];
        if (jobIds.length > 0) {
          query = query.in('id', jobIds);
        }
      } else if (profile.role === 'employer') {
        query = query.eq('employer_id', profile.user_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('complaints')
        .insert({
          user_id: profile.user_id,
          subject: formData.subject,
          description: formData.description,
          job_id: formData.job_id || null,
        });

      if (error) throw error;
      toast.success('Complaint submitted successfully');
      setFormData({ subject: '', description: '', job_id: '' });
      loadComplaints();
    } catch (error) {
      toast.error('Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Complaints & Grievances</h1>
          <p className="text-gray-600">Submit and track your complaints</p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Submit a Complaint</CardTitle>
              <CardDescription>
                Report any issues or grievances you&apos;re experiencing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Brief description of the issue"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide detailed information about your complaint"
                    rows={5}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="job_id">Related Job (Optional)</Label>
                  <select
                    id="job_id"
                    className="w-full rounded-md border border-gray-300 p-2"
                    value={formData.job_id}
                    onChange={(e) => setFormData({ ...formData, job_id: e.target.value })}
                  >
                    <option value="">None</option>
                    {jobs.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.title}
                      </option>
                    ))}
                  </select>
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Submitting...' : 'Submit Complaint'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>My Complaints</CardTitle>
              <CardDescription>View your submitted complaints and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complaints.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>You haven&apos;t submitted any complaints yet.</p>
                  </div>
                ) : (
                  complaints.map((complaint: any) => (
                    <Card key={complaint.id} className="border-l-4" style={{
                      borderLeftColor: complaint.status === 'resolved' ? '#22c55e' :
                        complaint.status === 'in_progress' ? '#eab308' :
                          '#ef4444'
                    }}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{complaint.subject}</CardTitle>
                            <CardDescription>
                              Submitted on {new Date(complaint.created_at).toLocaleDateString()}
                            </CardDescription>
                          </div>
                          <Badge variant={
                            complaint.status === 'resolved' ? 'default' :
                              complaint.status === 'in_progress' ? 'secondary' :
                                'destructive'
                          }>
                            {complaint.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label className="text-sm font-semibold">Description</Label>
                          <p className="text-gray-700 mt-1">{complaint.description}</p>
                        </div>
                        {complaint.job && (
                          <div>
                            <Label className="text-sm font-semibold">Related Job</Label>
                            <p className="text-gray-700 mt-1">{complaint.job.title}</p>
                          </div>
                        )}
                        {complaint.admin_response && (
                          <div className="bg-green-50 p-4 rounded-md border border-green-200">
                            <div className="flex items-start">
                              <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                              <div className="flex-1">
                                <Label className="text-sm font-semibold text-green-800">
                                  Admin Response
                                </Label>
                                <p className="text-green-900 mt-1">{complaint.admin_response}</p>
                                {complaint.resolved_at && (
                                  <p className="text-xs text-green-600 mt-2">
                                    Resolved on {new Date(complaint.resolved_at).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
