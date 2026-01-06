
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Ticket, User, BookOpen } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from 'next/link';
import { getStudentData } from '@/app/actions/get-student-data';
import { notFound } from 'next/navigation';

interface DashboardPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const enrolmentNumber = searchParams.enrolment_number as string;
  
  if (!enrolmentNumber) {
    return notFound();
  }

  const studentData = await getStudentData(enrolmentNumber);
  const studentName = studentData?.name || 'Student';
  const courseName = studentData?.course || 'Your Course';


  return (
    <div className="grid gap-6">
      <Alert className="bg-primary text-primary-foreground border-primary rounded-none">
          <AlertTitle className="font-bold text-lg">Welcome, {studentName}!</AlertTitle>
          <AlertDescription>
            Here is your student dashboard. You can find all your information and quick actions here.
          </AlertDescription>
      </Alert>

      <Card className="rounded-none">
        <CardHeader>
           <CardTitle className="text-lg font-semibold">{courseName}</CardTitle>
           <CardDescription>Quick actions for your course.</CardDescription>
        </CardHeader>
        <CardContent>
             <div className="flex flex-col gap-4 sm:flex-row">
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 sm:w-auto rounded-none">
                <Link href={`/dashboard/hall-ticket?enrolment_number=${enrolmentNumber}`}>
                    <Ticket className="mr-2 h-4 w-4" />
                    View Hall Ticket
                </Link>
                </Button>
                <Button asChild variant="outline" className="w-full sm:w-auto rounded-none">
                    <Link href={`/dashboard/profile?enrolment_number=${enrolmentNumber}`}>
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
    </div>
  );
}
