'use server';

import { google } from 'googleapis';

async function getGoogleSheetsClient() {
    // Ensure the environment variables are set.
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
        throw new Error('Google service account credentials are not set in the environment variables.');
    }
    
    // Authenticate with Google Sheets API.
    const auth = new google.auth.JWT(
        process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        undefined,
        // The private key needs to have newlines replaced to be read from the environment variable.
        process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        ['https://www.googleapis.com/auth/spreadsheets.readonly'] // Use readonly scope for a safe check
    );

    const authClient = await auth.getClient();
    return google.sheets({ version: 'v4', auth: authClient as any });
}

export async function checkSheetConnection(): Promise<{ success: boolean; error?: string }> {
    const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

    if (!SPREADSHEET_ID) {
        return { success: false, error: 'Google Sheet ID is not configured.' };
    }
    
    try {
        const sheets = await getGoogleSheetsClient();
        
        // Attempt to read a very small, non-existent range. This is a lightweight way
        // to check permissions and connectivity without fetching actual data.
        await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Sheet1!A1', // We just need to touch the sheet to see if we can.
        });

        return { success: true };
    } catch (err: any) {
        console.error('Error connecting to Google Sheet:', err);
        if(err.code === 403) {
            return { success: false, error: `Permission denied. Check service account access to the sheet.` };
        }
        if(err.code === 404) {
            return { success: false, error: `Sheet not found. Check your SPREADSHEET_ID.` };
        }
        return { success: false, error: `Connection failed: ${err.message}` };
    }
}
