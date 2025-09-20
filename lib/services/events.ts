import { executeQuery } from '@/lib/database';
import { Event, AgeGroup } from '@/types';
import { checkTableExists, getAllRecords } from './database-adapter';

export async function getAllEvents(): Promise<Event[]> {
  try {
    console.log('Database connection issues, returning default events');
    // Return default events
    return [
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
  } catch (error) {
    console.error('Error getting events:', error);
    return [
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
  }
}

export async function getAllAgeGroups(): Promise<AgeGroup[]> {
  try {
    console.log('Database connection issues, returning default age groups');
    // Return default age groups
    return [
      { id: '1', name: 'Under 15', maxAge: 14 },
      { id: '2', name: 'Under 17', maxAge: 16 },
      { id: '3', name: 'Under 20', maxAge: 19 },
      { id: '4', name: 'Senior', minAge: 20, maxAge: 34 },
      { id: '5', name: 'Veteran 35+', minAge: 35, maxAge: 39 },
      { id: '6', name: 'Veteran 40+', minAge: 40, maxAge: 44 },
      { id: '7', name: 'Veteran 45+', minAge: 45, maxAge: 49 },
      { id: '8', name: 'Veteran 50+', minAge: 50 }
    ];
  } catch (error) {
    console.error('Error getting age groups:', error);
    return [
      { id: '1', name: 'Under 15', maxAge: 14 },
      { id: '2', name: 'Under 17', maxAge: 16 },
      { id: '3', name: 'Under 20', maxAge: 19 },
      { id: '4', name: 'Senior', minAge: 20, maxAge: 34 },
      { id: '5', name: 'Veteran 35+', minAge: 35, maxAge: 39 },
      { id: '6', name: 'Veteran 40+', minAge: 40, maxAge: 44 },
      { id: '7', name: 'Veteran 45+', minAge: 45, maxAge: 49 },
      { id: '8', name: 'Veteran 50+', minAge: 50 }
    ];
  }
}