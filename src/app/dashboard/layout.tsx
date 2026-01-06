
"use client";

import React, { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Bell, Home, Ticket, User, LogOut } from 'lucide-react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

function DashboardNavContent({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const enrolmentNumber = searchParams.get('enrolment_number');

  const navLinks = [
    { href: `/dashboard?enrolment_number=${enrolmentNumber}`, icon: Home, label: 'Dashboard' },
    { href: `/dashboard/hall-ticket?enrolment_number=${enrolmentNumber}`, icon: Ticket, label: 'Hall Ticket' },
    { href: `/dashboard/profile?enrolment_number=${enrolmentNumber}`, icon: User, label: 'Profile' },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-100 dark:bg-gray-900">
      <header className="flex items-center justify-between border-b bg-white px-6 py-4 dark:bg-gray-800">
        <Link href={enrolmentNumber ? `/dashboard?enrolment_number=${enrolmentNumber}` : '#'}>
          <Image src="/logo.png" alt="University Logo" width={120} height={35} data-ai-hint="university logo"/>
        </Link>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>
          <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-200">
            <Image src="https://picsum.photos/seed/1/32/32" alt="Student Profile" width={32} height={32} data-ai-hint="profile person" />
          </div>
           <Button asChild variant="ghost" size="sm">
                <Link href="/login">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Link>
            </Button>
        </div>
      </header>
      
      <main className="flex flex-1">
        <div className="container mx-auto max-w-7xl py-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                <aside className="md:col-span-1">
                    <nav className="flex flex-col space-y-2">
                        {navLinks.map((link) => (
                        <Button asChild variant="ghost" className="w-full justify-start rounded-none" key={link.href} disabled={!enrolmentNumber}>
                        <Link href={enrolmentNumber ? link.href : '#'}>
                            <link.icon className="mr-2 h-4 w-4" />
                            {link.label}
                        </Link>
                        </Button>
                    ))}
                    </nav>
                </aside>
                 <div className="md:col-span-3">
                    {children}
                </div>
            </div>
        </div>
      </main>
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div>Loading Navigation...</div>}>
      <DashboardNavContent>{children}</DashboardNavContent>
    </Suspense>
  );
}
