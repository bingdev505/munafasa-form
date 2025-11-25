"use client";

import { useState, useTransition } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  PlusCircle,
  Trash2,
  Loader2,
} from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { createFormAction } from "@/app/actions";
import type { FormField as FormFieldType, FormFieldType as FieldType } from "@/lib/definitions";
import { useToast } from "@/hooks/use-toast";

const formFieldSchema = z.object({
  label: z.string().min(1, "Label is required"),
  name: z.string(),
  type: z.enum(["text", "textarea", "select", "number"]),
  required: z.boolean(),
  placeholder: z.string().optional(),
  options: z.array(z.string()).optional(),
});

const formBuilderSchema = z.object({
  title: z.string().min(1, "Form title is required"),
  description: z.string().optional(),
  fields: z.array(formFieldSchema),
});

type FormBuilderValues = z.infer<typeof formBuilderSchema>;


export default function FormBuilder() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<FormBuilderValues>({
    resolver: zodResolver(formBuilderSchema),
    defaultValues: {
      title: "Meeting Attendance",
      description: "Please select the class and student name, then indicate who will be attending.",
      fields: [
        { label: "Class", name: "class", type: "select", required: true, options: ["Mathematics", "Science", "History", "English"], placeholder: "Select a class" },
        { label: "Student Name", name: "student_name", type: "select", required: true, options: ["John Doe", "Jane Smith", "Peter Jones", "Mary Williams"], placeholder: "Select a student" },
        { label: "Number of Males", name: "number_of_males", type: "number", required: true, placeholder: "Enter number of males" },
        { label: "Number of Females", name: "number_of_females", type: "number", required: true, placeholder: "Enter number of females" },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "fields",
  });

  const addField = (type: FieldType) => {
    const newFieldLabel = `New ${type.replace("-", " ")} field`;
    append({
      label: newFieldLabel,
      name: `new_${type}_field_${fields.length}`,
      type: type,
      required: true,
      options: type === "select" ? ["Option 1", "Option 2"] : [],
    });
  };

  const onSubmit = (data: FormBuilderValues) => {
    const processedData = {
        ...data,
        fields: data.fields.map(f => ({
            ...f,
            id: crypto.randomUUID(),
            name: f.label.toLowerCase().replace(/\s+/g, '_').replace(/[^\w]/g, ''),
        }))
    }
    startTransition(async () => {
      const result = await createFormAction(processedData as any);
      if (result?.message) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message,
        });
      }
    });
  };

  return (
    <>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Form Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Customer Feedback Survey" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Form Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="A short description of what this form is for." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {fields.map((field, index) => (
          <Card key={field.id}>
            <CardHeader className="flex flex-row items-center justify-between">
                <p className="font-semibold">{form.getValues(`fields.${index}.label`)}</p>
                <Button variant="ghost" size="icon" onClick={() => remove(index)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                <FormField
                    control={form.control}
                    name={`fields.${index}.label`}
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Field Label</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name={`fields.${index}.placeholder`}
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Placeholder</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name={`fields.${index}.type`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Field Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="text">Text</SelectItem>
                                        <SelectItem value="number">Number</SelectItem>
                                        <SelectItem value="textarea">Text Area</SelectItem>
                                        <SelectItem value="select">Select</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name={`fields.${index}.required`}
                        render={({ field }) => (
                            <FormItem className="flex flex-col justify-center">
                                <FormLabel>Required</FormLabel>
                                <FormControl>
                                    <div className="flex items-center space-x-2 h-10">
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </div>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>
                 {form.watch(`fields.${index}.type`) === 'select' && (
                  <FormField
                    control={form.control}
                    name={`fields.${index}.options`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Options (comma-separated)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                            onChange={(e) => field.onChange(e.target.value.split(',').map(s => s.trim()))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
            </CardContent>
          </Card>
        ))}

        <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={() => addField('text')}><PlusCircle className="mr-2 h-4 w-4"/>Add Field</Button>
        </div>
        
        <Separator />

        <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Form
        </Button>
      </form>
    </Form>
    </>
  );
}
