"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useTransition, useMemo, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import { Check, ChevronsUpDown, Loader2, Circle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { updateSheet } from "@/app/actions/update-sheet";
import { checkSheetConnection } from "@/app/actions/check-sheet-connection";
import { getStudentsFromSheet, type Student } from "@/app/actions/get-students-from-sheet";
import { cn } from "@/lib/utils";


const formSchema = z.object({
    class: z.string().min(1, "Class is required."),
    // The value will be the student's ID now
    student_id: z.string().min(1, "Student name is required."),
    number_of_males: z.preprocess(
        (a) => (a === '' || a === undefined ? undefined : parseInt(z.string().parse(a), 10)),
        z.number().min(0).optional()
    ),
    number_of_females: z.preprocess(
        (a) => (a === '' || a === undefined ? undefined : parseInt(z.string().parse(a), 10)),
        z.number().min(0).optional()
    ),
    reach_time: z.string().optional(),
});

export default function Home() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [studentNamePopoverOpen, setStudentNamePopoverOpen] = useState(false);
  const [isAlreadySubmitted, setIsAlreadySubmitted] = useState(false);
  
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  const [connectionStatus, setConnectionStatus] = useState<{
    status: 'pending' | 'success' | 'error';
    message: string;
  }>({ status: 'pending', message: 'Checking Google Sheet connection...' });

  useEffect(() => {
    async function checkConnection() {
      const result = await checkSheetConnection();
      if (result.success) {
        setConnectionStatus({ status: 'success', message: 'Connected to Google Sheet' });
      } else {
        setConnectionStatus({ status: 'error', message: result.error || 'Failed to connect' });
      }
    }

    async function fetchStudentData() {
        setDataLoading(true);
        const { students, classes, error } = await getStudentsFromSheet();
        if (error) {
            setDataError(error);
        } else {
            setStudents(students);
            setClasses(classes);
        }
        setDataLoading(false);
    }
    
    checkConnection();
    fetchStudentData();
  }, []);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      class: "",
      student_id: "",
      reach_time: "",
    },
  });

  const selectedClass = form.watch("class");
  const selectedStudentId = form.watch("student_id");

  const filteredStudents = useMemo(() => {
    if (!selectedClass) return [];
    return students.filter((student) => student.class === selectedClass);
  }, [selectedClass, students]);

  // Check local storage when student selection changes
  useEffect(() => {
    if (selectedStudentId) {
      if (localStorage.getItem(`submitted_${selectedStudentId}`)) {
        setIsAlreadySubmitted(true);
      } else {
        setIsAlreadySubmitted(false);
      }
    } else {
      setIsAlreadySubmitted(false);
    }
  }, [selectedStudentId]);

  // Reset student_id when class changes
  const handleClassChange = (value: string) => {
    form.setValue("class", value);
    form.setValue("student_id", "");
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    const student = students.find(s => s.id === values.student_id);
    if (!student) {
        toast({
            variant: "destructive",
            title: "Invalid Student",
            description: "The selected student could not be found.",
        });
        return;
    }

    startTransition(async () => {
        try {
            const dataToSubmit = {
                student_id: student.id,
                student_name: student.name,
                class: student.class,
                number_of_males: values.number_of_males ?? 0,
                number_of_females: values.number_of_females ?? 0,
                reach_time: values.reach_time ?? "",
            };
            const result = await updateSheet(dataToSubmit);
            if (result.success) {
                toast({
                    title: "Success!",
                    description: "Your attendance has been recorded in the Google Sheet.",
                });
                // Save to local storage on success
                localStorage.setItem(`submitted_${student.id}`, 'true');
                setIsAlreadySubmitted(true);
                form.reset();
            } else {
                toast({
                    variant: "destructive",
                    title: "Uh oh! Something went wrong.",
                    description: result.error || "Could not save to Google Sheet.",
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: "An error occurred while updating the sheet.",
            });
        }
    });
  }

  const totalStudents = students.length;

  const StatusIndicator = () => (
    <div className="mb-4 flex items-center gap-2 rounded-lg border p-3 text-sm">
        {connectionStatus.status === 'pending' && <Loader2 className="h-4 w-4 animate-spin" />}
        {connectionStatus.status === 'success' && <Circle className="h-4 w-4 fill-green-500 text-green-500" />}
        {connectionStatus.status === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
        <span className={cn(
            connectionStatus.status === 'error' && 'text-red-500 font-medium',
            connectionStatus.status === 'success' && 'text-muted-foreground'
        )}>
            {connectionStatus.message}
        </span>
    </div>
  );

  return (
    <main className="flex items-center justify-center min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-lg shadow-2xl">
          <CardHeader>
              <CardTitle className="text-3xl font-bold tracking-tight">Meeting Attendance</CardTitle>
              <CardDescription className="text-muted-foreground">Please fill out the form to confirm your attendance.</CardDescription>
              {!dataLoading && !dataError && <p className="text-sm text-muted-foreground pt-2">Total Students: {totalStudents}</p>}
          </CardHeader>
          <CardContent>
              <StatusIndicator />
              {dataLoading && <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /> <span className="ml-2">Loading Student Data...</span></div>}
              {dataError && <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive"><AlertCircle className="inline-block h-4 w-4 mr-2"/>Failed to load student data: {dataError}</div>}

              {!dataLoading && !dataError && (
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="class"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Class *</FormLabel>
                            <Select onValueChange={handleClassChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a class" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {classes.map((c) => (
                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="student_id"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Student Name *</FormLabel>
                                <Popover open={studentNamePopoverOpen} onOpenChange={setStudentNamePopoverOpen}>
                                    <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                        variant="outline"
                                        role="combobox"
                                        className={cn(
                                            "w-full justify-between",
                                            !field.value && "text-muted-foreground"
                                        )}
                                        disabled={!selectedClass}
                                        >
                                        {field.value
                                            ? filteredStudents.find(
                                                (student) => student.id === field.value
                                            )?.name
                                            : "Select a student"}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search student..." />
                                        <CommandList>
                                            <CommandEmpty>No student found.</CommandEmpty>
                                            <CommandGroup>
                                            {filteredStudents.map((student) => (
                                                <CommandItem
                                                value={student.name}
                                                key={student.id}
                                                onSelect={() => {
                                                    form.setValue("student_id", student.id);
                                                    setStudentNamePopoverOpen(false);
                                                }}
                                                >
                                                <Check
                                                    className={cn(
                                                    "mr-2 h-4 w-4",
                                                    student.id === field.value
                                                        ? "opacity-100"
                                                        : "opacity-0"
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
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="number_of_males"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Number of Males</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="0" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : e.target.valueAsNumber)} value={field.value ?? ""} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="number_of_females"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Number of Females</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="0" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : e.target.valueAsNumber)} value={field.value ?? ""} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormField
                        control={form.control}
                        name="reach_time"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>When will you reach?</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value ?? ""}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a time" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="29th">29th</SelectItem>
                                    <SelectItem value="30th 9:00am">30th 9:00am</SelectItem>
                                    <SelectItem value="30th 12:00">30th 12:00</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={isPending || isAlreadySubmitted || connectionStatus.status !== 'success'} className="w-full">
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : isAlreadySubmitted ? (
                            "Submitted"
                        ) : (
                            "Submit"
                        )}
                    </Button>
                </form>
                </Form>
              )}
          </CardContent>
      </Card>
    </main>
  );
}

    