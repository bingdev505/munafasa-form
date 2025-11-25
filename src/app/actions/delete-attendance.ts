
"use server";

import { supabase } from "@/utils/supabaseClient";

export async function deleteAttendance(id: number) {
  try {
    const { error } = await supabase.from("attendance").delete().eq("id", id);

    if (error) {
      console.error("Error deleting attendance:", error);
      return {
        success: false,
        message: `Deletion failed: ${error.message}`,
      };
    }

    return { success: true, message: "Record deleted successfully!" };
  } catch (error) {
    console.error("Error during deletion:", error);
     if (error instanceof Error) {
        return { success: false, message: `Deletion failed: ${error.message}` };
    }
    return { success: false, message: "An unknown error occurred during deletion." };
  }
}

    