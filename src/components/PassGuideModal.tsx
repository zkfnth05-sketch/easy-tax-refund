"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselApi,
} from "@/components/ui/carousel";
import { useTranslation } from "@/components/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  ChevronLeft, 
  ChevronRight, 
  Info, 
  AlertTriangle, 
  Lightbulb, 
  CheckCircle2, 
  Search, 
  X, 
  Copy, 
  Sparkles, 
  Camera, 
  RefreshCw, 
  Check, 
  Scan, 
  Loader2,
  ScanText
} from "lucide-react";
import { extractIdInfo } from "@/ai/flows/ocr-id-flow";
import { optimizeName } from "@/ai/flows/name-optimization-flow";

interface GuideMarker {
  x: number; // percentage from left (0-100)
  y: number; // percentage from top (0-100)
  text: string;
  hideBox?: boolean;
  isMask?: boolean; // If true, make the box solid to cover sensitive info
  position?: "top" | "bottom"; // Default to top
}

interface GuideStep {
  image: string;
  markers: GuideMarker[];
}

// Fixed sequence 1-27
const PASS_GUIDE_STEPS: GuideStep[] = Array.from({ length: 27 }, (_, i) => ({
  image: `/images/guide/pass/pass_${String(i + 1).padStart(2, "0")}.jpg`,
  markers: [],
}));

// Step 1 (pass_01)
PASS_GUIDE_STEPS[0].markers = [
  { x: 50, y: 18, text: "SKT 알뜰폰→SKT / KT 알뜰폰→KT / LG 알뜰폰→LG 선택" },
  { x: 45, y: 39, text: "본인 통신사에 맞는 PASS 앱을 설치해 주세요" },
];

// Step 2 (pass_02)
PASS_GUIDE_STEPS[1].markers = [
  { x: 50, y: 16, text: "이용 중인 통신사의 PASS 앱을 설치해 주세요" },
];

// Step 3 (pass_03)
PASS_GUIDE_STEPS[2].markers = [
  { x: 50, y: 20, text: "설치가 완료되었습니다 '열기'를 눌러 앱을 실행해 주세요", hideBox: true },
  { x: 74, y: 25, text: "" },
];

// Step 4 (pass_04)
PASS_GUIDE_STEPS[3].markers = [
  { x: 50, y: 55, text: "아래로 스크롤하여 모든 내용을 확인해 주세요", hideBox: true },
  { x: 50, y: 89, text: "앱 이용 권한 안내입니다. '확인'을 눌러주세요" },
];

// Step 5 (pass_05)
PASS_GUIDE_STEPS[4].markers = [
  { x: 50, y: 80, text: "'허용'을 눌러 앱 알림 권한을 승인해 주세요" },
];

// Step 6 (pass_06)
PASS_GUIDE_STEPS[5].markers = [
  { x: 50, y: 80, text: "'허용'을 눌러 전화 관리 권한을 승인해 주세요" },
];

// Step 7 (pass_07)
PASS_GUIDE_STEPS[6].markers = [
  { x: 50, y: 20.5, text: "성명을 입력해 주세요" },
  { x: 50, y: 34.3, text: "외국인 등록번호를 입력해 주세요" },
  { x: 50, y: 46.5, text: "휴대폰 번호를 입력해 주세요" },
  { x: 50, y: 88, text: "정보 입력 후 '다음'을 눌러주세요" },
];

// Step 8 (pass_08)
PASS_GUIDE_STEPS[7].markers = [
  { x: 50, y: 47.5, text: "PASS 필수 항목을 선택하여 모두 동의해 주세요" },
  { x: 50, y: 88.5, text: "동의를 마친 후 '다음' 버튼을 눌러주세요" },
];

// Step 9 (pass_09)
PASS_GUIDE_STEPS[8].markers = [
  { x: 50, y: 17.5, text: "휴대폰 문자로 받은 인증번호 6자리를 입력해 주세요" },
  { x: 50, y: 88.5, text: "번호를 모두 입력한 후 '다음' 버튼을 눌러주세요" },
];

