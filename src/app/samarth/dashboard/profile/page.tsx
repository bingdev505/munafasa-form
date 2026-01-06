
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getStudentData } from '@/app/actions/get-student-data';
import { notFound } from 'next/navigation';

export default async function ProfilePage() {
  const enrolmentNumber = "2107106328"; // Using a dummy enrolment number for now
  const studentData = await getStudentData(enrolmentNumber);

  if (!studentData) {
    return notFound();
  }

  return (
    <div className="grid gap-6">
      <Card className="shadow-md rounded-none">
        <CardHeader className="bg-gray-50 p-6">
          <div>
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
                    <p className="text-gray-800">{studentData.course || 'NA'}</p>
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
