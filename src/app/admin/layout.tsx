"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Lock } from 'lucide-react';

const ADMIN_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN || '3369';
const UNLOCK_KEY = 'admin_unlocked';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const [unlocked, setUnlocked] = useState(false);
  const [checkingLock, setCheckingLock] = useState(true);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(UNLOCK_KEY) === 'yes') {
        setUnlocked(true);
      }
    } catch {
      // sessionStorage can be blocked; fall back to asking for the PIN.
    }
    setCheckingLock(false);
  }, []);

  const handleUnlock = (event: React.FormEvent) => {
    event.preventDefault();

    if (pin.trim() !== ADMIN_PIN) {
      setPinError('Wrong PIN. Try again.');
      setPin('');
      return;
    }

    try {
      sessionStorage.setItem(UNLOCK_KEY, 'yes');
    } catch {
      // Not fatal: the admin stays unlocked for this page load.
    }
    setPinError(null);
    setPin('');
    setUnlocked(true);
  };

  const handleLock = () => {
    try {
      sessionStorage.removeItem(UNLOCK_KEY);
    } catch {
      // Ignore: locking the UI below is what matters.
    }
    setUnlocked(false);
  };

  if (checkingLock) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-sm shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              <CardTitle className="text-xl">Admin Locked</CardTitle>
            </div>
            <CardDescription>
              Enter the admin PIN to continue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUnlock} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-pin">PIN</Label>
                <Input
                  id="admin-pin"
                  type="password"
                  inputMode="numeric"
                  autoComplete="off"
                  autoFocus
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setPinError(null);
                  }}
                />
                {pinError && (
                  <p className="text-sm text-red-600">{pinError}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={!pin}>
                Unlock
              </Button>
            </form>
          </CardContent>
        </Card>
        <Link href="/" className="mt-4 text-sm text-muted-foreground underline">
          Back to main site
        </Link>
      </main>
    );
  }

  const navLinks = [
    { href: '/admin/students', label: 'Students' },
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
                <Button
                    variant="ghost"
                    className="hover:bg-primary/80"
                    onClick={handleLock}
                >
                    <Lock className="mr-2 h-4 w-4" />
                    Lock
                </Button>
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
