
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SamarthLoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main dashboard which now handles both IGNOU and PONDI
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="flex h-full w-full items-center justify-center">
      <p>Redirecting to dashboard...</p>
    </div>
  );
}
