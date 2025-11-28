
"use server";

import { z } from "zod";
import { supabase } from "@/utils/supabaseClient";

const OtherFamilyMemberSchema = z.object({
  relationship: z.string().min(1, "Relationship is required"),
  name: z.string().min(1, "Name is required"),
});

const FamilySchema = z.object({
  student_id: z.string(),
  mother_name: z.string().optional(),
  father_name: z.string().optional(),
  grandmother_name: z.string().optional(),
  grandfather_name: z.string().optional(),
  brother_name: z.string().optional(),
  sister_name: z.string().optional(),
  others: z.array(OtherFamilyMemberSchema).optional(),
});

export type FamilyData = z.infer<typeof FamilySchema>;

export async function saveFamilyData(
  data: FamilyData,
  existingRecordId?: number
) {
  const parsedData = FamilySchema.safeParse(data);

  if (!parsedData.success) {
    console.error("Invalid family data:", parsedData.error.flatten());
    return {
      success: false,
      message: "Invalid data format provided.",
    };
  }

  const { student_id, mother_name, father_name, grandmother_name, grandfather_name, brother_name, sister_name, others } = parsedData.data;

  const recordToSave = {
      student_id,
      mother_name,
      father_name,
      grandmother_name,
      grandfather_name,
      brother_name,
      sister_name,
      others,
  };
  
  try {
    let error;
    if (existingRecordId) {
      // Update existing record
      const { error: updateError } = await supabase
        .from("family")
        .update(recordToSave)
        .eq("id", existingRecordId);
      error = updateError;
    } else {
      // Insert new record
      const { error: insertError } = await supabase
        .from("family")
        .insert(recordToSave);
      error = insertError;
    }
    
    if (error) {
      console.error("Error saving family data:", error);
      return {
        success: false,
        message: `Submission failed: ${error.message}`,
      };
    }

    return { success: true, message: "Family data saved successfully!" };

  } catch (error) {
    console.error("Error during submission:", error);
    if (error instanceof Error) {
      return { success: false, message: `Submission failed: ${error.message}` };
    }
    return { success: false, message: "An unknown error occurred." };
  }
}
