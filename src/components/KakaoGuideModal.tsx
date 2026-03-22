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
  Sparkles,
  Camera,
  ScanText,
  Loader2,
  Check,
  RefreshCw,
  Copy,
  X
} from "lucide-react";
import { extractIdInfo } from "@/ai/flows/ocr-id-flow";
import { optimizeName } from "@/ai/flows/name-optimization-flow";

interface GuideMarker {
  x: number; // percentage from left (0-100)
  y: number; // percentage from top (0-100)
  text: string;
  hideBox?: boolean;
  isMask?: boolean; // If true, make the box solid to cover sensitive info
  isRed?: boolean; // If true, use red theme for urgency
  isSmall?: boolean; // If true, make the highlight box smaller
  isLarge?: boolean; // If true, make the highlight box larger
  fontSize?: number; // Custom font size for the text bubble
  hideArrow?: boolean; // If true, do not show the speech bubble triangle
  position?: "top" | "bottom" | "center"; // Default to top
  textX?: number; // Optional override for text x position
  textY?: number; // Optional override for text y position
}

interface GuideStep {
  image: string;
  markers: GuideMarker[];
}

// Fixed sequence 1-? (Will be updated as images are uploaded)
// Keeping it simple for now, assuming at least one placeholder or first step
const KAKAO_GUIDE_STEPS: GuideStep[] = Array.from({ length: 37 }, (_, i) => ({
  image: `/images/guide/KakaoTalk/kakao_${i + 1}.jpg`,
  markers: [],
}));

const CHAPTERS = [
  { title: "카카오톡 시작", start: 0, icon: "📱" },
  { title: "회원가입", start: 2, icon: "⚠️" },
  { title: "인증서 발급", start: 20, icon: "🎫" },
  { title: "계좌 인증 완료", start: 25, icon: "🏦" },
];

// We'll manually specify each step's markers in the next turns.
// Current progress: Step 1 markers defined.
KAKAO_GUIDE_STEPS[0].markers = [
  {
    x: 84,
    y: 23,
    text: "Play 스토어에서 '카카오톡'을 검색하여 설치해 주세요.",
    textX: 50,
    textY: 15,
  },
];

KAKAO_GUIDE_STEPS[1].markers = [
  {
    x: 88,
    y: 24,
    text: "설치가 완료되었습니다. '열기'를 눌러 카카오톡을 실행해 주세요.",
    textX: 50,
    textY: 14
  },
];

KAKAO_GUIDE_STEPS[2].markers = [
  {
    x: 50,
    y: 42,
    text: "카카오톡이 처음이라면 '새로운 카카오계정 만들기'를 눌러 가입을 시작해 주세요.",
    textX: 50,
    textY: 35
  },
];

KAKAO_GUIDE_STEPS[3].markers = [
  {
    x: 7,
    y: 16.5,
    text: "이용 약관에 모두 동의해 주세요.",
    textX: 35,
    textY: 8,
    position: "bottom"
  },
  {
    x: 50,
    y: 72,
    text: "'동의하고 계속 진행합니다' 버튼을 눌러 다음으로 넘어가세요.",
    textX: 50,
    textY: 65
  },
];

KAKAO_GUIDE_STEPS[4].markers = [
  {
    x: 78,
    y: 55.5,
    text: "원활한 가입을 위해 '확인'을 눌러 전화 권한을 허용해 주세요.",
    textX: 50,
    textY: 42
  },
];

KAKAO_GUIDE_STEPS[5].markers = [
  {
    x: 50,
    y: 81,
    text: "시스템 팝업창에서 '허용'을 눌러주세요.",
    textX: 50,
    textY: 74
  },
  {
    x: 50,
    y: 10,
    text: "안내 문구가 가려져 보이지 않는다면 화면을 아래로 내려보세요.",
    hideBox: true,
    textX: 50,
    textY: 10
  },
];

KAKAO_GUIDE_STEPS[6].markers = [
  {
    x: 50,
    y: 34.5,
    text: "전화번호가 자동으로 입력되었습니다. '확인'을 눌러 다음 단계로 넘어가 주세요.",
    textX: 50,
    textY: 45
  },
];

KAKAO_GUIDE_STEPS[7].markers = [
  {
    x: 50,
    y: 19,
    text: "문자로 받은 인증번호를 입력해 주세요.",
    textX: 50,
    textY: 9
  },
  {
    x: 50,
    y: 32,
    text: "인증번호 입력 후 '확인'을 눌러주세요.",
    textX: 50,
    textY: 42,
    position: "bottom"
  },
];

