/** FINAL_TRANSLATION_LOCK: VI_ZH_DONE_DO_NOT_MODIFY **/

"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { askFaqQuestion } from "@/ai/flows/ai-powered-faq-flow";
import { Sparkles, Send, Loader2, MessageCircle, HelpCircle, BadgeCheck, ShieldCheck, X, Minimize2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AiChatDialog } from "@/components/AiChatDialog";
import { useTranslation } from "@/components/LanguageContext";

export default function FAQPage() {
  const { t, language } = useTranslation();
  const { toast } = useToast();
  const [question, setQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAiVisible, setIsAiVisible] = useState(true);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    
    setLoading(true);
    setAiAnswer(null); // 이전 답변 초기화
    
    try {
      const result = await askFaqQuestion({ 
        question,
        language
      });
      setAiAnswer(result.answer);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: t("AI 비서 연결 실패"),
        description: t("현재 AI 비서가 응답할 수 없습니다. 잠시 후 다시 시도해 주세요."),
      });
    } finally {
      setLoading(false);
    }
  };

  const faqSections = [
    {
      category: t("1. 비자 및 체류 자격 (Visa & Status)"),
      items: [
        {
          q: t("비자 종류(E-7, E-9, F-2 등)에 상관없이 신청할 수 있나요?"),
          a: t("네, 비자 종류보다는 '거주자(183일 이상 한국 거주)' 여부와 '중소기업 근무' 여부가 중요합니다. 요건만 충족한다면 대부분의 취업 비자 소지자가 혜택 대상입니다.")
        },
        {
          q: t("지금은 회사를 그만두고 구직 중(D-10)이거나 본국으로 돌아갈 예정인데 가능한가요?"),
          a: t("과거 5년 이내에 한국 중소기업에서 일하며 세금을 냈던 기록이 있다면, 현재 무직 상태이거나 출국 예정이라도 지난 세금을 돌려받을 수 있습니다.")
        },
        {
          q: t("이 신청이 내 비자 연장이나 영주권 신청에 불이익을 주지 않나요?"),
          a: t("전혀 그렇지 않습니다. 이것은 정부가 법적으로 보장하는 정당한 세제 혜택이며, 세금을 체납하는 것이 아니라 이미 낸 세금을 법에 따라 환급받는 것이므로 비자 상태에 아무런 영향을 주지 않습니다.")
        }
      ]
    },
    {
      category: t("2. 회사와의 관계 (Relationship with Company)"),
      items: [
        {
          q: t("회사 몰래 신청할 수 있나요? 사장님이 알면 싫어하실까 봐 걱정돼요."),
          a: t("과거의 세금을 돌려받는 '경정청구'는 회사를 통하지 않고 본인이 직접 세무서에 신청하는 것입니다. 회사에는 어떠한 통보도 가지 않으며, 회사가 비용을 부담하는 것도 아니니 안심하고 신청하셔도 됩니다.")
        },
        {
          q: t("회사가 중소기업인지 어떻게 확인하나요?"),
          a: t(`저희 앱에 접속하여 사업자 번호만 입력하시면, 저희 AI 시스템이 해당 기업이 감면 대상인 '중소기업 기본법'상의 중소기업인지 즉시 판별해 드립니다.`)
        }
      ]
    },
    {
      category: t("3. 환급 및 세금 (Refund & Tax)"),
      items: [
        {
          q: t("이미 연말정산을 했는데 또 받을 수 있는 게 있나요?"),
          a: t(`네, 연말정산 때 이 감면 혜택(90% 감면)을 적용받지 못했다면, 놓친 금액만큼을 '경정청구'라는 절차를 통해 별도로 돌려받을 수 있습니다.`)
        },
        {
          q: t("돈은 언제, 어디로 들어오나요?"),
          a: t("신청 후 세무서의 검토를 거쳐 보통 1~2개월 이내에 신청 시 입력하신 본인 명의의 한국 은행 계좌로 국세청에서 직접 입금됩니다.")
        },
        {
          q: t("환급금이 없으면 수수료를 안 내도 되나요?"),
          a: t("네, 저희 서비스는 '성공 보수' 원칙입니다. 예상 환급액을 확인하는 것은 무료이며, 실제 환급액이 발생하지 않으면 어떠한 수수료도 청구되지 않습니다.")
        }
      ]
    },
    {
      category: t("4. 본인 인증 및 오류 (Authentication)"),
      items: [
        {
          q: t("이름이 외국인 등록증(ARC)이랑 통신사에 등록된 게 다른데 어떡하죠?"),
          a: t("외국인들이 가장 많이 겪는 문제입니다. 저희 앱의 'AI 이름 최적화' 기능을 사용하면, 다양한 이름 조합을 자동으로 테스트하여 인증에 성공할 수 있도록 도와드립니다.")
        },
        {
          q: t("한국 핸드폰 번호가 없으면 신청이 불가능한가요?"),
          a: t("국세청 데이터 조회를 위해 본인 명의의 휴대폰 인증이나 금융인증서가 반드시 필요합니다. 본인 명의가 아닌 경우 상담원을 통해 별도의 방법을 안내받으실 수 있습니다.")
        }
      ]
    },
    {
      category: t("5. 연령 및 기간 (Age & Period)"),
      items: [
        {
          q: t("저는 만 34세가 넘었는데 아예 방법이 없나요?"),
          a: t("현재 나이가 만 34세가 넘었더라도, '취업 당시' 나이가 만 34세 이하였다면 그 시점부터 5년 동안의 세금은 환급받을 수 있습니다. 포기하기 전에 꼭 확인해 보세요.")
        },
        {
          q: t("한국에 온 지 1년밖에 안 됐는데 신청 가능한가요?"),
          a: t("네, 입사한 날로부터 바로 혜택이 시작됩니다. 작년에 냈던 세금을 지금 바로 환급 신청하세요.")
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col font-body bg-slate-50">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto space-y-20">
          <div className="text-center space-y-6">
            <h1 className="text-4xl lg:text-6xl font-extrabold font-headline tracking-tighter text-slate-900">{t('당신의 궁금증을')}<br />{t('명쾌하게 해결해 드립니다')}</h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">{t('외국인 근로자의 권리, 이제는 전문가와 AI에게 물어보세요.')}</p>
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
                     <CardDescription className="text-base">{t('어떤 질문이든 자유롭게 입력하세요. 365일 24시간 실시간 답변.')}</CardDescription>
                   </div>
                 </div>
               </CardHeader>
               <CardContent className="space-y-10 relative z-10 px-0 pb-0">
                 <form onSubmit={handleAsk} className="flex flex-col sm:flex-row gap-4">
                   <Input 
                     placeholder={t("예: E-7 비자인데 환급 신청할 수 있나요?")} 
                     className="h-16 text-lg rounded-2xl border-slate-200 focus:ring-primary shadow-inner bg-slate-50/50 flex-1 px-6"
                     value={question}
                     onChange={(e) => setQuestion(e.target.value)}
                   />
                   <button type="submit" className="h-16 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-white flex items-center justify-center shadow-xl shadow-primary/20 disabled:opacity-50 transition-all" disabled={loading}>
                     {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Send className="h-6 w-6" />}
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
                         <p className="font-bold text-primary tracking-widest uppercase text-xs">AI Assistant Response</p>
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
                 className="rounded-full px-8 py-6 border-primary/20 hover:bg-primary/5 text-primary font-bold gap-3 shadow-lg shadow-primary/5 group"
               >
                 <Sparkles className="h-5 w-5 group-hover:animate-pulse" />
                 {t('Easy Tax Refund AI 비서')} 호출하기
               </Button>
             </div>
           )}

          {/* Categorized FAQ */}
          <div className="space-y-16">
            {faqSections.map((section, sectionIdx) => (
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

          {/* Trust Badge Section */}
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
              <Button variant="outline" size="lg" className="rounded-2xl h-18 px-16 border-2 border-primary text-primary hover:bg-primary/5 text-xl font-bold transition-all hover:scale-105">
                {t('상담원과 실시간 채팅하기')}
              </Button>
            </AiChatDialog>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
