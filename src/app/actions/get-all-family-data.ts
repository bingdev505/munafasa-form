
"use server";

import { supabase } from "@/utils/supabaseClient";

export type FamilyMember = { 
  relationship: string; 
  name: string; 
};

export type FullFamilyData = {
  id: number; // This will be the family record ID if registered, or student ID if not.
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
  isRegistered: boolean;
};

export async function getAllFamilyData(): Promise<{ data: FullFamilyData[] | null; error: string | null; }> {
  try {
    // 1. Fetch all students from the attendance table. This is our master list.
    const { data: allStudents, error: attendanceError } = await supabase
      .from("attendance")
      .select("id, name, class, created_at")
      .order("name", { ascending: true });

    if (attendanceError) {
      console.error("Error fetching attendance data:", attendanceError);
      return { data: null, error: `Failed to fetch student list: ${attendanceError.message}` };
    }
    
    if (!allStudents) {
      return { data: [], error: null };
    }

    // 2. Fetch all family data to find out who is registered.
    const { data: familyData, error: familyError } = await supabase
      .from("family")
      .select("*");

    if (familyError) {
      console.error("Error fetching family data:", familyError);
      // We can continue, but registration status will be incomplete.
    }

    // 3. Create a map of registered students for quick lookup.
    const familyDataMap = new Map<string, typeof familyData[number]>();
    if (familyData) {
      familyData.forEach(familyRecord => {
        // Check if there is actual data entered.
        const isDataEntered = 
          familyRecord.mother_name || 
          familyRecord.father_name || 
          familyRecord.grandmother_name || 
          familyRecord.grandfather_name || 
          familyRecord.brother_name || 
          familyRecord.sister_name || 
          (familyRecord.others && familyRecord.others.length > 0 && familyRecord.others.some((o: any) => o.name));
        
        if (isDataEntered) {
          familyDataMap.set(String(familyRecord.student_id), familyRecord);
        }
      });
    }

    // 4. Combine the lists.
    const fullData: FullFamilyData[] = allStudents.map(student => {
      const studentIdStr = String(student.id);
      const familyRecord = familyDataMap.get(studentIdStr);

      if (familyRecord) {
        // Student is registered
        return {
          id: familyRecord.id,
          student_id: studentIdStr,
          student_name: student.name,
          student_class: student.class,
          mother_name: familyRecord.mother_name,
          father_name: familyRecord.father_name,
          grandmother_name: familyRecord.grandmother_name,
          grandfather_name: familyRecord.grandfather_name,
          brother_name: familyRecord.brother_name,
          sister_name: familyRecord.sister_name,
          others: familyRecord.others || [],
          created_at: familyRecord.created_at,
          isRegistered: true,
        };
      } else {
        // Student is not registered
        return {
          id: student.id, // Using student id as the key here
          student_id: studentIdStr,
          student_name: student.name,
          student_class: student.class,
          created_at: student.created_at,
          isRegistered: false,
        };
      }
    });

    // Sort so registered students appear first.
    fullData.sort((a, b) => (b.isRegistered ? 1 : 0) - (a.isRegistered ? 1 : 0) || a.student_name!.localeCompare(b.student_name!));

    return { data: fullData, error: null };

  } catch (error) {
    console.error("An unexpected error occurred:", error);
    if (error instanceof Error) {
        return { data: null, error: `An unexpected error occurred: ${error.message}` };
    }
    return { data: null, error: "An unknown error occurred." };
  }
}
