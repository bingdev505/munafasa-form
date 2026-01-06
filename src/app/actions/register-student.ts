'use server';

import { z } from 'zod';
import { supabase } from '@/utils/supabaseClient';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary for any server-side actions if needed in the future
// Note: For client-side uploads, this config is not used.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
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

const FormSchema = z.object({
  student_name: z.string().min(1, 'Student name is required'),
  course: z.string().min(1, 'Course is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  category: z.string().min(1, 'Category is required'),
  mobile_number: z.string().min(1, 'Mobile number is required'),
  enrolment_number: z.string().min(1, 'Enrolment number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  correspondence_address: AddressSchema,
  permanent_address: AddressSchema,
  profile_url: z.string().url().optional().or(z.literal('')),
  hall_ticket_url: z.string().url().optional().or(z.literal('')),
});


export async function registerStudent(
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  
  // Extract and parse stringified JSON for nested objects
  const correspondenceAddress = JSON.parse(formData.get('correspondence_address') as string);
  const permanentAddress = JSON.parse(formData.get('permanent_address') as string);
  
  // Construct the data object for validation
  const dataToValidate = {
    student_name: formData.get('student_name'),
    course: formData.get('course'),
    email: formData.get('email'),
    phone: formData.get('phone') || undefined,
    date_of_birth: formData.get('date_of_birth'),
    category: formData.get('category'),
    mobile_number: formData.get('mobile_number'),
    enrolment_number: formData.get('enrolment_number'),
    password: formData.get('password'),
    correspondence_address: correspondenceAddress,
    permanent_address: permanentAddress,
    profile_url: formData.get('profile_url') || '',
    hall_ticket_url: formData.get('hall_ticket_url') || '',
  };


  const parsedData = FormSchema.safeParse(dataToValidate);
  
  if (!parsedData.success) {
    console.error('Validation Error:', parsedData.error.flatten());
    return {
      success: false,
      message:
        'Invalid form data. ' +
        Object.values(parsedData.error.flatten().fieldErrors).flat().join(', '),
    };
  }

  const {
    student_name,
    course,
    email,
    phone,
    date_of_birth,
    category,
    mobile_number,
    enrolment_number,
    password,
    profile_url,
    hall_ticket_url,
  } = parsedData.data;

  try {
    // Prepare data for Supabase insertion
    const dbData = {
      student_name,
      course,
      email,
      phone,
      date_of_birth,
      category,
      mobile_number,
      enrolment_number,
      password, // Note: Storing passwords in plain text is not secure for production. Use an auth provider.
      profile_url: profile_url || null,
      hallticket_url: hall_ticket_url || null,
      correspondence_address_line1: correspondenceAddress.line1,
      correspondence_address_line2: correspondenceAddress.line2,
      correspondence_address_line3: correspondenceAddress.line3,
      correspondence_district: correspondenceAddress.district,
      correspondence_state: correspondenceAddress.state,
      correspondence_pincode: correspondenceAddress.pincode,
      correspondence_country: correspondenceAddress.country,
      permanent_address_line1: permanentAddress.line1,
      permanent_address_line2: permanentAddress.line2,
      permanent_address_line3: permanentAddress.line3,
      permanent_district: permanentAddress.district,
      permanent_state: permanentAddress.state,
      permanent_pincode: permanentAddress.pincode,
      permanent_country: permanentAddress.country,
    };

    const { error } = await supabase.from('user2').insert(dbData);

    if (error) {
      console.error('Supabase insert error:', error);
      // Check for unique constraint violation
      if (error.code === '23505') {
           return { success: false, message: `Registration failed: An account with this enrolment number or email already exists.` };
      }
      return { success: false, message: `Registration failed: ${error.message}` };
    }

    return { success: true, message: 'Registration successful!' };
  } catch (error) {
    console.error('Unexpected error in registerStudent:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, message: `An unexpected error occurred: ${errorMessage}` };
  }
}
