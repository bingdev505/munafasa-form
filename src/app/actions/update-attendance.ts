
"use server";

import { z } from "zod";
import { supabase } from "@/utils/supabaseClient";

const UpdateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  class: z.string().min(1, "Class is required"),
  male: z.coerce.number().optional(),
  female: z.coerce.number().optional(),
  when_reach: z.string().optional(),
});

export async function updateAttendance(
  id: number,
  updateData: z.infer<typeof UpdateSchema>
) {
  const parsedData = UpdateSchema.safeParse(updateData);

  if (!parsedData.success) {
    console.error("Invalid update data:", parsedData.error.flatten());
    return {
      success: false,
      message: "Invalid data format provided.",
    };
  }

  const { name, "class": className, male, female, when_reach } = parsedData.data;

  try {
    const { error } = await supabase
      .from("attendance")
      .update({
        name,
        class: className,
        male,
        female,
        when_reach,
      })
      .eq("id", id);

    if (error) {
      console.error("Error updating attendance:", error);
      return {
        success: false,
        message: `Update failed: ${error.message}`,
      };
    }

    return { success: true, message: "Attendance updated successfully!" };
  } catch (error) {
    console.error("Error during update:", error);
    if (error instanceof Error) {
        return { success: false, message: `Update failed: ${error.message}` };
    }
    return { success: false, message: "An unknown error occurred during update." };
  }
}

    