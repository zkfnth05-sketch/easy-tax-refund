/** FINAL_TRANSLATION_LOCK: VI_ZH_DONE_DO_NOT_MODIFY **/

"use client";

import Link from "next/link";
import { AiChatDialog } from "@/components/AiChatDialog";
import { useTranslation } from "@/components/LanguageContext";
import { LegalDialog } from "@/components/LegalDialog";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t bg-white print:hidden">
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-24">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <h3 className="text-2xl font-black font-headline tracking-tighter">Easy Tax Refund</h3>
            <p className="text-slate-500 text-sm font-medium max-sm leading-relaxed">
              {t('대한민국에 있는 외국인들이 정당한 권리를 찾을 수 있도록 돕습니다. 외국인을 위한 쉽고 빠르며 안전한 세금 환급 서비스입니다.')}
            </p>
            <div className="pt-4 flex gap-4">
              <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                <span className="text-[10px] font-black text-slate-400">FB</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                <span className="text-[10px] font-black text-slate-400">IG</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                <span className="text-[10px] font-black text-slate-400">LI</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-black text-slate-900 mb-6 uppercase tracking-widest text-xs">{t('제품 및 가격')}</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-500">
              <li><Link href="/estimate" className="hover:text-primary transition-colors">{t('환급액 빠른 조회')}</Link></li>
              <li><Link href="/pricing" className="hover:text-primary transition-colors">{t('가격 정책 (20%)')}</Link></li>
              <li><Link href="/upload" className="hover:text-primary transition-colors">{t('서류 업로드 센터')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black text-slate-900 mb-6 uppercase tracking-widest text-xs">{t('고객 지원')}</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-500">
              <li><Link href="/faq" className="hover:text-primary transition-colors">{t('FAQ')}</Link></li>
              <li>
                <AiChatDialog>
                  <button className="hover:text-primary transition-colors text-left">{t('1:1 AI 상담')}</button>
                </AiChatDialog>
              </li>
              <li>
                <LegalDialog type="privacy">
                  <button className="hover:text-primary transition-colors text-left">{t('개인정보 처리방침')}</button>
                </LegalDialog>
              </li>
              <li>
                <LegalDialog type="terms">
                  <button className="hover:text-primary transition-colors text-left">{t('이용 약관')}</button>
                </LegalDialog>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-20 pt-10 border-t border-slate-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
            <div className="space-y-2 text-xs font-bold text-slate-400 leading-relaxed">
              <p>{t('사업자명: 더윤컴퍼니 | 사업자 번호: 105-1278126')}</p>
              <p>{t('통신판매업 번호: 제 2023-진접오남-0680호')}</p>
              <p>{t('주소: 경기도 남양주시 부평로 48번길 140, 107-1102')}</p>
              <p>{t('연락처: 010-4885-8575 | 이메일: zkfnth01@naver.com')}</p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-xs font-bold text-slate-400">
                © 2026 Easy Tax Refund. THEYOON COMPANY. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
