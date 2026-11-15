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
import { Users, ClipboardList, Settings } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-gray-100 p-4">
      <Card className="w-full max-w-lg shadow-xl overflow-hidden">
        <div className="border-b-4 border-blue-600"></div>
        <CardHeader className="items-center text-center py-8">
          <div className="bg-blue-600 p-4 rounded-full mb-4">
            <Users className="h-12 w-12 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Meeting Registration
          </CardTitle>
          <CardDescription className="text-gray-600 mt-2">
            Register your attendance and family members for the event
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <div className="space-y-4">
            <Button asChild className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg">
              <Link href="/attend" className="flex items-center justify-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Submit Attendance
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full h-12 text-lg border-blue-600 text-blue-600 hover:bg-blue-50">
              <Link href="/admin" className="flex items-center justify-center gap-2">
                <Settings className="h-5 w-5" />
                Admin Panel
              </Link>
            </Button>
          </div>
          
          <div className="mt-8 pt-6 border-t text-center">
            <p className="text-sm text-gray-500">
              For assistance, please contact the event organizer.
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
