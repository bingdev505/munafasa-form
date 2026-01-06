'use client';

import { useState } from 'react';
import { CldUploadWidget, CldImage } from 'next-cloudinary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface UploadResultInfo {
  secure_url: string;
  public_id: string;
  resource_type: string;
}

export default function UploadTestPage() {
  const [uploadResult, setUploadResult] = useState<UploadResultInfo | null>(null);
  const { toast } = useToast();

  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Cloudinary Upload Test</CardTitle>
          <CardDescription>
            Click the button to use the Cloudinary Upload Widget. This tests the client-side upload functionality.
          </CardDescription>
           {!uploadPreset && (
            <CardDescription className="text-red-500 font-semibold pt-2">
                Warning: `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` is not set in your .env file. Please set it to your unsigned upload preset from Cloudinary.
            </CardDescription>
           )}
        </CardHeader>
        <CardContent>
          <CldUploadWidget
            uploadPreset={uploadPreset}
            onSuccess={(result) => {
              const info = result.info as UploadResultInfo;
              setUploadResult(info);
              toast({
                title: 'Upload Successful',
                description: 'Your file has been uploaded.',
              });
            }}
            onError={(error) => {
                toast({
                    variant: 'destructive',
                    title: 'Upload Failed',
                    description: `An error occurred: ${error.statusText}`,
                });
            }}
          >
            {({ open }) => {
              return (
                <Button onClick={() => open()} disabled={!uploadPreset} className="w-full">
                  Upload a File
                </Button>
              );
            }}
          </CldUploadWidget>

          {uploadResult && (
            <div className="mt-6 rounded-md border p-4">
              <h4 className="font-semibold">Last Upload Result:</h4>
              <div className="mt-4">
                {uploadResult.resource_type === 'image' && (
                  <div className="mb-4">
                    <p className="text-sm font-medium">Uploaded Image:</p>
                     <CldImage
                        width="300"
                        height="200"
                        src={uploadResult.public_id}
                        alt="Uploaded image"
                        className="mt-2 rounded-md"
                    />
                  </div>
                )}
                 {uploadResult.resource_type !== 'image' && (
                  <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-md">
                     <p className="font-bold">File uploaded successfully!</p>
                  </div>
                )}

                <p className="text-sm font-medium">Uploaded URL:</p>
                <Link href={uploadResult.secure_url} target="_blank" rel="noopener noreferrer" className="break-all text-sm text-blue-600 hover:underline">
                    {uploadResult.secure_url}
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
