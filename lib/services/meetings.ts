import { executeQuery, testConnection } from '@/lib/database';
import { Meeting, SerializedMeeting } from '@/types';

export async function getAllMeetings(): Promise<SerializedMeeting[]> {
  try {
    console.log('Fetching meetings from MariaDB database...');
    
    // Test connection first
    const connectionTest = await testConnection();
    if (!connectionTest) {
      console.log('Database connection failed, returning fallback data');
      return getFallbackMeetings();
    }
    
    const query = `
      SELECT 
        MeetingID as id,
        MeetingName as name,
        date as meetingDate,
        Venue as venue,
        AdditionalMeetingInfo as description,
        ClosingDate as closingDate
      FROM tblMeeting 
      WHERE (date LIKE '%2025%' OR date LIKE '%2026%')
      ORDER BY meetingDate
    `;
    
    const results = await executeQuery(query) as any[];
    console.log(`Retrieved ${results.length} meetings from database`);
    
    // Log the actual ClosingDate values to debug
    results.forEach(meeting => {
      console.log(`Meeting: ${meeting.name}, ClosingDate: "${meeting.closingDate}"`);
    });
    
    // Helper function to safely parse dates
    const parseDate = (dateValue: any): string => {
      if (!dateValue) return new Date().toISOString();
      
      // If it's already a Date object
      if (dateValue instanceof Date) {
        return isNaN(dateValue.getTime()) ? new Date().toISOString() : dateValue.toISOString();
      }
      
      // If it's a string, try to parse it
      if (typeof dateValue === 'string') {
        const parsed = new Date(dateValue);
        return isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
      }
      
      // Fallback to current date
      return new Date().toISOString();
    };
    
    return results.map(meeting => ({
      id: meeting.id.toString(),
      name: meeting.name || '',
      date: parseDate(meeting.meetingDate),
      venue: meeting.venue || '',
      description: meeting.description || '',
      closingDate: parseDate(meeting.closingDate),
       isOpen: Boolean(meeting.isOpen)
    }));
    
  } catch (error) {
    console.error('Error getting meetings:', error);
    console.log('Falling back to default meetings due to database error');
    return getFallbackMeetings();
  }
}

export async function getMeetingById(id: string): Promise<SerializedMeeting | null> {
  try {
    console.log(`Fetching meeting ${id} from MariaDB database...`);
    
    // Test connection first
    const connectionTest = await testConnection();
    if (!connectionTest) {
      console.log('Database connection failed, checking fallback data');
      const fallbackMeetings = getFallbackMeetings();
      return fallbackMeetings.find(m => m.id === id) || null;
    }
    
    const query = `
      SELECT 
        MeetingID as id,
        MeetingName as name,
        date as meetingDate,
        Venue as venue,
        AdditionalMeetingInfo as description,
        ClosingDate as closingDate
      FROM tblMeeting 
      WHERE MeetingID = ?
    `;
    
    const results = await executeQuery(query, [id]) as any[];
    
    if (results.length === 0) {
      console.log(`Meeting ${id} not found`);
      return null;
    }
    
    const meeting = results[0];
    console.log(`Retrieved meeting: ${meeting.name}`);
    console.log(`ClosingDate value: "${meeting.closingDate}"`);
    
    // Helper function to safely parse dates
    const parseDate = (dateValue: any): string => {
      if (!dateValue) return new Date().toISOString();
      
      // If it's already a Date object
      if (dateValue instanceof Date) {
        return isNaN(dateValue.getTime()) ? new Date().toISOString() : dateValue.toISOString();
      }
      
      // If it's a string, try to parse it
      if (typeof dateValue === 'string') {
        const parsed = new Date(dateValue);
        return isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
      }
      
      // Fallback to current date
      return new Date().toISOString();
    };
    
    return {
      id: meeting.id.toString(),
      name: meeting.name || '',
      date: parseDate(meeting.meetingDate),
      venue: meeting.venue || '',
      description: meeting.description || '',
      closingDate: parseDate(meeting.closingDate),
      isOpen: !String(meeting.closingDate || '').toLowerCase().includes('closed')
    };
    
  } catch (error) {
    console.error('Error getting meeting by ID:', error);
    // Try fallback data
    const fallbackMeetings = getFallbackMeetings();
    return fallbackMeetings.find(m => m.id === id) || null;
  }
}
// Fallback meetings data when database is unavailable
function getFallbackMeetings(): SerializedMeeting[] {
  return [
    {
      id: '1',
      name: 'Southern 6/4/3 Stage Road Relays 2025',
      date: new Date('2025-09-20T10:00:00').toISOString(),
      venue: 'Rushmoor Arena, Aldershot, Hants',
      description: 'Annual road relay championships',
      closingDate: new Date('2025-09-15T23:59:59').toISOString(),
      isOpen: true
    },
    {
      id: '2',
      name: 'SEAA Track & Field Championships',
      date: new Date('2025-07-15T10:00:00').toISOString(),
      venue: 'Bedford International Stadium',
      description: 'Regional track and field championships',
      closingDate: new Date('2025-12-31T23:59:59').toISOString(),
      isOpen: true
    },
    {
      id: '3',
      name: 'Southern Cross Country Championships',
      date: new Date('2025-02-22T10:00:00').toISOString(),
      venue: 'Parliament Hill, London',
      description: 'Cross country championships',
      closingDate: new Date('2025-02-15T23:59:59').toISOString(),
      isOpen: true
    }
  ];
}