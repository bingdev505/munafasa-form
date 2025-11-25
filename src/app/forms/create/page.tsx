import FormBuilder from "./form-builder";

export default function CreateFormPage() {
  return (
    <main className="flex flex-1 flex-col p-4 md:p-8">
      <div className="mx-auto grid w-full max-w-4xl gap-2">
        <h1 className="text-3xl font-semibold">Create a new form</h1>
        <p className="text-muted-foreground">Build your form from scratch or let AI give you a head start.</p>
      </div>
      <div className="mx-auto w-full max-w-4xl mt-8">
        <FormBuilder />
      </div>
    </main>
  );
}
