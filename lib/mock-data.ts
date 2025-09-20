// Mock data - centralized location for all mock responses
// This can be easily replaced with real database calls later

import { User, Meeting, Event, AgeGroup, Registration, AuthUser } from '@/types';

// Mock data storage
export const mockUsers: User[] = [
  {
    id: 'sample-user-1',
    email: 'paul@saxtonenterprises.com',
    firstName: 'Paul',
    surname: 'Saxton',
    userType: 'athlete',
    club: 'Saxton Athletics Club',
    telephone: '01234 567890',
    mobile: '07123 456789',
    createdAt: new Date('2024-01-01')
  }
];

export const mockPasswords: { [email: string]: string } = {
  'paul@saxtonenterprises.com': 'Iceland153654!!'
};

export const mockMeetings: Meeting[] = [
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
    date: new Date('2025-07-15T10:00:00'),
    venue: 'Bedford International Stadium',
    description: 'Regional track and field championships',
    closingDate: new Date('2025-12-31T23:59:59'),
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

export const mockEvents: Event[] = [
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

export const mockAgeGroups: AgeGroup[] = [
  { id: '1', name: 'Under 15', maxAge: 14 },
  { id: '2', name: 'Under 17', maxAge: 16 },
  { id: '3', name: 'Under 20', maxAge: 19 },
  { id: '4', name: 'Senior', minAge: 20, maxAge: 34 },
  { id: '5', name: 'Veteran 35+', minAge: 35, maxAge: 39 },
  { id: '6', name: 'Veteran 40+', minAge: 40, maxAge: 44 },
  { id: '7', name: 'Veteran 45+', minAge: 45, maxAge: 49 },
  { id: '8', name: 'Veteran 50+', minAge: 50 }
];

export const mockRegistrations: Registration[] = [];

// Helper functions for mock operations
export const findUserByEmail = (email: string): User | undefined => {
  return mockUsers.find(u => u.email === email);
};

export const validatePassword = (email: string, password: string): boolean => {
  return mockPasswords[email] === password;
};

export const createUser = (userData: Omit<User, 'id' | 'createdAt'>): User => {
  const newUser: User = {
    ...userData,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date()
  };
  mockUsers.push(newUser);
  mockPasswords[newUser.email] = 'defaultPassword123';
  return newUser;
};

export const findMeetingById = (id: string): Meeting | undefined => {
  return mockMeetings.find(m => m.id === id);
};

export const createRegistration = (registrationData: Omit<Registration, 'id' | 'createdAt'>): Registration => {
  const newRegistration: Registration = {
    ...registrationData,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date()
  };
  mockRegistrations.push(newRegistration);
  return newRegistration;
};

export const findRegistrationsByUserId = (userId: string): Registration[] => {
  return mockRegistrations.filter(r => r.userId === userId);
};