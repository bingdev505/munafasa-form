
"use server";

import { supabase } from "@/utils/supabaseClient";

export type FamilyData = {
  id?: number;
  student_id: string;
  mother_name?: string;
  father_name?: string;
  grandmother_name?: string;
  grandfather_name?: string;
  brother_name?: string;
  sister_name?: string;
  others?: { relationship: string; name: string; }[];
};

type DbFamilyData = Omit<FamilyData, 'student_id'> & {
    student_id: number | string;
}

export async function getFamilyData(studentId: string): Promise<FamilyData | null> {
  const { data: dbData, error } = await supabase
    .from("family")
    .select("id, student_id, mother_name, father_name, grandmother_name, grandfather_name, brother_name, sister_name, others")
    .eq("student_id", studentId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116: "object not found"
    console.error("Error fetching family data:", error);
    return null;
  }

  if (!dbData) {
      return null;
  }

  // Ensure student_id is a string
  const { student_id, ...rest } = dbData as DbFamilyData;
  const data: FamilyData = {
      ...rest,
      student_id: String(student_id),
  };

  return data;
}
