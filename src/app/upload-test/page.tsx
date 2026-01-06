'use client';

import { useState } from 'react';
import { testUpload } from '@/app/actions/test-upload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function UploadTestPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; url?: string } | null>(null);
  const { toast } = useToast();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await testUpload(formData);
      setResult(response);
      
      if (response.success) {
        toast({
          title: 'Upload Successful',
          description: response.message,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Upload Failed',
          description: response.message,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected server error occurred.';
      setResult({ success: false, message: errorMessage });
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
    }

    setIsSubmitting(false);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Cloudinary Upload Test</CardTitle>
          <CardDescription>
            Select a file and click "Upload" to test the Cloudinary connection.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="test_file">File to Upload</Label>
              <Input id="test_file" name="test_file" type="file" required />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload'
              )}
            </Button>
          </form>

          {result && (
            <div className="mt-6 rounded-md border p-4">
              <h4 className="font-semibold">Result:</h4>
              <p className={result.success ? 'text-green-600' : 'text-red-600'}>
                {result.message}
              </p>
              {result.success && result.url && (
                <div className="mt-2 space-y-1">
                  <p className="text-sm font-medium">Uploaded URL:</p>
                  <Link href={result.url} target="_blank" rel="noopener noreferrer" className="break-all text-sm text-blue-600 hover:underline">
                    {result.url}
                  </Link>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
