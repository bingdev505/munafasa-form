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

const formSchema = z.object({
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
});

export default function Home() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      class: "",
      student_name: "",
      number_of_males: 0,
      number_of_females: 0,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(() => {
        console.log("Form submitted:", values);
        toast({
            title: "Success!",
            description: "Your attendance has been recorded.",
        });
        form.reset();
    });
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-background">
        <div className="max-w-2xl mx-auto w-full p-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl font-bold">Meeting Attendance</CardTitle>
                    <CardDescription className="text-lg">Please select the class and student name, then indicate who will be attending.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                        <FormField
                            control={form.control}
                            name="number_of_males"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Number of Males *</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="Enter number of males" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
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
                                    <Input type="number" placeholder="Enter number of females" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit
                        </Button>
                    </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    </main>
  );
}
