'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase, UserProfile } from '@/lib/supabase';
import { toast } from 'sonner';
import { Users, MapPin, Star, Search, Briefcase } from 'lucide-react';

export default function WorkersPage() {
  const [workers, setWorkers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('');

  useEffect(() => {
    loadWorkers();
  }, []);

  const loadWorkers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('role', 'worker')
        .eq('availability', true)
        .order('average_rating', { ascending: false });

      if (error) throw error;
      setWorkers(data || []);
    } catch (error) {
      console.error('Error loading workers:', error);
      toast.error('Failed to load workers');
    } finally {
      setLoading(false);
    }
  };

  const filteredWorkers = workers.filter((worker) => {
    const matchesSearch = worker.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = !locationFilter || worker.location?.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesSkill = !skillFilter || worker.skills?.some((skill) =>
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
          <h1 className="text-3xl font-bold text-gray-900">Find Workers</h1>
          <p className="text-gray-600">Browse skilled workers available for hire</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
            <CardDescription>Find workers that match your requirements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search by Name</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Worker name..."
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
                <Label htmlFor="skill">Skill</Label>
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
          Showing {filteredWorkers.length} {filteredWorkers.length === 1 ? 'worker' : 'workers'}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkers.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-semibold mb-2">No workers found</p>
                  <p>Try adjusting your search filters</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            filteredWorkers.map((worker) => (
              <Card key={worker.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{worker.name}</CardTitle>
                      <CardDescription>
                        {worker.experience || 0} years experience
                      </CardDescription>
                    </div>
                    {worker.availability && (
                      <Badge variant="default" className="bg-green-600">
                        Available
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-400 fill-current mr-1" />
                      <span className="font-semibold text-lg">
                        {worker.average_rating?.toFixed(1) || '0.0'}
                      </span>
                      <span className="text-gray-500 text-sm ml-1">
                        ({worker.total_ratings || 0})
                      </span>
                    </div>
                  </div>

                  {worker.location && (
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{worker.location}</span>
                    </div>
                  )}

                  {worker.phone && (
                    <div className="flex items-center text-gray-600">
                      <span className="mr-2">📞</span>
                      <span>{worker.phone}</span>
                    </div>
                  )}

                  {worker.skills && worker.skills.length > 0 ? (
                    <div>
                      <Label className="text-xs text-gray-500 mb-2">Skills:</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {worker.skills.slice(0, 4).map((skill, index) => (
                          <Badge key={index} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                        {worker.skills.length > 4 && (
                          <Badge variant="outline">
                            +{worker.skills.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-400 text-sm">No skills listed</div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
