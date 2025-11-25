import { notFound } from "next/navigation";
import { getFormById } from "@/lib/data";
import FormRenderer from "./form-renderer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function FormPage({ params }: { params: { formId: string } }) {
  const form = await getFormById(params.formId);

  if (!form) {
    notFound();
  }

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
