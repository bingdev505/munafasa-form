
'use server';

import { supabase } from '@/utils/supabaseClient';

export type StudentData = {
  name: string | null;
  course: string | null;
  profileUrl: string | null;
  hallTicketUrl: string | null;
  address: string | null;
  email: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  category: string | null;
  mobileNumber: string | null;
  correspondenceAddress: {
    line1: string | null;
    line2: string | null;
    line3: string | null;
    district: string | null;
    state: string | null;
    pincode: string | null;
    country: string | null;
  };
  permanentAddress: {
    line1: string | null;
    line2: string | null;
    line3: string | null;
    district: string | null;
    state: string | null;
    pincode: string | null;
    country: string | null;
  };
};

export async function getStudentData(enrolmentNumber: string): Promise<StudentData | null> {
  if (!enrolmentNumber) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('user2')
      .select(
        'student_name, course, profile_url, hallticket_url, address, email, phone, date_of_birth, category, mobile_number, correspondence_address_line1, correspondence_address_line2, correspondence_address_line3, correspondence_district, correspondence_state, correspondence_pincode, correspondence_country, permanent_address_line1, permanent_address_line2, permanent_address_line3, permanent_district, permanent_state, permanent_pincode, permanent_country'
      )
      .eq('enrolment_number', enrolmentNumber)
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
      email: data.email,
      phone: data.phone,
      dateOfBirth: data.date_of_birth,
      category: data.category,
      mobileNumber: data.mobile_number,
      correspondenceAddress: {
        line1: data.correspondence_address_line1,
        line2: data.correspondence_address_line2,
        line3: data.correspondence_address_line3,
        district: data.correspondence_district,
        state: data.correspondence_state,
        pincode: data.correspondence_pincode,
        country: data.correspondence_country,
      },
      permanentAddress: {
        line1: data.permanent_address_line1,
        line2: data.permanent_address_line2,
        line3: data.permanent_address_line3,
        district: data.permanent_district,
        state: data.permanent_state,
        pincode: data.permanent_pincode,
        country: data.permanent_country,
      },
    };
  } catch (e) {
    console.error('Unexpected error fetching student data:', e);
    return null;
  }
}