KAKAO_GUIDE_STEPS[8].markers = [
  {
    x: 50,
    y: 31,
    text: "사용하실 비밀번호를 위,아래 동일하게 한번씩 입력해 주세요.",
    textX: 50,
    textY: 20
  },
  {
    x: 50,
    y: 47,
    text: "비밀번호 설정 후 '확인'을 눌러주세요.",
    textX: 50,
    textY: 55,
    position: "bottom"
  },
];

KAKAO_GUIDE_STEPS[9].markers = [
  {
    x: 50,
    y: 47.5,
    text: "비밀번호를 모두 입력하셨다면 '확인'을 눌러주세요.",
    textX: 50,
    textY: 60,
    position: "bottom"
  },
];

KAKAO_GUIDE_STEPS[10].markers = [
  {
    x: 50,
    y: 23,
    text: "사용하실 닉네임을 입력해 주세요.",
  },
  {
    x: 50,
    y: 29,
    text: "생일을 선택해 주세요.",
  },
  {
    x: 50,
    y: 35,
    text: "성별을 선택해 주세요. (남성은 '남성', 여성은 '여성'을 선택)",
    textX: 50,
    textY: 42,
    position: "bottom"
  },
  {
    x: 50,
    y: 54,
    text: "모든 정보 입력 후 '확인'을 눌러주세요.",
    textX: 50,
    textY: 65,
    position: "bottom"
  },
];

KAKAO_GUIDE_STEPS[11].markers = [
  {
    x: 50,
    y: 54,
    text: "입력하신 정보를 다시 한번 확인하신 후 '확인'을 눌러주세요.",
    textX: 50,
    textY: 65,
    position: "bottom"
  },
];

KAKAO_GUIDE_STEPS[12].markers = [
  {
    x: 50,
    y: 41,
    text: "빠른 진행을 위해 '나중에 하기'를 눌러 다음 단계로 넘어가 주세요.",
    textX: 50,
    textY: 52,
    position: "bottom"
  },
];

KAKAO_GUIDE_STEPS[13].markers = [
  {
    x: 50,
    y: 89,
    text: "원활한 서비스 이용을 위해 내용을 확인하신 후 '확인'을 눌러주세요.",
    textX: 50,
    textY: 82
  },
  {
    x: 50,
    y: 10,
    text: "안내 내용이 더 있으니 화면을 아래로 내려보세요.",
    hideBox: true,
    textX: 50,
    textY: 10
  },
];

KAKAO_GUIDE_STEPS[14].markers = [
  {
    x: 50,
    y: 81,
    text: "시스템 팝업창에서 '허용'을 눌러주세요.",
    textX: 50,
    textY: 74,
    position: "top"
  },
  {
    x: 50,
    y: 10,
    text: "안내 내용이 더 있으니 화면을 아래로 내려보세요.",
    hideBox: true,
    textX: 50,
    textY: 10
  },
];

KAKAO_GUIDE_STEPS[15].markers = [
  {
    x: 50,
    y: 81,
    text: "시스템 팝업창에서 '허용'을 눌러주세요.",
    textX: 50,
    textY: 74,
    position: "top"
  },
  {
    x: 50,
    y: 10,
    text: "안내 내용이 더 있으니 화면을 아래로 내려보세요.",
    hideBox: true,
    textX: 50,
    textY: 10
  },
];

KAKAO_GUIDE_STEPS[16].markers = [
  {
    x: 78,
    y: 59.5,
    text: "원활한 서비스 사용을 위해 '확인'을 눌러주세요.",
    textX: 50,
    textY: 50,
    position: "top"
  },
];

KAKAO_GUIDE_STEPS[17].markers = [
  {
    x: 78,
    y: 59.5,
    text: "원활한 서비스 사용을 위해 '확인'을 눌러주세요.",
    textX: 50,
    textY: 50,
    position: "top"
  },
];

KAKAO_GUIDE_STEPS[18].markers = [
  {
    x: 88,
    y: 91,
    text: "더보기 메뉴로 가기 위해 하단의 '...' 아이콘을 눌러주세요.",
    textX: 50,
    textY: 82
  },
  {
    x: 50,
    y: 10,
    text: "안내 내용이 더 있으니 화면을 아래로 내려보세요.",
    hideBox: true,
    textX: 50,
    textY: 10
  },
];

