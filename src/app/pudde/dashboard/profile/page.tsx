
"use client";

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function SamarthProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const enrolmentNumber = searchParams.get('enrolment_number');

  useEffect(() => {
    // Redirect to the main profile page
    if (enrolmentNumber) {
      router.replace(`/dashboard/profile?enrolment_number=${enrolmentNumber}`);
    } else {
      router.replace('/login');
    }
  }, [router, enrolmentNumber]);

  return (
    <div className="flex h-full w-full items-center justify-center">
      <p>Redirecting to profile...</p>
    </div>
  );
}

export default function SamarthProfilePage() {
    return (
        <Suspense fallback={<div className="flex h-full w-full items-center justify-center"><p>Loading...</p></div>}>
            <SamarthProfileContent />
        </Suspense>
    )
}
