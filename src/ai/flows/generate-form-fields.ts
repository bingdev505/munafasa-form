'use server';

/**
 * @fileOverview AI-powered form field suggestion flow.
 *
 * - generateFormFields - A function that suggests form fields based on the form title.
 * - GenerateFormFieldsInput - The input type for the generateFormFields function.
 * - GenerateFormFieldsOutput - The return type for the generateFormFields function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFormFieldsInputSchema = z.object({
  formTitle: z
    .string()
    .describe('The title of the form, used to generate relevant fields.'),
});
export type GenerateFormFieldsInput = z.infer<typeof GenerateFormFieldsInputSchema>;

const GenerateFormFieldsOutputSchema = z.object({
  suggestedFields: z
    .array(z.string())
    .describe('An array of suggested form fields based on the form title.'),
  suggestedLayout: z.string().describe('A suggested basic layout for the form.'),
});
export type GenerateFormFieldsOutput = z.infer<typeof GenerateFormFieldsOutputSchema>;

export async function generateFormFields(
  input: GenerateFormFieldsInput
): Promise<GenerateFormFieldsOutput> {
  return generateFormFieldsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFormFieldsPrompt',
  input: {schema: GenerateFormFieldsInputSchema},
  output: {schema: GenerateFormFieldsOutputSchema},
  prompt: `You are an AI assistant that suggests form fields and a basic layout based on the form's title.

  Form Title: {{{formTitle}}}

  Based on the form title, suggest relevant form fields and a basic layout.
  Return the suggested fields as a JSON array of strings, and the suggested layout as a plain text description.
  For example:
  {
    "suggestedFields": ["name", "email", "phone number"],
    "suggestedLayout": "A simple layout with name and email on top, followed by phone number."
  }
  `,
});

const generateFormFieldsFlow = ai.defineFlow(
  {
    name: 'generateFormFieldsFlow',
    inputSchema: GenerateFormFieldsInputSchema,
    outputSchema: GenerateFormFieldsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