KAKAO_GUIDE_STEPS[19].markers = [
  {
    x: 27,
    y: 12.5,
    text: "인증서 확인을 위해 상단의 '지갑' 탭을 눌러주세요.",
    textX: 50,
    textY: 4
  },
];

KAKAO_GUIDE_STEPS[20].markers = [
  {
    x: 50,
    y: 66,
    text: "다른 서비스들이 많으니 주의하세요! '인증서 발급'을 정확히 눌러주세요.",
    textX: 50,
    textY: 58,
    position: "top",
    isRed: true
  },
];

KAKAO_GUIDE_STEPS[21].markers = [
  {
    x: 7,
    y: 24.5,
    text: "원활한 진행을 위해 '전체 동의'를 체크해 주세요.",
    textX: 50,
    textY: 17
  },
  {
    x: 50,
    y: 89,
    text: "동의 후 하단의 '계속 진행하기' 버튼을 눌러주세요.",
    textX: 50,
    textY: 82,
    position: "top"
  },
];

KAKAO_GUIDE_STEPS[22].markers = [
  {
    x: 50,
    y: 27,
    text: "본인 성함을 입력해 주세요.",
    textX: 50,
    textY: 27,
    isSmall: true,
    fontSize: 10,
    hideArrow: true
  },
  {
    x: 50,
    y: 33,
    text: "외국인등록번호 앞 6자리와 뒤 1자리를 입력해 주세요.",
    textX: 50,
    textY: 33,
    isSmall: true,
    fontSize: 10,
    hideArrow: true
  },
  {
    x: 50,
    y: 39,
    text: "이용 중인 통신사를 선택해 주세요. (알뜰폰은 하단 탭 확인)",
    textX: 50,
    textY: 39,
    isSmall: true,
    fontSize: 10,
    hideArrow: true
  },
  {
    x: 35.5,
    y: 45,
    text: "본인 휴대폰 번호를 입력해 주세요.",
    textX: 35.5,
    textY: 45,
    isSmall: true,
    fontSize: 10,
    hideArrow: true
  },
  {
    x: 85,
    y: 45,
    text: "인증요청",
    textX: 85,
    textY: 45,
    isSmall: true,
    fontSize: 10,
    hideArrow: true
  },
];

KAKAO_GUIDE_STEPS[23].markers = [
  {
    x: 22,
    y: 56,
    text: "알뜰폰 사용자를 위한 추가 동의입니다. '동의합니다'를 체크해 주세요.",
    textX: 50,
    textY: 48,
    isSmall: true,
    hideArrow: true
  },
  {
    x: 50,
    y: 64.5,
    text: "'확인'을 눌러 계속 진행해 주세요.",
    textX: 50,
    textY: 73,
    hideArrow: true
  },
];

KAKAO_GUIDE_STEPS[24].markers = [
  {
    x: 50,
    y: 51,
    text: "문자로 받은 인증번호 6자리를 입력해 주세요.",
    textX: 50,
    textY: 43,
    isSmall: true,
    hideArrow: true
  },
  {
    x: 50,
    y: 61,
    text: "인증번호 입력 후 '다음' 버튼을 눌러주세요.",
    textX: 50,
    textY: 70,
    hideArrow: true
  },
];

KAKAO_GUIDE_STEPS[25].markers = [
  {
    x: 50,
    y: 64,
    text: "본인이 이용 중인 은행을 선택해 주세요.",
    textX: 50,
    textY: 35,
    isLarge: true,
    hideArrow: true
  },
];

KAKAO_GUIDE_STEPS[26].markers = [
  {
    x: 50,
    y: 48,
    text: "본인 명의의 계좌번호를 숫자만 입력해 주세요.",
    textX: 50,
    textY: 38,
    isSmall: true,
    hideArrow: true
  },
  {
    x: 50,
    y: 89,
    text: "정보 입력 후 '1원 송금하기'를 눌러주세요.",
    textX: 50,
    textY: 80,
    hideArrow: true
  },
];

KAKAO_GUIDE_STEPS[27].markers = [
  {
    x: 50,
    y: 44,
    text: "입금자명 '카카오' 뒤의 숫자 3자리를 입력해 주세요.",
    textX: 50,
    textY: 34,
    isSmall: true,
    hideArrow: true
  },
  {
    x: 50,
    y: 89,
    text: "숫자 3자리 입력 후 '확인'을 눌러주세요.",
    textX: 50,
    textY: 80,
    hideArrow: true
  },
];

