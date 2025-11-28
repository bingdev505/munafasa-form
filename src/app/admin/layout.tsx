
"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navLinks = [
    { href: '/admin/attendance', label: 'Attendance' },
    { href: '/admin/registrations', label: 'Registrations' },
    { href: '/', label: 'Main Site' },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-primary text-primary-foreground p-4 shadow-md sticky top-0 z-10 no-print">
        <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-semibold">Admin Dashboard</h1>
            <nav className="hidden md:flex items-center space-x-2">
                {navLinks.map(link => (
                    <Link key={link.href} href={link.href} passHref>
                        <Button
                            variant={pathname === link.href ? 'secondary' : 'ghost'}
                            className={cn(
                                pathname === link.href ? 'text-primary-foreground bg-primary/80' : 'hover:bg-primary/80'
                            )}
                        >
                            {link.label}
                        </Button>
                    </Link>
                ))}
            </nav>
        </div>
      </header>
      <main className="flex-1 bg-gray-50/50">
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            {children}
        </div>
      </main>
    </div>
  );
}
