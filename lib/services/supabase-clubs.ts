import { createSupabaseAdmin } from '@/lib/supabase-server';

export async function getAllClubs() {
  try {
    console.log('🔍 Fetching clubs from Supabase...');
    const supabase = createSupabaseAdmin();
    
    const { data: clubs, error } = await supabase
      .from('clubs')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('❌ Supabase clubs error:', error);
      throw error;
    }

    console.log('✅ Successfully fetched clubs:', clubs?.length || 0);
    return clubs || [];
  } catch (error) {
    console.error('💥 Error in getAllClubs:', error);
    throw error;
  }
}

export async function searchClubs(query: string) {
  try {
    const supabase = createSupabaseAdmin();
    
    const { data: clubs, error } = await supabase
      .from('clubs')
      .select('*')
      .eq('is_active', true)
      .ilike('name', `%${query}%`)
      .order('name')
      .limit(20);

    if (error) {
      throw error;
    }

    return clubs || [];
  } catch (error) {
    console.error('Error searching clubs:', error);
    throw error;
  }
}