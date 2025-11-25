"use server";

import { supabase } from "@/utils/supabaseClient";

export async function getAttendance() {
  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching attendance:", error);
    return { data: [], error: "Failed to fetch attendance data." };
  }

  return { data, error: null };
}
