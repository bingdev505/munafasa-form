'use server';

import { google } from 'googleapis';
import { z } from 'zod';
import { students } from '@/app/lib/student-data';

const formSchema = z.object({
    class: z.string(),
    student_name: z.string(), // This is the student's name now, not the ID
    number_of_males: z.number(),
    number_of_females: z.number(),
    reach_time: z.string(),
});

type FormData = z.infer<typeof formSchema>;

// This is where you'll put your Google Sheet ID.
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID';
// This is the name of the sheet (tab) within your Google Sheet.
const SHEET_NAME = 'Sheet1'; 

async function getGoogleSheetsClient() {
    // This is where you'll configure your authentication.
    // For local development, you can use a service account key file.
    // For production on Google Cloud, Application Default Credentials will be used automatically.
    const auth = new google.auth.GoogleAuth({
        // You'll need to create credentials in Google Cloud Console and point to the key file.
        // e.g., keyFile: 'path/to/your/credentials.json'
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const authClient = await auth.getClient();
    return google.sheets({ version: 'v4', auth: authClient });
}

export async function updateSheet(data: FormData): Promise<{ success: boolean; error?: string }> {
    try {
        const sheets = await getGoogleSheetsClient();

        // Find the student's ID based on their name.
        const student = students.find(s => s.name === data.student_name);
        if (!student) {
            return { success: false, error: `Student "${data.student_name}" not found.` };
        }
        const studentId = student.id;
        
        // 1. Read the entire sheet to find the row with the matching ID.
        const getRowsResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:A`, // Assuming IDs are in column A
        });

        const rows = getRowsResponse.data.values;
        if (!rows || rows.length === 0) {
            return { success: false, error: 'Sheet is empty or could not be read.' };
        }

        // Find the row index that matches the student_id. +1 because sheets are 1-indexed.
        const rowIndex = rows.findIndex(row => row[0] === studentId) + 1;

        if (rowIndex === 0) { // findIndex returns -1 if not found, so it becomes 0 here.
            return { success: false, error: `Student ID "${studentId}" not found in the sheet.` };
        }

        // 2. Update the specific row with the new data.
        // Assuming your columns are in order: ID, Class, Name, Males, Females, Reach Time
        const updateRange = `${SHEET_NAME}!B${rowIndex}:F${rowIndex}`;
        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: updateRange,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [
                    [
                        data.class,
                        data.student_name,
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
        // Provide a more user-friendly error message
        return { success: false, error: `Failed to update sheet. Please check your configuration. Details: ${err.message}` };
    }
}
