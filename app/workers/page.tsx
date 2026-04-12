'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase, UserProfile } from '@/lib/supabase';
import { toast } from 'sonner';
import { Users, MapPin, Star, Search, Briefcase, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

const getInitials = (name: string) => {
  return name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'W';
};

const getCategoryStyles = (skill: string = '') => {
  const s = skill.toLowerCase();
  if (s.includes('cook')) return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' };
  if (s.includes('plumb')) return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' };
  if (s.includes('electr')) return { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' };
  if (s.includes('clean')) return { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200' };
  if (s.includes('nann') || s.includes('child')) return { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' };
  if (s.includes('construct') || s.includes('build')) return { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' };
  return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };
};

const getCategoryAvatarStyles = (skills: string[] = []) => {
  if (!skills || skills.length === 0) return { bg: 'bg-gray-100', text: 'text-gray-700' };
  const s = skills[0].toLowerCase();
  if (s.includes('cook')) return { bg: 'bg-blue-100', text: 'text-blue-700' };
  if (s.includes('plumb')) return { bg: 'bg-green-100', text: 'text-green-700' };
  if (s.includes('electr')) return { bg: 'bg-amber-100', text: 'text-amber-700' };
  if (s.includes('clean')) return { bg: 'bg-rose-100', text: 'text-rose-700' };
  if (s.includes('nann') || s.includes('child')) return { bg: 'bg-purple-100', text: 'text-purple-700' };
  if (s.includes('construct') || s.includes('build')) return { bg: 'bg-orange-100', text: 'text-orange-700' };
  return { bg: 'bg-gray-100', text: 'text-gray-700' };
};

export default function WorkersPage() {
  const [workers, setWorkers] = useState<UserProfile[]>([]);
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
    loadWorkers();
  }, []);

  const loadWorkers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('role', 'worker')
        .eq('availability', 'open')
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

        <div className="flex gap-3 overflow-x-auto pb-4 mb-4 snap-x [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
          <Button
            variant={skillFilter === '' ? 'default' : 'outline'}
            onClick={() => setSkillFilter('')}
            className={`rounded-full snap-start shrink-0 h-10 ${skillFilter === '' ? 'bg-amber-600 hover:bg-amber-700' : 'text-gray-700'}`}
          >
            All Workers
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
            filteredWorkers.map((worker) => {
              const avatarStyle = getCategoryAvatarStyles(worker.skills || []);
              return (
                <Card key={worker.id} className="hover:shadow-lg transition-shadow overflow-hidden border-t-0 hover:-translate-y-1 duration-300">
                  <div className="h-2 w-full bg-gradient-to-r from-amber-500 to-amber-300"></div>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-4">
                        <div className={`flex items-center justify-center h-14 w-14 rounded-full text-xl font-bold tracking-wider shrink-0 ${avatarStyle.bg} ${avatarStyle.text}`}>
                          {getInitials(worker.name || 'User')}
                        </div>
                        <div>
                          <CardTitle className="text-xl font-bold">{worker.name}</CardTitle>
                          <CardDescription className="text-gray-600 mt-1">
                            {worker.experience || 0} years experience
                          </CardDescription>
                        </div>
                      </div>
                      {worker.availability === 'open' ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-none px-3 py-1 ml-2">
                          Available
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 border-none px-3 py-1 ml-2">
                          Busy
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="flex items-center">
                      <Star className="h-6 w-6 text-amber-500 fill-current mr-2" />
                      <span className="font-bold text-2xl text-gray-900">
                        {worker.average_rating?.toFixed(1) || '0.0'}
                      </span>
                      <span className="text-gray-500 text-sm ml-2 font-medium">
                        ({worker.total_ratings || 0} reviews)
                      </span>
                    </div>

                    <div className="flex flex-col space-y-3 bg-gray-50 p-4 rounded-xl">
                      {worker.location && (
                        <div className="flex items-center text-gray-700 font-medium">
                          <MapPin className="h-5 w-5 mr-3 text-blue-600" />
                          <span>{worker.location}</span>
                        </div>
                      )}
                      {worker.phone && (
                        <div className="flex items-center text-gray-700 font-medium">
                          <Phone className="h-5 w-5 mr-3 text-green-600" />
                          <span>{worker.phone}</span>
                        </div>
                      )}
                    </div>

                    {worker.skills && worker.skills.length > 0 ? (
                      <div>
                        <div className="flex flex-wrap gap-2 pt-2">
                          {worker.skills.slice(0, 4).map((skill, index) => {
                            const pillStyle = getCategoryStyles(skill);
                            return (
                              <Badge key={index} variant="outline" className={`${pillStyle.bg} ${pillStyle.text} ${pillStyle.border} px-3 py-1`}>
                                {skill}
                              </Badge>
                            );
                          })}
                          {worker.skills.length > 4 && (
                            <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200 px-3 py-1">
                              +{worker.skills.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-400 text-sm pt-2 italic">No skills listed</div>
                    )}
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
