
"use client";

import React, { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Bell, Home, Ticket, User, LogOut } from 'lucide-react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

function DashboardNav() {
  const searchParams = useSearchParams();
  const enrolmentNumber = searchParams.get('enrolment_number');
  const profileImageUrl =  "https://picsum.photos/seed/1/32/32"; // Placeholder, real image is fetched in profile page now

  // If there's no enrolment number, we probably don't want to show the nav, or we show a limited version.
  // For now, we'll just make the links inactive.
  const navLinks = [
    { href: `/dashboard?enrolment_number=${enrolmentNumber}`, icon: Home, label: 'Dashboard' },
    { href: `/dashboard/hall-ticket?enrolment_number=${enrolmentNumber}`, icon: Ticket, label: 'Hall Ticket' },
    { href: `/dashboard/profile?enrolment_number=${enrolmentNumber}`, icon: User, label: 'Profile' },
  ];

  return (
    <div className="flex min-h-screen w-full bg-gray-100 dark:bg-gray-900">
      <aside className="fixed hidden h-screen w-64 flex-col border-r bg-white dark:bg-gray-800 sm:flex">
        <div className="flex items-center border-b px-6 py-8">
           <Link href="/dashboard">
            <Image 
                src="/logo.png" 
                alt="University Logo" 
                width={140} 
                height={40}
                data-ai-hint="university logo" 
            />
          </Link>
        </div>
        <nav className="flex-1 space-y-2 p-4">
          {navLinks.map((link) => (
             <Button asChild variant="ghost" className="w-full justify-start rounded-none" key={link.href} disabled={!enrolmentNumber}>
              <Link href={enrolmentNumber ? link.href : '#'}>
                <link.icon className="mr-2 h-4 w-4" />
                {link.label}
              </Link>
            </Button>
          ))}
        </nav>
        <div className="mt-auto p-4">
            <Button asChild variant="ghost" className="w-full justify-start rounded-none">
                <Link href="/login">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Link>
            </Button>
        </div>
      </aside>
      <div className="flex flex-1 flex-col sm:pl-64">
        <header className="flex items-center justify-between border-b bg-white px-6 py-4 dark:bg-gray-800 sm:justify-end">
           <div className="sm:hidden">
             <Link href={enrolmentNumber ? `/dashboard?enrolment_number=${enrolmentNumber}` : '#'}>
                <Image src="/logo.png" alt="University Logo" width={120} height={35} data-ai-hint="university logo"/>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
             {/* This will be static now, profile image shown on profile page */}
            <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200">
                <Image src={profileImageUrl} alt="Student Profile" width={32} height={32} className="" data-ai-hint="profile person" />
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">{/* Children passed here will be the page components */}</main>
      </div>
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
      <DashboardNav />
      <div className="sm:pl-64">
        {children}
      </div>
    </Suspense>
  );
}
