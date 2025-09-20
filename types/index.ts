export interface User {
  id: string;
  email: string;
  firstName: string;
  surname: string;
  userType: 'athlete' | 'team_manager';
  club?: string;
  clubRole?: string;
  telephone?: string;
  mobile?: string;
  clubColours?: string;
  createdAt: Date;
}

export interface Meeting {
  id: string;
  name: string;
  date: Date;
  venue: string;
  description?: string;
  closingDate: Date;
  isOpen: boolean;
}

export interface SerializedMeeting extends Omit<Meeting, 'date' | 'closingDate'> {
  date: string;
  closingDate: string;
}

export interface Event {
  id: string;
  name: string;
  category: 'track' | 'field' | 'road';
}

export interface AgeGroup {
  id: string;
  name: string;
  minAge?: number;
  maxAge?: number;
}

export interface Registration {
  id: string;
  userId: string;
  meetingId: string;
  events: EventRegistration[];
  createdAt: Date;
}

export interface EventRegistration {
  eventId: string;
  ageGroupId: string;
  personalBest?: string;
  pbVenue?: string;
  pbDate?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  surname: string;
  userType: 'athlete' | 'team_manager';
}