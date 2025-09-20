"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { MeetingCard } from '@/components/ui/meeting-card';
import { Meeting } from '@/types';
import { Navbar } from '@/components/layout/navbar';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loadingMeetings, setLoadingMeetings] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentStatus = searchParams.get('payment');
  const regId = searchParams.get('regId');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await apiClient.getMeetings();
        
        if (response.success && response.data) {
          setMeetings(response.data.map((meeting: any) => ({
            ...meeting,
            date: new Date(meeting.date),
            closingDate: new Date(meeting.closingDate)
          })));
        }
      } catch (error) {
        console.error('Error fetching meetings:', error);
      } finally {
        setLoadingMeetings(false);
      }
    };

    if (user) {
      fetchMeetings();
    }
  }, [user]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.firstName}!
          </h1>
          <p className="mt-2 text-gray-600">
            {user.userType === 'athlete' 
              ? 'Select a meeting below to register for events'
              : 'View upcoming meetings and manage your team entries'
            }
          </p>
        </div>

        {/* Payment Status Messages */}
        {paymentStatus === 'success' && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="py-4">
              <div className="flex items-center text-green-800">
                <CheckCircle className="h-5 w-5 mr-2" />
                <div>
                  <p className="font-semibold">Payment Successful!</p>
                  <p className="text-sm">Your registration has been confirmed. Registration ID: {regId}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {paymentStatus === 'cancelled' && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="py-4">
              <div className="flex items-center text-yellow-800">
                <AlertCircle className="h-5 w-5 mr-2" />
                <div>
                  <p className="font-semibold">Payment Cancelled</p>
                  <p className="text-sm">Your registration is saved but not confirmed. Please complete payment to confirm your entry.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {loadingMeetings ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading meetings...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {meetings.map((meeting) => (
              <MeetingCard
                key={meeting.id}
                meeting={meeting}
                userType={user.userType}
              />
            ))}
          </div>
        )}

        {meetings.length === 0 && !loadingMeetings && (
          <div className="text-center py-12">
            <p className="text-gray-500">No meetings available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}