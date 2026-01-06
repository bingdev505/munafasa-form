
"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SamarthProfilePage() {
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
