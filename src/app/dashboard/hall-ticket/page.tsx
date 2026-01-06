
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
import { getStudentData, StudentData } from '@/app/actions/get-student-data';
import { useSearchParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState, Suspense } from 'react';

function HallTicketContent() {
    const searchParams = useSearchParams();
    const enrolmentNumber = searchParams.get('enrolment_number');
    const [studentData, setStudentData] = useState<StudentData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchStudentData() {
            if (enrolmentNumber) {
                setIsLoading(true);
                const data = await getStudentData(enrolmentNumber);
                setStudentData(data);
                setIsLoading(false);
            } else {
                setIsLoading(false);
            }
        }
        fetchStudentData();
    }, [enrolmentNumber]);

    if (isLoading) {
        return <div className="flex h-screen w-full items-center justify-center">Loading hall ticket...</div>
    }
    
    if (!enrolmentNumber) {
        return notFound();
    }

    if (!studentData) {
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
                <CardTitle className="text-lg font-semibold">Examination Hall Admit Card</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border overflow-x-auto">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>S.No</TableHead>
                            <TableHead>Reference Number</TableHead>
                            <TableHead>Programme</TableHead>
                            <TableHead>Examination Session / Type</TableHead>
                            <TableHead>Enrolment Number</TableHead>
                            <TableHead>Term</TableHead>
                            <TableHead>Application Status</TableHead>
                            <TableHead className="text-center">Action</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        <TableRow>
                            <TableCell>1</TableCell>
                            <TableCell>97240</TableCell>
                            <TableCell>{studentData.course || 'ODL36914: MASTER OF BUSINESS ADMINISTRATION (FINANCE)'}</TableCell>
                            <TableCell>DECEMBER 2025 - SEMESTER</TableCell>
                            <TableCell>{enrolmentNumber}</TableCell>
                            <TableCell>4 SEMESTER</TableCell>
                            <TableCell>VERIFIED</TableCell>
                            <TableCell className="text-center">
                                <Button asChild size="sm" className="bg-green-600 hover:bg-green-700 rounded-none" disabled={!studentData.hallTicketUrl}>
                                    <Link href={studentData.hallTicketUrl || '#'} target="_blank" rel="noopener noreferrer">View</Link>
                                </Button>
                            </TableCell>
                        </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}

export default function HallTicketPage() {
    return (
        <Suspense fallback={<div>Loading hall ticket...</div>}>
            <HallTicketContent />
        </Suspense>
    )
}
