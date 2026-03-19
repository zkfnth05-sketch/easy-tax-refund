'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/components/LanguageContext';

export default function LkPage() {
  const { setLanguage } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    const initLk = async () => {
      // Set language to Sinhala ('si') for the Sri Lanka route
      await setLanguage('si');
    };
    initLk();
  }, [setLanguage]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        <p className="text-slate-500 font-bold">Setting language to Sinhala...</p>
      </div>
    </div>
  );
}
