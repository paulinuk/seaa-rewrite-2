// Mock API responses that simulate what will come from the C# API
import { User, AuthUser, Meeting, SerializedMeeting, Event, AgeGroup, Registration } from '@/types';

// Mock data storage
const users: User[] = [
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

const passwords: { [email: string]: string } = {
  'paul@saxtonenterprises.com': 'Iceland153654!!'
};

const meetings: Meeting[] = [
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

const events: Event[] = [
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

const ageGroups: AgeGroup[] = [
  { id: '1', name: 'Under 15', maxAge: 14 },
  { id: '2', name: 'Under 17', maxAge: 16 },
  { id: '3', name: 'Under 20', maxAge: 19 },
  { id: '4', name: 'Senior', minAge: 20, maxAge: 34 },
  { id: '5', name: 'Veteran 35+', minAge: 35, maxAge: 39 },
  { id: '6', name: 'Veteran 40+', minAge: 40, maxAge: 44 },
  { id: '7', name: 'Veteran 45+', minAge: 45, maxAge: 49 },
  { id: '8', name: 'Veteran 50+', minAge: 50 }
];

const registrations: Registration[] = [];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API functions that simulate HTTP responses
export const mockApi = {
  // Authentication endpoints
  async login(email: string, password: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    await delay(500); // Simulate network delay
    
    const user = users.find(u => u.email === email);
    if (user && passwords[email] === password) {
      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        surname: user.surname,
        userType: user.userType
      };
      return { success: true, user: authUser };
    }
    return { success: false, error: 'Invalid email or password' };
  },

  async register(userData: Omit<User, 'id' | 'createdAt'>): Promise<{ success: boolean; user?: User; error?: string }> {
    await delay(500);
    
    // Check if user already exists
    if (users.find(u => u.email === userData.email)) {
      return { success: false, error: 'User already exists' };
    }

    const newUser: User = {
      ...userData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date()
    };
    users.push(newUser);
    passwords[newUser.email] = 'defaultPassword123';
    
    return { success: true, user: newUser };
  },

  // Meeting endpoints
  async getMeetings(): Promise<{ success: boolean; meetings?: SerializedMeeting[]; error?: string }> {
    await delay(300);
    const serializedMeetings = meetings.map(meeting => ({
      ...meeting,
      date: meeting.date.toISOString(),
      closingDate: meeting.closingDate.toISOString()
    }));
    return { success: true, meetings: serializedMeetings };
  },

  async getMeeting(id: string): Promise<{ success: boolean; meeting?: SerializedMeeting; error?: string }> {
    await delay(300);
    const meeting = meetings.find(m => m.id === id);
    if (meeting) {
      const serializedMeeting = {
        ...meeting,
        date: meeting.date.toISOString(),
        closingDate: meeting.closingDate.toISOString()
      };
      return { success: true, meeting: serializedMeeting };
    }
    return { success: false, error: 'Meeting not found' };
  },

  // Event endpoints
  async getEvents(): Promise<{ success: boolean; events?: Event[]; error?: string }> {
    await delay(200);
    return { success: true, events };
  },

  // Age group endpoints
  async getAgeGroups(): Promise<{ success: boolean; ageGroups?: AgeGroup[]; error?: string }> {
    await delay(200);
    return { success: true, ageGroups };
  },

  // Registration endpoints
  async createRegistration(registrationData: Omit<Registration, 'id' | 'createdAt'>): Promise<{ success: boolean; registration?: Registration; error?: string }> {
    await delay(800);
    
    if (!registrationData.userId || !registrationData.meetingId || !registrationData.events) {
      return { success: false, error: 'Missing required fields' };
    }

    if (registrationData.events.length === 0 || registrationData.events.length > 5) {
      return { success: false, error: 'Must select between 1 and 5 events' };
    }

    const newRegistration: Registration = {
      ...registrationData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date()
    };
    registrations.push(newRegistration);
    
    return { success: true, registration: newRegistration };
  },

  async getUserRegistrations(userId: string): Promise<{ success: boolean; registrations?: Registration[]; error?: string }> {
    await delay(300);
    const userRegistrations = registrations.filter(r => r.userId === userId);
    return { success: true, registrations: userRegistrations };
  }
};