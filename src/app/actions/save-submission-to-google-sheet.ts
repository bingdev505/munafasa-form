
"use server";

import { z } from "zod";

const SubmissionSchema = z.object({
  class: z.string(),
  student_id: z.string(),
  student_name: z.string(),
  number_of_males: z.number().optional(),
  number_of_females: z.number().optional(),
  reach_time: z.string().optional(),
});

export async function saveSubmissionToGoogleSheet(
  submissionData: z.infer<typeof SubmissionSchema>
) {
  console.log("Received submission data:", JSON.stringify(submissionData, null, 2));

  const parsedData = SubmissionSchema.safeParse(submissionData);

  if (!parsedData.success) {
    console.error("Invalid submission data:", parsedData.error.flatten());
    return {
      success: false,
      message: "Invalid data format provided.",
    };
  }

  const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;

  if (!scriptUrl) {
    console.error("Google Apps Script URL is not configured in .env");
    return {
      success: false,
      message: "Application is not configured for submissions.",
    };
  }

  try {
    const response = await fetch(scriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parsedData.data),
      redirect: "follow",
    });
    
    // Apps script response is not standard, so we read as text and parse manually
    const responseText = await response.text();
    const result = JSON.parse(responseText);

    if (result.success) {
      return { success: true, message: "Attendance submitted successfully!" };
    } else {
      console.error("Error from Google Apps Script:", result.error);
      return {
        success: false,
        message: `Submission failed: ${result.error || "Unknown error"}`,
      };
    }
  } catch (error) {
    console.error("Error calling Google Apps Script:", error);
    if (error instanceof Error) {
        return { success: false, message: `Submission failed: ${error.message}` };
    }
    return { success: false, message: "An unknown error occurred during submission." };
  }
}
