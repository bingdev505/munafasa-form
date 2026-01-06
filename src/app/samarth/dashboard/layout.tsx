
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  User,
  ChevronDown,
  Briefcase,
  GraduationCap,
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isStudentOpen, setStudentOpen] = useState(true);
  const [isExamOpen, setExamOpen] = useState(false);
  const [isTrainingOpen, setTrainingOpen] = useState(false);

  const studentLinks = [
    { href: '/samarth/dashboard', label: 'Dashboard' },
    { href: '/samarth/dashboard/profile', label: 'Profile' },
    { href: '#', label: 'ODL36914: MASTER OF B...' },
    { href: '#', label: 'Fee' },
    { href: '#', label: 'Course(s) Selection' },
    { href: '#', label: 'Upload Section' },
    { href: '#', label: 'Services' },
    { href: '#', label: 'Dues' },
    { href: '#', label: 'Certificates' },
    { href: '#', label: 'Profile Updated Details' },
    { href: '#', label: 'My Payment' },
    { href: '#', label: 'Swayam Courses' },
  ];

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="fixed hidden h-screen w-64 flex-col border-r bg-white sm:flex">
        <nav className="flex-1 space-y-2 p-2">
          {/* Student Collapsible */}
          <Collapsible open={isStudentOpen} onOpenChange={setStudentOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between text-base font-semibold px-4"
              >
                <div className="flex items-center">
                  <User className="mr-3 h-5 w-5" />
                  Student
                </div>
                <ChevronDown
                  className={cn(
                    'h-5 w-5 transition-transform',
                    isStudentOpen && 'rotate-180'
                  )}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 pl-4">
              {studentLinks.map((link) => (
                <Button
                  asChild
                  key={link.href}
                  variant={pathname === link.href ? 'secondary' : 'ghost'}
                  className="w-full justify-start rounded-none text-muted-foreground hover:text-primary"
                >
                  <Link href={link.href}>{link.label}</Link>
                </Button>
              ))}
            </CollapsibleContent>
          </Collapsible>

          {/* Examination Collapsible */}
          <Collapsible open={isExamOpen} onOpenChange={setExamOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between text-base font-semibold px-4"
              >
                <div className="flex items-center">
                  <GraduationCap className="mr-3 h-5 w-5" />
                  Examination
                </div>
                <ChevronDown
                  className={cn(
                    'h-5 w-5 transition-transform',
                    isExamOpen && 'rotate-180'
                  )}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-4">
              {/* Add Examination links here */}
            </CollapsibleContent>
          </Collapsible>
          
          {/* Training & Placement Collapsible */}
          <Collapsible open={isTrainingOpen} onOpenChange={setTrainingOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between text-base font-semibold px-4"
              >
                <div className="flex items-center">
                  <Briefcase className="mr-3 h-5 w-5" />
                  Training & Placement
                </div>
                <ChevronDown
                  className={cn(
                    'h-5 w-5 transition-transform',
                    isTrainingOpen && 'rotate-180'
                  )}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-4">
              {/* Add Training links here */}
            </CollapsibleContent>
          </Collapsible>

        </nav>
      </aside>
      <div className="flex flex-1 flex-col sm:pl-64">
        <header className="flex h-12 items-center border-b bg-white px-6">
          <div className="text-sm text-muted-foreground">
            <Link href="#" className="text-primary hover:underline">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span>Dashboard</span>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 bg-gray-100">
            {children}
            <footer className="text-center mt-8 text-sm text-muted-foreground">
                © Samarth eGov
            </footer>
        </main>
      </div>
    </div>
  );
}
