
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "@/components/LanguageContext";
import { ShieldCheck, FileText, Lock, Eye, UserCheck, Scale, RotateCcw, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LegalDialogProps {
  type: "privacy" | "terms";
  children: React.ReactNode;
}

export function LegalDialog({ type, children }: LegalDialogProps) {
  const { t } = useTranslation();

  const isPrivacy = type === "privacy";

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl">
        <DialogHeader className="p-8 bg-slate-900 text-white space-y-2 shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
              {isPrivacy ? <ShieldCheck className="h-6 w-6 text-white" /> : <FileText className="h-6 w-6 text-white" />}
            </div>
            <div>
              <DialogTitle className="text-xl font-black">
                {isPrivacy ? t('개인정보 처리방침') : t('서비스 이용 약관')}
              </DialogTitle>
              <p className="text-xs text-slate-400 font-bold">
                {isPrivacy 
                  ? t('Easy Tax Refund는 고객님의 소중한 정보를 금융권 수준으로 보호합니다.') 
                  : t('Easy Tax Refund 이용을 위한 표준 약관 및 정책 안내입니다.')}
              </p>
            </div>
          </div>
        </DialogHeader>
        
        <ScrollArea className="flex-1 overflow-auto p-8 lg:p-12 bg-white">
          <div className="space-y-12 pb-12">
            {isPrivacy ? (
              <>
                <section className="space-y-4">
                  <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <Eye className="h-5 w-5 text-primary" /> {t('1. 수집하는 개인정보 항목')}
                  </h3>
                  <p className="font-medium text-slate-600">{t('회사는 서비스 제공을 위해 아래와 같은 정보를 수집합니다.')}</p>
                  <ul className="list-disc pl-6 space-y-2 font-medium text-sm text-slate-500">
                    <li>{t('필수 항목: 성명(영문/한글), 외국인등록번호, 휴대폰 번호, 통신사 정보, 계좌 정보(은행명, 계좌번호, 예금주명)')}</li>
                    <li>{t('서비스 이용 과정 생성 항목: 서비스 이용 기록, 접속 로그, 쿠키, 접속 IP 정보, 결제 기록')}</li>
                    <li>{t('증빙 서류: 외국인등록증 사진, 급여명세서, 세무 대리 수임 동의서(전자서명 포함)')}</li>
                  </ul>
                </section>

                <section className="space-y-4">
                  <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <Lock className="h-5 w-5 text-primary" /> {t('2. 개인정보의 이용 목적')}
                  </h3>
                  <p className="font-medium text-sm text-slate-600">{t('수집된 정보는 다음의 목적을 위해서만 사용됩니다.')}</p>
                  <ul className="list-disc pl-6 space-y-2 font-medium text-sm text-slate-500">
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
                  <p className="font-medium text-sm text-slate-600">{t('회사는 원활한 세무 처리를 위해 다음과 같이 정보를 제공합니다.')}</p>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-sm font-bold space-y-2">
                    <p className="text-slate-700">{t('제공받는 자: (주)이지택스 세무회계 및 협력 공인세무사')}</p>
                    <p className="text-slate-700">{t('제공 항목: 성명, 외국인등록번호, 소득 내역, 근무지 정보, 전자서명')}</p>
                    <p className="text-slate-700">{t('제공 목적: 국세청 경정청구 대행 및 세무 상담')}</p>
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-xl font-black text-slate-900">{t('4. 개인정보의 보유 및 이용 기간')}</h3>
                  <p className="text-sm font-medium text-slate-600">
                    {t('회사는 원칙적으로 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 관계법령의 규정에 의하여 보존할 필요가 있는 경우 회사는 아래와 같이 관계법령에서 정한 일정한 기간 동안 회원정보를 보관합니다.')}
                  </p>
                  <ul className="list-disc pl-6 space-y-2 font-medium text-sm text-slate-500">
                    <li>{t('계약 또는 청약철회 등에 관한 기록: 5년')}</li>
                    <li>{t('대금결제 및 재화 등의 공급에 관한 기록: 5년')}</li>
                    <li>{t('소비자의 불만 또는 분쟁처리에 관한 기록: 3년')}</li>
                  </ul>
                </section>

                <div className="pt-10 border-t border-slate-100 text-xs text-slate-400 font-bold">
                  {t('공고일자: 2024년 05월 20일 / 시행일자: 2024년 06월 01일')}
                </div>
              </>
            ) : (
              <>
                <section className="space-y-4">
                  <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <Scale className="h-5 w-5 text-primary" /> {t('제 1 조 (목적)')}
                  </h3>
                  <p className="font-medium text-sm text-slate-600">
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
                  <p className="font-medium text-sm text-slate-600">{t('이용자는 서비스 이용을 위해 정확한 정보를 제공해야 합니다.')}</p>
                  <ul className="list-disc pl-6 space-y-2 font-medium text-sm text-slate-500">
                    <li>{t('타인의 명의나 부정확한 정보를 사용하여 신청할 경우 서비스가 거절될 수 있으며 법적 책임이 발생할 수 있습니다.')}</li>
                    <li>{t('국세청 검토 과정에서 세무서의 추가 소명 요청이 있을 경우, 이용자는 성실히 협조해야 합니다.')}</li>
                  </ul>
                </section>

                <section className="space-y-4">
                  <h3 className="text-xl font-black text-slate-900">{t('제 5 조 (면책 조항)')}</h3>
                  <p className="font-medium text-sm text-slate-600">
                    {t('회사는 국세청 시스템 점검, 천재지변 등 불가항력적인 사유로 인해 서비스가 일시 중단되는 경우 책임을 지지 않습니다. 또한, 환급 기간은 국세청의 처리 속도에 따라 변동될 수 있습니다.')}
                  </p>
                </section>

                <div className="pt-10 border-t border-slate-100 text-xs text-slate-400 font-bold">
                  {t('공고일자: 2024년 05월 20일 / 시행일자: 2024년 06월 01일')}
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
