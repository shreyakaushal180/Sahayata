'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Users, Shield, Star, Briefcase, MapPin, Clock } from 'lucide-react';

export default function Home() {
  const { user, profile } = useAuth();

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find Work. Hire Workers. Directly.
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Connecting daily wage workers with employers for transparent and fair opportunities
            </p>
            {!user ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                    Get Started
                  </Button>
                </Link>
                <Link href="/jobs">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-white text-blue-600 hover:bg-blue-50">
                    Browse Jobs
                  </Button>
                </Link>
              </div>
            ) : (
              <Link href={
                profile?.role === 'worker' ? '/worker/dashboard' :
                profile?.role === 'employer' ? '/employer/dashboard' :
                '/admin/dashboard'
              }>
                <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                  Go to Dashboard
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Sahayata?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <Shield className="h-12 w-12 text-blue-600" />
                </div>
                <CardTitle className="text-center">No Middlemen</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Direct connection between workers and employers. No hidden fees or commissions.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <Users className="h-12 w-12 text-blue-600" />
                </div>
                <CardTitle className="text-center">Verified Profiles</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  All users are verified with ratings and reviews from past work experiences.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <Search className="h-12 w-12 text-blue-600" />
                </div>
                <CardTitle className="text-center">Easy Discovery</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Smart matching based on skills, location, and availability for quick hiring.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">For Workers</h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <Briefcase className="h-6 w-6 text-blue-600 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg">Find Daily Work</h3>
                    <p className="text-gray-600">Browse hundreds of job listings and apply instantly</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <Star className="h-6 w-6 text-blue-600 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg">Build Your Reputation</h3>
                    <p className="text-gray-600">Get rated by employers and showcase your skills</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <MapPin className="h-6 w-6 text-blue-600 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg">Work Near You</h3>
                    <p className="text-gray-600">Find jobs based on your location and availability</p>
                  </div>
                </li>
              </ul>
              {!user && (
                <Link href="/register">
                  <Button className="mt-6" size="lg">Register as Worker</Button>
                </Link>
              )}
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-6">For Employers</h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <Users className="h-6 w-6 text-blue-600 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg">Hire Quickly</h3>
                    <p className="text-gray-600">Post jobs and get applications from skilled workers</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <Search className="h-6 w-6 text-blue-600 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg">Search by Skills</h3>
                    <p className="text-gray-600">Find workers with specific skills and experience</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <Clock className="h-6 w-6 text-blue-600 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg">Save Time</h3>
                    <p className="text-gray-600">No need to search manually. Let workers come to you</p>
                  </div>
                </li>
              </ul>
              {!user && (
                <Link href="/register">
                  <Button className="mt-6" size="lg">Register as Employer</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of workers and employers using Sahayata every day
          </p>
          {!user && (
            <Link href="/register">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                Create Free Account
              </Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
