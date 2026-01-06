
"use client";

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function SamarthDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const enrolmentNumber = searchParams.get('enrolment_number');

  useEffect(() => {
    // Redirect to the main dashboard
    if (enrolmentNumber) {
      router.replace(`/dashboard?enrolment_number=${enrolmentNumber}`);
    } else {
      router.replace('/login');
    }
  }, [router, enrolmentNumber]);

  return (
    <div className="flex h-full w-full items-center justify-center">
      <p>Redirecting to dashboard...</p>
    </div>
  );
}

export default function SamarthDashboardPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SamarthDashboardContent />
        </Suspense>
    )
}
