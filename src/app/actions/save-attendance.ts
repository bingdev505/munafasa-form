"use server";

import { supabase } from "@/utils/supabaseClient";

interface ImportedAttendance {
  name: string;
  class: string;
}

export async function saveImportedAttendance(data: ImportedAttendance[]) {
  const recordsToInsert = data.map(item => ({
    name: item.name,
    class: item.class
  }));

  const { error } = await supabase.from("attendance").insert(recordsToInsert);

  if (error) {
    console.error("Error saving imported attendance:", error);
    return { success: false, error: "Failed to import data." };
  }

  return { success: true, error: null };
}
