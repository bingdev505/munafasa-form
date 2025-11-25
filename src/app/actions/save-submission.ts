'use server';

import { google } from 'googleapis';
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

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
// We'll save submissions to a new sheet named 'Submissions'
const SHEET_NAME = 'Submissions'; 

async function getGoogleSheetsClient() {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
        throw new Error('Google service account credentials are not set in the environment variables.');
    }

    const auth = new google.auth.JWT(
        process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        undefined,
        process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        ['https://www.googleapis.com/auth/spreadsheets']
    );

    return google.sheets({ version: 'v4', auth });
}

export async function saveSubmission(data: FormData): Promise<{ success: boolean; error?: string }> {
    if (!SPREADSHEET_ID) {
        return { success: false, error: 'Google Sheet ID is not configured.' };
    }

    try {
        const sheets = await getGoogleSheetsClient();

        const values = [
            [
                new Date().toISOString(), // Timestamp
                data.class,
                data.student_id,
                data.student_name,
                data.number_of_males,
                data.number_of_females,
                data.reach_time,
            ],
        ];

        // Append the new row to the 'Submissions' sheet
        const result = await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A1`, // Google Sheets appends after the last row of the table starting at A1
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: values,
            },
        });
        
        if (result.data.updates?.updatedCells && result.data.updates.updatedCells > 0) {
            return { success: true };
        } else {
            // This case can happen if the API call succeeds but reports no cells updated.
            return { success: false, error: 'The append operation was sent, but Google Sheets reported no cells were changed.' };
        }

    } catch (err: any) {
        console.error('Error saving to Google Sheet:', err);
        if (err.code === 403) {
            return { success: false, error: `Permission denied. Please make sure the service account email has "Editor" permissions on the Google Sheet.` };
        }
        if (err.message?.includes('Unable to parse range')) {
            // This error often means the 'Submissions' sheet does not exist.
            return { success: false, error: `Sheet named '${SHEET_NAME}' not found. Please create it in your Google Sheet.` };
        }
        return { success: false, error: `Failed to save to sheet: ${err.message}` };
    }
}
