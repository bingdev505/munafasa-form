import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import { Logo } from "@/components/logo";
import Link from 'next/link';

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
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        {children}
      </main>
      <footer className="py-6 px-4 text-center text-muted-foreground">
        <Link href="/" className="inline-flex items-center gap-2">
            <Logo />
            <span className="font-semibold">Powered by FormFlow</span>
        </Link>
      </footer>
      <Toaster />
    </div>
  );
}
