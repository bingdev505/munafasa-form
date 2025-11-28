
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminRootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/attendance');
  }, [router]);

  return (
    <div className="flex h-full w-full items-center justify-center">
      <p>Redirecting...</p>
    </div>
  );
}
