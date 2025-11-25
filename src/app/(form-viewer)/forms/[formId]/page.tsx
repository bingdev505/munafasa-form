import FormRenderer from "./form-renderer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Form } from "@/lib/definitions";

const form: Form = {
    id: "meeting-attendance",
    title: "Meeting Attendance",
    description: "Please select the class and student name, then indicate who will be attending.",
    fields: [
        { id: "1", name: "class", label: "Class", type: "select", required: true, options: ["Mathematics", "Science", "History", "English"], placeholder: "Select a class" },
        { id: "2", name: "student_name", label: "Student Name", type: "select", required: true, options: ["John Doe", "Jane Smith", "Peter Jones", "Mary Williams"], placeholder: "Select a student" },
        { id: "3", name: "number_of_males", label: "Number of Males", type: "number", required: true, placeholder: "Enter number of males" },
        { id: "4", name: "number_of_females", label: "Number of Females", type: "number", required: true, placeholder: "Enter number of females" },
    ],
    createdAt: new Date().toISOString(),
};

export default function FormPage({ params }: { params: { formId: string } }) {
  return (
    <div className="max-w-2xl mx-auto">
        <Card>
            <CardHeader>
                <CardTitle className="text-3xl font-bold">{form.title}</CardTitle>
                <CardDescription className="text-lg">{form.description}</CardDescription>
            </CardHeader>
            <CardContent>
                <FormRenderer form={form} />
            </CardContent>
        </Card>
    </div>
  );
}
