
'use server';

import { supabase } from '@/utils/supabaseClient';

export type StudentData = {
  name: string | null;
  course: string | null;
  profileUrl: string | null;
  hallTicketUrl: string | null;
  address: string | null;
};

export async function getStudentData(enrolmentNumber: string): Promise<StudentData | null> {
  if (!enrolmentNumber) {
    return null;
  }

  try {
    // In a real app, you would have a unique identifier. We assume 'student_name' is being used as one for now.
    // Ideally this would be an 'enrolment_number' column. Let's use 'student_name' as a stand-in.
    const { data, error } = await supabase
      .from('user2')
      .select(
        'student_name, course, profile_url, hallticket_url, address'
      )
      .eq('student_name', enrolmentNumber) // Assuming the enrolment number is stored in the 'student_name' column for this example
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log(`No student found with enrolment number: ${enrolmentNumber}`);
        return null;
      }
      console.error('Error fetching student data:', error);
      return null;
    }

    if (!data) {
      console.log(`No student data found for enrolment number: ${enrolmentNumber}`);
      return null;
    }

    // Map database columns to our desired object keys
    return {
      name: data.student_name,
      course: data.course,
      profileUrl: data.profile_url,
      hallTicketUrl: data.hallticket_url,
      address: data.address,
    };
  } catch (e) {
    console.error('Unexpected error fetching student data:', e);
    return null;
  }
}
