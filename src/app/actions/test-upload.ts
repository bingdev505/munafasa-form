'use server';

import { v2 as cloudinary } from 'cloudinary';

// Ensure Cloudinary is configured
if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  throw new Error('Cloudinary environment variables are not set.');
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary(
  file: File
): Promise<string | null> {
  if (!file) return null;

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'upload_test', resource_type: 'auto' },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(new Error('Upload to Cloudinary failed.'));
        } else if (result) {
          resolve(result.secure_url);
        } else {
          // This case should ideally not happen if there's no error
          reject(new Error('Cloudinary returned no result and no error.'));
        }
      }
    );

    const fileStream = file.stream();
    const reader = fileStream.getReader();

    reader.read().then(function processStream({ done, value }) {
        if (done) {
            stream.end();
            return;
        }
        stream.write(value);
        reader.read().then(processStream).catch(reject);
    }).catch(reject);
  });
}

export async function testUpload(
  formData: FormData
): Promise<{ success: boolean; message: string; url?: string }> {
  const file = formData.get('test_file') as File | null;

  if (!file || file.size === 0) {
    return { success: false, message: 'No file was selected for upload.' };
  }

  try {
    const fileUrl = await uploadToCloudinary(file);

    if (fileUrl) {
      return {
        success: true,
        message: 'File uploaded successfully!',
        url: fileUrl,
      };
    } else {
      throw new Error('File upload returned no URL.');
    }
  } catch (error) {
    console.error('Error in testUpload action:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, message: `Upload failed: ${errorMessage}` };
  }
}
