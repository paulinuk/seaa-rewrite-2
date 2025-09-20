import { createSupabaseAdmin } from '@/lib/supabase-server';
import { Registration } from '@/types';

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
): Promise<Registration | null> {
  try {
    console.log('🔍 Creating registration in Supabase...');
    const supabase = createSupabaseAdmin();
    
    const totalCost = events.length * 10; // £10 per event
    
    // Create main registration record
    const { data: registration, error: regError } = await supabase
      .from('registrations')
      .insert({
        user_id: userId,
        meeting_id: meetingId,
        total_cost: totalCost,
        payment_status: 'pending'
      })
      .select()
      .single();

    if (regError) {
      console.error('❌ Registration creation error:', regError);
      throw regError;
    }

    // Create event registration records
    const eventRegistrations = events.map(event => ({
      registration_id: registration.id,
      event_id: event.eventId,
      age_group_id: event.ageGroupId,
      personal_best: event.personalBest || null,
      pb_venue: event.pbVenue || null,
      pb_date: event.pbDate || null,
      cost: 10.00
    }));

    const { error: eventError } = await supabase
      .from('registration_events')
      .insert(eventRegistrations);

    if (eventError) {
      console.error('❌ Event registration error:', eventError);
      throw eventError;
    }

    console.log('✅ Successfully created registration:', registration.id);
    
    // Return the created registration
    return {
      id: registration.id,
      userId,
      meetingId,
      events: events.map(e => ({
        eventId: e.eventId,
        ageGroupId: e.ageGroupId,
        personalBest: e.personalBest,
        pbVenue: e.pbVenue,
        pbDate: e.pbDate
      })),
      createdAt: new Date(registration.created_at)
    };
  } catch (error) {
    console.error('💥 Error in createRegistration:', error);
    return null;
  }
}

export async function getUserRegistrations(userId: string): Promise<Registration[]> {
  try {
    console.log('🔍 Fetching user registrations from Supabase...');
    const supabase = createSupabaseAdmin();
    
    const { data: registrations, error } = await supabase
      .from('registrations')
      .select(`
        *,
        registration_events (
          *,
          events (name),
          age_groups (name)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ User registrations error:', error);
      throw error;
    }

    console.log('✅ Successfully fetched registrations:', registrations?.length || 0);
    
    // Transform to match our Registration interface
    return (registrations || []).map(reg => ({
      id: reg.id,
      userId: reg.user_id,
      meetingId: reg.meeting_id,
      events: (reg.registration_events || []).map((event: any) => ({
        eventId: event.event_id,
        ageGroupId: event.age_group_id,
        personalBest: event.personal_best,
        pbVenue: event.pb_venue,
        pbDate: event.pb_date
      })),
      createdAt: new Date(reg.created_at)
    }));
  } catch (error) {
    console.error('💥 Error in getUserRegistrations:', error);
    return [];
  }
}