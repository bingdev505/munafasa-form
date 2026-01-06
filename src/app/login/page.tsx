
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
import { getStudentData } from '@/app/actions/get-student-data';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.currentTarget);
    const enrolmentNumber = formData.get('enrolment-number') as string;
    
    if (enrolmentNumber) {
        const studentData = await getStudentData(enrolmentNumber);
        
        if (studentData) {
            // NOTE: We are not checking password, as per original logic.
            // In a real app, you would validate the password here.
            const destination = `/dashboard?enrolment_number=${enrolmentNumber}`;
            router.push(destination);
        } else {
            toast({
                variant: 'destructive',
                title: 'Login Failed',
                description: 'No student found with that enrolment number.',
            });
            setIsLoading(false);
        }
    } else {
        toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: 'Enrolment number is required.',
        });
        setIsLoading(false);
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
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 rounded-none" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      'Login'
                    )}
                </Button>
            </div>
            
            <div className="flex items-center justify-center space-x-4 mt-4">
              <Button asChild variant="default" className="bg-green-600 hover:bg-green-700 rounded-none">
                <Link href="/registration/new">New Registration</Link>
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
