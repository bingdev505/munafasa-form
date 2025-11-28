
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
  CardFooter,
} from "@/components/ui/card";
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
import { getClassData, ClassData, Student } from "@/app/actions/get-class-data";
import { getFamilyData, FamilyData } from "@/app/actions/get-family-data";
import { saveFamilyData } from "@/app/actions/save-family-data";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

const FormSchema = z.object({
  student_id: z.string().min(1, "Student is required."),
  mother_name: z.string().optional(),
  father_name: z.string().optional(),
  grandmother_name: z.string().optional(),
  grandfather_name: z.string().optional(),
  brother_name: z.string().optional(),
  sister_name: z.string().optional(),
});

type FormData = z.infer<typeof FormSchema>;

export default function RegistrationPage() {
  const [classData, setClassData] = useState<ClassData>({});
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [existingRecordId, setExistingRecordId] = useState<number | undefined>();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      student_id: "",
      mother_name: "",
      father_name: "",
      grandmother_name: "",
      grandfather_name: "",
      brother_name: "",
      sister_name: "",
    },
  });

  const selectedStudentId = form.watch("student_id");

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      const data = await getClassData();
      setClassData(data);
      const students = Object.values(data).flat();
      setAllStudents(students);
      setIsLoading(false);
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchAndSetFamilyData = async (studentId: string) => {
        const student = allStudents.find(s => s.id === studentId);
        setSelectedStudent(student || null);
        
        setIsPending(true);
        const familyData = await getFamilyData(studentId);
        if (familyData) {
            form.reset({
                student_id: familyData.student_id,
                mother_name: familyData.mother_name || "",
                father_name: familyData.father_name || "",
                grandmother_name: familyData.grandmother_name || "",
                grandfather_name: familyData.grandfather_name || "",
                brother_name: familyData.brother_name || "",
                sister_name: familyData.sister_name || "",
            });
            setExistingRecordId(familyData.id);
        } else {
            form.reset({
                student_id: studentId,
                mother_name: "",
                father_name: "",
                grandmother_name: "",
                grandfather_name: "",
                brother_name: "",
                sister_name: "",
            });
            setExistingRecordId(undefined);
        }
        setIsPending(false);
    };
    
    if (selectedStudentId) {
        fetchAndSetFamilyData(selectedStudentId);
    } else {
        setSelectedStudent(null);
        form.reset();
    }
  }, [selectedStudentId, allStudents, form]);


  const onSubmit = async (data: FormData) => {
    setIsPending(true);
    
    const result = await saveFamilyData(data, existingRecordId);

    if (result.success) {
      toast({ title: "Success", description: result.message });
      // Refetch data to get new record ID if it was an insert
      if (!existingRecordId) {
        const familyData = await getFamilyData(data.student_id);
        if (familyData) {
            setExistingRecordId(familyData.id);
        }
      }
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
    }

    setIsPending(false);
  };

  const getStudentClass = (studentId: string): string | undefined => {
    for (const className in classData) {
      if (classData[className].some(student => student.id === studentId)) {
        return className;
      }
    }
    return undefined;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-gray-50">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Family Registration</CardTitle>
          <CardDescription>
            Select a student and fill in their family details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="student">Student Name</Label>
               <Controller
                  name="student_id"
                  control={form.control}
                  render={({ field }) => (
                    <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={comboboxOpen}
                                className="w-full justify-between"
                                disabled={isLoading}
                            >
                                <span className="truncate">
                                {field.value
                                    ? allStudents.find((student) => student.id === field.value)?.name
                                    : "Select a student"}
                                </span>
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                           <Command>
                                <CommandInput placeholder="Search for a name..." />
                                <CommandList>
                                <CommandEmpty>No student found.</CommandEmpty>
                                <CommandGroup>
                                    {allStudents.map((student) => (
                                    <CommandItem
                                        key={student.id}
                                        value={student.name}
                                        onSelect={() => {
                                            form.setValue("student_id", student.id);
                                            setComboboxOpen(false);
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                field.value === student.id ? "opacity-100" : "opacity-0"
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
              {form.formState.errors.student_id && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.student_id.message}
                </p>
              )}
            </div>

            {selectedStudent && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm font-medium text-blue-800">
                        Class: <span className="font-normal">{getStudentClass(selectedStudent.id)}</span>
                    </p>
                </div>
            )}
            
            {selectedStudentId && (
                <div className="space-y-4 pt-4 border-t">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="father_name">Father&apos;s Name</Label>
                            <Input id="father_name" {...form.register("father_name")} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="mother_name">Mother&apos;s Name</Label>
                            <Input id="mother_name" {...form.register("mother_name")} />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="grandfather_name">Grandfather&apos;s Name</Label>
                            <Input id="grandfather_name" {...form.register("grandfather_name")} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="grandmother_name">Grandmother&apos;s Name</Label>
                            <Input id="grandmother_name" {...form.register("grandmother_name")} />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="brother_name">Brother&apos;s Name</Label>
                            <Input id="brother_name" {...form.register("brother_name")} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="sister_name">Sister&apos;s Name</Label>
                            <Input id="sister_name" {...form.register("sister_name")} />
                        </div>
                    </div>
                </div>
            )}


            <Button type="submit" className="w-full" disabled={isPending || !selectedStudentId}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                existingRecordId ? "Update Details" : "Save Details"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
            <Link href="/" passHref>
                <Button variant="link">Go to Attendance</Button>
            </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
