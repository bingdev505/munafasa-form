
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Download, User, BookOpen } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// Mock data - in a real app, this would come from your database
const studentData = {
  name: 'Rakesh Sharma',
  course: 'Bachelor of Computer Applications (BCA)',
  profileUrl: 'https://picsum.photos/seed/student-profile/200/200',
  hallTicketUrl: '#', // Placeholder link
};

export default function DashboardPage() {
  return (
    <div className="grid gap-6">
      <Card className="shadow-md rounded-none">
        <CardHeader className="flex flex-col items-center space-y-4 bg-gray-50 p-6 text-center md:flex-row md:space-y-0 md:text-left">
          <Image
            src={studentData.profileUrl}
            alt="Student Profile"
            width={120}
            height={120}
            data-ai-hint="profile person"
            className="border-4 border-white shadow-lg"
          />
          <div className="md:ml-6">
            <CardTitle className="text-2xl font-bold text-gray-800">
              {studentData.name}
            </CardTitle>
            <CardDescription className="text-md text-gray-600">
              {studentData.course}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <h3 className="mb-4 text-lg font-semibold">Quick Actions</h3>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 sm:w-auto rounded-none">
              <Link href={studentData.hallTicketUrl}>
                <Download className="mr-2 h-4 w-4" />
                Download Hall Ticket
              </Link>
            </Button>
             <Button asChild variant="outline" className="w-full sm:w-auto rounded-none">
                <Link href="#">
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
