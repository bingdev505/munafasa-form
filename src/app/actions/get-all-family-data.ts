
"use server";

import { supabase } from "@/utils/supabaseClient";

export type FamilyMember = { 
  relationship: string; 
  name: string; 
};

export type FullFamilyData = {
  id: number;
  student_id: string;
  student_name: string | null;
  student_class: string | null;
  mother_name?: string;
  father_name?: string;
  grandmother_name?: string;
  grandfather_name?: string;
  brother_name?: string;
  sister_name?: string;
  others?: FamilyMember[];
  created_at: string;
};

export async function getAllFamilyData(): Promise<{ data: FullFamilyData[] | null; error: string | null; }> {
  try {
    const { data: familyData, error: familyError } = await supabase
      .from("family")
      .select("*")
      .order("created_at", { ascending: false });

    if (familyError) {
      console.error("Error fetching family data:", familyError);
      return { data: null, error: `Failed to fetch family data: ${familyError.message}` };
    }
    
    if (!familyData) {
      return { data: [], error: null };
    }

    const studentIds = familyData.map(f => f.student_id);

    const { data: attendanceData, error: attendanceError } = await supabase
      .from("attendance")
      .select("id, name, class")
      .in("id", studentIds);

    if (attendanceError) {
      console.error("Error fetching attendance data for names:", attendanceError);
      // Proceed without names if this fails, but log the error
    }

    const studentInfoMap = new Map(
        attendanceData?.map(a => [String(a.id), { name: a.name, class: a.class }]) || []
    );

    const fullData: FullFamilyData[] = familyData.map(familyRecord => {
        const studentInfo = studentInfoMap.get(String(familyRecord.student_id));
        return {
            ...familyRecord,
            id: familyRecord.id,
            student_id: String(familyRecord.student_id),
            student_name: studentInfo?.name || `ID: ${familyRecord.student_id}`,
            student_class: studentInfo?.class || 'N/A',
            others: familyRecord.others || []
        };
    });

    return { data: fullData, error: null };

  } catch (error) {
    console.error("An unexpected error occurred:", error);
    if (error instanceof Error) {
        return { data: null, error: `An unexpected error occurred: ${error.message}` };
    }
    return { data: null, error: "An unknown error occurred." };
  }
}