// Step 10 (pass_10)
PASS_GUIDE_STEPS[9].markers = [
  { x: 50, y: 30, text: "앞으로 앱 실행 시 사용할 숫자 6자리 비밀번호를 설정해 주세요" },
  { x: 50, y: 68, text: "연속된 숫자나 생년월일 등 쉬운 번호를 피해서 입력해 주세요" },
];

// Step 11 (pass_11)
PASS_GUIDE_STEPS[10].markers = [
  { x: 50, y: 25, text: "설정한 비밀번호를 확인하기 위해 한 번 더 입력해 주세요" },
];

// Step 12 (pass_12)
PASS_GUIDE_STEPS[11].markers = [
  { x: 50, y: 89, text: "PASS 가입이 완료되었습니다 인증서 발급을 위해 하단의 '다음'을 눌러 이동해 주세요" },
  { x: 50, y: 55, text: "생체 인증은 건너뛰고 '다음'을 눌러주세요", hideBox: true },
];

// Step 13 (pass_13)
PASS_GUIDE_STEPS[12].markers = [
  { x: 50, y: 36.5, text: "인증서를 발급받기 위해 화면 중앙의 '인증서 관리' 메뉴를 눌러주세요" },
];

// Step 14 (pass_14)
PASS_GUIDE_STEPS[13].markers = [
  { x: 50, y: 55, text: "초록색 팝업창 중앙의 '인증서 발급 받기' 버튼을 눌러주세요" },
];

// Step 15 (pass_15)
PASS_GUIDE_STEPS[14].markers = [
  { x: 50, y: 51, text: "인증서 서비스를 이용하기 위해 필수 항목을 선택하여 모두 동의해 주세요", hideBox: true },
  { x: 9, y: 56.5, text: "" }, // Just box on the checkbox
  { x: 50, y: 80.5, text: "모든 항목에 동의한 후 하단의 '발급' 버튼을 눌러주세요" },
];

// Step 16 (pass_16)
PASS_GUIDE_STEPS[15].markers = [
  { x: 50, y: 20.5, text: "이름을 실명으로 입력해 주세요" },
  { x: 50, y: 32.5, text: "가입된 휴대폰 번호를 숫자만 입력해 주세요" },
  { x: 50, y: 41.5, text: "'인증번호요청' 버튼을 누른 후 문자로 받은 번호를 입력해 주세요", position: "bottom" },
  { x: 50, y: 88.5, text: "정보 입력 후 '다음' 버튼을 눌러주세요" },
];

// Step 17 (pass_17)
PASS_GUIDE_STEPS[16].markers = [
  { x: 50, y: 42.5, text: "문자로 받은 인증번호 6자리를 입력해 주세요" },
  { x: 50, y: 88.5, text: "번호를 입력한 후 하단의 '다음' 버튼을 눌러주세요" },
];

// Step 18 (pass_18)
PASS_GUIDE_STEPS[17].markers = [
  { x: 50, y: 18, text: "본인이 사용 중인 은행을 목록에서 선택해 주세요" },
  { x: 50, y: 33, text: "본인 명의의 계좌번호를 하이픈(-) 없이 숫자만 입력해 주세요", position: "bottom" },
  { x: 50, y: 48, text: "'인증요청' 버튼을 누르면 해당 계좌로 1원이 입금됩니다", position: "bottom" },
];

// Step 19 (pass_19)
PASS_GUIDE_STEPS[18].markers = [
  { x: 50, y: 8.5, text: "해당 은행 앱의 거래내역에서 'SKT또는 LGU또는 KT' 뒤에 적힌 숫자 3자리를 확인해 주세요" },
  { x: 50, y: 45.5, text: "확인한 숫자 3자리를 아래 입력창에 넣어주세요" },
  { x: 50, y: 88.5, text: "입력을 마친 후 하단의 '다음' 버튼을 눌러주세요" },
];

