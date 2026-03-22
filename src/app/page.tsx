/** FINAL_TRANSLATION_LOCK: VI_ZH_DONE_DO_NOT_MODIFY **/

"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  ShieldCheck, 
  BadgeCheck,
  CheckCircle2,
  Sparkles,
  Send,
  Loader2,
  MessageCircle,
  HelpCircle,
  RotateCcw,
  AlertCircle,
  ScanSearch,
  UserCheck,
  Lock,
  Plane,
  Home,
  Coins,
  Trophy,
  Globe,
  Database,
  Shield,
  X,
  Minimize2
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { askFaqQuestion } from "@/ai/flows/ai-powered-faq-flow";
import { useToast } from "@/hooks/use-toast";
import { AiChatDialog } from "@/components/AiChatDialog";
import { useTranslation } from "@/components/LanguageContext";
import { captureTrackingData, logVisit } from "@/lib/tracking";

import { useRouter } from "next/navigation";
import { languages } from '@/lib/translations/config';
import Image from 'next/image';

export default function HomePage() {
  const router = useRouter();
  const { t, isReady, setLanguage } = useTranslation();
  const { toast } = useToast();
  const [question, setQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAiVisible, setIsAiVisible] = useState(true);

  const [hasSeenWelcome, setHasSeenWelcome] = useState<boolean | null>(null);

  // 방문 여부 확인 및 초기화
  useEffect(() => {
    const welcomeSeen = localStorage.getItem("welcome_seen");
    setHasSeenWelcome(!!welcomeSeen);
  }, []);

  const handleLanguageSelect = (langCode: any) => {
    localStorage.setItem('welcome_seen', 'true');
    setLanguage(langCode as any);
    setHasSeenWelcome(true);
  };

  // Parse and store UTM or referrer data on first load
  useEffect(() => {
    captureTrackingData();
    logVisit();
  }, []);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    
    setLoading(true);
    setAiAnswer(null);
    
    try {
      const result = await askFaqQuestion({ question });
      setAiAnswer(result.answer);
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("AI 비서 연결 실패"),
        description: t("현재 AI 비서가 응답할 수 없습니다. 잠시 후 다시 시도해 주세요."),
      });
    } finally {
      setLoading(false);
    }
  };

  const faqData = [
    {
      category: t('1. 비자 및 체류 자격 (Visa & Status)'),
      items: [
        { q: t('비자 종류(E-7, E-9, F-2 등)에 상관없이 신청할 수 있나요?'), a: t("네, 비자 종류보다는 '거주자(183일 이상 한국 거주)' 여부와 '중소기업 근무' 여부가 중요합니다. 요건만 충족한다면 대부분의 취업 비자 소지자가 혜택 대상입니다.") },
        { q: t('지금은 회사를 그만두고 구직 중(D-10)이거나 본국으로 돌아갈 예정인데 가능한가요?'), a: t("과거 5년 이내에 한국 중소기업에서 일하며 세금을 냈던 기록이 있다면, 현재 무직 상태이거나 출국 예정이라도 지난 세금을 돌려받을 수 있습니다.") },
        { q: t('이 신청이 내 비자 연장이나 영주권 신청에 불이익을 주지 않나요?'), a: t('전혀 그렇지 않습니다. 이것은 정부가 법적으로 보장하는 정당한 세제 혜택이며, 세금을 체납하는 것이 아니라 이미 낸 세금을 법에 따라 환급받는 것이므로 비자 상태에 아무런 영향을 주지 않습니다.') },
      ]
    },
    {
      category: t('2. 회사와의 관계 (Relationship with Company)'),
      items: [
        { q: t('회사 몰래 신청할 수 있나요? 사장님이 알면 싫어하실까 봐 걱정돼요.'), a: t("과거의 세금을 돌려받는 '경정청구'는 회사를 통하지 않고 본인이 직접 세무서에 신청하는 것입니다. 회사에는 어떠한 통보도 가지 않으며, 회사가 비용을 부담하는 것도 아니니 안심하고 신청하셔도 됩니다.") },
        { q: t('회사가 중소기업인지 어떻게 확인하나요?'), a: t(`저희 앱에 접속하여 사업자 번호만 입력하시면, 저희 AI 시스템이 해당 기업이 감면 대상인 '중소기업 기본법'상의 중소기업인지 즉시 판별해 드립니다.`) },
      ]
    },
    {
      category: t('3. 환급 및 세금 (Refund & Tax)'),
      items: [
        { q: t('이미 연말정산을 했는데 또 받을 수 있는 게 있나요?'), a: t(`네, 연말정산 때 이 감면 혜택(90% 감면)을 적용받지 못했다면, 놓친 금액만큼을 '경정청구'라는 절차를 통해 별도로 돌려받을 수 있습니다.`) },
        { q: t('돈은 언제, 어디로 들어오나요?'), a: t('신청 후 세무서의 검토를 거쳐 보통 1~2개월 이내에 신청 시 입력하신 본인 명의의 한국 은행 계좌로 국세청에서 직접 입금됩니다.') },
        { q: t('환급금이 없으면 수수료를 안 내도 되나요?'), a: t("네, 저희 서비스는 '성공 보수' 원칙입니다. 예상 환급액을 확인하는 것은 무료이며, 실제 환급액이 발생하지 않으면 어떠한 수수료도 청구되지 않습니다.") },
      ]
    },
    {
      category: t('4. 본인 인증 및 오류 (Authentication)'),
      items: [
        { q: t('이름이 외국인 등록증(ARC)이랑 통신사에 등록된 게 다른데 어떡하죠?'), a: t("외국인들이 가장 많이 겪는 문제입니다. 저희 앱의 'AI 이름 최적화' 기능을 사용하면, 다양한 이름 조합을 자동으로 테스트하여 인증에 성공할 수 있도록 도와드립니다.") },
        { q: t('한국 핸드폰 번호가 없으면 신청이 불가능한가요?'), a: t('국세청 데이터 조회를 위해 본인 명의의 휴대폰 인증이나 금융인증서가 반드시 필요합니다. 본인 명의가 아닌 경우 상담원을 통해 별도의 방법을 안내받으실 수 있습니다.') },
      ]
    },
    {
      category: t('5. 연령 및 기간 (Age & Period)'),
      items: [
        { q: t('저는 만 34세가 넘었는데 아예 방법이 없나요?'), a: t("현재 나이가 만 34세가 넘었더라도, '취업 당시' 나이가 만 34세 이하였다면 그 시점부터 5년 동안의 세금은 환급받을 수 있습니다. 포기하기 전에 꼭 확인해 보세요.") },
        { q: t('한국에 온 지 1년밖에 안 됐는데 신청 가능한가요?'), a: t('네, 입사한 날로부터 바로 혜택이 시작됩니다. 작년에 냈던 세금을 지금 바로 환급 신청하세요.') }
      ]
    }
  ];

  // 로딩 중이거나 방문 여부를 아직 확인하지 못한 경우
  if (!isReady || hasSeenWelcome === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
        <div className="relative flex flex-col items-center gap-8 animate-fade-in">
          <div className="flex items-center gap-4 group">
            <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-primary via-primary/90 to-indigo-700 text-white shadow-[0_15px_35px_-5px_rgba(99,102,241,0.4)]">
              <Globe className="h-9 w-9 animate-pulse" />
            </div>
            <span className="text-4xl font-black tracking-tighter text-slate-900 font-headline">Easy Tax Refund</span>
          </div>
          <div className="h-2 w-16 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-primary animate-progress-indefinite" />
          </div>
        </div>
      </div>
    );
  }

  // 방문한 적이 없다면 국기 선택 화면(Welcome) 표시
  if (!hasSeenWelcome) {
    return (
      <div className="min-h-screen flex flex-col font-body bg-slate-50 items-center justify-center p-6 py-20">
        <div className="max-w-6xl w-full space-y-16 animate-fade-in-up">
          <div className="text-center space-y-6">
            <div className="mx-auto h-20 w-20 bg-primary rounded-[2rem] flex items-center justify-center shadow-2xl shadow-primary/20 mb-8 animate-float">
              <Globe className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-black font-headline text-slate-900 tracking-tight">
              {t('welcome_title')}
            </h1>
            <p className="text-xl text-slate-500 font-bold">
              {t('welcome_desc')}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {languages.map((lang, index) => (
              <Card 
                key={lang.code}
                onClick={() => handleLanguageSelect(lang.code)}
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

  // 방문한 적이 있다면 메인 서비스 화면(Home) 표시

  return (
    <div className="min-h-screen flex flex-col font-body">
      <Navbar />
      <main className="flex-1">
        
        {/* 디자인 섹션 1: 히어로 섹션 */}
        <section className="relative pt-32 pb-24 lg:pt-52 lg:pb-40 overflow-hidden bg-slate-50/50">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[1000px] h-[1000px] bg-primary/5 rounded-full blur-[140px]" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-5xl mx-auto text-center space-y-10">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-primary/10 shadow-[0_4px_20px_-4px_rgba(99,102,241,0.1)] animate-fade-in-up">
                <BadgeCheck className="h-5 w-5 text-primary" />
                <span className="text-sm font-bold text-slate-700 tracking-tight">{t('청년 외국인 세무 지원 • Certified System')}</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-[5.5rem] font-black font-headline text-slate-900 text-gradient animate-fade-in-up delay-100 leading-[1.1] break-keep">
                {t('한국에서 일하는 당신의')}<br />
                {t('땀방울,')}<br />
                <span className="text-primary inline-block transform -skew-x-1">{t('이제 90%의 세금 환급')}</span>{t('으로 보상받으세요.')}
              </h1>
              
              <div className="max-w-3xl mx-auto space-y-8 text-xl lg:text-2xl text-slate-500 font-medium leading-relaxed animate-fade-in-up delay-200">
                <p>{t(`대한민국 중소기업에서 근무하는 외국인 전문 인력 중 90% 이상이 자신의 당연한 권리를 놓치고 있다는 사실을 알고 계십니까? 청년 외국인 근로자(35번째 생일이 지나기 전에 한국에서 일을 시작했다면 OK!)는 소득세의 90%를 감면받을 수 있습니다.`)}</p>
                <div className="flex items-center justify-center gap-3 text-primary/80 font-bold bg-primary/5 py-4 px-8 rounded-3xl border border-primary/10 w-fit mx-auto">
                  <CheckCircle2 className="h-6 w-6" />
                  {t('언어의 장벽과 복잡한 절차 때문에 포기하지 마세요. 저희가 최적의 환급 경로를 찾아드립니다.')}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 animate-fade-in-up delay-300">
                <Button size="lg" asChild className="text-lg sm:text-2xl px-8 sm:px-16 py-6 sm:py-10 h-auto bg-slate-900 hover:bg-slate-800 shadow-2xl shadow-slate-900/20 rounded-2xl sm:rounded-[2rem] transition-all hover:scale-105 active:scale-95 group">
                  <Link href="/estimate" className="flex items-center gap-3 sm:gap-4">
                    {t('30초 만에 환급액 확인하기')} <ArrowRight className="h-6 w-6 sm:h-7 sm:w-7 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* 디자인 섹션 2: 신뢰 지표 */}
        <section className="py-12 bg-white border-b border-slate-50 overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-12 lg:gap-24 opacity-80 text-slate-400">
              <div className="flex items-center gap-3 font-black text-2xl tracking-tighter">{t('청년 외국인 세무 지원')}</div>
              <div className="flex items-center gap-3 font-black text-2xl tracking-tighter">{t('CERTIFIED TAX SERVICE')}</div>
              <div className="flex items-center gap-3 font-black text-2xl tracking-tighter">{t('FINANCIAL SECURITY')}</div>
            </div>
          </div>
        </section>

        {/* 디자인 섹션 3: 정부 공인 상세 안내 */}
        <section className="py-20 bg-slate-50/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/[0.02] pointer-events-none" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-16 text-center md:text-left p-10 bg-white rounded-[3rem] shadow-xl border border-slate-100/50">
              <div className="shrink-0 relative group">
                <div className="absolute -inset-4 bg-primary/10 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <Image 
                  src="/official_nts_carrier_badge_v2_1774141326494.png"
                  alt="Official NTS & Carrier Badge" 
                  width={180}
                  height={180}
                  className="relative rounded-3xl shadow-xl border border-slate-50 transition-transform group-hover:scale-105"
                />
              </div>
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600">
                  <ShieldCheck className="h-5 w-5" />
                  <span className="text-xs font-black uppercase tracking-widest leading-none">{t('safe_and_secure')}</span>
                </div>
                <h2 className="text-2xl md:text-4xl font-black text-slate-900 leading-tight">
                  {t('nts_trust_title')}
                </h2>
                <p className="text-lg md:text-xl text-slate-500 font-bold leading-relaxed max-w-2xl">
                  {t('nts_trust_message')}
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-8 pt-2">
                  <div className="flex items-center gap-2.5 text-sm font-black text-slate-400">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    {t('nts_hometax')}
                  </div>
                  <div className="flex items-center gap-2.5 text-sm font-black text-slate-400">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    {t('SKT / KT / LGU+')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 디자인 섹션 5: 문제 제기 */}
        <section className="py-32 bg-white overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-20 items-center max-w-7xl mx-auto">
              <div className="space-y-10">
                <div className="space-y-4">
                  <Badge variant="outline" className="text-red-500 border-red-100 bg-red-50 px-4 py-1.5 font-bold uppercase tracking-widest">{t('REAL PROBLEM')}</Badge>
                  <h2 className="text-4xl lg:text-6xl font-black font-headline text-slate-900 leading-tight whitespace-pre-line">
                    {t("Why didn't I know\nthis before?")}
                  </h2>
                  <p className="text-2xl font-bold text-slate-400">{t('외국인 근로자 10명 중 9명이 환급을 받지 못하는 이유')}</p>
                </div>
                <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-xl">{t(`대한민국 정부는 중소기업에서 활약하는 젊은 인재들을 위해 강력한 세제 혜택를 제공합니다. 하지만 정작 혜택를 받아야 할 외국인 근로자들은 정보 부족과 까다로운 본인 인증 절차 때문에 매년 수백만 원을 국가에 남겨두고 있습니다.`)}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center space-y-2">
                    <div className="text-slate-400 font-bold text-xs uppercase tracking-widest">{t('매년 최대 환급액')}</div>
                    <div className="text-2xl font-black text-slate-900">{t('200만 원')}</div>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center space-y-2">
                    <div className="text-slate-400 font-bold text-xs uppercase tracking-widest">{t('지원 기간')}</div>
                    <div className="text-2xl font-black text-slate-900">{t('최대 5년')}</div>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center space-y-2">
                    <div className="text-slate-400 font-bold text-xs uppercase tracking-widest">{t('과거 내역 소급')}</div>
                    <div className="text-2xl font-black text-slate-900">{t('과거 5년치')}</div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-primary/5 rounded-[4rem] -rotate-3" />
                <Card className="relative premium-card rounded-[3.5rem] border-none p-10 lg:p-16 space-y-12 shadow-2xl overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-primary"><AlertCircle className="h-48 w-48" /></div>
                  <h3 className="text-2xl font-black text-slate-900 relative z-10">{t('왜 지금까지 못 받았을까요?')}</h3>
                  <div className="space-y-6 relative z-10">
                    {[t('복잡한 조세특례제한법 법률 용어'), t('통신사와 ARC 명의 불일치로 인한 인증 실패'), t('회사 인사팀에 직접 물어보기 껄끄러운 상황'), t('외국인 전문 상담 창구의 부재')].map((reason, idx) => (
                      <div key={idx} className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-slate-50 shadow-sm transition-all hover:border-primary/20">
                        <div className="h-8 w-8 bg-red-50 rounded-full flex items-center justify-center shrink-0"><AlertCircle className="h-5 w-5 text-red-500" /></div>
                        <span className="text-lg font-bold text-slate-600">{reason}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* 디자인 섹션 4: 해결책 */}
        <section className="py-32 bg-slate-50/50">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center space-y-4 mb-20">
              <h2 className="text-4xl lg:text-6xl font-black font-headline text-slate-900">
                {t('가장 까다로운 인증을')}<br /><span className="text-primary">{t('가장 확실하게 해결합니다')}</span>
              </h2>
              <p className="text-xl text-slate-500 font-bold">{t('Easy Tax Refund만의 독자적인 기술력과 전문성을 경험하세요.')}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="premium-card rounded-[2.5rem] border-none p-8 space-y-6 bg-white shadow-xl">
                <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center"><ScanSearch className="h-8 w-8 text-primary" /></div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-black text-slate-900">{t('외국인 전용 성명 매칭 알고리즘')}</h3>
                  <p className="text-slate-500 font-medium leading-relaxed">{t('ARC와 통신사 정보의 이름 형식이 달라 발생하는 고질적인 인증 오류를 저희만의 독자적인 알고리즘으로 해결했습니다.')}</p>
                </div>
              </Card>
              <Card className="premium-card rounded-[2.5rem] border-none p-8 space-y-6 bg-white shadow-xl">
                <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center"><UserCheck className="h-8 w-8 text-primary" /></div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-black text-slate-900">{t('국가 공인 세무 전문가의 검토')}</h3>
                  <p className="text-slate-500 font-medium leading-relaxed">{t('단순한 자동화 프로그램이 아닙니다. 모든 신청은 대한민국 공인 세무사의 철저한 검토를 거쳐 진행됩니다.')}</p>
                </div>
              </Card>
              <Card className="premium-card rounded-[2.5rem] border-none p-8 space-y-6 bg-white shadow-xl">
                <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center"><Lock className="h-8 w-8 text-primary" /></div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-black text-slate-900">{t('금융권 수준의 데이터 보안')}</h3>
                  <p className="text-slate-500 font-medium leading-relaxed">{t('당신의 소중한 개인정보는 은행급 암호화 프로토콜로 보호됩니다. 환급 목적 외 데이터 사용은 절대 금지됩니다.')}</p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* 디자인 섹션 7: CTA */}
        <section className="py-32 bg-white relative">
          <div className="container mx-auto px-6 max-w-5xl text-center space-y-12">
            <h2 className="text-4xl lg:text-7xl font-black font-headline text-slate-900 text-gradient break-keep">
              {t('단 30초의 확인으로')}<br />{t('지난 5년의 권리를 찾으세요.')}
            </h2>
            <div className="flex flex-col items-center gap-8 pt-8">
              <Button size="lg" asChild className="text-xl sm:text-3xl px-10 sm:px-20 py-8 sm:py-12 h-auto bg-primary hover:bg-primary/90 shadow-[0_32px_64px_-12px_rgba(99,102,241,0.4)] rounded-2xl sm:rounded-[2.5rem] transition-all hover:scale-105 active:scale-95">
                <Link href="/estimate" className="flex items-center gap-4">
                  {t('내 환급액 무료로 확인하기')} <ArrowRight className="h-6 w-6 sm:h-8 sm:w-8" />
                </Link>
              </Button>
              <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-3xl bg-white border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 text-slate-900 font-black"><ShieldCheck className="h-6 w-6 text-primary" />{t('Professional Service')}</div>
                <div className="hidden sm:block h-4 w-px bg-slate-200" />
                <div className="flex items-center gap-2 text-slate-900 font-black"><RotateCcw className="h-6 w-6 text-primary" />{t('Zero Risk')}</div>
              </div>
              <p className="text-slate-400 font-bold max-lg">{t('우리는 단순히 계산기만 돌리는 앱이 아닙니다. 전문적인 서비스, 리스크는 제로. 환급 거절 시 선임료를 100% 환불해 드립니다.')}</p>
            </div>
          </div>
        </section>

        {/* 디자인 섹션 8: 보안 안심 보증서 */}
        <section className="py-24 bg-white overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="bg-slate-50 rounded-[4rem] p-10 md:p-20 relative overflow-hidden border border-slate-100 group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-[100px] group-hover:bg-primary/10 transition-colors duration-1000" />
                
                <div className="relative flex flex-col lg:flex-row items-center gap-16">
                  <div className="shrink-0 relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-[40px] animate-pulse" />
                    <Image 
                      src="/certified_security_seal_premium_1774150786685.png" 
                      alt="Certified Security" 
                      width={220} 
                      height={220} 
                      className="relative transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  
                  <div className="flex-1 space-y-10 text-center lg:text-left">
                    <div className="space-y-4">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-primary/10 shadow-sm">
                        <Badge variant="outline" className="border-none bg-primary p-1 rounded-full"><Lock className="h-3 w-3 text-white" /></Badge>
                        <span className="text-sm font-black text-primary tracking-widest leading-none">{t('security_certified')}</span>
                      </div>
                      <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight break-keep">
                        {t('security_card_title')}
                      </h2>
                      <p className="text-xl text-slate-500 font-bold max-xl mx-auto lg:mx-0 leading-relaxed">
                        {t('security_card_subtitle')}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="space-y-3 p-6 bg-white rounded-3xl shadow-sm border border-slate-100 transition-transform hover:-translate-y-1">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                          <Lock className="h-6 w-6 text-primary" />
                        </div>
                        <h4 className="font-black text-slate-800">{t('security_item_encryption_title')}</h4>
                        <p className="text-sm font-bold text-slate-400 leading-relaxed">{t('security_item_encryption_desc')}</p>
                      </div>
                      
                      <div className="space-y-3 p-6 bg-white rounded-3xl shadow-sm border border-slate-100 transition-transform hover:-translate-y-1">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                          <Database className="h-6 w-6 text-primary" />
                        </div>
                        <h4 className="font-black text-slate-800">{t('security_item_no_storage_title')}</h4>
                        <p className="text-sm font-bold text-slate-400 leading-relaxed">{t('security_item_no_storage_desc')}</p>
                      </div>

                      <div className="space-y-3 p-6 bg-white rounded-3xl shadow-sm border border-slate-100 transition-transform hover:-translate-y-1">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                          <Shield className="h-6 w-6 text-primary" />
                        </div>
                        <h4 className="font-black text-slate-800">{t('security_item_pippa_title')}</h4>
                        <p className="text-sm font-bold text-slate-400 leading-relaxed">{t('security_item_pippa_desc')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 디자인 섹션 6: 미래 가치 */}
        <section className="py-32 bg-slate-900 text-white overflow-hidden">
          <div className="container mx-auto px-4 max-w-7xl relative">
            <div className="absolute top-0 right-0 p-24 opacity-10"><Trophy className="h-96 w-96 text-primary" /></div>
            <div className="grid lg:grid-cols-2 gap-20 items-center relative z-10">
              <div className="space-y-8">
                <div className="space-y-2">
                  <Badge className="bg-primary text-white border-none px-4 py-1.5 font-bold uppercase tracking-widest">{t('YOUR FUTURE VALUE')}</Badge>
                  <h2 className="text-4xl lg:text-6xl font-black font-headline leading-tight">
                    {t('연간 200만 원,')}<br />{t('당신의 한국 생활이 달라집니다')}
                  </h2>
                </div>
                <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-xl">{t('매년 한 달 치 월급을 보너스로 받는다고 상상해 보세요. Easy Tax Refund가 찾아드리는 환급금은 단순한 숫자가 아닌 당신의 미래를 위한 소중한 자산입니다.')}</p>
                <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 space-y-4">
                  <p className="text-lg font-bold text-slate-300">{t(`"절차가 어렵다는 이유만으로 당신의 소중한 돈을 포기하지 마세요. 저희가 그 과정을 쉽고 완벽하게 만들어 드립니다."`)}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Card className="bg-white/5 border-white/10 p-8 rounded-[2rem] space-y-4 hover:bg-white/10 transition-colors">
                  <div className="h-12 w-12 bg-primary/20 rounded-xl flex items-center justify-center"><Plane className="h-6 w-6 text-primary" /></div>
                  <h4 className="text-xl font-black text-white">{t('고향 방문 왕복 항공권')}</h4>
                  <p className="text-sm text-slate-400 font-medium">{t('가족들을 만나러 가는 비행기 표, 이제 부담 없이 예약하세요.')}</p>
                </Card>
                <Card className="bg-white/5 border-white/10 p-8 rounded-[2rem] space-y-4 hover:bg-white/10 transition-colors">
                  <div className="h-12 w-12 bg-primary/20 rounded-xl flex items-center justify-center"><Home className="h-6 w-6 text-primary" /></div>
                  <h4 className="text-xl font-black text-white">{t('수개월 치의 월세 및 생활비')}</h4>
                  <p className="text-sm text-slate-400 font-medium">{t('고정 지출의 부담을 줄이고 여유 있는 한국 생활을 즐기세요.')}</p>
                </Card>
                <Card className="bg-white/5 border-white/10 p-8 rounded-[2rem] space-y-4 hover:bg-white/10 transition-colors sm:col-span-2">
                  <div className="h-12 w-12 bg-primary/20 rounded-xl flex items-center justify-center"><Coins className="h-6 w-6 text-primary" /></div>
                  <h4 className="text-xl font-black text-white">{t('당신의 미래를 위한 종잣돈')}</h4>
                  <p className="text-sm text-slate-400 font-medium">{t('더 큰 꿈을 향한 투자의 시작, 환급금이 든든한 기반이 됩니다.')}</p>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* 사회적 증거(Social Proof) 리뷰 섹션 */}
        <section className="py-20 bg-slate-50/50 overflow-hidden border-t border-slate-100">
          <div className="container mx-auto px-4 mb-12 text-center">
            <Badge variant="outline" className="mb-4 py-1 px-4 border-primary/20 text-primary bg-primary/5 rounded-full font-bold">
              {t('함께하는 동료들의 리얼 후기')}
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900">
              {t('이미 많은 외국인 동료들이 권리를 찾았습니다')}
            </h2>
          </div>
          
          <div className="relative flex gap-8 py-4">
            <div className="flex gap-8 animate-marquee whitespace-nowrap">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex gap-8">
                  {[
                    { 
                      name: "Nguyen", country: "Vietnam", flag: "🇻🇳", amount: "3,100,000", 
                      text: "맨 처음에는 한국어를 몰라서 인증앱을 어떻게 깔아야 하나 걱정부터 앞섰어요. 그런데 이지텍스리펀드의 자세한 안내를 하나하나 따라하다 보니 인증에 성공했구요. 결과는 대박! 제가 받을 수 있는 금액이 310만원이나 되더라구요. 신청 후 2달 뒤에 어김없이 국세청에서 입금되었습니다. 여러분 두려워 마세요!" 
                    },
                    { 
                      name: "Chen", country: "China", flag: "🇨🇳", amount: "2,250,000", 
                      text: "솔직히 처음엔 사기인 줄 알고 의심했어요. 하지만 국세청 공식 데이터를 안전하게 가져온다는 설명을 보고 용기를 냈죠. PASS 앱 인증이 조금 복잡했지만 그림 가이드 덕분에 성공했고, 정확히 8주 뒤에 225만원이 통장으로 들어왔습니다. 정말 믿을 수 있는 서비스예요." 
                    },
                    { 
                      name: "Hassan", country: "Uzbekistan", flag: "🇺🇿", amount: "1,850,000", 
                      text: "이름 대소문자랑 띄어쓰기 때문에 항상 실패했는데, 여기서 알려준 대로 하니까 바로 통과됐어요! 한국어가 서툴러도 그림만 보면 누구나 할 수 있습니다. 185만원이라는 큰 돈이 생겨서 너무 행복합니다. 우즈벡 친구들에게도 다 추천하고 있어요." 
                    },
                    { 
                      name: "Maria", country: "Philippines", flag: "🇵🇭", amount: "2,780,000", 
                      text: "인증앱 설치가 외국인에겐 제일 큰 장벽인데, 이 앱은 그걸 아주 쉽게 풀어서 알려줍니다. 보안도 확실해서 개인정보 유출 걱정도 없었어요. 한 달 반 만에 278만원 환급받았습니다. 포기하지 마시고 꼭 도전해 보세요!" 
                    },
                    { 
                      name: "Aris", country: "Indonesia", flag: "🇮🇩", amount: "1,420,000", 
                      text: "처음엔 내 정보를 넣는 게 무서웠어요. 하지만 암호화 기술과 무저장 원칙을 보고 신뢰가 생겼습니다. 인증 성공하고 조회해보니 142만원이나 있었네요! 실제로 돈이 입금되는 걸 확인하니 정말 감격스러웠습니다. 이지텍스리펀드 팀 감사합니다." 
                    },
                    { 
                      name: "Sita", country: "Nepal", flag: "🇳🇵", amount: "3,000,000", 
                      text: "네팔 친구들은 세금을 돌려받을 수 있다는 사실조차 몰랐어요. 저도 긴가민가하면서 시작했는데 300만원 행운을 얻었습니다! 인증 과정이 조금 힘들 수 있지만 자세히 설명된 대로만 하면 저 같은 외국인도 충분히 성공할 수 있어요." 
                    },
                    { 
                      name: "Bat", country: "Mongolia", flag: "🇲🇳", amount: "950,000", 
                      text: "통신사 인증이 항상 문제였는데, 여기서 알려준 팁 덕분에 드디어 해결했습니다. 소액이라고 생각했는데 95만원이나 들어오니 기분 최고네요! 외국인을 위한 이런 서비스가 있어서 정말 다행입니다. 여러분도 본인의 권리를 찾으세요." 
                    },
                    { 
                      name: "Somchai", country: "Thailand", flag: "🇹🇭", amount: "2,120,000", 
                      text: "신청하고 나서 정말 돈이 들어올까 매일 확인했어요. 정확히 약속한 날짜에 국세청에서 입금 알림이 왔을 때 소리를 질렀습니다! 212만원 환급 성공! 인증앱 때문에 포기하지 마세요. 차근차근 따라하다 보면 행운이 올 거예요." 
                    },
                    { 
                      name: "Vlad", country: "Russia", flag: "🇷🇺", amount: "1,680,000", 
                      text: "보안이 제일 중요했는데 이 앱은 보안 보증서까지 있어서 안심하고 사용했습니다. 카카오톡 인증 방법이 상세해서 외국인인 저도 5분 만에 끝냈어요. 168만원 환급금 받고 고향 부모님께 선물 보냈습니다. 정말 감사합니다!" 
                    },
                    { 
                      name: "Kyaw", country: "Myanmar", flag: "🇲🇲", amount: "1,150,000", 
                      text: "미얀마 친구들이 사기 아니냐고 걱정했는데 제가 먼저 받고 증명했습니다! 115만원 통장에 찍히는 순간 다들 놀랐죠. 인증이 막힌다면 AI 비서에게 물어보세요. 정말 친절하게 알려줍니다. 모두 꼭 해보세요!" 
                    },
                  ].map((review, idx) => (
                    <Card key={idx} className="w-[550px] min-h-[350px] shrink-0 border-none shadow-[0_20px_45px_-10px_rgba(0,0,0,0.08)] rounded-[2.5rem] p-10 bg-white border border-slate-50 transition-all hover:scale-[1.03] active:scale-95 group flex flex-col justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-5 mb-8">
                          <div className="h-16 w-16 rounded-[1.25rem] bg-slate-50 flex items-center justify-center text-4xl shadow-inner leading-none group-hover:bg-primary/5 transition-colors">
                            {review.flag}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-slate-900 text-xl tracking-tight">{review.name}</span>
                              <Badge className="bg-primary/10 text-primary border-none font-bold text-[10px] h-5 px-2 uppercase tracking-wider">SECURE VERIFIED</Badge>
                            </div>
                            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">{review.country}</p>
                          </div>
                          <div className="ml-auto flex flex-col items-end">
                            <div className="flex items-baseline gap-1">
                              <span className="text-primary font-black text-3xl tracking-tighter">+{review.amount}</span>
                              <span className="text-slate-400 font-black text-sm">원</span>
                            </div>
                            <p className="text-[10px] text-green-500 font-black uppercase mt-1">NTS Deposited ✓</p>
                          </div>
                        </div>
                        <div className="relative">
                          <div className="absolute -top-4 -left-2 text-primary/10 text-6xl font-serif">"</div>
                          <p className="text-slate-600 font-bold leading-relaxed text-lg lg:text-xl pl-4 relative z-10 break-words whitespace-normal">
                            {t(review.text)}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ))}
            </div>
            {/* 측면 그래디언트 페이드 (고급스러움) */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-slate-50/100 to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-slate-50/100 to-transparent z-10 pointer-events-none" />
          </div>
        </section>

        {/* 디자인 섹션 7: FAQ/AI Assistant */}
        <section className="py-40 bg-white">
          <div className="container mx-auto px-4 max-w-4xl space-y-24">
            <div className="text-center space-y-6">
              <h2 className="text-4xl lg:text-6xl font-black font-headline text-slate-900">{t('궁금한 점이 있으신가요?')}</h2>
              <p className="text-slate-500 text-xl font-medium">{t('Easy Tax Refund AI 비서와 상세 FAQ가 도와드립니다.')}</p>
            </div>
            {/* AI Assistant Card */}
            {isAiVisible ? (
              <Card className="border-none shadow-[0_40px_80px_-15px_rgba(163,139,255,0.15)] relative overflow-hidden bg-white rounded-[3rem] p-6 lg:p-12 animate-in fade-in zoom-in duration-500">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] text-primary pointer-events-none">
                  <MessageCircle className="h-64 w-64" />
                </div>
                <button 
                  onClick={() => setIsAiVisible(false)}
                  className="absolute top-8 right-8 p-3 rounded-2xl hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-all z-20 group"
                  title="AI 비서 숨기기"
                >
                  <Minimize2 className="h-6 w-6 group-hover:scale-110 transition-transform" />
                </button>
                <CardHeader className="relative z-10 px-0 pt-0">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                      <Sparkles className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold">{t('Easy Tax Refund AI 비서')}</CardTitle>
                      <CardDescription className="text-base font-medium">{t('어떤 질문이든 자유롭게 입력하세요. 365일 24시간 실시간 답변.')}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-8 relative z-10 px-0 pb-0">
                  <form onSubmit={handleAsk} className="flex flex-col sm:flex-row gap-4">
                    <input 
                      placeholder={t(`궁금한 점을 자유롭게 입력하세요.`)} 
                      className="h-22 text-lg rounded-[1.5rem] border-slate-200 focus:ring-primary shadow-inner bg-slate-50/50 w-full sm:flex-1 px-8 outline-none transition-all focus:bg-white" 
                      value={question} 
                      onChange={(e) => setQuestion(e.target.value)} 
                    />
                    <button type="submit" className="h-22 px-10 rounded-[1.5rem] bg-primary hover:bg-primary/90 text-white flex items-center justify-center shadow-xl shadow-primary/20 disabled:opacity-50 transition-all w-full sm:w-auto min-w-[140px]" disabled={loading}>
                      {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="flex items-center gap-2 font-black text-xl">{t('질문하기')} <Send className="h-6 w-6" /></div>}
                    </button>
                  </form>
                  {aiAnswer && (
                    <div className="p-10 bg-slate-900 text-white rounded-[2.5rem] border-none animate-in fade-in slide-in-from-bottom-6 duration-700 shadow-2xl relative">
                      <div className="absolute top-6 right-8 flex items-center gap-4">
                        <Badge variant="outline" className="text-primary border-primary/30">AI Verified</Badge>
                        <button 
                          onClick={() => { setAiAnswer(null); setQuestion(""); }}
                          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="flex gap-6">
                        <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/40">
                          <Sparkles className="h-6 w-6 text-white" />
                        </div>
                        <div className="space-y-4">
                          <p className="font-bold text-primary tracking-widest uppercase text-xs">{t('AI Assistant Response')}</p>
                          <p className="text-xl text-slate-200 leading-relaxed font-medium whitespace-pre-wrap">{aiAnswer}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="flex justify-center animate-in fade-in slide-in-from-top-4 duration-500">
                <Button 
                  onClick={() => setIsAiVisible(true)}
                  variant="outline" 
                  className="rounded-full px-8 py-6 border-primary/20 hover:bg-primary/5 text-primary font-bold gap-3 shadow-lg shadow-primary/5 group h-auto"
                >
                  {t('Easy Tax Refund AI 비서 호출하기')}
                </Button>
              </div>
            )}

            <div className="space-y-16">
              {faqData.map((section, sectionIdx) => (
                <div key={sectionIdx} className="space-y-8">
                  <div className="flex items-center gap-4 px-4">
                    <div className="h-10 w-1.5 bg-primary rounded-full" />
                    <h2 className="text-2xl lg:text-3xl font-bold font-headline text-slate-900">{section.category}</h2>
                  </div>
                  <Accordion type="single" collapsible className="w-full space-y-4">
                    {section.items.map((item, itemIdx) => (
                      <AccordionItem key={itemIdx} value={`section-${sectionIdx}-item-${itemIdx}`} className="border-none rounded-[2rem] bg-white shadow-sm hover:shadow-md transition-all px-8 py-2">
                        <AccordionTrigger className="hover:no-underline font-bold text-lg lg:text-xl py-6 text-left text-slate-800">
                          <div className="flex items-center gap-4 pr-4">
                            <HelpCircle className="h-6 w-6 text-slate-300 shrink-0" />
                            {item.q}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-slate-500 text-lg pb-10 pl-10 leading-relaxed font-medium border-t border-slate-50 pt-8">
                          {item.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
            </div>

            <div className="text-center pt-20 pb-10 border-t border-slate-200">
              <div className="inline-flex flex-wrap justify-center items-center gap-6 px-10 py-5 rounded-3xl bg-white shadow-sm border border-slate-100">
                <div className="flex items-center gap-2">
                  <BadgeCheck className="h-6 w-6 text-primary" />
                  <span className="font-bold text-slate-700">{t('세무사 직접 검토')}</span>
                </div>
                <div className="hidden sm:block w-px h-6 bg-slate-200" />
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-6 w-6 text-green-500" />
                  <span className="font-bold text-slate-700">{t('금융권 수준 보안')}</span>
                </div>
              </div>
            </div>

            <div className="text-center space-y-10">
              <h3 className="text-2xl font-bold">{t('해결되지 않은 궁금증이 있나요?')}</h3>
              <AiChatDialog>
                <button className="inline-flex items-center justify-center rounded-2xl h-18 px-16 border-2 border-primary text-primary hover:bg-primary/5 text-xl font-bold transition-all hover:scale-105">
                  {t('상담원과 실시간 채팅하기')}
                </button>
              </AiChatDialog>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      {/* Mobile Sticky CTA */}
      <div className="lg:hidden fixed bottom-6 left-6 right-6 z-50 animate-fade-in-up delay-300">
        <Button size="lg" asChild className="w-full text-lg h-16 bg-slate-900 hover:bg-slate-800 shadow-2xl shadow-slate-900/40 rounded-2xl font-black">
          <Link href="/estimate" className="flex items-center justify-center gap-3">
            {t('30초 만에 환급액 확인하기')} <ArrowRight className="h-5 w-5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
