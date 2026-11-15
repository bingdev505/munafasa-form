'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Users, CheckCircle2 } from 'lucide-react';
import { getClassData, ClassData, Student } from '@/app/actions/get-class-data';
import { submitAttendance } from '@/app/actions/submit-attendance';

export default function PublicAttendancePage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [classData, setClassData] = useState<ClassData>({});
  
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [maleCount, setMaleCount] = useState<number>(0);
  const [femaleCount, setFemaleCount] = useState<number>(0);
  const [reachTime, setReachTime] = useState<string>('');

  useEffect(() => {
    async function fetchData() {
      const data = await getClassData();
      setClassData(data);
      setIsLoading(false);
    }
    fetchData();
  }, []);

  const classes = Object.keys(classData);
  const studentsInClass = selectedClass ? classData[selectedClass] || [] : [];

  const handleStudentSelect = (studentId: string) => {
    const student = studentsInClass.find(s => s.id === studentId);
    if (student) {
      setSelectedStudent(student);
      setMaleCount(student.male || 0);
      setFemaleCount(student.female || 0);
      setReachTime(student.when_reach || '');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStudent) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select your name from the list.',
      });
      return;
    }

    if (!reachTime) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select when you will reach.',
      });
      return;
    }

    setIsSubmitting(true);

    const result = await submitAttendance({
      student_id: selectedStudent.id,
      number_of_males: maleCount,
      number_of_females: femaleCount,
      reach_time: reachTime,
    });

    if (result.success) {
      setIsSubmitted(true);
      toast({
        title: 'Success!',
        description: 'Your attendance has been submitted.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: result.message,
      });
    }

    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-gray-100 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2">Loading...</span>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (isSubmitted) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-green-50 to-gray-100 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h2>
            <p className="text-gray-600 mb-6">Your attendance has been recorded successfully.</p>
            <Button onClick={() => {
              setIsSubmitted(false);
              setSelectedClass('');
              setSelectedStudent(null);
              setMaleCount(0);
              setFemaleCount(0);
              setReachTime('');
            }}>
              Submit Another
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-gray-100 p-4">
      <Card className="w-full max-w-md shadow-xl overflow-hidden">
        <div className="border-b-4 border-blue-600"></div>
        <CardHeader className="items-center text-center py-6">
          <div className="bg-blue-600 p-3 rounded-full mb-3">
            <Users className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-xl font-bold text-gray-800">
            Meeting Attendance
          </CardTitle>
          <CardDescription className="text-gray-600">
            Please fill in your attendance details
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Select Class */}
            <div className="space-y-2">
              <Label htmlFor="class">Select Class/Group</Label>
              <Select value={selectedClass} onValueChange={(value) => {
                setSelectedClass(value);
                setSelectedStudent(null);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Select Name */}
            {selectedClass && (
              <div className="space-y-2">
                <Label htmlFor="name">Select Your Name</Label>
                <Select value={selectedStudent?.id || ''} onValueChange={handleStudentSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your name" />
                  </SelectTrigger>
                  <SelectContent>
                    {studentsInClass.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Attendance Details */}
            {selectedStudent && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="male">Number of Males</Label>
                    <Input
                      id="male"
                      type="number"
                      min="0"
                      value={maleCount}
                      onChange={(e) => setMaleCount(parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="female">Number of Females</Label>
                    <Input
                      id="female"
                      type="number"
                      min="0"
                      value={femaleCount}
                      onChange={(e) => setFemaleCount(parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reach">When will you reach?</Label>
                  <Select value={reachTime} onValueChange={setReachTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select arrival time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="29th">29th</SelectItem>
                      <SelectItem value="30th Nasta vendavar">30th (With Breakfast)</SelectItem>
                      <SelectItem value="30th Nasta vendathavar">30th (Without Breakfast)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-blue-50 p-3 rounded-md">
                  <p className="text-sm text-blue-800">
                    <strong>Total attending:</strong> {maleCount + femaleCount} people
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 h-12"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Attendance'
                  )}
                </Button>
              </>
            )}
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
