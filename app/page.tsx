"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (user) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
          <div className="mb-8">
            <div className="flex justify-center mb-6">
              <img 
                src="/seaa-logo.png" 
                alt="South of England Athletic Association" 
                className="h-16 w-auto"
              />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
              Meeting Registration
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl">
              Register for meetings and competitions. Join as an athlete to compete 
              or as a team manager to manage your club's entries.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Link href="/register">
              <Button size="lg" className="bg-red-500 hover:bg-red-600 text-white px-8 py-3">
                Get Started - Register
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="px-8 py-3">
                Already have an account? Login
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">For Athletes</h3>
              <p className="text-gray-600">
                Browse upcoming meetings, register for up to 5 events per competition,
                select your age groups, and track your registrations.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">For Team Managers</h3>
              <p className="text-gray-600">
                View upcoming meetings, manage team entries, and coordinate 
                your club's participation in competitions.
              </p>
            </div>
          </div>

          <div className="mt-12 text-sm text-gray-500">
            <p>Powered by South of England Athletic Association (SEAA)</p>
          </div>
        </div>
      </div>
    </div>
  );
}