
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from 'next/link';
import { getStudentData } from '@/app/actions/get-student-data';
import { useSearchParams, notFound } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const enrolmentNumber = searchParams.get('enrolment_number');
  const [courseName, setCourseName] = useState('Your Course');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStudentCourse() {
      if (enrolmentNumber) {
        const studentData = await getStudentData(enrolmentNumber);
        if (studentData?.course) {
          setCourseName(studentData.course);
        }
      }
      setIsLoading(false);
    }

    if (enrolmentNumber) {
      fetchStudentCourse();
    } else {
      setIsLoading(false);
    }
  }, [enrolmentNumber]);
  
  if (!enrolmentNumber) {
    return notFound();
  }

  if (isLoading) {
      return <div>Loading...</div>
  }

  return (
    <div className="grid gap-6">
      <Alert className="bg-primary text-primary-foreground border-primary rounded-none">
          <AlertTitle className="font-bold text-lg">Announcement:</AlertTitle>
          <AlertDescription>
            <Link href="#" className="underline hover:text-primary-foreground/80">
              Create/Link Your Academic Bank of Credits (ABC) Account
            </Link>
          </AlertDescription>
      </Alert>

      <Card className="rounded-none">
        <CardContent className="p-6">
            <h3 className="text-lg font-semibold">{courseName}</h3>
            <Button asChild variant="outline" className="mt-4 rounded-none">
                <Link href={`/dashboard/profile?enrolment_number=${enrolmentNumber}`}>CLICK HERE</Link>
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
