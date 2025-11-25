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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { getClassData, ClassData } from "@/app/actions/get-class-data";
import { saveSubmissionToGoogleSheet } from "@/app/actions/save-submission-to-google-sheet";

const FormSchema = z.object({
  class: z.string().min(1, "Class is required."),
  student: z.string().min(1, "Student name is required."),
  male: z.coerce.number().min(0),
  female: z.coerce.number().min(0),
  when_reach: z.string().min(1, "Reach time is required."),
});

type FormData = z.infer<typeof FormSchema>;

export default function AttendancePage() {
  const [classData, setClassData] = useState<ClassData>({});
  const [studentsInClass, setStudentsInClass] = useState<
    { id: string; name: string }[]
  >([]);
  const [isPending, setIsPending] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const selectedClass = form.watch("class");

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const data = await getClassData();
      setClassData(data);
      setIsLoading(false);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedClass && classData[selectedClass]) {
      setStudentsInClass(classData[selectedClass]);
      form.resetField("student", { defaultValue: "" });
    } else {
      setStudentsInClass([]);
    }
  }, [selectedClass, classData, form]);

  const onSubmit = async (data: FormData) => {
    setIsPending(true);
    setSubmissionStatus(null);

    const studentInfo =
      classData[data.class]?.find(
        (s) => s.id.toString() === data.student
      ) || null;

    if (!studentInfo) {
      setSubmissionStatus({
        success: false,
        message: "Could not find student details. Please try again.",
      });
      setIsPending(false);
      return;
    }

    const payload = {
      class: data.class,
      student_id: studentInfo.id,
      student_name: studentInfo.name,
      number_of_males: data.male,
      number_of_females: data.female,
      reach_time: data.when_reach,
    };

    const result = await saveSubmissionToGoogleSheet(payload);
    setSubmissionStatus(result);

    if (result.success) {
      form.reset();
      setStudentsInClass([]);
    }

    setIsPending(false);
  };

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
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
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
                    >
                      <SelectTrigger id="class">
                        <SelectValue placeholder="Select a class" />
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
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                      disabled={!selectedClass}
                    >
                      <SelectTrigger id="student">
                        <SelectValue placeholder="Select your name" />
                      </SelectTrigger>
                      <SelectContent>
                        {studentsInClass.map((student) => (
                          <SelectItem key={student.id} value={student.id.toString()}>
                            {student.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="female">Number of Females</Label>
                  <Input
                    id="female"
                    type="number"
                    min="0"
                    {...form.register("female")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="when_reach">When will you reach?</Label>
                <Input
                  id="when_reach"
                  type="time"
                  {...form.register("when_reach")}
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

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Go"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
