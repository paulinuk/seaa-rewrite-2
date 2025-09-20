"use client";

import { Meeting } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

interface MeetingCardProps {
  meeting: Meeting;
  userType: 'athlete' | 'team_manager';
}

export function MeetingCard({ meeting, userType }: MeetingCardProps) {
  const now = new Date();
  const isExpired = now > meeting.closingDate;
  const canRegister = meeting.isOpen && !isExpired && userType === 'athlete';

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg leading-tight">{meeting.name}</CardTitle>
          <Badge variant={canRegister ? "default" : "secondary"}>
            {isExpired ? 'Closed' : meeting.isOpen ? 'Open' : 'Upcoming'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="space-y-3 flex-1">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{format(meeting.date, 'EEEE, MMMM d, yyyy')}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{meeting.venue}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>Closes: {format(meeting.closingDate, 'MMM d, yyyy')}</span>
          </div>
          
          {meeting.description && (
            <p className="text-sm text-gray-500 mt-2">{meeting.description}</p>
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t">
          {canRegister ? (
            <Link href={`/meetings/${meeting.id}/register`}>
              <Button className="w-full bg-red-500 hover:bg-red-600">
                Register Now
              </Button>
            </Link>
          ) : (
            <div className="text-center">
              <span className="text-sm text-gray-500">
                {isExpired ? 'Registration Closed' : 
                 userType === 'team_manager' ? 'Team Manager View' : 
                 'Registration Not Available'}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}