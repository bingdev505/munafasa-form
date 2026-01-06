
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Ticket, User, BookOpen } from 'lucide-react';
import Link from 'next/link';

// Mock data - in a real app, this would come from your database
const studentData = {
  name: 'Rakesh Sharma',
};

export default function DashboardPage() {
  return (
    <div className="grid gap-6">
      <Card className="shadow-md rounded-none">
        <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-800">
              Welcome, {studentData.name}!
            </CardTitle>
            <CardDescription className="text-md text-gray-600">
              Here are some quick actions to get you started.
            </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <h3 className="mb-4 text-lg font-semibold">Quick Actions</h3>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 sm:w-auto rounded-none">
              <Link href="/dashboard/hall-ticket">
                <Ticket className="mr-2 h-4 w-4" />
                View Hall Ticket
              </Link>
            </Button>
             <Button asChild variant="outline" className="w-full sm:w-auto rounded-none">
                <Link href="/dashboard/profile">
                    <User className="mr-2 h-4 w-4" />
                    View Profile
                </Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto rounded-none">
                <Link href="#">
                    <BookOpen className="mr-2 h-4 w-4" />
                    My Courses
                </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      {/* You can add more dashboard widgets here */}
    </div>
  );
}
