
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Bell, Home, Ticket, User, LogOut } from 'lucide-react';
import Image from 'next/image';
import { getStudentData } from '@/app/actions/get-student-data';


export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const studentData = await getStudentData();

  const profileImageUrl = studentData?.profileUrl || "https://picsum.photos/seed/1/32/32";

  return (
    <div className="flex min-h-screen w-full bg-gray-100 dark:bg-gray-900">
      <aside className="fixed hidden h-screen w-64 flex-col border-r bg-white dark:bg-gray-800 sm:flex">
        <div className="flex items-center border-b px-6 py-4">
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
          <Button asChild variant="ghost" className="w-full justify-start rounded-none">
            <Link href="/dashboard">
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          <Button asChild variant="ghost" className="w-full justify-start rounded-none">
            <Link href="/dashboard/hall-ticket">
              <Ticket className="mr-2 h-4 w-4" />
              Hall Ticket
            </Link>
          </Button>
           <Button asChild variant="ghost" className="w-full justify-start rounded-none">
            <Link href="/dashboard/profile">
              <User className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </Button>
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
             <Link href="/dashboard">
                <Image src="/logo.png" alt="University Logo" width={120} height={35} data-ai-hint="university logo"/>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
            <div className="h-8 w-8 rounded-full overflow-hidden">
                <Image src={profileImageUrl} alt="Student Profile" width={32} height={32} className="" data-ai-hint="profile person" />
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