KAKAO_GUIDE_STEPS[28].markers = [
  {
    x: 23,
    y: 18,
    text: "은행 앱의 입금 내역에서 '카카오' 뒤의 숫자 3자리를 확인해 주세요.",
    textX: 50,
    textY: 30,
    isSmall: true,
    hideArrow: true
  },
];

KAKAO_GUIDE_STEPS[29].markers = [
  {
    x: 12,
    y: 44,
    text: "은행 앱에서 확인하신 숫자 3자리를 입력해 주세요.",
    textX: 50,
    textY: 34,
    isSmall: true,
    hideArrow: true
  },
  {
    x: 50,
    y: 89,
    text: "입력 후 하단의 '확인' 버튼을 눌러 다음으로 진행해 주세요.",
    textX: 50,
    textY: 80,
    hideArrow: true
  },
];

KAKAO_GUIDE_STEPS[30].markers = [
  {
    x: 50,
    y: 89,
    text: "카카오 인증서 사용 시 필요한 My 비밀번호 6자리를 만들어주세요.",
    textX: 50,
    textY: 80,
    hideArrow: true
  },
];

KAKAO_GUIDE_STEPS[31].markers = [
  {
    x: 50,
    y: 89,
    text: "인증서 발급이 완료되었습니다! '확인'을 눌러주세요.",
    textX: 50,
    textY: 80,
    hideArrow: true
  },
];

KAKAO_GUIDE_STEPS[32].markers = [
  {
    x: 50,
    y: 32,
    text: "카카오톡 지갑 채팅방으로 온 인증 요청 메시지를 클릭해 주세요.",
    textX: 50,
    textY: 42,
    hideArrow: true
  },
];

KAKAO_GUIDE_STEPS[33].markers = [
  {
    x: 50,
    y: 61,
    text: "받은 메시지에서 '인증하기' 버튼을 눌러주세요.",
    textX: 50,
    textY: 51,
    hideArrow: true
  },
];

KAKAO_GUIDE_STEPS[34].markers = [
  {
    x: 50,
    y: 89,
    text: "개인정보 제공 동의 후 하단의 '인증하기' 버튼을 눌러주세요.",
    textX: 50,
    textY: 80,
    hideArrow: true
  },
];

KAKAO_GUIDE_STEPS[35].markers = [
  {
    x: 50,
    y: 89,
    text: "인증이 완료되었습니다! '확인'을 누르신 후 앱으로 돌아가 다음 단계를 진행해 주세요.",
    textX: 50,
    textY: 80,
    hideArrow: true
  },
];

KAKAO_GUIDE_STEPS[36].markers = [
  {
    x: 50,
    y: 50,
    text: "모든 인증 절차가 마무리되었습니다. 수고하셨습니다!",
    hideBox: true,
    textX: 50,
    textY: 50,
  },
];

