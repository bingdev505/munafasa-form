
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getStudentData } from '@/app/actions/get-student-data';
import Image from 'next/image';
import { notFound } from 'next/navigation';

interface ProfilePageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const enrolmentNumber = searchParams.enrolment_number as string;

  if (!enrolmentNumber) {
    return notFound();
  }

  const studentData = await getStudentData(enrolmentNumber);

  if (!studentData) {
    return (
        <div className="grid gap-6">
            <Card className="shadow-md rounded-none">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-800">
                Student Not Found
                </CardTitle>
                <CardDescription className="text-md text-gray-600">
                We could not find a profile for the provided enrolment number.
                </CardDescription>
            </CardHeader>
            </Card>
        </div>
    );
  }

  const profileImageUrl = studentData.profileUrl || "https://picsum.photos/seed/1/120/120";

  return (
    <div className="grid gap-6">
      <Card className="shadow-md rounded-none">
        <CardHeader className="flex flex-col items-center space-y-4 bg-gray-50 p-6 text-center md:flex-row md:space-y-0 md:text-left">
          <Image
            src={profileImageUrl}
            alt="Student Profile"
            width={120}
            height={120}
            data-ai-hint="profile person"
            className="border-4 border-white shadow-lg rounded-full"
          />
          <div className="md:ml-6">
            <CardTitle className="text-2xl font-bold text-gray-800">
              {studentData.name || 'N/A'}
            </CardTitle>
            <CardDescription className="text-md text-gray-600">
              {studentData.course || 'N/A'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-6">
            <h3 className="mb-4 text-lg font-semibold border-b pb-2">Student Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                    <p className="font-semibold text-gray-500">Student Name</p>
                    <p className="text-gray-800">{studentData.name || 'N/A'}</p>
                </div>
                 <div>
                    <p className="font-semibold text-gray-500">Enrolment Number</p>
                    <p className="text-gray-800">{enrolmentNumber}</p>
                </div>
                <div>
                    <p className="font-semibold text-gray-500">Course</p>
                    <p className="text-gray-800">{studentData.course || 'N/A'}</p>
                </div>
                 <div className="md:col-span-2">
                    <p className="font-semibold text-gray-500">Address</p>
                    <p className="text-gray-800 whitespace-pre-wrap">{studentData.address || 'N/A'}</p>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
