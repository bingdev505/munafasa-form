"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useTransition } from "react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

import type { Form as FormType, FormField as FormFieldType } from "@/lib/definitions";
import { submitFormAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

type FormRendererProps = {
  form: FormType;
};

const generateSchema = (fields: FormFieldType[]) => {
  const schemaShape: { [key: string]: z.ZodType<any, any> } = {};

  fields.forEach((field) => {
    let fieldSchema: z.ZodType<any, any>;

    switch (field.type) {
      case "select":
        fieldSchema = z.string();
        break;
      case "number":
        fieldSchema = z.preprocess(
          (a) => parseInt(z.string().parse(a), 10),
          z.number().positive().min(0)
        );
        break;
      case "text":
      default:
        fieldSchema = z.string();
        break;
    }

    if (field.required) {
      fieldSchema = fieldSchema.refine(data => data !== null && data !== '' && data !== undefined, { message: `${field.label} is required.` });
    } else {
        fieldSchema = fieldSchema.optional().nullable();
    }
    
    schemaShape[field.name] = fieldSchema;
  });

  return z.object(schemaShape);
};

export default function FormRenderer({ form }: FormRendererProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const formSchema = generateSchema(form.fields);
  
  const formHook = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: form.fields.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {}),
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
        const result = await submitFormAction(form.id, values);
        if (result?.message) {
            toast({
                variant: "destructive",
                title: "Submission Error",
                description: result.message,
            });
        }
    });
  }

  return (
    <Form {...formHook}>
      <form onSubmit={formHook.handleSubmit(onSubmit)} className="space-y-8">
        {form.fields.map((field) => (
          <FormField
            key={field.id}
            control={formHook.control}
            name={field.name}
            render={({ field: renderField }) => (
              <FormItem>
                <FormLabel>{field.label}{field.required && ' *'}</FormLabel>
                <FormControl>
                  <>
                    {field.type === "text" && <Input placeholder={field.placeholder} {...renderField} />}
                    {field.type === "number" && <Input type="number" placeholder={field.placeholder} {...renderField} />}
                    {field.type === "select" && (
                       <Select onValueChange={renderField.onChange} defaultValue={renderField.value}>
                         <FormControl>
                           <SelectTrigger>
                             <SelectValue placeholder={field.placeholder} />
                           </SelectTrigger>
                         </FormControl>
                         <SelectContent>
                           {field.options?.map((option) => (
                             <SelectItem key={option} value={option}>
                               {option}
                             </SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                    )}
                  </>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit
        </Button>
      </form>
    </Form>
  );
}