export function KakaoGuideModal({
  isOpen,
  onClose,
  mode = "registration"
}: {
  isOpen: boolean;
  onClose: () => void;
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
  const [dismissAiCard, setDismissAiCard] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(text);
    toast({
      title: t("복사되었습니다"),
      description: t("카카오톡 앱의 성명란에 붙여넣으세요."),
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

  const stepsToRender = React.useMemo(() => {
    if (mode === "registration") return KAKAO_GUIDE_STEPS.slice(0, 32);
    if (mode === "auth") return KAKAO_GUIDE_STEPS.slice(32, 37);
    return KAKAO_GUIDE_STEPS;
  }, [mode]);

  const absoluteIndex = mode === "auth" ? current + 32 : current;

  React.useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const currentChapterIndex = CHAPTERS.findIndex((ch, i) => {
    const nextCh = CHAPTERS[i + 1];
    return absoluteIndex >= ch.start && (!nextCh || absoluteIndex < nextCh.start);
  });

  const goToChapter = (index: number) => {
    const chapterStart = CHAPTERS[index].start;
    if (mode === "registration" && chapterStart < 32) {
      api?.scrollTo(chapterStart);
    } else if (mode === "auth" && chapterStart >= 32) {
      api?.scrollTo(chapterStart - 32);
    } else if (mode === "full") {
      api?.scrollTo(chapterStart);
    }
  };

  const chaptersToRender = React.useMemo(() => {
    if (mode === "registration") return CHAPTERS.filter(ch => ch.start < 32);
    if (mode === "auth") return []; // Auth mode has few steps, no need for chapter tabs
    return CHAPTERS;
  }, [mode]);

  return (
    <>
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-white/95 border-none h-[95vh] flex flex-col sm:rounded-[2.5rem]">
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
                <div className="w-8 h-8 bg-[#FEE500] rounded-lg flex items-center justify-center overflow-hidden">
                  <span className="text-[#3C1E1E] font-black text-[12px]">K</span>
                </div>
                {t("카카오톡 상세 가이드")}
              </DialogTitle>
              <DialogDescription className="font-bold text-slate-400 text-xs sm:text-sm">
                {t("외국인 사용자를 위한 4단계 핵심 가이드")}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl sm:rounded-full shrink-0 overflow-x-auto no-scrollbar">
               {chaptersToRender.map((ch, i) => (
                 <button
                   key={i}
                   onClick={() => goToChapter(CHAPTERS.indexOf(ch))}
                   className={cn(
                     "flex-1 sm:flex-none px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-full text-[10px] sm:text-xs font-black transition-all flex items-center justify-center gap-1.5 whitespace-nowrap",
                     currentChapterIndex === CHAPTERS.indexOf(ch) 
                       ? "bg-[#3C1E1E] text-white shadow-lg scale-105" 
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

        <div className="flex-1 w-full bg-slate-50 relative overflow-hidden min-h-0">
          {absoluteIndex === 24 && !dismissAiCard && (
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
          )}
          {stepsToRender.length > 0 ? (
            <Carousel
              setApi={setApi}
              className="w-full h-full"
              opts={{
                align: "start",
                loop: false,
                watchDrag: false,
              }}
            >
              <CarouselContent className="h-full ml-0">
                {stepsToRender.map((step, index) => (
                  <CarouselItem key={index} className="h-[calc(95vh-120px)] overflow-y-auto pl-0 relative flex-shrink-0 bg-slate-50">
                    <div className="flex flex-col items-center pt-8 px-4 pb-32 sm:pt-12 sm:px-8">
                      <div className="relative w-full max-w-[480px] shadow-2xl rounded-[2.5rem] border-[10px] sm:border-[16px] border-[#3C1E1E] bg-white ring-8 ring-white/10 ring-offset-2 ring-offset-slate-200">
                        <img
                          src={step.image}
                          alt={`Kakao Guide Step ${index + 1}`}
                          className="w-full h-auto block rounded-[1.8rem] sm:rounded-[2.2rem]"
                        />
                        <div className="absolute inset-0 pointer-events-none">
                          {step.markers.map((marker, mId) => (
                            <React.Fragment key={mId}>
                              {/* Highlight Box */}
                              <div
                                className="absolute pointer-events-auto"
                                style={{
                                  left: `${marker.x}%`,
                                  top: `${marker.y}%`,
                                  transform: "translate(-50%, -50%)",
                                  zIndex: 50
                                }}
                              >
                                {!marker.hideBox && (
                                  <div
                                    className={cn(
                                      "transition-all duration-300",
                                      marker.isMask
                                        ? "w-[90vw] max-w-[420px] h-[35px] sm:h-[45px] bg-white border-none opacity-100 shadow-[0_0_15px_rgba(255,255,255,1)]"
                                        : cn(
                                            marker.isLarge 
                                              ? "w-[80vw] h-[60vw] max-w-[420px] max-h-[280px]" 
                                              : marker.isSmall ? "w-[12vw] h-[12vw] max-w-[60px] max-h-[60px]" : "w-[18vw] h-[18vw] max-w-[100px] max-h-[100px] min-w-[50px] min-h-[50px]",
                                            "border-[3px] sm:border-[5px] border-dashed rounded-2xl sm:rounded-3xl animate-pulse",
                                            marker.isRed 
                                              ? "border-[#FF0000] shadow-[0_0_20px_rgba(255,0,0,0.6)] bg-[#FF0000]/20" 
                                              : "border-[#FEE500] shadow-[0_0_20px_rgba(254,229,0,0.6)] bg-[#FEE500]/20"
                                          )
                                    )}
                                  />
                                )}
                              </div>

                              {/* Text Bubble */}
                              {marker.text && (
                                <div
                                  className={cn(
                                    "absolute pointer-events-auto z-[60] transition-all duration-300",
                                    marker.textX === undefined && marker.textY === undefined
                                      ? marker.position === "bottom"
                                        ? "translate-y-[15vw] sm:translate-y-32"
                                        : "-translate-y-full -mt-4"
                                      : ""
                                  )}
                                  style={{
                                    left: `${marker.textX !== undefined ? marker.textX : marker.x}%`,
                                    top: `${marker.textY !== undefined ? marker.textY : marker.y}%`,
                                    transform: "translate(-50%, -50%)",
                                  }}
                                >
                                  <div 
                                    className={`bg-[#3C1E1E] ${marker.isRed ? 'text-[#FF0000]' : 'text-[#FEE500]'} font-black px-4 py-2 sm:px-8 sm:py-4 rounded-xl sm:rounded-[2rem] shadow-xl sm:shadow-2xl flex items-center gap-2 sm:gap-4 border-2 ${marker.isRed ? 'border-[#FF0000]' : 'border-[#FEE500]'} ring-2 sm:ring-4 ring-[#3C1E1E]/30 whitespace-normal sm:whitespace-nowrap w-max max-w-[70vw] sm:max-w-none relative`}
                                    style={{ fontSize: marker.fontSize ? `${marker.fontSize}px` : 'clamp(11px,3.0vw,20px)' }}
                                  >
                                    <Info className={`w-[4vw] h-[4vw] max-w-[24px] max-h-[24px] min-w-[14px] min-h-[14px] ${marker.isRed ? 'text-[#FF0000]' : 'text-[#FEE500]'} flex-shrink-0`} />
                                    <span className="leading-tight break-keep">{t(marker.text)}</span>
                                    
                                    {/* Arrow */}
                                    {!marker.hideArrow && (
                                      marker.position === "bottom" ? (
                                        <div className={cn(
                                          "absolute -top-2.5 left-1/2 -translate-x-1/2 w-4 h-4 sm:w-6 sm:h-6 bg-[#3C1E1E] rotate-45 border-l-2 border-t-2",
                                          marker.isRed ? "border-[#FF0000]" : "border-[#FEE500]"
                                        )} />
                                      ) : (
                                        <div className={cn(
                                          "absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-4 h-4 sm:w-6 sm:h-6 bg-[#3C1E1E] rotate-45 border-r-2 border-b-2",
                                          marker.isRed ? "border-[#FF0000]" : "border-[#FEE500]"
                                        )} />
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                      <div className="h-[120px] w-full shrink-0" />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>

              <div className="absolute bottom-10 left-0 right-0 flex justify-center items-center gap-6 px-8 pointer-events-none z-[100]">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={(e) => { e.stopPropagation(); api?.scrollPrev(); }}
                  disabled={current === 0}
                  className="h-14 w-14 sm:h-16 sm:w-16 rounded-full shadow-2xl pointer-events-auto bg-white border-black/5 hover:bg-slate-50 hover:scale-110 transition-transform"
                >
                  <ChevronLeft className="h-8 w-8 sm:h-10 sm:w-10 text-[#3C1E1E]" />
                </Button>

                <div className="bg-[#3C1E1E] backdrop-blur-xl text-[#FEE500] px-6 py-2.5 sm:px-8 sm:py-4 rounded-full font-black text-base sm:text-xl pointer-events-auto shadow-2xl flex items-center gap-2">
                  {currentChapterIndex !== -1 && (
                    <>
                      <span className="hidden sm:inline">{t(CHAPTERS[currentChapterIndex].title)}</span>
                      <span className="mx-2 opacity-50 hidden sm:inline">|</span>
                    </>
                  )}
                  <span className="">{current + 1}</span>
                  <span className="mx-1 opacity-50">/</span>
                  <span>{stepsToRender.length}</span>
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={(e) => { e.stopPropagation(); api?.scrollNext(); }}
                  disabled={current === stepsToRender.length - 1}
                  className="h-14 w-14 sm:h-16 sm:w-16 rounded-full shadow-2xl pointer-events-auto bg-white border-black/5 hover:bg-slate-50 hover:scale-110 transition-transform"
                >
                  <ChevronRight className="h-8 w-8 sm:h-10 sm:w-10 text-[#3C1E1E]" />
                </Button>
              </div>
            </Carousel>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
              <Loader2 className="h-12 w-12 animate-spin text-[#FEE500]" />
              <p className="font-bold">{t("가이드 이미지를 준비 중입니다...")}</p>
            </div>
          )}
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
