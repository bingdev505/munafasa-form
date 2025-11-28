
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
};

export async function getFamilyData(studentId: string): Promise<FamilyData | null> {
  const { data, error } = await supabase
    .from("family")
    .select("*")
    .eq("student_id", studentId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116: "object not found"
    console.error("Error fetching family data:", error);
    return null;
  }

  return data;
}
