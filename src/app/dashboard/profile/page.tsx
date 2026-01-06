
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
import { Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProfilePageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

const DetailRow = ({ label, value }: { label: string, value: string | null | undefined }) => {
    if (!value) return null;
    return (
        <div>
            <p className="font-semibold text-gray-500 text-xs uppercase">{label}</p>
            <p className="text-gray-800">{value}</p>
        </div>
    )
};


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
        {/* Top Card for Profile Header */}
        <Card className="shadow-md rounded-none">
            <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                     <div className="relative h-20 w-20 overflow-hidden">
                        <Image
                            src={profileImageUrl}
                            alt="Student Profile Photo"
                            width={80}
                            height={80}
                            className="object-cover"
                            data-ai-hint="student photo"
                        />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">{studentData.name || 'N/A'}</h2>
                </div>
                <div className="space-y-2 text-sm text-center sm:text-right">
                    {studentData.phone && (
                        <div className="flex items-center gap-2 justify-center sm:justify-end">
                            <Phone className="h-5 w-5 text-blue-500" />
                            <span>{studentData.phone}</span>
                        </div>
                    )}
                    {studentData.email && (
                        <div className="flex items-center gap-2 justify-center sm:justify-end">
                            <Mail className="h-5 w-5 text-blue-500" />
                            <span>{studentData.email}</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
      
        {/* Bottom Card for Enrolled Courses */}
        <Card className="shadow-md rounded-none">
            <CardHeader>
                <CardTitle className="text-lg font-semibold">Enrolled Courses</CardTitle>
            </CardHeader>
            <CardContent>
                <Card className="rounded-none border-2">
                    <CardContent className="p-4">
                        <h3 className="font-semibold text-md">{studentData.course || 'N/A'}</h3>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 gap-4">
                            <p className="text-sm text-muted-foreground">
                                ENROLMENT NUMBER: {enrolmentNumber}
                            </p>
                            <Button variant="outline" size="sm" className="rounded-none w-full sm:w-auto">
                                CLICK HERE
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </CardContent>
      </Card>

      {/* Personal Details Card */}
      <Card className="shadow-md rounded-none">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Personal Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <DetailRow label="Full Name" value={studentData.name} />
            <DetailRow label="Date of Birth" value={studentData.dateOfBirth} />
            <DetailRow label="Category" value={studentData.category} />
            <DetailRow label="Mobile Number" value={studentData.mobileNumber} />
            <DetailRow label="Applicant's Email" value={studentData.email} />
        </CardContent>
      </Card>

      {/* Address Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Correspondence Address Card */}
            <Card className="shadow-md rounded-none">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Correspondence Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <DetailRow label="Address Line 1" value={studentData.correspondenceAddress.line1} />
                    <DetailRow label="Address Line 2" value={studentData.correspondenceAddress.line2} />
                    <DetailRow label="Address Line 3" value={studentData.correspondenceAddress.line3} />
                    <DetailRow label="District" value={studentData.correspondenceAddress.district} />
                    <DetailRow label="State, Pincode" value={`${studentData.correspondenceAddress.state || ''}, ${studentData.correspondenceAddress.pincode || ''}`} />
                    <DetailRow label="Country" value={studentData.correspondenceAddress.country} />
                </CardContent>
            </Card>

            {/* Permanent Address Card */}
            <Card className="shadow-md rounded-none">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Permanent Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <DetailRow label="Address Line 1" value={studentData.permanentAddress.line1} />
                    <DetailRow label="Address Line 2" value={studentData.permanentAddress.line2} />
                    <DetailRow label="Address Line 3" value={studentData.permanentAddress.line3} />
                    <DetailRow label="District" value={studentData.permanentAddress.district} />
                    <DetailRow label="State, Pincode" value={`${studentData.permanentAddress.state || ''}, ${studentData.permanentAddress.pincode || ''}`} />
                    <DetailRow label="Country" value={studentData.permanentAddress.country} />
                </CardContent>
            </Card>
      </div>
    </div>
  );
}
