"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createForm, addSubmission } from "@/lib/data";
import type { Form, FormField } from "@/lib/definitions";

const FormSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().optional(),
  fields: z.array(z.any()), // Not validating fields deeply here, trust client for now.
});

export async function createFormAction(formData: { title: string; description: string; fields: FormField[] }) {
  const validatedFields = FormSchema.safeParse(formData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Failed to create form.",
    };
  }
  
  let newForm: Form;
  try {
    newForm = await createForm(validatedFields.data);
  } catch (error) {
     return { message: 'Database Error: Failed to Create Form.' };
  }

  revalidatePath("/");
  redirect(`/forms/create?success=true&formId=${newForm.id}`);
}


export async function submitFormAction(formId: string, formData: any) {
    try {
        // Here you would typically validate the formData against the form's field definitions
        // For now, we'll just log it
        console.log("Form submitted:", { formId, formData });
        
        // This simulates saving to Google Sheets
        await addSubmission(formId, formData);

    } catch (error) {
        console.error("Submission error:", error);
        return {
            message: "An error occurred while submitting the form."
        }
    }

    redirect(`/forms/${formId}/success`);
}
