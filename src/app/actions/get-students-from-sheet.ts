'use server';

import { google } from 'googleapis';
import { z } from 'zod';

const StudentSchema = z.object({
    id: z.string(),
    name: z.string(),
    class: z.string(),
});

export type Student = z.infer<typeof StudentSchema>;

// This is where you'll put your Google Sheet ID.
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
// Assumes your student data is on a sheet named 'Students'. Change if necessary.
const SHEET_NAME = 'Students'; 

async function getGoogleSheetsClient() {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
        throw new Error('Google service account credentials are not set in the environment variables.');
    }
    
    const auth = new google.auth.JWT(
        process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        undefined,
        process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        ['https://www.googleapis.com/auth/spreadsheets.readonly']
    );

    return google.sheets({ version: 'v4', auth });
}

export async function getStudentsFromSheet(): Promise<{ students: Student[]; classes: string[]; error?: string }> {
    if (!SPREADSHEET_ID) {
        return { students: [], classes: [], error: 'Google Sheet ID is not configured.' };
    }
    
    try {
        const sheets = await getGoogleSheetsClient();
        
        // Fetches columns A, B, and C. Assumes A=ID, B=Name, C=Class.
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A2:C`, // Starts from row 2 to skip header
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            return { students: [], classes: [], error: 'No students found in the sheet.' };
        }

        const students: Student[] = rows.map((row) => ({
            id: row[0],
            name: row[1],
            class: row[2],
        })).filter(s => s.id && s.name && s.class); // Filter out any empty rows

        const classes = [...new Set(students.map(s => s.class))].sort();

        return { students, classes };
    } catch (err: any) {
        console.error('Error fetching students from Google Sheet:', err);
         if(err.code === 403) {
            return { students: [], classes: [], error: `Permission denied. Check service account read access to the sheet.` };
        }
        if(err.code === 404) {
            return { students: [], classes: [], error: `Sheet or range not found. Check your SPREADSHEET_ID and SHEET_NAME ('${SHEET_NAME}').` };
        }
        return { students: [], classes: [], error: `Connection failed: ${err.message}` };
    }
}
