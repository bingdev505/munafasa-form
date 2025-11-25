'use server';

import { supabase } from '@/utils/supabaseClient';

export async function getAttendance() {
  const { data, error } = await supabase.from('attendance').select('*');

  if (error) {
    console.error('Error fetching attendance:', error);
    return { data: [], error: error.message };
  }

  return { data, error: null };
}
