"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useTransition } from "react";

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
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { updateSheet } from "@/app/actions/update-sheet";

const formSchema = z.object({
    student_id: z.string().min(1, "Student ID is required."),
    class: z.string().min(1, "Class is required."),
    student_name: z.string().min(1, "Student name is required."),
    number_of_males: z.preprocess(
        (a) => parseInt(z.string().parse(a), 10),
        z.number().positive().min(0, "Number of males must be a positive number.")
    ),
    number_of_females: z.preprocess(
        (a) => parseInt(z.string().parse(a), 10),
        z.number().positive().min(0, "Number of females must be a positive number.")
    ),
    reach_time: z.string().min(1, "Arrival time is required."),
});

export default function Home() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      student_id: "",
      class: "",
      student_name: "",
      number_of_males: 0,
      number_of_females: 0,
      reach_time: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
        try {
            const result = await updateSheet(values);
            if (result.success) {
                toast({
                    title: "Success!",
                    description: "Your attendance has been recorded in the Google Sheet.",
                });
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

  return (
    <main className="flex items-center justify-center min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-lg shadow-2xl">
          <CardHeader>
              <CardTitle className="text-3xl font-bold tracking-tight">Meeting Attendance</CardTitle>
              <CardDescription className="text-muted-foreground">Please fill out the form to confirm your attendance.</CardDescription>
          </CardHeader>
          <CardContent>
              <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                      control={form.control}
                      name="student_id"
                      render={({ field }) => (
                          <FormItem>
                          <FormLabel>Student ID *</FormLabel>
                          <FormControl>
                              <Input placeholder="Enter your Student ID" {...field} />
                          </FormControl>
                          <FormMessage />
                          </FormItem>
                      )}
                  />
                  <FormField
                      control={form.control}
                      name="class"
                      render={({ field }) => (
                          <FormItem>
                          <FormLabel>Class *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                              <SelectTrigger>
                                  <SelectValue placeholder="Select a class" />
                              </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                                  <SelectItem value="Science">Science</SelectItem>
                                  <SelectItem value="History">History</SelectItem>
                                  <SelectItem value="English">English</SelectItem>
                              </SelectContent>
                          </Select>
                          <FormMessage />
                          </FormItem>
                      )}
                  />
                  <FormField
                      control={form.control}
                      name="student_name"
                      render={({ field }) => (
                          <FormItem>
                          <FormLabel>Student Name *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                              <SelectTrigger>
                                  <SelectValue placeholder="Select a student" />
                              </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                  <SelectItem value="John Doe">John Doe</SelectItem>
                                  <SelectItem value="Jane Smith">Jane Smith</SelectItem>
                                  <SelectItem value="Peter Jones">Peter Jones</SelectItem>
                                  <SelectItem value="Mary Williams">Mary Williams</SelectItem>
                              </SelectContent>
                          </Select>
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
                            <FormLabel>Number of Males *</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="0" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
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
                            <FormLabel>Number of Females *</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="0" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
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
                          <FormLabel>When will you reach? *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  <Button type="submit" disabled={isPending} className="w-full">
                      {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Submit
                  </Button>
              </form>
              </Form>
          </CardContent>
      </Card>
    </main>
  );
}