// Step 20 (pass_20)
PASS_GUIDE_STEPS[19].markers = [
  { x: 50, y: 8, text: "은행 앱에서 1원 입금 내역을 보면 'SKT또는 LGU또는 KT' 뒤에 숫자 3자리가 적혀 있습니다.", hideBox: true },
  { x: 50, y: 15, text: "사진 속 '510'처럼 적힌 숫자 3자리를 기억해 주세요", hideBox: true },
  { x: 15, y: 18, text: "" },
];

// Step 21 (pass_21)
PASS_GUIDE_STEPS[20].markers = [
  { x: 50, y: 46, text: "확인된 입금자명 중 3자리 숫자를 입력해 주세요" },
  { x: 50, y: 88, text: "입력 후 하단의 '다음' 버튼을 눌러주세요", position: "bottom" },
];

// Step 22 (pass_22)
PASS_GUIDE_STEPS[21].markers = [
  { x: 50, y: 26, text: "앱에서 사용할 비밀번호 6자리를 설정해 주세요", position: "bottom" },
];

// Step 23 (pass_23)
PASS_GUIDE_STEPS[22].markers = [
  { x: 50, y: 46, text: "PASS 인증서 발급이 완료되었습니다!" },
  { x: 50, y: 55, text: "가운데 '확인' 버튼을 눌러주세요", position: "bottom" },
];

// Step 24 (pass_24)
PASS_GUIDE_STEPS[23].markers = [
  { x: 50, y: 15, text: "상단의 빨간색 '홈택스 인증 요청' 알림을 눌러주세요", position: "bottom" },
];

// Step 25 (pass_25)
PASS_GUIDE_STEPS[24].markers = [
  { x: 50, y: 64, text: "제3자 제공 동의에 체크해 주세요" },
  { x: 68, y: 76, text: "우측 하단의 '인증' 버튼을 눌러주세요", position: "bottom" },
];

// Step 26 (pass_26)
PASS_GUIDE_STEPS[25].markers = [
  { x: 50, y: 36, text: "조금 전 가입할 때 설정하신 비밀번호 6자리를 입력하세요", position: "bottom" },
];

// Step 27 (pass_27)
PASS_GUIDE_STEPS[26].markers = [
  { x: 50, y: 35, text: "🎉 축하합니다 🎉\n이제 PASS에서의 모든 작업이 끝났습니다!\n\n열려있는 앱을 닫고 '텍스리펀 앱'으로 돌아가\n최종 '인증완료'를 누르세요!", hideBox: true },
];

const CHAPTERS = [
  { title: "PASS 시작", start: 0, icon: "📱" },
  { title: "회원가입", start: 6, icon: "⚠️" },
  { title: "인증서 발급", start: 12, icon: "🎫" },
  { title: "계좌 인증 완료", start: 17, icon: "🏦" },
];

