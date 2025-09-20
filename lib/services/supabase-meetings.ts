import { createSupabaseAdmin } from '@/lib/supabase-server';
import { SerializedMeeting } from '@/types';

export async function getAllMeetings(): Promise<SerializedMeeting[]> {
  try {
    console.log('🔍 Fetching meetings from Supabase...');
    const supabase = createSupabaseAdmin();
    
    const { data: meetings, error } = await supabase
      .from('meetings')
      .select('*')
      .eq('is_open', true)
      .order('meeting_date');

    if (error) {
      console.error('❌ Supabase meetings error:', error);
      throw error;
    }

    console.log('✅ Successfully fetched meetings:', meetings?.length || 0);
    
    // Transform to match our SerializedMeeting interface
    return (meetings || []).map(meeting => ({
      id: meeting.id,
      name: meeting.name,
      date: meeting.meeting_date,
      venue: meeting.venue || '',
      description: meeting.description || '',
      closingDate: meeting.closing_date,
      isOpen: meeting.is_open
    }));
  } catch (error) {
    console.error('💥 Error in getAllMeetings:', error);
    // Return fallback meetings
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
}

export async function getMeetingById(id: string): Promise<SerializedMeeting | null> {
  try {
    console.log(`🔍 Fetching meeting ${id} from Supabase...`);
    const supabase = createSupabaseAdmin();
    
    const { data: meeting, error } = await supabase
      .from('meetings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Supabase meeting error:', error);
      throw error;
    }

    if (!meeting) {
      console.log(`❌ Meeting ${id} not found`);
      return null;
    }

    console.log('✅ Successfully fetched meeting:', meeting.name);
    
    // Transform to match our SerializedMeeting interface
    return {
      id: meeting.id,
      name: meeting.name,
      date: meeting.meeting_date,
      venue: meeting.venue || '',
      description: meeting.description || '',
      closingDate: meeting.closing_date,
      isOpen: meeting.is_open
    };
  } catch (error) {
    console.error('💥 Error in getMeetingById:', error);
    // Try fallback data
    const fallbackMeetings = await getAllMeetings();
    return fallbackMeetings.find(m => m.id === id) || null;
  }
}