
"use server";

import { supabase } from "@/utils/supabaseClient";

export type AttendanceWithRegistration = {
  id: number;
  name: string;
  male: number | null;
  female: number | null;
  when_reach: string | null;
  class: string;
  created_at: string;
  isRegistered: boolean;
};

export async function getAttendance(): Promise<{ data: AttendanceWithRegistration[]; error: string | null; }> {
  try {
    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("Error fetching attendance:", error);
      return { data: [], error: "Failed to fetch attendance data." };
    }

    if (!data) {
      return { data: [], error: null };
    }

    const { data: familyData, error: familyError } = await supabase
      .from("family")
      .select("student_id, mother_name, father_name, grandmother_name, grandfather_name, brother_name, sister_name, others");
      
    if (familyError) {
      console.error("Error fetching family data for registration status:", familyError);
      // Proceed but status will be inaccurate
    }

    const registeredStudentIds = new Set<string>();
    if (familyData) {
      familyData.forEach(record => {
        const isDataEntered = 
          record.mother_name || 
          record.father_name || 
          record.grandmother_name || 
          record.grandfather_name || 
          record.brother_name || 
          record.sister_name || 
          (record.others && record.others.length > 0 && record.others.some((o: any) => o.name));

        if (isDataEntered) {
          registeredStudentIds.add(String(record.student_id));
        }
      });
    }

    const dataWithRegistration: AttendanceWithRegistration[] = data.map(att => ({
      ...att,
      isRegistered: registeredStudentIds.has(String(att.id)),
    }));
    
    return { data: dataWithRegistration, error: null };
  } catch (e) {
    const error = e as Error;
    console.error("Error in getAttendance:", error);
    return { data: [], error: `An unexpected error occurred: ${error.message}` };
  }
}
