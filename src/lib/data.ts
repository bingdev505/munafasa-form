import type { Form } from "./definitions";

// In-memory store for forms
let forms: Form[] = [
    {
        id: "contact-form-123",
        title: "Contact Us",
        description: "Please fill out this form to get in touch with us.",
        createdAt: new Date().toISOString(),
        submissionCount: 25,
        fields: [
            { id: "1", name: "full_name", label: "Full Name", type: "text", required: true, placeholder: "John Doe" },
            { id: "2", name: "email_address", label: "Email Address", type: "email", required: true, placeholder: "you@example.com" },
            { id: "3", name: "message", label: "Message", type: "textarea", required: true, placeholder: "Your message here..." },
        ],
    },
    {
        id: "event-rsvp-456",
        title: "Event RSVP",
        description: "Let us know if you can make it to our annual company picnic.",
        createdAt: new Date().toISOString(),
        submissionCount: 112,
        fields: [
            { id: "1", name: "name", label: "Name", type: "text", required: true },
            { id: "2", name: "attending", label: "Will you be attending?", type: "multiple-choice", required: true, options: ["Yes, I'll be there!", "No, I can't make it."] },
            { id: "3", name: "guest_count", label: "Number of Guests", type: "text", required: false },
        ],
    },
];

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getForms(): Promise<Form[]> {
  await delay(500);
  return forms;
}

export async function getFormById(id: string): Promise<Form | undefined> {
  await delay(300);
  return forms.find((form) => form.id === id);
}

export async function createForm(form: Omit<Form, 'id' | 'createdAt' | 'submissionCount'>): Promise<Form> {
  await delay(1000);
  const newForm: Form = {
    ...form,
    id: `${form.title.toLowerCase().replace(/\s+/g, "-")}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    submissionCount: 0,
  };
  forms.unshift(newForm);
  return newForm;
}

export async function addSubmission(formId: string, submission: any): Promise<void> {
    await delay(500);
    console.log(`New submission for form ${formId}:`, submission);
    // In a real app, this would save to a database and Google Sheets.
    const form = await getFormById(formId);
    if(form) {
        form.submissionCount = (form.submissionCount || 0) + 1;
    }
    return;
}
