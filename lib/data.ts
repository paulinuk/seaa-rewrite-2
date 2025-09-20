import { Meeting, Event, AgeGroup, Registration } from '@/types';

// Mock data - in production, fetch from database
export const meetings: Meeting[] = [
  {
    id: '1',
    name: 'Southern 6/4/3 Stage Road Relays 2025',
    date: new Date('2025-09-20'),
    venue: 'Rushmoor Arena, Aldershot, Hants',
    description: 'Annual road relay championships',
    closingDate: new Date('2025-09-15'),
    isOpen: true
  },
  {
    id: '2',
    name: 'SEAA Track & Field Championships',
    date: new Date('2025-07-15'),
    venue: 'Bedford International Stadium',
    description: 'Regional track and field championships',
    closingDate: new Date('2025-07-10'),
    isOpen: true
  },
  {
    id: '3',
    name: 'Southern Cross Country Championships',
    date: new Date('2025-02-22'),
    venue: 'Parliament Hill, London',
    description: 'Cross country championships',
    closingDate: new Date('2025-02-15'),
    isOpen: true
  }
];

export const events: Event[] = [
  { id: '1', name: '100m', category: 'track' },
  { id: '2', name: '200m', category: 'track' },
  { id: '3', name: '400m', category: 'track' },
  { id: '4', name: '800m', category: 'track' },
  { id: '5', name: '1500m', category: 'track' },
  { id: '6', name: '5000m', category: 'track' },
  { id: '7', name: '10000m', category: 'track' },
  { id: '8', name: 'Long Jump', category: 'field' },
  { id: '9', name: 'High Jump', category: 'field' },
  { id: '10', name: 'Shot Put', category: 'field' },
  { id: '11', name: 'Discus', category: 'field' },
  { id: '12', name: 'Javelin', category: 'field' }
];

export const ageGroups: AgeGroup[] = [
  { id: '1', name: 'Under 15', maxAge: 14 },
  { id: '2', name: 'Under 17', maxAge: 16 },
  { id: '3', name: 'Under 20', maxAge: 19 },
  { id: '4', name: 'Senior', minAge: 20, maxAge: 34 },
  { id: '5', name: 'Veteran 35+', minAge: 35, maxAge: 39 },
  { id: '6', name: 'Veteran 40+', minAge: 40, maxAge: 44 },
  { id: '7', name: 'Veteran 45+', minAge: 45, maxAge: 49 },
  { id: '8', name: 'Veteran 50+', minAge: 50 }
];

export const registrations: Registration[] = [];

export function getMeetings(): Meeting[] {
  return meetings;
}

export function getMeeting(id: string): Meeting | undefined {
  return meetings.find(m => m.id === id);
}

export function getEvents(): Event[] {
  return events;
}

export function getAgeGroups(): AgeGroup[] {
  return ageGroups;
}

export function addRegistration(registration: Omit<Registration, 'id' | 'createdAt'>): Registration {
  const newRegistration: Registration = {
    ...registration,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date()
  };
  registrations.push(newRegistration);
  return newRegistration;
}

export function getUserRegistrations(userId: string): Registration[] {
  return registrations.filter(r => r.userId === userId);
}