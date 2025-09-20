import { createSupabaseAdmin } from '@/lib/supabase-server';
import { Event, AgeGroup } from '@/types';

export async function getAllEvents(): Promise<Event[]> {
  try {
    console.log('🔍 Fetching events from Supabase...');
    const supabase = createSupabaseAdmin();
    
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .eq('is_active', true)
      .order('list_position');

    if (error) {
      console.error('❌ Supabase events error:', error);
      throw error;
    }

    console.log('✅ Successfully fetched events:', events?.length || 0);
    
    // Transform to match our Event interface
    return (events || []).map(event => ({
      id: event.id,
      name: event.name,
      category: event.category || 'track'
    }));
  } catch (error) {
    console.error('💥 Error in getAllEvents:', error);
    // Return fallback events
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
    console.log('🔍 Fetching age groups from Supabase...');
    const supabase = createSupabaseAdmin();
    
    const { data: ageGroups, error } = await supabase
      .from('age_groups')
      .select('*')
      .eq('is_active', true)
      .order('list_position');

    if (error) {
      console.error('❌ Supabase age groups error:', error);
      throw error;
    }

    console.log('✅ Successfully fetched age groups:', ageGroups?.length || 0);
    
    // Transform to match our AgeGroup interface
    return (ageGroups || []).map(ageGroup => ({
      id: ageGroup.id,
      name: ageGroup.name,
      minAge: ageGroup.min_age,
      maxAge: ageGroup.max_age
    }));
  } catch (error) {
    console.error('💥 Error in getAllAgeGroups:', error);
    // Return fallback age groups
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