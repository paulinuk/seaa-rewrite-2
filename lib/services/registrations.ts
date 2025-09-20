import { executeQuery, getConnection } from '@/lib/database';
import { Registration, EventRegistration } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export async function createRegistration(
  userId: string,
  meetingId: string,
  events: Array<{
    eventId: string;
    ageGroupId: string;
    personalBest?: string;
    pbVenue?: string;
    pbDate?: string;
  }>
): Promise<Registration> {
  const connection = await getConnection();
  
  try {
    await connection.beginTransaction();
    
    const registrationId = uuidv4();
    const totalCost = events.length * 10; // £10 per event
    
    // Create main registration record
    const registrationQuery = `
      INSERT INTO registrations (id, user_id, meeting_id, total_cost, payment_status)
      VALUES (?, ?, ?, ?, 'pending')
    `;
    
    await connection.execute(registrationQuery, [registrationId, userId, meetingId, totalCost]);
    
    // Create event registration records
    for (const event of events) {
      const eventRegId = uuidv4();
      const eventRegQuery = `
        INSERT INTO event_registrations (id, registration_id, event_id, age_group_id, personal_best, pb_venue, pb_date, cost)
        VALUES (?, ?, ?, ?, ?, ?, ?, 10.00)
      `;
      
      await connection.execute(eventRegQuery, [
        eventRegId,
        registrationId,
        event.eventId,
        event.ageGroupId,
        event.personalBest || null,
        event.pbVenue || null,
        event.pbDate || null
      ]);
    }
    
    await connection.commit();
    
    // Return the created registration
    return {
      id: registrationId,
      userId,
      meetingId,
      events: events.map(e => ({
        eventId: e.eventId,
        ageGroupId: e.ageGroupId,
        personalBest: e.personalBest,
        pbVenue: e.pbVenue,
        pbDate: e.pbDate
      })),
      createdAt: new Date()
    };
    
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function getUserRegistrations(userId: string): Promise<Registration[]> {
  const query = `
    SELECT 
      r.id,
      r.user_id,
      r.meeting_id,
      r.total_cost,
      r.payment_status,
      r.created_at,
      er.event_id,
      er.age_group_id,
      er.personal_best,
      er.pb_venue,
      er.pb_date
    FROM registrations r
    LEFT JOIN event_registrations er ON r.id = er.registration_id
    WHERE r.user_id = ?
    ORDER BY r.created_at DESC
  `;
  
  const results = await executeQuery(query, [userId]) as any[];
  
  // Group results by registration
  const registrationMap = new Map<string, Registration>();
  
  results.forEach(row => {
    if (!registrationMap.has(row.id)) {
      registrationMap.set(row.id, {
        id: row.id,
        userId: row.user_id,
        meetingId: row.meeting_id,
        events: [],
        createdAt: row.created_at
      });
    }
    
    const registration = registrationMap.get(row.id)!;
    if (row.event_id) {
      registration.events.push({
        eventId: row.event_id,
        ageGroupId: row.age_group_id,
        personalBest: row.personal_best,
        pbVenue: row.pb_venue,
        pbDate: row.pb_date
      });
    }
  });
  
  return Array.from(registrationMap.values());
}