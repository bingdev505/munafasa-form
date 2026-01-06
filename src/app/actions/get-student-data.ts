
'use server';

import { supabase } from '@/utils/supabaseClient';

export type StudentData = {
  name: string | null;
  course: string | null;
  profileUrl: string | null;
  enrolmentNumber: string | null;
  fatherName: string | null;
  address: string | null;
  hallTicketUrl: string | null;
};

// In a real app, you'd get the logged-in user's ID from a session.
// For now, we'll hardcode the enrolment number to fetch a specific student.
const MOCK_ENROLMENT_NUMBER = '123456789';

export async function getStudentData(): Promise<StudentData | null> {
  try {
    const { data, error } = await supabase
      .from('user2')
      .select(
        'student_name, course, profile_url, enrolment_number, father_name, address, hallticket_url'
      )
      .eq('enrolment_number', MOCK_ENROLMENT_NUMBER)
      .single();

    if (error) {
      console.error('Error fetching student data:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    // Map database columns to our desired object keys
    return {
      name: data.student_name,
      course: data.course,
      profileUrl: data.profile_url,
      enrolmentNumber: data.enrolment_number,
      fatherName: data.father_name,
      address: data.address,
      hallTicketUrl: data.hallticket_url,
    };
  } catch (e) {
    console.error('Unexpected error fetching student data:', e);
    return null;
  }
}
