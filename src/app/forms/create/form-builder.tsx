"use client";

import { useState, useTransition, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  PlusCircle,
  Trash2,
  Wand2,
  Loader2,
  CheckCircle,
  Share2,
  Copy,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
import { generateFormFields } from "@/ai/flows/generate-form-fields";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formFieldSchema = z.object({
  label: z.string().min(1, "Label is required"),
  name: z.string(),
  type: z.enum(["text", "textarea", "multiple-choice", "date", "email"]),
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

function SuccessAlert({ formId }: { formId: string }) {
    const { toast } = useToast();
    const shareUrl = `${window.location.origin}/forms/${formId}`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareUrl);
        toast({ title: "Copied!", description: "Shareable link copied to clipboard." });
    };

    return (
        <Alert className="mb-6 bg-accent">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Form Created Successfully!</AlertTitle>
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <p>Your new form is live. Share it using the link below.</p>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
                <Input readOnly value={shareUrl} className="bg-background h-8" />
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={copyToClipboard}><Copy className="h-4 w-4" /></Button>
            </div>
          </AlertDescription>
        </Alert>
    );
}


export default function FormBuilder() {
  const [isPending, startTransition] = useTransition();
  const [isAiLoading, setIsAiLoading] = useState(false);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const showSuccess = searchParams.get('success') === 'true';
  const formId = searchParams.get('formId');

  const form = useForm<FormBuilderValues>({
    resolver: zodResolver(formBuilderSchema),
    defaultValues: {
      title: "",
      description: "",
      fields: [],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "fields",
  });

  const watchTitle = form.watch("title");

  const addField = (type: FieldType) => {
    const newFieldLabel = `New ${type.replace("-", " ")} field`;
    append({
      label: newFieldLabel,
      name: `new_${type}_field_${fields.length}`,
      type: type,
      required: true,
      options: type === "multiple-choice" ? ["Option 1", "Option 2"] : [],
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
  
  const handleSuggestFields = async () => {
    if (!watchTitle) {
      toast({ variant: "destructive", title: "Please enter a form title first." });
      return;
    }
    setIsAiLoading(true);
    try {
      const result = await generateFormFields({ formTitle: watchTitle });
      const newFields = result.suggestedFields.map((fieldLabel) => ({
        label: fieldLabel.charAt(0).toUpperCase() + fieldLabel.slice(1),
        name: fieldLabel.toLowerCase().replace(/\s+/g, '_'),
        type: fieldLabel.toLowerCase().includes('email') ? 'email' : 'text',
        required: true,
        placeholder: `Enter ${fieldLabel}...`,
        options: []
      }));
      append(newFields as any);
      toast({ title: "AI Suggestions Added", description: `We've added ${newFields.length} suggested fields to your form.` });
    } catch (error) {
      console.error("AI suggestion failed", error);
      toast({ variant: "destructive", title: "AI Suggestion Failed" });
    }
    setIsAiLoading(false);
  };

  return (
    <>
    {showSuccess && formId && <SuccessAlert formId={formId} />}
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
                                        <SelectItem value="email">Email</SelectItem>
                                        <SelectItem value="textarea">Text Area</SelectItem>
                                        <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                                        <SelectItem value="date">Date</SelectItem>
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
                                        <FormDescription>{field.value ? "This field is required" : "This field is optional"}</FormDescription>
                                    </div>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>
            </CardContent>
          </Card>
        ))}

        <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={() => addField('text')}><PlusCircle className="mr-2 h-4 w-4"/>Add Field</Button>
             <Button type="button" onClick={handleSuggestFields} disabled={isAiLoading}>
                {isAiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Wand2 className="mr-2 h-4 w-4"/>}
                Suggest with AI
            </Button>
        </div>
        
        <Separator />

        <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Form
        </Button>
      </form>
    </Form>
    </>
  );
}
