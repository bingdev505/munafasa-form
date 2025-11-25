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
import { Textarea } from "@/components/ui/textarea";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

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
      case "email":
        fieldSchema = z.string().email({ message: "Invalid email address." });
        break;
      case "date":
        fieldSchema = z.date();
        break;
      case "text":
      case "textarea":
      case "multiple-choice":
      default:
        fieldSchema = z.string();
        break;
    }

    if (field.required) {
      if(field.type === 'date') {
        fieldSchema = fieldSchema.refine(date => date !== null, { message: `${field.label} is required.` });
      } else {
        fieldSchema = (fieldSchema as z.ZodString).min(1, {
          message: `${field.label} is required.`,
        });
      }
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
    defaultValues: form.fields.reduce((acc, field) => ({ ...acc, [field.name]: undefined }), {}),
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
                    {field.type === "email" && <Input placeholder={field.placeholder} {...renderField} />}
                    {field.type === "textarea" && <Textarea placeholder={field.placeholder} {...renderField} />}
                    {field.type === "multiple-choice" && (
                      <RadioGroup
                        onValueChange={renderField.onChange}
                        defaultValue={renderField.value}
                        className="flex flex-col space-y-1"
                      >
                        {field.options?.map((option) => (
                          <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value={option} />
                            </FormControl>
                            <FormLabel className="font-normal">{option}</FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    )}
                    {field.type === "date" && (
                      <Popover>
                        <PopoverTrigger asChild>
                           <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !renderField.value && "text-muted-foreground"
                              )}
                            >
                              {renderField.value ? (
                                format(renderField.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                           </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={renderField.value}
                            onSelect={renderField.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
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
