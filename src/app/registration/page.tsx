
"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useForm, Controller, useFieldArray } from "react-hook-form";
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
import { Loader2, Check, ChevronsUpDown, PlusCircle, X } from "lucide-react";
import { getClassData, ClassData, Student } from "@/app/actions/get-class-data";
import { getFamilyData } from "@/app/actions/get-family-data";
import { saveFamilyData } from "@/app/actions/save-family-data";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

const OtherFamilyMemberSchema = z.object({
  relationship: z.string().min(1, "Relationship is required"),
  name: z.string().min(1, "Name is required"),
});

const FormSchema = z.object({
  student_id: z.string().min(1, "Student is required."),
  mother_name: z.string().optional(),
  father_name: z.string().optional(),
  grandmother_name: z.string().optional(),
  grandfather_name: z.string().optional(),
  brother_name: z.string().optional(),
  sister_name: z.string().optional(),
  others: z.array(OtherFamilyMemberSchema).optional(),
});

type FormData = z.infer<typeof FormSchema>;

function RegistrationPageContent() {
  const searchParams = useSearchParams();
  const studentIdFromQuery = searchParams.get("student_id");

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
      others: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "others",
  });

  const selectedStudentId = form.watch("student_id");

  const fetchInitialData = async () => {
    setIsLoading(true);
    const data = await getClassData();
    setClassData(data);
    const students = Object.values(data).flat();
    setAllStudents(students);
    setIsLoading(false);
    return students;
  };

  useEffect(() => {
    fetchInitialData().then((students) => {
      if (studentIdFromQuery) {
        const studentExists = students.some(s => s.id === studentIdFromQuery);
        if (studentExists) {
          form.setValue("student_id", studentIdFromQuery);
        }
      }
    });
  }, [studentIdFromQuery, form]);

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
                others: familyData.others || [],
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
                others: [],
            });
            setExistingRecordId(undefined);
        }
        setIsPending(false);
    };
    
    if (selectedStudentId) {
        fetchAndSetFamilyData(selectedStudentId);
    } else {
        setSelectedStudent(null);
        form.reset({
            student_id: "",
            mother_name: "",
            father_name: "",
            grandmother_name: "",
            grandfather_name: "",
            brother_name: "",
            sister_name: "",
            others: [],
        });
        setExistingRecordId(undefined);
    }
  }, [selectedStudentId, allStudents, form]);


  const onSubmit = async (data: FormData) => {
    setIsPending(true);
    
    const result = await saveFamilyData(data, existingRecordId);

    if (result.success) {
      toast({ title: "Success", description: result.message });
      // Refetch student data to update registration status
      await fetchInitialData();
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
                                <CommandList className="max-h-60">
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
                                        className="flex justify-between items-center"
                                    >
                                        <span>{student.name}</span>
                                        {student.isRegistered && (
                                            <Check
                                                className={cn("h-4 w-4 text-green-500")}
                                                title="Family registered"
                                            />
                                        )}
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
                    
                    <Separator />

                    <div>
                        <Label>Other Family Members</Label>
                        <div className="space-y-4 mt-2">
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex flex-col sm:flex-row items-start sm:items-end gap-2 p-3 border rounded-md bg-gray-50/50">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-grow w-full">
                                        <div className="space-y-1">
                                            <Label htmlFor={`others.${index}.relationship`} className="text-xs">Relationship</Label>
                                            <Input
                                                {...form.register(`others.${index}.relationship`)}
                                                placeholder="e.g. Uncle"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor={`others.${index}.name`} className="text-xs">Name</Label>
                                            <Input
                                                {...form.register(`others.${index}.name`)}
                                                placeholder="e.g. John Doe"
                                            />
                                        </div>
                                    </div>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="shrink-0 self-center sm:self-end">
                                        <X className="h-4 w-4 text-red-500"/>
                                    </Button>
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => append({ relationship: "", name: "" })}
                            >
                                <PlusCircle className="mr-2 h-4 w-4"/>
                                Add Other Family Member
                            </Button>
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
      </Card>
    </main>
  );
}

export default function RegistrationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegistrationPageContent />
    </Suspense>
  )
}
