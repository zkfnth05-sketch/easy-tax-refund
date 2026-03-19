/** FINAL_TRANSLATION_LOCK: VI_ZH_DONE_DO_NOT_MODIFY **/

"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Scale, RotateCcw, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/components/LanguageContext";

/**
 * TERMS_PAGE_DESIGN_LOCK: 프리미엄 슬레이트 테마 및 법적 효력이 명시된 표준 약관 레이아웃 고정.
 */
export default function TermsPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col font-body bg-slate-50/50">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto space-y-12">
          
          <div className="text-center space-y-4">
            <div className="mx-auto h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-black font-headline text-slate-900">{t('서비스 이용 약관')}</h1>
            <p className="text-slate-500 font-bold">{t('Easy Tax Refund 이용을 위한 표준 약관 및 정책 안내입니다.')}</p>
          </div>

          <Card className="premium-card rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
            <CardContent className="p-10 lg:p-16 space-y-12 text-slate-700 leading-relaxed">
              
              <section className="space-y-4">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Scale className="h-5 w-5 text-primary" /> {t('제 1 조 (목적)')}
                </h3>
                <p className="font-medium text-sm">
                  {t('본 약관은 더윤컴퍼니(이하 "회사")가 운영하는 "Easy Tax Refund" 서비스를 이용함에 있어 회사와 이용자의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.')}
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" /> {t('제 2 조 (서비스 수수료 및 선임)')}
                </h3>
                <div className="bg-primary/5 p-8 rounded-[2rem] border border-primary/10 space-y-4">
                  <Badge className="bg-primary text-white font-black">{t('중요 정책')}</Badge>
                  <p className="font-bold text-slate-900">
                    {t('본 서비스는 조세특례제한법에 따른 세금 환급 대행을 위해 전문 세무사를 선임하는 방식으로 운영됩니다.')}
                  </p>
                  <ul className="list-disc pl-6 space-y-2 font-bold text-sm text-slate-700">
                    <li>{t('수수료는 예상 환급액의 20%를 원칙으로 합니다.')}</li>
                    <li>{t('대한민국 국세청(NTS)의 직접 입금 원칙에 따라, 수수료는 신청 시점에 선결제(선임료) 방식으로 지급되어야 합니다.')}</li>
                    <li>{t('사용자는 전자서명을 통해 세무 대리 수임에 명시적으로 동의합니다.')}</li>
                  </ul>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <RotateCcw className="h-5 w-5 text-primary" /> {t('제 3 조 (환불 보장 정책)')}
                </h3>
                <div className="bg-slate-900 text-white p-8 rounded-[2rem] space-y-4">
                  <h4 className="text-lg font-black text-primary">{t('100% 안심 환불 약속')}</h4>
                  <p className="font-medium text-slate-300">
                    {t('회사는 전문적인 검토를 통해 최선의 환급 서비스를 제공합니다. 만약 국세청의 최종 결정 결과 환급이 불가능하거나 환급액이 발생하지 않는 것으로 확정될 경우, 사용자가 지불한 선임료(수수료) 20%는 전액 즉시 환불됩니다.')}
                  </p>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-black text-slate-900">{t('제 4 조 (이용자의 의무)')}</h3>
                <p className="font-medium text-sm">{t('이용자는 서비스 이용을 위해 정확한 정보를 제공해야 합니다.')}</p>
                <ul className="list-disc pl-6 space-y-2 font-medium text-sm">
                  <li>{t('타인의 명의나 부정확한 정보를 사용하여 신청할 경우 서비스가 거절될 수 있으며 법적 책임이 발생할 수 있습니다.')}</li>
                  <li>{t('국세청 검토 과정에서 세무서의 추가 소명 요청이 있을 경우, 이용자는 성실히 협조해야 합니다.')}</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-black text-slate-900">{t('제 5 조 (면책 조항)')}</h3>
                <p className="font-medium text-sm">
                  {t('회사는 국세청 시스템 점검, 천재지변 등 불가항력적인 사유로 인해 서비스가 일시 중단되는 경우 책임을 지지 않습니다. 또한, 환급 기간은 국세청의 처리 속도에 따라 변동될 수 있습니다.')}
                </p>
              </section>

              <div className="pt-10 border-t border-slate-100 text-xs text-slate-400 font-bold">
                {t('공고일자: 2024년 05월 20일 / 시행일자: 2024년 06월 01일')}
              </div>

            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
