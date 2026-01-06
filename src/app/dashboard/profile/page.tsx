
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Image from 'next/image';

// Mock data - in a real app, this would come from your database
const studentData = {
  name: 'Rakesh Sharma',
  course: 'Bachelor of Computer Applications (BCA)',
  profileUrl: 'https://picsum.photos/seed/student-profile/200/200',
  enrolmentNumber: '123456789',
  fatherName: 'Suresh Sharma',
  address: '123, ABC Colony, New Delhi, India'
};

export default function ProfilePage() {
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
            className="border-4 border-white shadow-lg rounded-full"
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
            <h3 className="mb-4 text-lg font-semibold border-b pb-2">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                    <p className="font-semibold text-gray-500">Enrolment Number</p>
                    <p className="text-gray-800">{studentData.enrolmentNumber}</p>
                </div>
                 <div>
                    <p className="font-semibold text-gray-500">Father's Name</p>
                    <p className="text-gray-800">{studentData.fatherName}</p>
                </div>
                 <div>
                    <p className="font-semibold text-gray-500">Address</p>
                    <p className="text-gray-800">{studentData.address}</p>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
