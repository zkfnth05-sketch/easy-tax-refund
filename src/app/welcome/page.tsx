
'use client';

/** 
 * DESIGN_LOCK: 언어 선택 진입 페이지 - 고화질 국기 및 영어 안내 고정.
 */

import { useTranslation } from '@/components/LanguageContext';
import { languages } from '@/lib/translations/config';
import { Card, CardContent } from '@/components/ui/card';
import { Globe, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function WelcomePage() {
  const { setLanguage, isReady, t } = useTranslation();

  // No longer returning null to ensure buttons are ALWAYS visible
  // English fallbacks used below if translations aren't loaded

  return (
    <div className="min-h-screen flex flex-col font-body bg-slate-50 items-center justify-center p-6 py-20">
      <div className="max-w-6xl w-full space-y-16 animate-fade-in-up">
        <div className="text-center space-y-6">
          <div className="mx-auto h-20 w-20 bg-primary rounded-[2rem] flex items-center justify-center shadow-2xl shadow-primary/20 mb-8 animate-float">
            <Globe className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-black font-headline text-slate-900 tracking-tight">
            {isReady ? t('welcome_title') : 'Welcome to Easy Tax Refund'}
          </h1>
          <p className="text-xl text-slate-500 font-bold">
            {isReady ? t('welcome_desc') : 'Please select your language to start your refund check'}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {languages.map((lang, index) => (
            <Card 
              key={lang.code}
              onClick={() => {
                localStorage.setItem('welcome_seen', 'true');
                setLanguage(lang.code);
              }}
              className="premium-card rounded-[2.5rem] border-none shadow-sm cursor-pointer overflow-hidden group transition-all hover:scale-105"
            >
              <CardContent className="p-8 flex flex-col items-center gap-6 text-center">
                <div className="relative w-24 h-16 shadow-lg rounded-xl overflow-hidden transform transition-transform group-hover:scale-110">
                  <Image 
                    src={`https://flagcdn.com/w320/${lang.countryCode}.png`}
                    alt={lang.name}
                    fill
                    className="object-cover"
                    priority={index < 5}
                  />
                </div>
                <div className="space-y-1">
                  <p className="font-black text-slate-900 text-lg">{lang.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-1">
                    Select <ArrowRight className="h-2 w-2" />
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
