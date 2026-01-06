
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SamarthRootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/pudde/login');
  }, [router]);

  return (
    <div className="flex h-full w-full items-center justify-center">
      <p>Redirecting to portal...</p>
    </div>
  );
}
