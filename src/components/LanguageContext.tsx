'use client';

/**
 * [보안 강화된 LanguageContext]
 * - 번역 데이터를 클라이언트 번들에 포함하지 않음
 * - 서버 API(/api/translations/[lang])를 통해서만 번역 데이터를 수신
 * - ko.ts를 포함한 모든 번역 파일은 서버에만 존재
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Language } from '@/lib/translations/config';
import { useRouter } from 'next/navigation';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language, shouldRedirect?: boolean) => void;
  t: (key: string, variables?: Record<string, string | number>) => string;
  isReady: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ko');
  const [translationMap, setTranslationMap] = useState<Record<string, string>>({});
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  const fetchTranslations = useCallback(async (lang: Language) => {
    if (lang === 'ko') {
      setTranslationMap({});
      return true;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const res = await fetch(`/api/translations/${lang}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (res.ok) {
        const data = await res.json();
        setTranslationMap(data);
        return true;
      }
      return false;
    } catch (error) {
      clearTimeout(timeoutId);
      setTranslationMap({});
      return false;
    }
  }, []);

  useEffect(() => {
    const initLanguage = async () => {
      const savedLang = localStorage.getItem('app_lang') as Language;
      const lang = savedLang || 'ko';
      setLanguageState(lang);

      const success = await fetchTranslations(lang);
      
      // If server hangs or fails, fallback to 'ko' instead of infinite redirect loop
      if (!success && lang !== 'ko') {
        setLanguageState('ko');
        localStorage.setItem('app_lang', 'ko');
      }
      
      setIsReady(true);
    };

    initLanguage();
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback(async (lang: Language, shouldRedirect = true) => {
    setLanguageState(lang);
    localStorage.setItem('app_lang', lang);
    await fetchTranslations(lang);
    if (shouldRedirect) {
      router.push('/');
    }
  }, [fetchTranslations, router]);

  const t = React.useCallback((key: string, variables?: Record<string, string | number>): string => {
    if (!key || typeof key !== 'string') return '';
    const trimmedKey = key.trim();
    let text = language === 'ko' ? key : (translationMap[trimmedKey] || key);
    
    if (variables) {
      Object.entries(variables).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    
    return text;
  }, [language, translationMap]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isReady }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useTranslation must be used within a LanguageProvider');
  return context;
}
