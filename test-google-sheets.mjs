
import { google } from 'googleapis';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

async function testSheetConnection() {
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    const sheetId = process.env.GOOGLE_SHEET_ID;

    if (!serviceAccountEmail || !privateKey || !sheetId) {
        console.error('Error: Make sure GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, and GOOGLE_SHEET_ID are in your .env.local file.');
        return;
    }

    try {
        console.log('Authenticating with Google Sheets...');
        const auth = new google.auth.JWT(
            serviceAccountEmail,
            undefined,
            privateKey.replace(/\\n/g, '\n'), // Important: Format the private key
            ['https://www.googleapis.com/auth/spreadsheets']
        );

        const sheets = google.sheets({ version: 'v4', auth });

        console.log('Attempting to read from the sheet...');
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: 'Sheet1!A1', // A simple, safe range to test
        });

        console.log('Successfully connected to Google Sheets!');
        console.log('Data from A1:', response.data.values);

    } catch (error) {
        console.error('Failed to connect to Google Sheets:');
        if (error.code === 403) {
            console.error('Error 403: Permission denied. This is likely one of two issues:');
            console.error('1. The service account email does not have "Editor" access to the Google Sheet.');
            console.error('2. The Google Sheets API is not enabled in your Google Cloud project.');
        } else if (error.code === 404) {
            console.error('Error 404: Sheet not found. Please double-check your GOOGLE_SHEET_ID.');
        } else {
            console.error('An unexpected error occurred:', error.message);
        }
    }
}

testSheetConnection();
