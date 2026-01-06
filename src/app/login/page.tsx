
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { FormEvent } from 'react';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const enrolmentNumber = formData.get('enrolment-number') as string;
    
    if (enrolmentNumber) {
        router.push(`/dashboard?enrolment_number=${enrolmentNumber}`);
    } else {
        // Handle case where enrolment number is not entered
        // For now, we'll just log an error, but you might want to show a message to the user.
        console.error("Enrolment number is required.");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md shadow-lg overflow-hidden rounded-none">
        <div className="border-b-4 border-blue-600"></div>
        <CardHeader className="items-center text-center py-8">
          <Image
            src="/logo.png"
            alt="University Logo"
            width={200}
            height={60}
            data-ai-hint="university logo"
            className="mb-2"
          />
          <p className="font-semibold text-lg">Student Portal</p>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <div className="mb-6">
            <CardTitle className="text-xl">Sign In</CardTitle>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="enrolment-number">Username</Label>
              <Input
                id="enrolment-number"
                name="enrolment-number"
                placeholder="Enrolment Number"
                required
                className="rounded-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Password" required className="rounded-none" />
            </div>
            
            <div className="flex justify-center">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 rounded-none">
                    Login
                </Button>
            </div>
            
            <div className="flex items-center justify-center space-x-4 mt-4">
              <Button asChild variant="default" className="bg-green-600 hover:bg-green-700 rounded-none">
                <Link href="#">New Registration</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-none">
                <Link href="#">Reset Password</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