export function PassGuideModal({ 
  isOpen, 
  onClose,
  optimizedNames = [],
  officialName = "",
  currentAuthName = "",
  mode = "registration"
}: { 
  isOpen: boolean; 
  onClose: () => void;
  optimizedNames?: Array<{ name: string; label: string }>;
  officialName?: string;
  currentAuthName?: string;
  mode?: "registration" | "auth" | "full";
}) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const [isAiHelperOpen, setIsAiHelperOpen] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [localOptimizedNames, setLocalOptimizedNames] = useState<Array<{ name: string; label: string }>>([]);
  const [isCopied, setIsCopied] = useState<string | null>(null);
  const [showAiHelper, setShowAiHelper] = useState(false);
  const [dismissAiCard, setDismissAiCard] = useState(false);

  const stepsToRender = React.useMemo(() => {
    if (mode === "registration") return PASS_GUIDE_STEPS.slice(0, 23);
    if (mode === "auth") return PASS_GUIDE_STEPS.slice(23, 27);
    return PASS_GUIDE_STEPS;
  }, [mode]);

  const absoluteIndex = mode === "auth" ? current + 23 : current;

  const currentChapterIndex = CHAPTERS.findIndex((ch, i) => {
    const nextCh = CHAPTERS[i + 1];
    return absoluteIndex >= ch.start && (!nextCh || absoluteIndex < nextCh.start);
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(text);
    toast({
      title: t("복사되었습니다"),
      description: t("패스 앱의 성명란에 붙여넣으세요."),
    });
    setTimeout(() => setIsCopied(null), 2000);
  };

  const handleAiScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAiProcessing(true);
    try {
      const reader = new FileReader();
      const photoDataUri = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const ocrResult = await extractIdInfo({ photoDataUri });
      if (!ocrResult.name) throw new Error("Could not find name");

      const optimizationResult = await optimizeName({ name: ocrResult.name });
      if (optimizationResult.combinations && optimizationResult.combinations.length > 0) {
        setLocalOptimizedNames(optimizationResult.combinations);
        toast({
          title: t("AI 이름 분석 완료!"),
          description: t("회원님의 이름 형식을 찾았습니다."),
        });
      } else {
        throw new Error("No name combinations found");
      }
    } catch (error) {
      console.error('AI Scan Error:', error);
      toast({
        variant: "destructive",
        title: t("AI 분석 실패"),
        description: t("신분증 사진을 인식할 수 없습니다. 글자가 잘 보이게 다시 찍어주세요."),
      });
    } finally {
      setIsAiProcessing(false);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      window.dispatchEvent(new CustomEvent("hide-social-proof"));
      document.body.classList.add("guide-modal-open");
    } else {
      window.dispatchEvent(new CustomEvent("show-social-proof"));
      document.body.classList.remove("guide-modal-open");
    }
    return () => document.body.classList.remove("guide-modal-open");
  }, [isOpen]);

  React.useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const goToChapter = (index: number) => {
    api?.scrollTo(CHAPTERS[index].start);
  };

  const renderStepTip = () => {
    if (absoluteIndex === 8) { // Step 9: SMS Verification Phase
      if (dismissAiCard) return null;

      const hasRealNames = (officialName && optimizedNames.length > 0) || localOptimizedNames.length > 0;
      const currentSuggestions = localOptimizedNames.length > 0 ? localOptimizedNames : optimizedNames;
      const displayFailName = officialName || "HONG GIL DONG";
      const displaySuccessName = hasRealNames ? currentSuggestions[0].name : "GILDONG HONG";

      return (
        <div className="absolute inset-x-0 bottom-[12%] z-[130] px-3 sm:px-4 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="bg-amber-50 border-2 border-amber-200 rounded-[1.5rem] p-4 shadow-xl shadow-amber-900/15 flex flex-col gap-4 relative">
            <button
               onClick={(e) => { e.stopPropagation(); setDismissAiCard(true); }}
               className="absolute top-3 right-3 p-1.5 rounded-full text-amber-500 hover:bg-amber-200/50 hover:text-amber-700 transition-colors"
               aria-label="닫기"
            >
               <X className="h-4 w-4" />
            </button>
            <div className="flex items-start gap-3.5 pr-6">
              <div className="h-11 w-11 bg-amber-400 rounded-2xl flex items-center justify-center shrink-0 shadow-lg border-2 border-white/50">
                <AlertTriangle className="text-white h-7 w-7" />
              </div>
              <div className="flex-1 space-y-1.5 mt-0.5">
                <h5 className="font-black text-amber-900 text-sm leading-none mb-1.5 uppercase tracking-tight">{t("문자가 오지 않나요?")}</h5>
                <p className="text-[11px] font-bold text-amber-800 leading-normal">
                  {t("문자가 오면 인증번호 입력 후 넘어가시면 됩니다. 하지만 문자가 오지 않는다면, 휴대폰을 처음 개통할 때 상담사가 입력한 이름 방식과 현재 외국인등록증 영문 이름이 다를 가능성이 높습니다. 이름이 조금이라도 다르면 조회가 불가능하니, 외국인등록증을 촬영하시고 AI가 추천해 주는 이름으로 다시 시도해 보세요!")}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-amber-200/50">
              <button
                onClick={() => setIsAiHelperOpen(true)}
                className="w-full h-11 bg-white hover:bg-white/90 border-2 border-amber-400 rounded-xl px-4 flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500 fill-amber-500" />
                  <span className="text-xs font-black text-amber-900">{t("내 이름 형식 AI 분석하기 (추천)")}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (absoluteIndex === 15) { // Step 16: Account Verification
      return (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[110] w-[90%] max-w-[400px] animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-[2rem] p-5 shadow-2xl shadow-blue-900/10 flex items-start gap-4">
            <div className="h-10 w-10 bg-blue-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
              <Lightbulb className="text-white h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h5 className="font-black text-blue-900 text-sm">{t("계좌 인증 성공 비결")}</h5>
              <p className="text-[11px] font-bold text-blue-800/80 leading-relaxed">
                {t("계좌 1원 입금자명 중 마지막 숫자 3자리를 입력하세요. 문자가 안 온다면 은행 앱에서 직접 확인하는 것이 가장 빠릅니다!")}
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderInlineStepTip = (stepIndex: number) => null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-slate-950/95 border-none h-[95vh] flex flex-col sm:rounded-[2.5rem]">
        <DialogHeader className="p-6 bg-white shrink-0 border-b z-50 relative pr-12">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="가이드 닫기"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 text-left">
              <DialogTitle className="text-xl font-black text-slate-900 flex items-center gap-2">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center overflow-hidden">
                  <span className="text-white font-black text-[10px]">PASS</span>
                </div>
                {t("PASS 상세 가이드")}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <DialogDescription className="font-bold text-slate-400 text-xs sm:text-sm">
                  {t("외국인 사용자를 위한 4단계 핵심 가이드")}
                </DialogDescription>
                {optimizedNames.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowAiHelper(!showAiHelper)}
                    className={cn(
                      "h-7 px-3 rounded-full text-[10px] font-black transition-all gap-1.5",
                      showAiHelper ? "bg-primary text-white" : "bg-primary/10 text-primary hover:bg-primary/20"
                    )}
                  >
                    <Search className="h-3 w-3" />
                    {t("내 추천 성명 보기")}
                  </Button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl sm:rounded-full shrink-0">
               {CHAPTERS.map((ch, i) => (
                 <button
                   key={i}
                   onClick={() => goToChapter(i)}
                   className={cn(
                     "flex-1 sm:flex-none px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-full text-[10px] sm:text-xs font-black transition-all flex items-center justify-center gap-1.5 whitespace-nowrap",
                     currentChapterIndex === i 
                       ? "bg-slate-900 text-white shadow-lg scale-105" 
                       : "text-slate-400 hover:text-slate-600 hover:bg-slate-200"
                   )}
                 >
                   <span className="opacity-70">{ch.icon}</span>
                   {t(ch.title)}
                 </button>
               ))}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 w-full bg-slate-100 relative overflow-hidden min-h-0">
          {renderStepTip()}
          
          {showAiHelper && optimizedNames.length > 0 && (
            <div className="absolute top-4 right-4 z-[120] w-64 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-3xl p-4 shadow-2xl animate-in fade-in zoom-in duration-300">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
                <h6 className="font-black text-xs text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  {t("내 본인인증 추천 성명")}
                </h6>
                <button onClick={() => setShowAiHelper(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-2">
                {optimizedNames.map((item, i) => (
                  <div 
                    key={i} 
                    onClick={() => handleCopy(item.name)}
                    className={cn(
                        "p-3 rounded-2xl border transition-all cursor-pointer group",
                        currentAuthName === item.name ? "bg-primary/5 border-primary/20" : "bg-slate-50 border-transparent hover:border-primary/20"
                    )}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-slate-900">{item.name}</span>
                      <Copy className="h-3 w-3 text-slate-300 group-hover:text-primary transition-colors" />
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 mt-1">{t(item.label)}</p>
                  </div>
                ))}
              </div>
              <p className="text-[9px] font-bold text-slate-400 mt-4 leading-tight italic">
                {t("* 클릭하면 복사됩니다 PASS 앱에 붙여넣어 사용하세요")}
              </p>
            </div>
          )}

          <Carousel 
            setApi={setApi} 
            className="w-full h-full"
            opts={{ align: "start", loop: false, watchDrag: false }}
          >
            <CarouselContent className="h-full ml-0">
              {stepsToRender.map((step, index) => (
                <CarouselItem key={index} className="h-[calc(95vh-160px)] overflow-y-auto pl-0 relative flex-shrink-0 bg-slate-100">
                  <div className="flex flex-col items-center pt-8 px-4 pb-32 sm:pt-12 sm:px-8">
                    <div className="relative w-full max-w-[480px] shadow-2xl rounded-[2.5rem] border-[10px] sm:border-[16px] border-slate-900 bg-white ring-8 ring-white/10 ring-offset-2 ring-offset-slate-200">
                      <img src={step.image} alt={`Guide Step ${index + 1}`} className="w-full h-auto block rounded-[1.8rem] sm:rounded-[2.2rem]" />
                      <div className="absolute inset-0 pointer-events-none">
                        {step.markers.map((marker, mId) => (
                          <div key={mId} className="absolute pointer-events-auto" style={{ left: `${marker.x}%`, top: `${marker.y}%`, transform: "translate(-50%, -50%)" }}>
                            <div className="relative group">
                              {!marker.hideBox && (
                                <div className={cn("transition-all duration-300", marker.isMask ? "w-[90vw] max-w-[420px] h-[35px] sm:h-[45px] bg-white border-none opacity-100 shadow-[0_0_15px_rgba(255,255,255,1)]" : "w-[18vw] h-[18vw] max-w-[100px] max-h-[100px] min-w-[50px] min-h-[50px] border-[3px] sm:border-[5px] border-amber-400 border-dashed rounded-2xl sm:rounded-3xl animate-pulse shadow-[0_0_20px_rgba(251,191,36,0.6)] bg-amber-400/20")} />
                              )}
                              {marker.text && (
                                <div className={cn("absolute left-1/2 -translate-x-1/2 whitespace-normal sm:whitespace-nowrap z-[60] w-max max-w-[70vw] sm:max-w-none transition-all duration-300", marker.position === "bottom" ? "top-[15vw] sm:top-32 translate-y-0" : "-top-[1.5vw] sm:-top-6 -translate-y-full")}>
                                  <div className="bg-amber-400 text-slate-900 text-[clamp(10px,2.8vw,18px)] font-black px-4 py-2 sm:px-8 sm:py-4 rounded-xl sm:rounded-3xl shadow-xl sm:shadow-2xl flex items-center gap-2 sm:gap-4 border-2 border-white ring-2 sm:ring-4 ring-amber-400/30">
                                    <Info className="w-[4vw] h-[4vw] max-w-[24px] max-h-[24px] min-w-[14px] min-h-[14px] text-slate-900 flex-shrink-0" />
                                    <span className="leading-tight break-keep whitespace-pre-line text-center">{t(marker.text)}</span>
                                    {marker.position === "bottom" ? <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-4 h-4 sm:w-6 sm:h-6 bg-amber-400 rotate-45 border-l-2 border-t-2 border-white" /> : <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-4 h-4 sm:w-6 sm:h-6 bg-amber-400 rotate-45 border-r-2 border-b-2 border-white" />}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {renderInlineStepTip(index)}
                    <div className="h-[120px] w-full shrink-0" />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            <div className="absolute bottom-10 left-0 right-0 flex justify-center items-center gap-6 px-8 pointer-events-none z-[100]">
                <Button variant="outline" size="icon" onClick={(e) => { e.stopPropagation(); api?.scrollPrev(); }} disabled={current === 0} className="h-14 w-14 sm:h-16 sm:w-16 rounded-full shadow-2xl pointer-events-auto bg-white border-white/20 hover:bg-slate-50 hover:scale-110 transition-transform">
                    <ChevronLeft className="h-8 w-8 sm:h-10 sm:w-10 text-slate-900" />
                </Button>
                
                <div className="bg-slate-900/90 backdrop-blur-xl text-white px-6 py-2.5 sm:px-8 sm:py-4 rounded-full font-black text-base sm:text-xl pointer-events-auto shadow-2xl flex items-center gap-2">
                    <span className="text-primary hidden sm:inline">{t(CHAPTERS[currentChapterIndex].title)}</span>
                    <span className="mx-2 opacity-50 hidden sm:inline">|</span>
                    <span className="text-primary">{current + 1}</span>
                    <span className="mx-1 opacity-50">/</span>
                    <span>{stepsToRender.length}</span>
                </div>

                <Button variant="outline" size="icon" onClick={(e) => { e.stopPropagation(); api?.scrollNext(); }} disabled={current === stepsToRender.length - 1} className="h-14 w-14 sm:h-16 sm:w-16 rounded-full shadow-2xl pointer-events-auto bg-white border-white/20 hover:bg-slate-50 hover:scale-110 transition-transform">
                    <ChevronRight className="h-8 w-8 sm:h-10 sm:w-10 text-slate-900" />
                </Button>
            </div>
          </Carousel>
        </div>
      </DialogContent>
    </Dialog>

    {/* AI Helper Modal */}
    <Dialog open={isAiHelperOpen} onOpenChange={setIsAiHelperOpen}>
      <DialogContent className="max-w-xs sm:max-w-sm rounded-[2rem] p-6 border-none shadow-2xl bg-amber-50 gap-6 z-[200]">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-slate-900 flex items-center justify-center gap-2 text-center">
            <Sparkles className="text-amber-500 fill-amber-500 h-5 w-5" />
            {t("내 이름 형식 AI 분석")}
          </DialogTitle>
          <DialogDescription className="text-center font-bold text-slate-500 text-xs mt-2">
            {t("외국인등록증을 촬영하시면 AI가 통신사 등록 이름을 찾아냅니다.")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {!isAiProcessing && localOptimizedNames.length === 0 ? (
            <div className="bg-white rounded-2xl p-4 border border-dashed border-amber-300 flex flex-col items-center gap-3 text-center">
              <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
                <Camera className="text-amber-500 h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-black text-amber-900">{t("외국인등록증 사진을 분석합니다")}</p>
                <p className="text-[10px] text-amber-800/60 font-medium">{t("AI가 즉시 통신사 등록 이름을 분석해 드립니다.")}</p>
              </div>
              <label className="w-full h-11 bg-amber-400 hover:bg-amber-500 text-white rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-lg active:scale-95">
                <ScanText className="h-4 w-4" />
                <span className="text-xs font-black">{t("외국인등록증 촬영 / 선택")}</span>
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleAiScan} />
              </label>
            </div>
          ) : isAiProcessing ? (
            <div className="bg-white rounded-2xl p-6 border border-amber-200 flex flex-col items-center gap-4 text-center">
              <div className="relative h-12 w-12 flex items-center justify-center">
                <div className="absolute inset-0 bg-amber-200 rounded-full animate-ping opacity-25" />
                <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
              </div>
              <p className="text-xs font-black text-amber-900 animate-pulse">{t("분석 중입니다...")}</p>
            </div>
          ) : (
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-600">
                  <Check className="h-4 w-4" />
                  <span className="text-xs font-black">{t("분석 완료! 클릭하여 복사")}</span>
                </div>
                <button onClick={() => setLocalOptimizedNames([])} className="h-6 w-6 rounded-full hover:bg-emerald-200/50 flex items-center justify-center">
                  <RefreshCw className="h-3 w-3 text-emerald-500" />
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {localOptimizedNames.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      handleCopy(item.name);
                      setTimeout(() => setIsAiHelperOpen(false), 800);
                    }}
                    className="w-full bg-white border border-emerald-100 hover:border-emerald-300 rounded-xl p-3 flex items-center justify-between transition-all active:scale-95 text-left"
                  >
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-emerald-500/80">{t(item.label)}</span>
                      <span className="text-sm font-black text-emerald-700">{item.name}</span>
                    </div>
                    <div className="h-8 w-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                      {isCopied === item.name ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-emerald-200" />}
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-center text-[10px] font-bold text-emerald-600/60 mt-2">{t("* 복사 후 창이 자동으로 닫힙니다.")}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  </>
  );
}
