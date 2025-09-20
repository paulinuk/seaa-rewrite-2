import { AuthUser, User } from '@/types';

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

export function login(email: string, password: string): AuthUser | null {
  const user = users.find(u => u.email === email);
  
  if (user && passwords[email] === password) {
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      surname: user.surname,
      userType: user.userType
    };
    return authUser;
  }
  return null;
}

export function register(userData: Omit<User, 'id' | 'createdAt'>): User {
  const newUser: User = {
    ...userData,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date()
  };
  users.push(newUser);
  
  // Set a default password for new users (in production, this would be handled differently)
  passwords[newUser.email] = 'defaultPassword123';
  
  return newUser;
}

export function getUsers(): User[] {
  return users;
}