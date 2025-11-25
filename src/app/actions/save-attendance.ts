'use server';

import { supabase } from '@/utils/supabaseClient';
import { z } from 'zod';

const FormSchema = z.object({
  name: z.string(),
  male: z.coerce.number(),
  female: z.coerce.number(),
  when_reach: z.string(),
});

export async function saveAttendance(formData: FormData) {
  const parsed = FormSchema.parse({
    name: formData.get('name'),
    male: formData.get('male'),
    female: formData.get('female'),
    when_reach: formData.get('when_reach'),
  });

  const { data, error } = await supabase.from('attendance').insert([
    {
      name: parsed.name,
      male: parsed.male,
      female: parsed.female,
      when_reach: parsed.when_reach,
    },
  ]);

  if (error) {
    console.error('Error inserting data:', error);
    return { success: false, error: error.message };
  }

  console.log('Data inserted successfully:', data);
  return { success: true };
}


const ImportedAttendanceSchema = z.array(z.object({
    name: z.string(),
    class: z.string(),
  }));
  

  export async function saveImportedAttendance(importedData: unknown) {
    const parsedData = ImportedAttendanceSchema.safeParse(importedData);
  
    if (!parsedData.success) {
        console.error("Validation error:", parsedData.error);
        return { success: false, error: "Invalid data format." };
    }

    const { data, error } = await supabase.from('attendance').insert(parsedData.data);
  
    if (error) {
      console.error('Error inserting imported data:', error);
      return { success: false, error: error.message };
    }
  
    console.log('Imported data inserted successfully:', data);
    return { success: true };
  }
  