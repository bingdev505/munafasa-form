
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

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md shadow-lg overflow-hidden">
        <div className="border-b-4 border-blue-600"></div>
        <CardHeader className="items-center text-center">
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
          <form className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="enrolment-number">Username</Label>
              <Input
                id="enrolment-number"
                placeholder="Enrolment Number"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Password" required />
            </div>
            
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              Login
            </Button>
            
            <div className="flex items-center justify-center space-x-4 mt-4">
              <Button asChild variant="default" className="bg-green-600 hover:bg-green-700">
                <Link href="#">New Registration</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="#">Reset Password</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
