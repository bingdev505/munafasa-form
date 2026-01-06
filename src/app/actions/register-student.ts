
'use server';

import { z } from 'zod';
import { supabase } from '@/utils/supabaseClient';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const AddressSchema = z.object({
    line1: z.string().min(1, 'Address Line 1 is required'),
    line2: z.string().optional(),
    line3: z.string().optional(),
    district: z.string().min(1, 'District is required'),
    state: z.string().min(1, 'State is required'),
    pincode: z.string().min(1, 'Pincode is required'),
    country: z.string().min(1, 'Country is required'),
});

const RegistrationSchema = z.object({
  student_name: z.string().min(1, 'Student name is required'),
  course: z.string().min(1, 'Course is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  category: z.string().min(1, 'Category is required'),
  mobile_number: z.string().min(1, 'Mobile number is required'),
  correspondence_address: AddressSchema,
  permanent_address: AddressSchema,
  profile_photo: z.string().optional(),
  enrolment_number: z.string().min(1, 'Enrolment number is required'),
});

export async function registerStudent(formData: FormData) {
  const data = Object.fromEntries(formData);
  
  const structuredData = {
    ...data,
    correspondence_address: {
        line1: data.correspondence_address_line1,
        line2: data.correspondence_address_line2,
        line3: data.correspondence_address_line3,
        district: data.correspondence_district,
        state: data.correspondence_state,
        pincode: data.correspondence_pincode,
        country: data.correspondence_country,
    },
    permanent_address: {
        line1: data.permanent_address_line1,
        line2: data.permanent_address_line2,
        line3: data.permanent_address_line3,
        district: data.permanent_district,
        state: data.permanent_state,
        pincode: data.permanent_pincode,
        country: data.permanent_country,
    }
  };

  const parsed = RegistrationSchema.safeParse(structuredData);

  if (!parsed.success) {
    console.error('Validation Error:', parsed.error.flatten());
    return { success: false, message: 'Invalid form data.', errors: parsed.error.flatten().fieldErrors };
  }
  
  const { profile_photo, ...studentData } = parsed.data;

  try {
    let profileUrl: string | null = null;
    if (profile_photo) {
      const uploadResult = await cloudinary.uploader.upload(profile_photo, {
        folder: 'student_profiles',
      });
      profileUrl = uploadResult.secure_url;
    }

    const { data: dbData, error } = await supabase
      .from('user2')
      .insert([
        {
          student_name: studentData.student_name,
          course: studentData.course,
          email: studentData.email,
          phone: studentData.phone,
          date_of_birth: studentData.date_of_birth,
          category: studentData.category,
          mobile_number: studentData.mobile_number,
          correspondence_address_line1: studentData.correspondence_address.line1,
          correspondence_address_line2: studentData.correspondence_address.line2,
          correspondence_address_line3: studentData.correspondence_address.line3,
          correspondence_district: studentData.correspondence_address.district,
          correspondence_state: studentData.correspondence_address.state,
          correspondence_pincode: studentData.correspondence_address.pincode,
          correspondence_country: studentData.correspondence_address.country,
          permanent_address_line1: studentData.permanent_address.line1,
          permanent_address_line2: studentData.permanent_address.line2,
          permanent_address_line3: studentData.permanent_address.line3,
          permanent_district: studentData.permanent_address.district,
          permanent_state: studentData.permanent_address.state,
          permanent_pincode: studentData.permanent_address.pincode,
          permanent_country: studentData.permanent_address.country,
          profile_url: profileUrl,
          enrolment_number: studentData.enrolment_number
        },
      ])
      .select();

    if (error) {
      console.error('Supabase Error:', error);
      return { success: false, message: `Database error: ${error.message}` };
    }

    return { success: true, message: 'Student registered successfully!', data: dbData };
  } catch (error) {
    console.error('Unexpected Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return { success: false, message: `An unexpected error occurred: ${errorMessage}` };
  }
}

