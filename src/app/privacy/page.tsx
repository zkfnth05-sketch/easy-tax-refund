/** FINAL_TRANSLATION_LOCK: VI_ZH_DONE_DO_NOT_MODIFY **/

"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, Lock, Eye, UserCheck } from "lucide-react";
import { useTranslation } from "@/components/LanguageContext";

/**
 * PRIVACY_PAGE_DESIGN_LOCK: 프리미엄 슬레이트 테마 및 가독성 높은 리걸 문서 레이아웃 고정.
 */
export default function PrivacyPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col font-body bg-slate-50/50">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto space-y-12">
          
          {/* 헤더 섹션 - 신뢰성 강조 */}
          <div className="text-center space-y-4">
            <div className="mx-auto h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-black font-headline text-slate-900">{t('개인정보 처리방침')}</h1>
            <p className="text-slate-500 font-bold">{t('Easy Tax Refund는 고객님의 소중한 정보를 금융권 수준으로 보호합니다.')}</p>
          </div>

          <Card className="premium-card rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
            <CardContent className="p-10 lg:p-16 space-y-12 text-slate-700 leading-relaxed">
              
              <section className="space-y-4">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" /> {t('1. 수집하는 개인정보 항목')}
                </h3>
                <p className="font-medium">{t('회사는 서비스 제공을 위해 아래와 같은 정보를 수집합니다.')}</p>
                <ul className="list-disc pl-6 space-y-2 font-medium text-sm">
                  <li>{t('필수 항목: 성명(영문/한글), 외국인등록번호, 휴대폰 번호, 통신사 정보, 계좌 정보(은행명, 계좌번호, 예금주명)')}</li>
                  <li>{t('서비스 이용 과정 생성 항목: 서비스 이용 기록, 접속 로그, 쿠키, 접속 IP 정보, 결제 기록')}</li>
                  <li>{t('증빙 서류: 외국인등록증 사진, 급여명세서, 세무 대리 수임 동의서(전자서명 포함)')}</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" /> {t('2. 개인정보의 이용 목적')}
                </h3>
                <p className="font-medium text-sm">{t('수집된 정보는 다음의 목적을 위해서만 사용됩니다.')}</p>
                <ul className="list-disc pl-6 space-y-2 font-medium text-sm">
                  <li>{t('본인 인증 및 국세청 데이터 연동을 통한 환급액 분석')}</li>
                  <li>{t('조세특례제한법에 따른 중소기업 취업자 소득세 감면 신청 대행')}</li>
                  <li>{t('세무 대리인 선임 및 세무서 경정청구 서류 제출')}</li>
                  <li>{t('환급금 입금을 위한 계좌 정보 확인 및 서비스 수수료 결제 처리')}</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-primary" /> {t('3. 개인정보의 제3자 제공')}
                </h3>
                <p className="font-medium text-sm">{t('회사는 원활한 세무 처리를 위해 다음과 같이 정보를 제공합니다.')}</p>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-sm font-bold space-y-2">
                  <p>{t('제공받는 자: (주)이지택스 세무회계 및 협력 공인세무사')}</p>
                  <p>{t('제공 항목: 성명, 외국인등록번호, 소득 내역, 근무지 정보, 전자서명')}</p>
                  <p>{t('제공 목적: 국세청 경정청구 대행 및 세무 상담')}</p>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-black text-slate-900">{t('4. 개인정보의 보유 및 이용 기간')}</h3>
                <p className="text-sm font-medium">
                  {t('회사는 원칙적으로 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 관계법령의 규정에 의하여 보존할 필요가 있는 경우 회사는 아래와 같이 관계법령에서 정한 일정한 기간 동안 회원정보를 보관합니다.')}
                </p>
                <ul className="list-disc pl-6 space-y-2 font-medium text-sm">
                  <li>{t('계약 또는 청약철회 등에 관한 기록: 5년')}</li>
                  <li>{t('대금결제 및 재화 등의 공급에 관한 기록: 5년')}</li>
                  <li>{t('소비자의 불만 또는 분쟁처리에 관한 기록: 3년')}</li>
                </ul>
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
