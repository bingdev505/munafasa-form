
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Download } from 'lucide-react';
import Link from 'next/link';
import { getStudentData } from '@/app/actions/get-student-data';

export default async function HallTicketPage() {
    const studentData = await getStudentData();

    if (!studentData || !studentData.hallTicketUrl) {
        return (
             <div className="grid gap-6">
              <Card className="shadow-md rounded-none">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-800">
                    Hall Ticket Not Available
                  </CardTitle>
                  <CardDescription className="text-md text-gray-600">
                    We could not find a hall ticket for your account. Please contact administration if you believe this is an error.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
        )
    }

  return (
    <div className="grid gap-6">
      <Card className="shadow-md rounded-none">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Exam Hall Ticket
          </CardTitle>
          <CardDescription className="text-md text-gray-600">
            Your hall ticket is ready. Please download it and bring a printed copy to the examination center.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-10 text-center bg-gray-50/50">
            <div className="mb-6">
                <Download className="h-16 w-16 text-blue-500" />
            </div>
            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 sm:w-auto rounded-none">
              <Link href={studentData.hallTicketUrl} target="_blank" rel="noopener noreferrer">
                <Download className="mr-2 h-4 w-4" />
                Download Now
              </Link>
            </Button>
            <p className="text-xs text-gray-500 mt-4">
                If you face any issues, please contact the administration office.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
