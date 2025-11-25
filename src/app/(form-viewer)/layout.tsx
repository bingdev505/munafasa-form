import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "FormFlow",
  description: "Fill out this form.",
};

export default function FormViewerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="h-16 w-full bg-primary" />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        {children}
      </main>
      <Toaster />
    </div>
  );
}
