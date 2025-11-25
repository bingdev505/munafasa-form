"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Check, ChevronsUpDown } from "lucide-react";
import { getClassData, ClassData } from "@/app/actions/get-class-data";
import { submitAttendance } from "@/app/actions/submit-attendance";
import { cn } from "@/lib/utils";
import Link from "next/link";

const FormSchema = z.object({
  class: z.string().min(1, "Class is required."),
  student: z.string().min(1, "Student name is required."),
  male: z.coerce.number().optional(),
  female: z.coerce.number().optional(),
  when_reach: z.string().optional(),
});

type FormData = z.infer<typeof FormSchema>;

type Student = { id: string; name: string, male?: number, female?: number, when_reach?: string };

const LOCAL_STORAGE_KEY = 'attendance_submitted_student_id';

export default function AttendancePage() {
  const [classData, setClassData] = useState<ClassData>({});
  const [studentsInClass, setStudentsInClass] = useState<Student[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [submittedStudentId, setSubmittedStudentId] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      class: "",
      student: "",
      male: 0,
      female: 0,
      when_reach: "",
    },
  });

  useEffect(() => {
    const storedStudentId = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedStudentId) {
      setSubmittedStudentId(storedStudentId);
    }
  }, []);

  const selectedClass = form.watch("class");
  const selectedStudentId = form.watch("student");

  const fetchClassData = async () => {
    setIsLoading(true);
    const data = await getClassData();
    setClassData(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchClassData();
  }, []);

  useEffect(() => {
    if (selectedClass && classData[selectedClass]) {
      setStudentsInClass(classData[selectedClass]);
      form.resetField("student", { defaultValue: "" });
    } else {
      setStudentsInClass([]);
    }
  }, [selectedClass, classData, form]);

  useEffect(() => {
    const student = studentsInClass.find(s => s.id === selectedStudentId);
    if (student) {
        const hasSubmitted = student.when_reach || student.male || student.female;
        if(hasSubmitted) {
            form.setValue("male", student.male || 0);
            form.setValue("female", student.female || 0);
            form.setValue("when_reach", student.when_reach || "");
            setIsEditing(true);
        } else {
            form.setValue("male", 0);
            form.setValue("female", 0);
            form.setValue("when_reach", "");
            setIsEditing(false);
        }
    } else {
        setIsEditing(false);
    }
  }, [selectedStudentId, studentsInClass, form]);

  const onSubmit = async (data: FormData) => {
    setIsPending(true);
    setSubmissionStatus(null);

    const payload = {
      student_id: data.student,
      number_of_males: data.male || 0,
      number_of_females: data.female || 0,
      reach_time: data.when_reach || "",
    };
    
    const result = await submitAttendance(payload);
    setSubmissionStatus(result);

    if (result.success) {
      localStorage.setItem(LOCAL_STORAGE_KEY, data.student);
      setSubmittedStudentId(data.student);
      await fetchClassData();
    }

    setIsPending(false);
  };
  
  const hasSubmitted = (student: Student) => {
      return student.when_reach || (student.male && student.male > 0) || (student.female && student.female > 0);
  }

  const handleResetDevice = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setSubmittedStudentId(null);
    setSubmissionStatus(null);
    form.reset();
  }

  if (submittedStudentId) {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 bg-gray-50">
            <Card className="w-full max-w-lg shadow-lg">
                <CardHeader>
                    <CardTitle>Attendance Submitted</CardTitle>
                    <CardDescription>
                        Your attendance has already been recorded from this device.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    <p>If you need to make changes, please contact an administrator.</p>
                    <Button onClick={handleResetDevice} variant="secondary">
                        Submit for Another Student
                    </Button>
                </CardContent>
            </Card>
        </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 bg-gray-50">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <CardTitle>Meeting Attendance</CardTitle>
          <CardDescription>
            Select your class and name to record your attendance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="class">Class</Label>
              <Controller
                name="class"
                control={form.control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="class">
                      <SelectValue placeholder={isLoading ? "Loading classes..." : "Select a class"} />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(classData).map((className) => (
                        <SelectItem key={className} value={className}>
                          {className}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.class && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.class.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="student">Name</Label>
               <Controller
                  name="student"
                  control={form.control}
                  render={({ field }) => (
                    <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={comboboxOpen}
                                className="w-full justify-between"
                                disabled={!selectedClass}
                            >
                                {field.value
                                    ? studentsInClass.find((student) => student.id.toString() === field.value)?.name
                                    : "Select your name"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                           <Command>
                                <CommandInput placeholder="Search for a name..." />
                                <CommandList>
                                <CommandEmpty>No student found.</CommandEmpty>
                                <CommandGroup>
                                    {studentsInClass.map((student) => (
                                    <CommandItem
                                        key={student.id}
                                        value={student.name}
                                        onSelect={() => {
                                            form.setValue("student", student.id.toString());
                                            setComboboxOpen(false);
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                hasSubmitted(student) ? "opacity-100 text-green-500" : "opacity-0",
                                                field.value === student.id.toString() && "opacity-100 text-green-500"
                                            )}
                                        />
                                        {student.name}
                                    </CommandItem>
                                    ))}
                                </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                  )}
                />
              {form.formState.errors.student && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.student.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="male">Number of Males</Label>
                <Input
                  id="male"
                  type="number"
                  min="0"
                  {...form.register("male")}
                />
                {form.formState.errors.male && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.male.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="female">Number of Females</Label>
                <Input
                  id="female"
                  type="number"
                  min="0"
                  {...form.register("female")}
                />
                {form.formState.errors.female && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.female.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="when_reach">When will you reach?</Label>
              <Controller
                name="when_reach"
                control={form.control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <SelectTrigger id="when_reach">
                      <SelectValue placeholder="Select a time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="29th">29th</SelectItem>
                      <SelectItem value="30th 9:00 am">30th 9:00 am</SelectItem>
                      <SelectItem value="30th 12:00 pm">30th 12:00 pm</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.when_reach && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.when_reach.message}
                </p>
              )}
            </div>

            {submissionStatus && (
              <div
                className={`rounded-md p-3 text-sm ${
                  submissionStatus.success
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {submissionStatus.message}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isPending || !selectedStudentId}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : isEditing ? (
                "Update Attendance"
              ) : (
                "Go"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
