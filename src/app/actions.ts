"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { FormField } from "@/lib/definitions";

const FormSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().optional(),
  fields: z.array(z.any()),
});

export async function createFormAction(formData: { title: string; description: string; fields: FormField[] }) {
  const validatedFields = FormSchema.safeParse(formData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Failed to create form.",
    };
  }
  
  const formId = validatedFields.data.title.toLowerCase().replace(/\s+/g, '-');

  revalidatePath("/");
  redirect(`/forms/${formId}`);
}


export async function submitFormAction(formId: string, formData: any) {
    try {
        console.log("Form submitted:", { formId, formData });
    } catch (error) {
        console.error("Submission error:", error);
        return {
            message: "An error occurred while submitting the form."
        }
    }

    redirect(`/forms/${formId}/success`);
}
