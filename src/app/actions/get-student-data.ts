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

export async function getStudentData(): Promise<StudentData | null> {
  try {
    // Fetch the first student from the table to demonstrate functionality.
    // In a real app, you would identify the user based on their login session.
    const { data, error } = await supabase
      .from('user2')
      .select(
        'student_name, course, profile_url, enrolment_number, father_name, address, hallticket_url'
      )
      .limit(1);

    if (error) {
      console.error('Error fetching student data:', error);
      return null;
    }

    const student = data?.[0];

    if (!student) {
      return null;
    }

    // Map database columns to our desired object keys
    return {
      name: student.student_name,
      course: student.course,
      profileUrl: student.profile_url,
      enrolmentNumber: student.enrolment_number,
      fatherName: student.father_name,
      address: student.address,
      hallTicketUrl: student.hallticket_url,
    };
  } catch (e) {
    console.error('Unexpected error fetching student data:', e);
    return null;
  }
}
