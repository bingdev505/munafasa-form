export type FormFieldType =
  | "text"
  | "textarea"
  | "multiple-choice"
  | "date"
  | "email";

export type FormField = {
  id: string;
  name: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  placeholder?: string;
  options?: string[];
};

export type Form = {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  createdAt: string;
  submissionCount?: number;
};
