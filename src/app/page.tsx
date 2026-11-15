'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import { GraduationCap, UserPlus, LogIn } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-gray-100 p-4">
      <Card className="w-full max-w-lg shadow-xl overflow-hidden">
        <div className="border-b-4 border-blue-600"></div>
        <CardHeader className="items-center text-center py-8">
          <div className="bg-blue-600 p-4 rounded-full mb-4">
            <GraduationCap className="h-12 w-12 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Student Portal
          </CardTitle>
          <CardDescription className="text-gray-600 mt-2">
            Welcome to the Student Registration & Management System
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <div className="space-y-4">
            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg">
              <Link href="/login" className="flex items-center justify-center gap-2">
                <LogIn className="h-5 w-5" />
                Login
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full h-12 text-lg border-green-600 text-green-600 hover:bg-green-50">
              <Link href="/registration/new" className="flex items-center justify-center gap-2">
                <UserPlus className="h-5 w-5" />
                New Registration
              </Link>
            </Button>
          </div>
          
          <div className="mt-8 pt-6 border-t text-center">
            <p className="text-sm text-gray-500">
              Need help? Contact your institution administrator.
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
