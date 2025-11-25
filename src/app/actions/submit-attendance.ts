"use server";

import { z } from "zod";
import { supabase } from "@/utils/supabaseClient";

const SubmissionSchema = z.object({
  student_id: z.string(),
  number_of_males: z.number().optional(),
  number_of_females: z.number().optional(),
  reach_time: z.string().optional(),
});

export async function submitAttendance(
  submissionData: z.infer<typeof SubmissionSchema>
) {
  const parsedData = SubmissionSchema.safeParse(submissionData);

  if (!parsedData.success) {
    console.error("Invalid submission data:", parsedData.error.flatten());
    return {
      success: false,
      message: "Invalid data format provided.",
    };
  }

  const { student_id, number_of_males, number_of_females, reach_time } = parsedData.data;

  try {
    const { error } = await supabase
      .from("attendance")
      .update({
        male: number_of_males,
        female: number_of_females,
        when_reach: reach_time,
      })
      .eq("id", student_id);

    if (error) {
      console.error("Error updating attendance:", error);
      return {
        success: false,
        message: `Submission failed: ${error.message}`,
      };
    }

    return { success: true, message: "Attendance submitted successfully!" };
  } catch (error) {
    console.error("Error during submission:", error);
    if (error instanceof Error) {
        return { success: false, message: `Submission failed: ${error.message}` };
    }
    return { success: false, message: "An unknown error occurred during submission." };
  }
}
