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
// Assumes your data is on a sheet named 'Sheet1'. Change if necessary.
const SHEET_NAME = 'Sheet1';

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

export async function updateSheet(data: FormData): Promise<{ success: boolean; error?: string }> {
    if (!SPREADSHEET_ID) {
        return { success: false, error: 'Google Sheet ID is not configured.' };
    }

    try {
        const sheets = await getGoogleSheetsClient();

        // 1. Find the row for the given student ID.
        const idColumnValues = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:A`,
        });

        const allIds = idColumnValues.data.values?.flat() ?? [];
        // Ensure we do a string comparison as sheet values can be numbers
        const rowIndex = allIds.findIndex(id => String(id) === String(data.student_id)) + 1;

        if (rowIndex === 0) {
            return { success: false, error: `Student with ID ${data.student_id} not found.` };
        }

        // 2. Update the specific row with the new data.
        // Assuming your columns are: A:ID, B:Classes, C:Students, D:Males, E:Females, F:Reach Time
        // We will update the range D:F for the found row.
        const updateRange = `${SHEET_NAME}!D${rowIndex}:F${rowIndex}`;
        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: updateRange,
            valueInputOption: 'RAW',
            requestBody: {
                values: [
                    [
                        data.number_of_males,
                        data.number_of_females,
                        data.reach_time,
                    ],
                ],
            },
        });

        return { success: true };
    } catch (err: any) {
        console.error('Error updating Google Sheet:', err);
        if (err.code === 403) {
            return { success: false, error: `Permission denied. Please make sure the service account with email ${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL} has "Editor" permissions on the Google Sheet.` };
        }
        return { success: false, error: `Failed to update sheet: ${err.message}` };
    }
}
