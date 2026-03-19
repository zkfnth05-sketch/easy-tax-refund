/** FINAL_TRANSLATION_LOCK: VI_ZH_DONE_DO_NOT_MODIFY **/

"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  ShieldCheck, 
  UserCheck, 
  Scale, 
  RotateCcw, 
  ArrowRight,
  Gem,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/components/LanguageContext";

export default function PricingPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col font-body bg-slate-50/50">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto space-y-16">
          <div className="text-center space-y-6">
            <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-bold uppercase tracking-widest">{t('Pricing Policy')}</Badge>
            <h1 className="text-4xl lg:text-6xl font-black font-headline text-slate-900 tracking-tighter">
              {t('[가격 정책]')}<br />
              <span className="text-primary">{t('투명하고 안전한 20% 선임 제도')}</span>
            </h1>
            <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">
              {t('우리는 단순히 계산기만 돌리는 앱이 아닙니다. 당신의 사건을 맡아 해결하는 법적 대리인입니다.')}
            </p>
          </div>

          <div className="grid gap-8">
            {/* 1. 요율제 섹션 */}
            <Card className="premium-card rounded-[3rem] border-none overflow-hidden shadow-2xl">
              <CardHeader className="bg-slate-900 text-white p-10 lg:p-16">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center">
                    <Gem className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-2xl lg:text-3xl font-black">{t('1. 신뢰를 바탕으로 한 단일 요율제')}</CardTitle>
                </div>
                <div className="space-y-6">
                  <p className="text-xl lg:text-2xl font-medium text-slate-300 leading-relaxed">
                    {t('저희 서비스는 복잡한 가입비나 숨겨진 비용 없이, 환급액의 20%를 정찰제로 운영합니다.')}
                  </p>
                  <p className="text-slate-400 font-medium border-l-4 border-primary pl-6">
                    {t('이 수수료는 당신의 소중한 세금을 되찾아오기 위한 전문 세무사의 전담 마크와 AI 시스템 이용료가 포함된 금액입니다.')}
                  </p>
                </div>
              </CardHeader>
            </Card>

            {/* 2. 선임료 필요성 섹션 */}
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="premium-card rounded-[3rem] p-10 lg:p-12 space-y-8 bg-white border border-slate-100 shadow-xl">
                <div className="space-y-4">
                  <div className="h-14 w-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                    <Scale className="h-7 w-7" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">{t('2. 왜 20% 선결제(선임)가 필요한가요?')}</h3>
                  <p className="text-slate-500 font-medium">{t('외국인 세금 환급은 한국인보다 과정이 훨씬 까다롭습니다.')}</p>
                </div>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-1" />
                    <div>
                      <h4 className="font-black text-slate-900 text-lg">{t('개별 맞춤형 서류 검토')}</h4>
                      <p className="text-slate-500 font-medium text-sm">{t('AI가 찾은 데이터를 바탕으로 전문 세무사가 당신의 비자와 재직 상태를 1:1로 정밀 검토합니다.')}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <UserCheck className="h-6 w-6 text-primary shrink-0 mt-1" />
                    <div>
                      <h4 className="font-black text-slate-900 text-lg">{t('전담 대리인 지정')}</h4>
                      <p className="text-slate-500 font-medium text-sm">{t('선임료 결제와 동시에 당신만을 위한 법적 세무 대리인이 지정되어 세무서와의 모든 소통을 책임집니다.')}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <ShieldCheck className="h-6 w-6 text-primary shrink-0 mt-1" />
                    <div>
                      <h4 className="font-black text-slate-900 text-lg">{t('책임 있는 서비스')}</h4>
                      <p className="text-slate-500 font-medium text-sm">{t("선임료는 저희가 끝까지 환급을 완료하겠다는 '약속의 증표'입니다.")}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* 3. 환불 보장 섹션 */}
              <Card className="premium-card rounded-[3rem] p-10 lg:p-12 bg-white border border-slate-200 space-y-10 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03]">
                  <RotateCcw className="h-48 w-48 text-slate-900" />
                </div>
                <div className="space-y-4 relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-primary" />
                    <Badge className="bg-primary/10 text-primary border-none font-black px-4 py-1">{t('핵심 정책 (CORE POLICY)')}</Badge>
                  </div>
                  <h3 className="text-3xl font-black font-headline text-slate-900 leading-tight">{t('3. [핵심] 100% 안심 환불 보장 정책')}</h3>
                  <p className="text-slate-600 font-medium text-lg">{t('가장 우려하시는 부분에 대해 명확한 약속을 드립니다.')}</p>
                </div>
                
                <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-200 space-y-6 relative z-10">
                  <p className="text-2xl lg:text-3xl font-black leading-tight text-slate-900">
                    {t('환급이 거절되면, 선임료 20% 전액을 즉시 돌려드립니다.')}
                  </p>
                  <p className="text-slate-700 font-bold text-base leading-relaxed">
                    {t('만약 세무서의 최종 검토 결과 환급이 불가능한 것으로 판명될 경우, 결제하신 선임료는 단 1원도 빠짐없이 100% 환불해 드립니다. 당신의 리스크는 0%입니다.')}
                  </p>
                </div>

                <Button className="w-full h-16 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 border-none font-black text-lg transition-all hover:scale-[1.02] relative z-10" asChild>
                  <Link href="/estimate" className="flex items-center justify-center">
                    {t('지금 무료로 조회하기')} <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </Card>
            </div>
          </div>

          <div className="text-center pt-10">
            <div className="inline-flex items-center gap-6 px-10 py-6 rounded-[2rem] bg-slate-900 text-white shadow-2xl">
              <div className="text-left">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t('Guaranteed Confidence')}</p>
                <p className="text-xl font-black italic">{t('"Professional Service, Zero Risk."')}</p>
              </div>
              <div className="h-10 w-px bg-white/10 hidden sm:block" />
              <p className="text-sm font-medium text-slate-300 hidden sm:block max-w-[200px]">{t('전문적인 서비스,')}<br />{t('리스크는 제로.')}</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
