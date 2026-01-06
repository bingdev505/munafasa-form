
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SamarthLoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main login page
    router.replace('/login');
  }, [router]);

  return (
    <div className="flex h-full w-full items-center justify-center">
      <p>Redirecting to login...</p>
    </div>
  );
}
