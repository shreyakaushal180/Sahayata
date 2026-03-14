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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase, UserProfile, Job, Complaint } from '@/lib/supabase';
import { toast } from 'sonner';
import { Users, Briefcase, CircleAlert as AlertCircle, Trash2, Ban, CircleCheck as CheckCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

function AdminDashboardContent() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadUsers();
    loadJobs();
    loadComplaints();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*, employer:user_profiles!employer_id(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  };

  const loadComplaints = async () => {
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select('*, user:user_profiles!user_id(*), job:jobs(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComplaints(data || []);
    } catch (error) {
      console.error('Error loading complaints:', error);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', userToDelete.user_id);

      if (error) throw error;
      toast.success('User deleted successfully');
      loadUsers();
      setUserToDelete(null);
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleResolveComplaint = async () => {
    if (!selectedComplaint) return;
    try {
      const { error } = await supabase
        .from('complaints')
        .update({
          status: 'resolved',
          admin_response: adminResponse,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', selectedComplaint.id);

      if (error) throw error;
      toast.success('Complaint resolved successfully');
      setSelectedComplaint(null);
      setAdminResponse('');
      loadComplaints();
    } catch (error) {
      toast.error('Failed to resolve complaint');
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const stats = {
    totalUsers: users.length,
    workers: users.filter((u) => u.role === 'worker').length,
    employers: users.filter((u) => u.role === 'employer').length,
    totalJobs: jobs.length,
    openJobs: jobs.filter((j) => j.status === 'open').length,
    pendingComplaints: complaints.filter((c) => c.status === 'pending').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage users, jobs, and complaints</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-gray-600">
                {stats.workers} workers, {stats.employers} employers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalJobs}</div>
              <p className="text-xs text-gray-600">
                {stats.openJobs} currently open
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Complaints</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingComplaints}</div>
              <p className="text-xs text-gray-600">
                Require attention
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="jobs">
              <Briefcase className="h-4 w-4 mr-2" />
              Jobs
            </TabsTrigger>
            <TabsTrigger value="complaints">
              <AlertCircle className="h-4 w-4 mr-2" />
              Complaints
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>View and manage all users</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Search users</Label>
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name or email..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Filter by role</Label>
                      <select
                        className="w-full rounded-md border border-gray-300 p-2"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                      >
                        <option value="all">All Roles</option>
                        <option value="worker">Workers</option>
                        <option value="employer">Employers</option>
                        <option value="admin">Admins</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {filteredUsers.map((user) => (
                <Card key={user.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{user.name}</CardTitle>
                        <CardDescription>{user.email}</CardDescription>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {user.role}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <Label className="text-xs text-gray-500">Phone</Label>
                        <p>{user.phone || 'Not provided'}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Location</Label>
                        <p>{user.location || 'Not provided'}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Rating</Label>
                        <p>{user.average_rating?.toFixed(1) || '0.0'} ({user.total_ratings || 0} reviews)</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Joined</Label>
                        <p>{new Date(user.created_at || '').toLocaleDateString()}</p>
                      </div>
                    </div>
                    {user.skills && user.skills.length > 0 && (
                      <div>
                        <Label className="text-xs text-gray-500">Skills</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {user.skills.map((skill, index) => (
                            <Badge key={index} variant="secondary">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setUserToDelete(user)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete User
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="jobs">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Job Listings</CardTitle>
                  <CardDescription>Monitor all job postings</CardDescription>
                </CardHeader>
              </Card>

              {jobs.map((job: any) => (
                <Card key={job.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{job.title}</CardTitle>
                        <CardDescription>
                          Posted by {job.employer?.name}
                        </CardDescription>
                      </div>
                      <Badge variant={job.status === 'open' ? 'default' : 'secondary'}>
                        {job.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-gray-700">{job.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <Label className="text-xs text-gray-500">Wage</Label>
                        <p>₹{job.wage}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Location</Label>
                        <p>{job.location}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Date</Label>
                        <p>{new Date(job.date_time).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Posted</Label>
                        <p>{new Date(job.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="complaints">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Complaints & Grievances</CardTitle>
                  <CardDescription>Review and respond to user complaints</CardDescription>
                </CardHeader>
              </Card>

              {complaints.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-400" />
                    <p>No complaints to review</p>
                  </CardContent>
                </Card>
              ) : (
                complaints.map((complaint: any) => (
                  <Card key={complaint.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{complaint.subject}</CardTitle>
                          <CardDescription>
                            Filed by {complaint.user?.name} on {new Date(complaint.created_at).toLocaleDateString()}
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
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-sm font-semibold">Description</Label>
                        <p className="text-gray-700 mt-1">{complaint.description}</p>
                      </div>
                      {complaint.job_id && (
                        <div>
                          <Label className="text-sm font-semibold">Related Job</Label>
                          <p className="text-gray-700 mt-1">{complaint.job?.title || 'N/A'}</p>
                        </div>
                      )}
                      {complaint.admin_response && (
                        <div>
                          <Label className="text-sm font-semibold">Admin Response</Label>
                          <p className="text-gray-700 mt-1">{complaint.admin_response}</p>
                        </div>
                      )}
                      {complaint.status !== 'resolved' && (
                        <Button onClick={() => setSelectedComplaint(complaint)}>
                          Respond & Resolve
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete User</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {userToDelete?.name}? This action cannot be undone.
                All related data including jobs and applications will be removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {selectedComplaint && (
          <Dialog open={!!selectedComplaint} onOpenChange={() => setSelectedComplaint(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Resolve Complaint</DialogTitle>
                <DialogDescription>
                  Provide a response and mark this complaint as resolved
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="font-semibold">Subject</Label>
                  <p className="text-gray-700 mt-1">{selectedComplaint.subject}</p>
                </div>
                <div>
                  <Label className="font-semibold">Description</Label>
                  <p className="text-gray-700 mt-1">{selectedComplaint.description}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="response">Admin Response</Label>
                  <Textarea
                    id="response"
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    placeholder="Provide your response to this complaint..."
                    rows={4}
                  />
                </div>
                <Button onClick={handleResolveComplaint} className="w-full">
                  Mark as Resolved
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}
