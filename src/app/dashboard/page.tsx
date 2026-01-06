
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
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
  const courseName = studentData?.course || 'Your Course';


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
