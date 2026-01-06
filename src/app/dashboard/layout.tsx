
"use client";

import React, { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Bell, Home, Ticket, User, LogOut, ChevronDown, Briefcase, GraduationCap, Menu as MenuIcon } from 'lucide-react';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import { getStudentData, type StudentData } from '@/app/actions/get-student-data';


function NavigationMenu({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const enrolmentNumber = searchParams.get('enrolment_number');

  const [openSection, setOpenSection] = useState('student');

  const handleSectionToggle = (section: string) => {
    setOpenSection(prev => prev === section ? '' : section);
  };
  
  const studentLinks = [
    { href: `/dashboard?enrolment_number=${enrolmentNumber}`, label: 'Dashboard' },
    { href: `/dashboard/profile?enrolment_number=${enrolmentNumber}`, label: 'Profile' },
    { href: '#', label: 'Fee' },
    { href: '#', label: 'Course(s) Selection' },
    { href: '#', label: 'Upload Section' },
  ];

  const examLinks = [
    { href: '#', label: 'Registration' },
    { href: '#', label: 'Additional Exam Fee' },
    { href: `/dashboard/hall-ticket?enrolment_number=${enrolmentNumber}`, label: 'Hall Admit Card' },
    { href: '#', label: 'Grade Card/Result' },
    { href: '#', label: 'Apply for EXIT (as per NEP)' },
  ];

  return (
    <nav className={cn("flex flex-col space-y-2 p-2", isMobile ? "w-full" : "")}>
      {/* Student Collapsible */}
      <Collapsible open={openSection === 'student'} onOpenChange={() => handleSectionToggle('student')}>
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
                openSection === 'student' && 'rotate-180'
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
              disabled={!enrolmentNumber && link.href.includes('enrolment_number')}
            >
              <Link href={enrolmentNumber ? link.href : '#'}>{link.label}</Link>
            </Button>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Examination Collapsible */}
      <Collapsible open={openSection === 'exam'} onOpenChange={() => handleSectionToggle('exam')}>
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
                openSection === 'exam' && 'rotate-180'
              )}
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-1 pl-4">
          {examLinks.map((link) => (
            <Button
              asChild
              key={link.label}
              variant={pathname === link.href ? 'secondary' : 'ghost'}
              className="w-full justify-start rounded-none text-muted-foreground hover:text-primary"
              disabled={!enrolmentNumber && link.href.includes('enrolment_number')}
            >
              <Link href={enrolmentNumber ? link.href : '#'}>{link.label}</Link>
            </Button>
          ))}
        </CollapsibleContent>
      </Collapsible>
      
      {/* Training & Placement Collapsible */}
      <Collapsible open={openSection === 'training'} onOpenChange={() => handleSectionToggle('training')}>
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
                openSection === 'training' && 'rotate-180'
              )}
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-4">
          {/* Add Training links here */}
        </CollapsibleContent>
      </Collapsible>
    </nav>
  );
}


function DashboardNavContent({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const enrolmentNumber = searchParams.get('enrolment_number');
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [studentData, setStudentData] = useState<StudentData | null>(null);

  useEffect(() => {
    async function fetchStudentData() {
      if (enrolmentNumber) {
        const data = await getStudentData(enrolmentNumber);
        setStudentData(data);
      }
    }
    fetchStudentData();
  }, [enrolmentNumber]);

  const profileImageUrl = studentData?.profileUrl || "https://picsum.photos/seed/1/32/32";
  
  return (
    <div className="flex min-h-screen w-full bg-background">
       <aside className="fixed hidden h-screen w-64 flex-col border-r bg-white sm:flex">
         <div className="p-4 border-b">
            <Link href={enrolmentNumber ? `/dashboard?enrolment_number=${enrolmentNumber}` : '#'}>
              <Image src="/logo.png" alt="University Logo" width={150} height={40} data-ai-hint="university logo"/>
            </Link>
         </div>
        <NavigationMenu />
      </aside>
       <div className="flex flex-1 flex-col sm:pl-64">
        <header className="flex h-16 items-center justify-between border-b bg-white px-4 sm:px-6">
           <div className="flex items-center gap-4">
             <div className="sm:hidden">
              <Link href={enrolmentNumber ? `/dashboard?enrolment_number=${enrolmentNumber}` : '#'}>
                <Image src="/logo.png" alt="University Logo" width={120} height={32} data-ai-hint="university logo"/>
              </Link>
             </div>
             <div className="text-sm text-muted-foreground hidden md:block">
              <Link href="#" className="text-primary hover:underline">
                Home
              </Link>
              <span className="mx-2">/</span>
              <span>Dashboard</span>
            </div>
           </div>

           <div className="flex items-center gap-2 sm:gap-4">
                <Button className="bg-green-600 hover:bg-green-700 rounded-none text-xs sm:text-sm h-8 sm:h-9">
                    Public Notice/Results
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center gap-2 cursor-pointer">
                        <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-200">
                            <Image src={profileImageUrl} alt="Student Profile" width={32} height={32} data-ai-hint="profile person" className="object-cover h-full w-full" />
                        </div>
                        {enrolmentNumber && <span className="text-sm font-medium text-primary hidden sm:inline">{enrolmentNumber}</span>}
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                       <Link href="/login">
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>

        {/* Mobile Menu */}
        <div className="sm:hidden border-b">
           <Collapsible open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between px-4 py-3 text-base font-semibold">
                  Menu
                  <ChevronDown className={cn("h-5 w-5 transition-transform", isMobileMenuOpen && "rotate-180")} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <NavigationMenu isMobile={true} />
              </CollapsibleContent>
           </Collapsible>
        </div>


        <main className="flex-1 p-4 md:p-6 lg:p-8 bg-gray-100">
            {children}
             <footer className="text-center mt-8 text-sm text-muted-foreground">
                © DDE IGNOU University
            </footer>
        </main>
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
      <DashboardNavContent>{children}</DashboardNavContent>
    </Suspense>
  );
}
