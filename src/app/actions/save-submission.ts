
'use server';

import { z } from 'zod';

const formSchema = z.object({
    class: z.string(),
    student_id: z.string(),
    student_name: z.string(),
    number_of_males: z.number(),
    number_of_females: z.number(),
    reach_time: z.string(),
});

type FormData = z.infer<typeof formSchema>;

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;

export async function saveSubmission(data: FormData): Promise<{ success: boolean; error?: string }> {
    if (!APPS_SCRIPT_URL) {
        return { success: false, error: 'Apps Script URL is not configured in environment variables.' };
    }

    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            // Use 'no-cors' if you face CORS issues, but a proper deployment handles this.
            // For Apps Script, we need to handle the redirect.
            redirect: 'follow', 
        });

        // Apps Script doPost returns a JSON response
        const result = await response.json();

        if (result.success) {
            return { success: true };
        } else {
            return { success: false, error: result.error || 'An unknown error occurred in Apps Script.' };
        }

    } catch (err: any) {
        console.error('Error calling Apps Script:', err);
        return { success: false, error: `Failed to call Apps Script: ${err.message}` };
    }
}
