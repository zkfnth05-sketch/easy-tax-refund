/** FINAL_TRANSLATION_LOCK: VI_ZH_DONE_DO_NOT_MODIFY **/

"use client";

import React, { useState, useEffect, useRef, Fragment } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { initiateRefundAuth, completeAuthAndEstimate } from "@/ai/flows/automated-refund-estimate";
import { extractIdInfo } from "@/ai/flows/ocr-id-flow";
import { optimizeName } from "@/ai/flows/name-optimization-flow";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  AlertCircle,
  Scan,
  Camera,
  ArrowRight,
  Database,
  Trophy,
  Smartphone,
  RefreshCw,
  UserCheck,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  CreditCard,
  Building2,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Phone,
  MessageSquare,
  MessageCircle,
  SearchX,
  RotateCcw,
  ArrowLeft,
  Banknote,
  FileText,
  BadgeCheck,
  Copy,
  User,
  Lock,
  Shield,
  Lightbulb,
  Search,
  X,
  HelpCircle,
  Send
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { PassGuideModal } from "@/components/PassGuideModal";
import { KakaoGuideModal } from "@/components/KakaoGuideModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";


import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/components/LanguageContext";
import { db } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  doc, 
  updateDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  increment 
} from "firebase/firestore";
import { getStoredTrackingData } from "@/lib/tracking";
import Image from "next/image";

export default function EstimatePage() {
  const { t } = useTranslation();
  const { toast } = useToast();

  const BANK_LOGOS: Record<string, React.ReactNode> = {
    "하나은행": (
      <div className="h-8 w-8 bg-[#008485] rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-white/10">
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
          <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
        </svg>
      </div>
    ),
    "KB국민은행": (
      <div className="h-8 w-8 bg-[#ffbc00] rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-white/10 overflow-hidden text-[#4b413a] font-black text-[10px]">
        <div className="flex flex-col items-center leading-none">
          <span>K</span>
          <span>B</span>
        </div>
      </div>
    ),
    "신한은행": (
      <div className="h-8 w-8 bg-[#0046ff] rounded-full flex items-center justify-center shrink-0 shadow-sm border border-white/20 p-1">
        <svg viewBox="0 0 24 24" className="w-full h-full fill-white">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v2h-2zm0 4h2v7h-2z" />
        </svg>
      </div>
    ),
    "우리은행": (
      <div className="h-8 w-8 bg-[#0067ac] rounded-full flex items-center justify-center shrink-0 shadow-sm border border-white/10">
        <div className="h-5 w-5 rounded-full border-2 border-white flex items-center justify-center">
          <span className="text-[10px] font-black text-white">W</span>
        </div>
      </div>
    ),
    "NH농협은행": (
      <div className="h-8 w-8 bg-[#00a35c] rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-white/10">
        <div className="flex flex-col items-center leading-none text-white font-black text-[9px]">
          <span>N</span>
          <span>H</span>
        </div>
      </div>
    ),
    "카카오뱅크": (
      <div className="h-8 w-8 bg-[#fee500] rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-black/5">
        <span className="text-[14px] font-black text-black">B</span>
      </div>
    ),
    "토스뱅크": (
      <div className="h-8 w-8 bg-[#0064ff] rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-white/10">
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
          <path d="M12 2L2 12l10 10 10-10L12 2z" />
        </svg>
      </div>
    ),
    "IBK기업은행": (
      <div className="h-8 w-8 bg-[#0053a1] rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-white/10">
        <span className="text-[8px] font-black text-white">IBK</span>
      </div>
    ),
    "케이뱅크": (
      <div className="h-8 w-8 bg-[#00235a] rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-white/10">
        <span className="text-[10px] font-black text-white italic">K</span>
      </div>
    ),
    "우체국": (
      <div className="h-8 w-8 bg-[#ed1c24] rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-white/10">
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
        </svg>
      </div>
    )
  };


  const router = useRouter();

  const [step, setStep] = useState(0);
  const [isVipChatOpen, setIsVipChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const [isChatLoading, setIsChatLoading] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [isSignUpAgreed, setIsSignUpAgreed] = useState(true);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isAuthGuideOpen, setIsAuthGuideOpen] = useState(false);
  const [isKakaoGuideOpen, setIsKakaoGuideOpen] = useState(false);
  const [isKakaoAuthGuideOpen, setIsKakaoAuthGuideOpen] = useState(false);
  const [isNameHelpOpen, setIsNameHelpOpen] = useState(false);
  
  // Step 0: Pre-filter Data
  const [preFilterData, setPreFilterData] = useState({
    workMonths: 36,
    avgSalary: 250
  });
  const [preFilterEstimate, setPreFilterEstimate] = useState(0);

  const [analysisError, setAnalysisError] = useState<{
    code: string;
    title: string;
    reason: string;
    solution: string;
    isHighValue?: boolean;
  } | null>(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSigned, setIsSigned] = useState(false);

  const [authSession, setAuthSession] = useState<{ id: string, twoWayInfo: any } | null>(null);
  const [authMethod, setAuthMethod] = useState<'app' | 'kakao'>('app');

  const [nameSuggestions, setNameSuggestions] = useState<{ name: string, label: string }[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const optimizationNameRef = useRef("");
  const [eligibilityRange, setEligibilityRange] = useState({ start: "", end: "" });

  const [formData, setFormData] = useState({
    officialName: "",
    authName: "",
    registrationNumber: "",
    issueDate: "",
    phone: "",
    carrier: "",
    otpCode: "",
    bankName: "",
    accountNumber: "",
    cardNumber: "",
    expiryDate: "",
    cvc: "",
    depositorName: "",
    accountHolder: ""
  });
  const [draftAppId, setDraftAppId] = useState<string | null>(null);

  const progressValue = (step / 9) * 100; // VIP 채팅 실시간 감시 및 동기화
  useEffect(() => {
    if (!draftAppId) return;
    
    // 유저가 읽지 않은 관리자 메시지 카운트 모니터링
    const unsubApp = onSnapshot(doc(db, 'applications', draftAppId), (doc) => {
      if (doc.exists()) {
         setUnreadCount(doc.data().unreadChatCountUser || 0);
      }
    });

    const q = query(
      collection(db, 'applications', draftAppId, 'chat_messages'),
      orderBy('timestamp', 'asc')
    );
    
    const unsubChat = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setChatMessages(msgs);
    });

    return () => {
      unsubApp();
      unsubChat();
    };
  }, [draftAppId]);

  // 채팅 창 열 때 카운트 초기화
  useEffect(() => {
    if (isVipChatOpen && draftAppId && unreadCount > 0) {
       updateDoc(doc(db, 'applications', draftAppId), { unreadChatCountUser: 0 });
    }
    if (isVipChatOpen && chatScrollRef.current) {
       chatScrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isVipChatOpen, draftAppId, unreadCount]);

  const handleSendVipMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !draftAppId || isChatLoading) return;
    
    const text = chatInput.trim();
    setChatInput("");
    setIsChatLoading(true);

    try {
      await addDoc(collection(db, 'applications', draftAppId, 'chat_messages'), {
        text,
        sender: 'user',
        timestamp: serverTimestamp()
      });

      // 관리자에게 알림
      await updateDoc(doc(db, 'applications', draftAppId), {
        unreadChatCountAdmin: increment(1),
        lastMessageAt: serverTimestamp(),
        lastMessageText: text
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsChatLoading(false);
    }
  };
  useEffect(() => {
    const today = new Date();
    const startDate = new Date(today.getFullYear() - 35, today.getMonth(), today.getDate() + 1);
    const endDate = new Date(today.getFullYear() - 15, today.getMonth(), today.getDate());

    const formatDate = (date: Date) => {
      return t("{year}년 {month}월 {day}일", {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate()
      });
    };

    setEligibilityRange({ start: formatDate(startDate), end: formatDate(endDate) });
  }, [t]);

  // Step 0 Estimate Calculation
  useEffect(() => {
    // 90% exemption rough calculation: Monthly Salary * 12 * 3.3% * 90%
    // Cap strictly at 2,000,000 KRW per year
    const yearlyGross = preFilterData.avgSalary * 10000 * 12;
    const yearlyPotential = yearlyGross * 0.033 * 0.9;
    const cappedYearly = Math.min(yearlyPotential, 2000000);
    
    // Total based on work months (up to 5 years / 60 months)
    const totalEstimate = (cappedYearly / 12) * preFilterData.workMonths;
    
    setPreFilterEstimate(Math.floor(totalEstimate / 1000) * 1000); // Round to thousands
  }, [preFilterData]);

  // 드래프트 복구
  useEffect(() => {
    const savedDraftId = sessionStorage.getItem('currentDraftId');
    if (savedDraftId) {
      setDraftAppId(savedDraftId);
    }
  }, []);

  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (error: any) {
      setIsCameraActive(false);
      toast({ variant: 'destructive', title: t('카메라 접근 실패'), description: t('권한을 확인해 주세요.') });
    }
  };

  const captureAndScan = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setLoading(true);
    const context = canvasRef.current.getContext('2d');
    if (context) {
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      const dataUri = canvasRef.current.toDataURL('image/jpeg');
      try {
        const ocrResult = await extractIdInfo({ photoDataUri: dataUri });
        setFormData(prev => ({
          ...prev,
          officialName: ocrResult.name,
          authName: ocrResult.name,
          registrationNumber: ocrResult.registrationNumber,
          issueDate: ocrResult.issueDate
        }));
        // OCR 결과가 나오면 즉시 최적화 시작
        if (ocrResult.name) {
          prefetchNameOptimization(ocrResult.name);
        }
        toast({ variant: "success", title: t("판독 완료"), description: t("신분증 정보가 자동 입력되었습니다.") });
        const stream = videoRef.current.srcObject as MediaStream;
        stream?.getTracks().forEach(track => track.stop());
        setIsCameraActive(false);
      } catch (error) {
        toast({ variant: "destructive", title: t("판독 실패"), description: t("다시 촬영해 주세요.") });
      } finally {
        setLoading(false);
      }
    }
  };

  const prefetchNameOptimization = async (name: string) => {
    if (!name || name === optimizationNameRef.current) return;
    optimizationNameRef.current = name;
    setIsOptimizing(true);
    try {
      const optimized = await optimizeName({ name });
      setNameSuggestions(optimized.combinations);
      setFormData(prev => ({ ...prev, authName: optimized.recommendation }));
    } catch (error) {
      console.error("Name optimization failed:", error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const saveProgress = async (nextStep: number, isFinal: boolean = false) => {
    try {
      const trackingData = getStoredTrackingData();
      const appData = {
        fullName: formData.officialName,
        registrationNumber: formData.registrationNumber,
        phone: formData.phone,
        lastStep: nextStep,
        preFilterEstimate,
        utmSource: trackingData?.utmSource || null,
        utmMedium: trackingData?.utmMedium || null,
        utmCampaign: trackingData?.utmCampaign || null,
        updatedAt: serverTimestamp(),
        isDraft: !isFinal
      };

      if (draftAppId) {
        await updateDoc(doc(db, 'applications', draftAppId), appData);
      } else {
        const docRef = await addDoc(collection(db, 'applications'), {
          ...appData,
          createdAt: serverTimestamp(),
          status: 'Draft'
        });
        setDraftAppId(docRef.id);
        sessionStorage.setItem('currentDraftId', docRef.id);
      }
    } catch (err) {
      console.error("Progress save error:", err);
    }
  };

  const handleOcrConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.officialName || !formData.registrationNumber) {
      toast({ variant: "destructive", title: t("정보 부족"), description: t("성함과 외국인 등록번호를 확인해 주세요.") });
      return;
    }
    
    // Step 2로 즉시 전환 (낙관적 전환)
    setStep(3);
    saveProgress(3);

    // 아직 최적화가 실행되지 않았거나 이름이 바뀐 경우에만 호출
    if (formData.officialName !== optimizationNameRef.current) {
      prefetchNameOptimization(formData.officialName);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.phone || !formData.carrier || !formData.authName) {
      toast({ variant: "destructive", title: t("정보 부족"), description: t("연락처와 통신사 정보를 모두 입력해 주세요.") });
      return;
    }
    setStep(4);
    saveProgress(4);
  };

  const handleInitiateAuth = async () => {
    // Step 5로 즉시 전환하여 '요청 중' 상태를 보여줌
    setStep(5);
    setLoading(true);
    try {
      const telecomCode = formData.carrier.includes("SKT") ? "0" : formData.carrier.includes("KT") ? "1" : "2";

      const authRes = await initiateRefundAuth({
        userName: formData.authName,
        registrationNumber: formData.registrationNumber,
        phoneNo: formData.phone,
        telecom: telecomCode,
        method: "app" // Both Kakao and PASS use push notification logic in this flow
      });

      if (authRes.success) {
        setAuthSession({ id: authRes.id, twoWayInfo: authRes.twoWayInfo });
        toast({ title: t("인증 요청 성공"), description: t(authRes.message) });
      } else {
        toast({ variant: "destructive", title: t("인증 요청 실패"), description: t(authRes.message) });
        setStep(4); // 실패 시 다시 선택 단계로
      }
    } catch (error) {
      toast({ variant: "destructive", title: t("시스템 오류"), description: t("인증 요청 중 오류가 발생했습니다.") });
      setStep(4);
    } finally {
      setLoading(false);
    }
  };

  const handleCarrierOcrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsOcrLoading(true);
    setOcrResult(null);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const { extractCarrierName } = await import('@/ai/flows/extract-carrier-name-flow');
        const result = await extractCarrierName({ photoDataUri: base64 });
        setOcrResult(result);
        setIsOcrLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      toast({
        title: t('판독 실패'),
        description: t('다시 촬영해 주세요.'),
        variant: 'destructive',
      });
      setIsOcrLoading(false);
    }
  };

  const applyOcrName = () => {
    if (!ocrResult?.extractedName) return;
    setFormData(prev => ({
      ...prev,
      authName: ocrResult.extractedName,
      fullName: ocrResult.extractedName
    }));
    setOcrResult(null);
    setStep(3); // 성명 확인 단계로 돌아가서 확인 유도
    toast({
      title: t('성명 적용 완료'),
      description: t('통신사 등록 성함으로 수정되었습니다. 다시 인증을 시도해 보세요.'),
    });
  };
  const handleFinalVerifyAndAnalyze = async () => {
    if (!authSession) return;
    setStep(6);
    setAnalysisError(null);
    setLoading(true);
    
    // 브라우저가 Step 5 화면을 렌더링할 시간을 줌
    await new Promise(resolve => setTimeout(resolve, 150));

    try {
      const telecomCode = formData.carrier.includes("SKT") ? "0" : formData.carrier.includes("KT") ? "1" : "2";
      console.log("[Frontend] Starting completeAuthAndEstimate at:", new Date().toLocaleTimeString());
      const startTime = Date.now();
      const analysisResult = await completeAuthAndEstimate({
        id: authSession.id,
        twoWayInfo: authSession.twoWayInfo,
        userName: formData.officialName,
        registrationNumber: formData.registrationNumber,
        phoneNo: formData.phone,
        telecom: telecomCode,
        otpCode: formData.otpCode
      });
      const endTime = Date.now();
      console.log(`[Frontend] completeAuthAndEstimate finished in ${((endTime - startTime) / 1000).toFixed(2)}s`);
      setResult(analysisResult);
      setStep(7);
      saveProgress(7);
      setLoading(false);
    } catch (error: any) {
      const isHighValue = preFilterEstimate >= 400000;
      let diag = {
        code: error.message,
        title: t("데이터 수집에 실패했습니다"),
        reason: t("알 수 없는 통신 오류가 발생했습니다."),
        solution: isHighValue 
          ? t("고액 환급 대상자이시군요! 인증이 어려우시다면 전문 상담원을 연결해 드릴까요?") 
          : t("AI 가이드의 그림을 보고 다시 한 번 시도해 보세요."),
        isHighValue: isHighValue
      };

      if (error.message === "NAME_MISMATCH") {
        diag = {
          ...diag,
          code: "NAME_MISMATCH",
          title: t("성명 정보가 일치하지 않습니다"),
          reason: t("외국인 등록증 성명({name})과 통신사(PASS) 등록 성명이 다릅니다.", { name: formData.officialName }),
          solution: isHighValue 
            ? t("성공 확률이 높은 이름들을 AI가 찾았습니다. 해결이 안 된다면 VIP 상담원과 채팅해 보세요.")
            : t("Step 3로 돌아가 AI가 추천하는 다른 이름 조합을 선택해 보세요.")
        };
      } else if (error.message === "AUTH_TIMEOUT") {
        diag = {
          ...diag,
          code: "AUTH_TIMEOUT",
          title: t("인증 시간이 초과되었습니다"),
          reason: t("휴대폰에서 2분 이내에 '확인' 버튼을 누르지 않았습니다."),
          solution: t("Step 4로 돌아가 다시 인증을 요청해 주세요.")
        };
      }

      setAnalysisError(diag);
      setLoading(false);
    }
  };

  const startDrawing = (e: any) => {
    setIsDrawing(true);
    setIsSigned(true);
    draw(e);
  };
  const stopDrawing = () => { setIsDrawing(false); signatureCanvasRef.current?.getContext('2d')?.beginPath(); };
  const draw = (e: any) => {
    if (!isDrawing || !signatureCanvasRef.current) return;
    const ctx = signatureCanvasRef.current.getContext('2d');
    if (!ctx) return;
    const rect = signatureCanvasRef.current.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.strokeStyle = '#000';
    ctx.lineTo(x, y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x, y);
  };

  const handlePayment = (method: 'card' | 'bank') => {
    if (method === 'bank' && !formData.depositorName.trim()) {
      toast({
        variant: "destructive",
        title: t("정보 입력 필요"),
        description: t("입금하실 분의 성함을 입력해 주세요.")
      });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsPaid(true);
      toast({ title: t("결제 완료 안내"), description: t("환급 받으실 계좌 정보를 입력해 주세요.") });
      setStep(9);
      saveProgress(9);
    }, 1500);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSigned) {
      toast({ variant: "destructive", title: t("서명 확인 필요"), description: t("전자서명 칸에 서명을 완료해 주세요.") });
      return;
    }
    if (!formData.bankName || !formData.accountNumber.trim() || !formData.accountHolder.trim()) {
      toast({ variant: "destructive", title: t("정보 입력 필요"), description: t("환급 받으실 은행명, 계좌번호, 예금주명을 모두 입력해 주세요.") });
      return;
    }
    setLoading(true);
    try {
      const signatureDataUri = signatureCanvasRef.current?.toDataURL('image/png');
      const clientId = `user-${formData.registrationNumber.replace(/[^0-9]/g, '').slice(-6)}-${Date.now()}`;

      const trackingData = getStoredTrackingData();

      // Firestore에 신청 데이터 저장 (기존 드래프트 업데이트)
      const appData = {
        clientId,
        fullName: formData.officialName,
        registrationNumber: formData.registrationNumber,
        phone: formData.phone,
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        accountHolder: formData.accountHolder,
        signatureDataUri: signatureDataUri || null,
        estimatedRefundAmount: result?.refundEstimate || 0,
        preFilterEstimate,
        resIncomeTax: result?.resIncomeTax || 0,
        resCompanyIdentityNo1: result?.resCompanyIdentityNo1 || 'N/A',
        resAttrYear: result?.resAttrYear || 'N/A',
        resIncomeSpecList: result?.resIncomeSpecList || '',
        caseType: result?.caseType || 'D',
        details: result?.details || [],
        status: 'InquiryCompleted',
        lastStep: 9,
        utmSource: trackingData?.utmSource || null,
        utmMedium: trackingData?.utmMedium || null,
        utmCampaign: trackingData?.utmCampaign || null,
        paymentStatus: 'pending',
        userLanguage: (typeof window !== 'undefined' ? localStorage.getItem('app_lang') || 'ko' : 'ko'),
        applicationDate: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isDraft: false
      };

      let finalDocId = draftAppId;
      if (draftAppId) {
        await updateDoc(doc(db, 'applications', draftAppId), appData);
      } else {
        const docRef = await addDoc(collection(db, 'applications'), {
          ...appData,
          createdAt: serverTimestamp()
        });
        finalDocId = docRef.id;
      }

      // 포털에서 내 신청 조회용 sessionStorage 저장
      sessionStorage.setItem('myApplicationId', finalDocId!);
      sessionStorage.setItem('myClientId', clientId);
      sessionStorage.setItem('myFullName', formData.officialName);

      toast({ title: t("신청 완료"), description: t("전문 세무사가 검토를 시작합니다.") });
      router.push("/portal");
    } catch (err) {
      console.error("Firestore 저장 오류:", err);
      toast({ variant: "destructive", title: t("제출 실패"), description: t("잠시 후 다시 시도해 주세요.") });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: t("복사 완료"), description: t("클립보드에 복사되었습니다.") });
  };

  return (
    <div className="min-h-screen flex flex-col font-body bg-slate-50/50">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 lg:py-24">
        <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">
                {step === 0 ? t('나의 환급금 사전 진단') : t('Process {step} / {total}', { step, total: 9 })}
              </Badge>
              <span className="text-2xl font-black">{step === 0 ? '0%' : `${Math.round(progressValue)}%`}</span>
            </div>
            <Progress value={step === 0 ? 5 : progressValue} className="h-3" />
          </div>

          <div className="relative">
            {step === 0 && (
              <Card className="premium-card rounded-[3rem] border-none shadow-2xl overflow-hidden bg-white animate-in fade-in slide-in-from-bottom-8 duration-700">
                <CardHeader className="text-center py-12 bg-slate-900 text-white relative">
                  <div className="absolute top-0 right-0 p-12 opacity-10"><Banknote className="h-64 w-64 text-primary" /></div>
                  <div className="mx-auto h-16 w-16 bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-primary/20">
                    <Sparkles className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-3xl sm:text-4xl font-black font-headline tracking-tight px-4 leading-tight">
                    {t('나의 잠재 환급액')}<br />{t('10초 만에 확인하기')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 sm:p-12 space-y-12">
                  <div className="space-y-10">
                    <div className="space-y-6">
                      <div className="flex justify-between items-center px-1">
                        <Label className="text-lg font-black text-slate-800">{t('최근 5년 한국 근무 기간')}</Label>
                        <span className="text-2xl font-black text-primary">{preFilterData.workMonths}{t('개월')}</span>
                      </div>
                      <input 
                        type="range" min="1" max="60" step="1"
                        value={preFilterData.workMonths}
                        onChange={(e) => setPreFilterData({ ...preFilterData, workMonths: parseInt(e.target.value) })}
                        className="w-full h-3 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                      <div className="flex justify-between text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">
                        <span>1 {t('개월')}</span>
                        <span>30 {t('개월')}</span>
                        <span>60 {t('개월')}</span>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex justify-between items-center px-1">
                        <Label className="text-lg font-black text-slate-800">{t('평균 월 급여 (세전)')}</Label>
                        <span className="text-2xl font-black text-primary">{preFilterData.avgSalary}{t('만 원')}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {[150, 200, 250, 300, 350, 400, 500, 600].map((val) => (
                          <Button 
                            key={val}
                            variant={preFilterData.avgSalary === val ? 'default' : 'outline'}
                            onClick={() => setPreFilterData({ ...preFilterData, avgSalary: val })}
                            className={cn(
                              "h-12 font-black rounded-xl text-sm transition-all",
                              preFilterData.avgSalary === val ? "bg-primary text-white scale-105 shadow-lg shadow-primary/20" : "border-slate-100 text-slate-400 hover:border-primary/20"
                            )}
                          >
                            {val === 600 ? '600+' : val}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-10 bg-primary/5 rounded-[2.5rem] border-2 border-primary/10 text-center space-y-4 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                    <p className="text-sm font-black text-slate-500 uppercase tracking-widest">{t('AI 예상 환급 가능 금액')}</p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-5xl font-black text-primary font-headline animate-in zoom-in-50 duration-500">
                        ₩ {preFilterEstimate.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-[11px] font-bold text-slate-400 leading-relaxed bg-white/50 py-2 px-4 rounded-full border border-slate-100 backdrop-blur-sm inline-block">
                      {t('* 실제 개인별 소득 공제 항목에 따라 차이가 발생할 수 있습니다.')}
                    </p>
                  </div>

                  <div className="space-y-4 pt-4">
                    <Button 
                      onClick={() => { setStep(1); saveProgress(1); }}
                      className="w-full h-24 bg-slate-900 text-2xl font-black rounded-3xl shadow-2xl flex items-center justify-center gap-4 transition-all hover:scale-[1.02] active:scale-[0.98] group"
                    >
                      {t('이어서 정밀 진단 시작하기')} <ArrowRight className="h-8 w-8 transition-transform group-hover:translate-x-2" />
                    </Button>
                    <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                      <ShieldCheck className="h-3 w-3" /> {t('9 step precision diagnostic flow initiated')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
            {step === 1 && (
              <Card className="premium-card rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-white">
                <CardHeader className="text-center py-6 sm:py-10 bg-slate-50/50 border-b border-slate-100">
                  <div className="mx-auto flex flex-col items-center gap-4">
                    <div className="relative group">
                      <div className="absolute -inset-4 bg-primary/10 rounded-full blur-xl opacity-50" />
                      <Image 
                        src="/official_nts_carrier_badge_v2_1774141326494.png"
                        alt="Official NTS & Carrier Badge"
                        width={120}
                        height={120}
                        className="relative rounded-2xl shadow-md border border-white transition-transform hover:scale-110"
                      />
                    </div>
                    <div className="space-y-2">
                       <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-100 text-[10px] font-black uppercase tracking-widest">{t('safe_and_secure')}</Badge>
                       <h2 className="text-xl sm:text-2xl font-black text-slate-800">{t('nts_trust_title')}</h2>
                       <p className="text-[13px] font-bold text-slate-500 leading-tight max-w-[280px] mx-auto opacity-80">{t('nts_trust_message')}</p>
                    </div>
                  </div>
                </CardHeader>

                <CardHeader className="text-center py-8 sm:py-12 bg-white">
                  <div className="mx-auto h-16 w-16 sm:h-20 sm:w-20 bg-slate-900 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-6 shadow-lg">
                    <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl sm:text-3xl font-black text-slate-900 break-keep">
                    {t('시작하기 전 필수 확인')}
                  </CardTitle>
                  <CardDescription className="font-bold text-slate-500 text-xs sm:text-sm">
                    {t('성공적인 환급 조회를 위해 아래 사항을 준비해 주세요.')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 sm:p-10 space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-5 bg-emerald-50 rounded-3xl border border-emerald-100 flex items-center gap-4">
                      <div className="h-10 w-10 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                        <BadgeCheck className="h-6 w-6" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="font-black text-emerald-900 text-sm">{t('외국인 등록증')}</p>
                        <p className="text-[11px] text-emerald-700/70 font-bold">{t('실물 신분증 준비')}</p>
                      </div>
                    </div>
                    <div className="p-5 bg-blue-50 rounded-3xl border border-blue-100 flex items-center gap-4">
                      <div className="h-10 w-10 bg-blue-500 rounded-xl flex items-center justify-center shrink-0">
                        <Phone className="h-6 w-6" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="font-black text-blue-900 text-sm">{t('본인 명의 휴대폰')}</p>
                        <p className="text-[11px] text-blue-700/70 font-bold">{t('통신사 가입자 본인')}</p>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-slate-100" />

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <h3 className="font-black text-red-500 text-lg flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-red-500 rounded-full" />
                        {t('인증서가 없으신가요? (추천)')}
                      </h3>
                      <p className="text-sm font-bold text-slate-500 leading-relaxed ml-3">
                        {t('대부분의 외국인 사용자는 인증서가 없습니다. 아래 가이드를 보고 1분 만에 발급받으세요.')}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-3">
                        <div className="flex flex-col gap-2">
                          <Button 
                            onClick={() => setIsGuideOpen(true)}
                            className="h-16 bg-white border-2 border-red-100 hover:border-red-500 hover:bg-red-50 text-red-600 text-lg font-black rounded-2xl shadow-sm flex items-center justify-center gap-3 transition-all group"
                          >
                            <div className="w-6 h-6 bg-red-600 rounded-lg flex items-center justify-center overflow-hidden transition-transform group-hover:scale-110">
                              <span className="text-white font-black text-[8px]">PASS</span>
                            </div>
                            {t('PASS 발급 가이드')}
                          </Button>
                          <a 
                            href="https://play.google.com/store/search?q=PASS&c=apps" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1.5 py-1 text-[11px] font-bold text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <Smartphone className="w-3 h-3" />
                            {t('구글 플레이에서 PASS 설치')}
                          </a>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button 
                            onClick={() => setIsKakaoGuideOpen(true)}
                            className="h-16 bg-white border-2 border-slate-100 hover:border-[#fee500] hover:bg-[#fee500]/5 text-[#3c1e1e] text-lg font-black rounded-2xl shadow-sm flex items-center justify-center gap-3 transition-all group"
                          >
                            <div className="w-6 h-6 bg-[#fee500] rounded-lg flex items-center justify-center overflow-hidden transition-transform group-hover:scale-110">
                              <span className="text-[#3c1e1e] font-black text-[10px]">K</span>
                            </div>
                            {t('카카오 발급 가이드')}
                          </Button>
                          <a 
                            href="https://play.google.com/store/apps/details?id=com.kakao.talk" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1.5 py-1 text-[11px] font-bold text-slate-400 hover:text-yellow-600 transition-colors"
                          >
                            <Smartphone className="w-3 h-3" />
                            {t('구글 플레이에서 카카오톡 설치')}
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4">
                      <h3 className="font-black text-slate-400 text-lg flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-slate-200 rounded-full" />
                        {t('이미 인증서가 있다면?')}
                      </h3>
                      <div className="grid grid-cols-1 gap-3 ml-3">
                        <Button 
                          variant="outline"
                          onClick={() => { setStep(2); saveProgress(2); }}
                          className="h-14 border-slate-200 text-slate-600 font-black rounded-2xl hover:bg-slate-50"
                        >
                          {t('인증서가 있습니다. 바로 시작하기')}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Alert className="bg-amber-50 border-amber-200 rounded-3xl p-5">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    <AlertDescription className="text-[13px] font-bold text-amber-900 leading-relaxed ml-1">
                      {t('중요: 통신사(핸드폰)에 등록된 영문 이름과 외국인 등록증의 이름이 단 한 글자라도 다르면 조회가 불가능합니다.')}
                    </AlertDescription>
                  </Alert>

                  {/* Security Assurance Card */}
                  <div className="mt-12 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-primary/10 transition-colors" />
                    <div className="relative flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                      <div className="shrink-0 relative">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                        <Image 
                          src="/certified_security_seal_premium_1774150786685.png" 
                          alt="Certified Security" 
                          width={80} 
                          height={80} 
                          className="relative transition-transform group-hover:scale-110"
                        />
                      </div>
                      <div className="space-y-4 flex-1">
                        <div className="space-y-1">
                          <h4 className="text-xl font-black text-slate-800 flex items-center justify-center md:justify-start gap-2">
                            {t('security_card_title')}
                            <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20 leading-none py-0.5">{t('security_certified')}</Badge>
                          </h4>
                          <p className="text-sm font-bold text-slate-500">{t('security_card_subtitle')}</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-black text-slate-700">
                              <Lock className="h-3 w-3 text-primary" />
                              {t('security_item_encryption_title')}
                            </div>
                            <p className="text-[10px] font-medium text-slate-400 leading-tight">{t('security_item_encryption_desc')}</p>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-black text-slate-700">
                              <Database className="h-3 w-3 text-primary" />
                              {t('security_item_no_storage_title')}
                            </div>
                            <p className="text-[10px] font-medium text-slate-400 leading-tight">{t('security_item_no_storage_desc')}</p>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-black text-slate-700">
                              <Shield className="h-3 w-3 text-primary" />
                              {t('security_item_pippa_title')}
                            </div>
                            <p className="text-[10px] font-medium text-slate-400 leading-tight">{t('security_item_pippa_desc')}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <Card className="premium-card rounded-[2.5rem] border-none shadow-sm overflow-hidden">
                <CardHeader className="text-center bg-slate-50/50 py-6 sm:py-10 border-b border-slate-100 relative">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => { setStep(1); saveProgress(1); }}
                    className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 font-bold flex items-center"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    {t('이전')}
                  </Button>
                  <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 bg-primary/10 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-4"><Scan className="h-6 w-6 sm:h-8 sm:w-8 text-primary" /></div>
                  <CardTitle className="text-2xl sm:text-3xl font-black break-keep">{t('Step 2: 외국인등록증 인증')}</CardTitle>
                  <CardDescription className="font-bold text-slate-400 text-xs sm:text-sm">{t('신분증 정보를 확인하여 감면 대상을 판별합니다.')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 sm:space-y-8 p-6 sm:p-10">
                  {!isCameraActive ? (
                    <div onClick={startCamera} className="border-2 border-dashed border-slate-200 rounded-[2.5rem] p-12 text-center bg-slate-50 cursor-pointer hover:bg-primary/5 transition-all group">
                      <Camera className="h-14 w-14 text-primary mx-auto mb-4 transition-transform group-hover:scale-110" />
                      <h3 className="font-black text-lg">{t('외국인등록증 촬영하여 자동 입력')}</h3>
                      <p className="text-xs font-bold text-slate-400 mt-2">{t('되도록 외국인 등록증을 촬영 해주세요. 그래야 정확한 정보가 입력 됩니다.')}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <video ref={videoRef} className="w-full aspect-video rounded-3xl bg-black object-cover shadow-2xl" autoPlay muted playsInline />
                      <Button onClick={captureAndScan} className="w-full h-16 bg-primary text-lg font-black rounded-2xl shadow-xl shadow-primary/20" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin h-6 w-6" /> : t('촬영 및 정보 추출')}
                      </Button>
                    </div>
                  )}
                  <canvas ref={canvasRef} width={640} height={480} className="hidden" />
                  <form onSubmit={handleOcrConfirm} className="space-y-8">
                    <div className="grid gap-6">
                      <div className="space-y-3">
                        <div className="flex flex-col gap-1.5 mb-1">
                          <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">{t('영문 성명 (NAME)')}</Label>
                          <p className="text-[10px] text-amber-600 font-bold ml-1">{t('* 정확한 조회를 위해 성과 이름을 꼭 띄어서 입력해 주세요.')}</p>
                        </div>
                        <input 
                          placeholder={t("예: HONG GIL DONG")} 
                          value={formData.officialName} 
                          onChange={(e) => {
                            const newName = e.target.value.toUpperCase();
                            setFormData({ ...formData, officialName: newName });
                            // 실시간으로 미리 작업 시작 (최적화)
                            if (newName.length > 3) {
                              prefetchNameOptimization(newName);
                            }
                          }} 
                          className="h-14 px-6 rounded-2xl bg-slate-50 border-none font-bold text-lg w-full outline-none focus:ring-2 focus:ring-primary/20" 
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">{t('외국인 등록번호')}</Label>
                        <input value={formData.registrationNumber} maxLength={13} onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })} className="h-14 px-6 rounded-2xl bg-slate-50 border-none font-bold text-lg w-full outline-none focus:ring-2 focus:ring-primary/20" />
                      </div>
                    </div>
                    <Button type="submit" className="w-full h-16 sm:h-20 bg-slate-900 text-lg sm:text-xl font-black rounded-2xl sm:rounded-3xl shadow-2xl" disabled={loading}>{t('다음 단계로 이동')}</Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {step === 3 && (
              <Card className="premium-card rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
                <CardHeader className="text-center bg-slate-50/50 py-6 sm:py-10 border-b border-slate-100 relative">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => { setStep(2); saveProgress(2); }}
                    className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 font-bold flex items-center"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    {t('이전')}
                  </Button>
                  <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 bg-primary/10 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-4">
                    <Smartphone className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl sm:text-3xl font-black break-keep">
                    {t('Step 3: 본인 인증 정보 입력')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 sm:p-10 space-y-6 sm:space-y-8">
                  <form onSubmit={handleContactSubmit} className="space-y-8">
                    <div className="grid gap-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">{t('휴대폰 번호')}</Label>
                          <input 
                            placeholder="01012345678" 
                            className="h-14 px-6 rounded-2xl bg-slate-50 border-none font-bold text-lg w-full outline-none focus:ring-2 focus:ring-primary/20" 
                            value={formData.phone} 
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                          />
                        </div>
                        <div className="space-y-3">
                          <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">{t('통신사')}</Label>
                          <Select onValueChange={(v) => setFormData({ ...formData, carrier: v })}>
                            <SelectTrigger className="h-14 px-6 rounded-2xl bg-slate-50 border-none font-bold text-lg">
                              <SelectValue placeholder={t('통신사 선택')} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="SKT">{t('SKT')}</SelectItem>
                              <SelectItem value="KT">{t('KT')}</SelectItem>
                              <SelectItem value="LGU+">{t('LGU+')}</SelectItem>
                              <SelectItem value="SKT 알뜰폰">{t('SKT 알뜰폰')}</SelectItem>
                              <SelectItem value="KT 알뜰폰">{t('KT 알뜰폰')}</SelectItem>
                              <SelectItem value="LGU+ 알뜰폰">{t('LGU+ 알뜰폰')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-4 p-6 bg-primary/5 rounded-[2.5rem] border border-primary/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                          <Sparkles className="h-24 w-24 text-primary" />
                        </div>
                        
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                              <UserCheck className="h-4 w-4 text-white" />
                            </div>
                            <h4 className="text-base font-black text-slate-900">
                              {isOptimizing ? t('AI 성명 최적화 분석 중...') : t('통신사 등록 성명 확인(필수)')}
                            </h4>
                          </div>
                          {!isOptimizing && (
                            <Button 
                              type="button"
                              variant="ghost" 
                              size="sm"
                              onClick={() => setIsNameHelpOpen(true)}
                              className="text-[11px] h-8 px-3 font-black text-primary hover:bg-primary/10 rounded-xl flex items-center gap-1.5 transition-colors"
                            >
                              <HelpCircle className="w-3.5 h-3.5" />
                              {t('정확한 등록 성함 확인 방법')}
                            </Button>
                          )}
                        </div>
                        
                        {!isOptimizing && (
                          <div className="mb-6 space-y-4">
                            <div className="p-5 bg-white rounded-2xl border border-primary/10 shadow-sm">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t('신분증상 성명')}</span>
                                <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-none font-black text-[10px]">{t('BASE')}</Badge>
                              </div>
                              <span className="text-xl font-black text-slate-400 line-through decoration-slate-300">{formData.officialName}</span>
                            </div>

                            <Alert className="bg-white border-amber-200 rounded-2xl shadow-sm">
                              <Info className="h-4 w-4 text-amber-500" />
                              <AlertDescription className="text-[11px] font-bold text-slate-500 leading-relaxed">
                                {t('외국인은 통신사마다 이름 형식이 다를 수 있습니다. 아래 추천된 형식 중 본인의 [통신사 앱]에 등록된 것과 "완벽히 똑같은" 것을 선택해 주세요.')}
                              </AlertDescription>
                            </Alert>
                          </div>
                        )}

                        <div className="grid grid-cols-1 gap-3 relative z-10">
                          {isOptimizing && nameSuggestions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 gap-6 bg-white/50 rounded-3xl border border-dashed border-slate-200">
                              <Loader2 className="h-12 w-12 animate-spin text-primary" />
                              <div className="text-center space-y-2">
                                <p className="text-base font-black text-slate-600">{t('성공 확률이 가장 높은 이름을 찾는 중...')}</p>
                                <p className="text-xs font-bold text-slate-400">{t('통신사 전산망의 다양한 영문 표기법을 분석하고 있습니다.')}</p>
                              </div>
                            </div>
                          ) : (
                            <>
                                {nameSuggestions.map((item, i) => (
                                  <div 
                                    key={i} 
                                    onClick={() => {
                                      setFormData({ ...formData, authName: item.name });
                                      navigator.clipboard.writeText(item.name);
                                      toast({
                                        title: t("성명 복사 완료"),
                                        description: t("'{name}'이(가) 클립보드에 복사되었습니다. PASS 앱에 그대로 붙여넣으세요.", { name: item.name })
                                      });
                                    }} 
                                    className={`group p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col gap-1.5 relative ${formData.authName === item.name ? 'bg-primary border-primary text-white shadow-xl scale-[1.02] z-20' : 'bg-white border-slate-100 text-slate-600 hover:border-primary/30'}`}
                                  >
                                    <div className="flex justify-between items-center">
                                      <span className="font-black text-xl tracking-tight">{item.name}</span>
                                      {formData.authName === item.name ? (
                                        <div className="h-6 w-6 bg-white rounded-full flex items-center justify-center">
                                          <CheckCircle2 className="h-4 w-4 text-primary" />
                                        </div>
                                      ) : (
                                        <div className="h-8 w-8 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                          <Copy className="h-4 w-4 text-slate-300 group-hover:text-primary" />
                                        </div>
                                      )}
                                    </div>
                                    <span className={cn("text-[11px] font-black uppercase tracking-wider", formData.authName === item.name ? "text-white/70" : "text-primary/70")}>
                                      {t(item.label)}
                                    </span>
                                  </div>
                                ))}

                                <div className="pt-6 border-t border-slate-100 mt-4 space-y-4">
                                  <div className="flex items-center justify-between px-1">
                                    <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{t('직접 입력하기')}</Label>
                                    <span className="text-[10px] text-slate-300 font-bold">{t('추천 목록에 없는 경우')}</span>
                                  </div>
                                  <div className="relative group">
                                    <input 
                                      placeholder={t('통신사에 등록된 이름을 그대로 입력')}
                                      value={formData.authName}
                                      onChange={(e) => setFormData({ ...formData, authName: e.target.value.toUpperCase() })}
                                      className="h-16 px-6 rounded-2xl bg-white border-2 border-slate-100 font-black text-lg w-full outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all pr-12"
                                    />
                                    <User className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-300 group-focus-within:text-primary transition-colors" />
                                  </div>
                                </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="p-8 bg-slate-900 text-white rounded-[2.5rem] flex items-start gap-5 shadow-2xl transition-all hover:scale-[1.01]">
                      <Checkbox id="signup" checked={isSignUpAgreed} onCheckedChange={(c) => setIsSignUpAgreed(c as boolean)} className="mt-1.5 h-6 w-6 border-white/20" />
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <Label htmlFor="signup" className="text-lg lg:text-xl font-black cursor-pointer break-keep">{t('회원가입 및 환급 알림 받기')}</Label>
                          <Badge className="bg-primary text-[10px] font-bold border-none h-5">{t('무료')}</Badge>
                        </div>
                        <p className="text-slate-400 text-xs font-bold leading-relaxed">{t('환급금 결과 및 진행 상황을 안전하게 안내해 드립니다.')}</p>
                      </div>
                    </div>
                    <Button type="submit" className="w-full h-20 sm:h-24 bg-primary text-xl sm:text-2xl font-black rounded-3xl shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all" disabled={loading}>
                      {loading ? <Loader2 className="animate-spin h-8 w-8" /> : t('조회 정보 확인 완료')}
                    </Button>
                  </form>

                  {/* Security Assurance Card - Embedded in Step 3 */}
                  <div className="mt-12 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-primary/10 transition-colors" />
                    <div className="relative flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                      <div className="shrink-0 relative">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                        <Image 
                          src="/certified_security_seal_premium_1774150786685.png" 
                          alt="Certified Security" 
                          width={80} 
                          height={80} 
                          className="relative transition-transform group-hover:scale-110"
                        />
                      </div>
                      <div className="space-y-4 flex-1">
                        <div className="space-y-1">
                          <h4 className="text-xl font-black text-slate-800 flex items-center justify-center md:justify-start gap-2">
                            {t('security_card_title')}
                            <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20 leading-none py-0.5">{t('security_certified')}</Badge>
                          </h4>
                          <p className="text-sm font-bold text-slate-500">{t('security_card_subtitle')}</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-black text-slate-700">
                              <Lock className="h-3 w-3 text-primary" />
                              {t('security_item_encryption_title')}
                            </div>
                            <p className="text-[10px] font-medium text-slate-400 leading-tight">{t('security_item_encryption_desc')}</p>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-black text-slate-700">
                              <Database className="h-3 w-3 text-primary" />
                              {t('security_item_no_storage_title')}
                            </div>
                            <p className="text-[10px] font-medium text-slate-400 leading-tight">{t('security_item_no_storage_desc')}</p>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-black text-slate-700">
                              <Shield className="h-3 w-3 text-primary" />
                              {t('security_item_pippa_title')}
                            </div>
                            <p className="text-[10px] font-medium text-slate-400 leading-tight">{t('security_item_pippa_desc')}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 4 && (
              <Card className="premium-card rounded-[2.5rem] border-none shadow-2xl overflow-hidden">
                <CardHeader className="text-center py-8 sm:py-12 bg-slate-50/50 relative">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => { setStep(3); saveProgress(3); }}
                    className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 font-bold flex items-center"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    {t('이전')}
                  </Button>
                  <div className="mx-auto h-16 w-16 sm:h-20 sm:w-20 bg-primary rounded-2xl sm:rounded-3xl flex items-center justify-center mb-6 shadow-lg"><UserCheck className="h-8 w-8 sm:h-10 sm:w-10 text-white" /></div>
                  <CardTitle className="text-2xl sm:text-3xl font-black text-slate-900 break-keep">{t('Step 4: 인증 방식 선택')}</CardTitle>
                  <CardDescription className="font-bold text-slate-500 text-xs sm:text-sm">{t('가장 편리한 방법으로 본인을 인증해 주세요.')}</CardDescription>
                </CardHeader>
                <CardContent className="p-6 sm:p-10 space-y-6 sm:space-y-8">
                  <div className="space-y-3 mb-6">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsAuthGuideOpen(true)}
                      className="w-full h-14 sm:h-16 font-black text-emerald-700 bg-emerald-50 border-emerald-200/60 hover:bg-emerald-100 transition-all flex items-center justify-center gap-2 rounded-2xl shadow-sm hover:shadow-md"
                    >
                      <Info className="h-4 w-4" />
                      {t('PASS 앱에서 어떻게 승인하나요? (가이드 보기)')}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsKakaoAuthGuideOpen(true)}
                      className="w-full h-14 sm:h-16 font-black text-[#3C1E1E] bg-[#FEE500]/10 border-[#FEE500]/40 hover:bg-[#FEE500]/20 transition-all flex items-center justify-center gap-2 rounded-2xl shadow-sm hover:shadow-md"
                    >
                      <Info className="h-4 w-4" />
                      {t('카카오톡 앱에서 어떻게 승인하나요? (가이드 보기)')}
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div
                      onClick={() => setAuthMethod('app')}
                      className={cn(
                        "p-6 rounded-[2rem] border-2 cursor-pointer transition-all flex items-center gap-5",
                        authMethod === 'app' ? "bg-red-50 border-red-500 shadow-lg shadow-red-500/10" : "bg-white border-slate-100 hover:border-slate-200"
                      )}
                    >
                      <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center", authMethod === 'app' ? "bg-red-600 text-white" : "bg-slate-100 text-slate-400")}>
                        <Smartphone className="h-7 w-7" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className={cn("font-black text-lg", authMethod === 'app' ? "text-red-700" : "text-slate-900")}>{t('PASS 앱으로 간편하게')}</h4>
                          {authMethod === 'app' && <CheckCircle2 className="h-5 w-5 text-red-600" />}
                        </div>
                        <p className="text-sm text-slate-500 font-medium">{t("앱에서 '확인' 버튼만 누르면 끝")}</p>
                      </div>
                    </div>

                    <div
                      onClick={() => setAuthMethod('kakao')}
                      className={cn(
                        "p-6 rounded-[2rem] border-2 cursor-pointer transition-all flex items-center gap-5",
                        authMethod === 'kakao' ? "bg-yellow-50/50 border-[#FEE500] shadow-lg shadow-yellow-500/10" : "bg-white border-slate-100 hover:border-slate-200"
                      )}
                    >
                      <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shadow-sm", authMethod === 'kakao' ? "bg-[#FEE500] text-[#191919]" : "bg-slate-100 text-slate-400")}>
                        <MessageCircle className="h-7 w-7" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className={cn("font-black text-lg", authMethod === 'kakao' ? "text-[#191919]" : "text-slate-900")}>{t('카카오톡 앱으로 간편하게')}</h4>
                          {authMethod === 'kakao' && <CheckCircle2 className="h-5 w-5 text-[#191919]" />}
                        </div>
                        <p className={cn("text-sm font-medium", authMethod === 'kakao' ? "text-slate-700" : "text-slate-500")}>{t("앱에서 '확인' 버튼만 누르면 끝")}</p>
                      </div>
                    </div>
                  </div>

                  <Button onClick={handleInitiateAuth} className="w-full h-20 bg-primary text-2xl font-black rounded-3xl shadow-xl shadow-primary/20" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin h-8 w-8" /> : t('인증 요청하기')}
                  </Button>
                </CardContent>
              </Card>
            )}

            {step === 5 && (
              <Card className="premium-card rounded-[2.5rem] border-none shadow-2xl overflow-hidden">
                <CardHeader className="text-center py-12 bg-slate-50/50 relative">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => { setStep(4); saveProgress(4); }}
                    className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 font-bold flex items-center"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    {t('이전')}
                  </Button>
                  <div className={cn("mx-auto h-20 w-20 rounded-3xl flex items-center justify-center mb-6 shadow-lg", authMethod === 'app' ? "bg-red-600" : "bg-[#FEE500]")}>
                    {authMethod === 'app' ? <Smartphone className="h-10 w-10 text-white" /> : <MessageCircle className="h-10 w-10 text-[#191919]" />}
                  </div>
                  <CardTitle className="text-3xl font-black text-slate-900">{t('Step 5: 인증 확인')}</CardTitle>
                </CardHeader>
                <CardContent className="p-10 space-y-10">
                  <div className="text-center space-y-8 py-4">
                    {!authSession ? (
                      <div className="space-y-6">
                        <div className="flex flex-col items-center justify-center py-12 gap-6 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                          <Loader2 className="h-16 w-16 animate-spin text-primary" />
                          <div className="space-y-2">
                            <h2 className="text-2xl font-black text-slate-900">{authMethod === 'app' ? t("PASS 앱 인증 요청 중...") : t("카카오톡 인증 요청 중...")}</h2>
                            <p className="text-slate-500 font-bold">{t("잠시만 기다려 주세요.")}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <h2 className="text-2xl font-black text-slate-900">{t("휴대폰에서 '확인'을 눌러주세요")}</h2>
                        <p className="text-lg font-bold text-slate-500 whitespace-pre-line">{authMethod === 'app' ? t("PASS 앱 알림 또는 문자를 확인한 뒤\n아래 버튼을 눌러주세요.") : t("카카오 지갑 알림을 확인한 뒤\n아래 버튼을 눌러주세요.")}</p>
                      </div>
                    )}
                  </div>

                  {authSession && (
                    <div className="space-y-6">
                      <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-6">
                        <div className="flex items-center gap-3">
                           <AlertTriangle className="h-6 w-6 text-amber-500" />
                           <h4 className="text-lg font-black text-slate-900">{t('인증 알림이 오지 않나요?')}</h4>
                        </div>
                        <p className="text-sm font-bold text-slate-500 leading-relaxed">
                          {t('외국 국적자는 통신사에 등록된 이름이 신분증과 다른 경우가 많습니다. 알림이 오지 않는다면 AI가 제안해 준 추천 성명을 하나씩 시도해 보세요.')}
                        </p>
                        
                        <div className="pt-2 space-y-4">
                          {preFilterEstimate >= 400000 ? (
                            <div className="space-y-4">
                              <div className="p-4 bg-amber-400/10 rounded-2xl border border-amber-400/20">
                                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">VIP 전용 라이브 헬프</p>
                                <p className="text-sm font-bold text-slate-600">
                                   {t('예상 환급액이 {amount}원이나 됩니다! 인증이 막히셨다면 전문 상담원이 즉시 도와드려요.', { amount: preFilterEstimate.toLocaleString() })}
                                </p>
                              </div>
                              <Button 
                                onClick={() => setIsVipChatOpen(true)}
                                className="w-full h-16 bg-slate-900 text-white hover:bg-slate-800 text-lg font-black rounded-2xl shadow-xl flex items-center justify-center gap-2 group transition-all hover:scale-[1.02]"
                              >
                                <MessageSquare className="h-6 w-6 text-amber-400 animate-bounce" /> {t('실시간 전문 상담원 채팅 시작')}
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <p className="text-sm font-bold text-slate-600">
                                {t('인증 과정을 자세한 그림 가이드로 확인해 보세요.')}
                              </p>
                              <Button 
                                variant="outline"
                                onClick={() => setIsAuthGuideOpen(true)}
                                className="w-full h-16 border-primary text-primary hover:bg-primary/5 text-lg font-black rounded-2xl flex items-center justify-center gap-2"
                              >
                                <Sparkles className="h-6 w-6" /> {t('AI 자가 해결 가이드 보기')}
                              </Button>
                            </div>
                          )}

                          {/* AI OCR 이름 추출 섹션 */}
                          <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100 mt-4 space-y-4">
                             <div className="flex items-center gap-2">
                               <Sparkles className="h-5 w-5 text-blue-500" />
                               <h4 className="font-black text-blue-900">{t('ai_name_check_title')}</h4>
                             </div>
                             <p className="text-xs font-bold text-blue-700/70 leading-relaxed">
                               {t('ai_name_check_desc')}
                             </p>
                             
                             {!ocrResult ? (
                               <div className="relative">
                                 <input 
                                   type="file" 
                                   accept="image/*" 
                                   onChange={handleCarrierOcrUpload}
                                   className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                   disabled={isOcrLoading}
                                 />
                                 <Button 
                                   variant="outline" 
                                   className="w-full h-14 border-blue-200 text-blue-600 hover:bg-blue-100/50 rounded-2xl flex items-center justify-center gap-2"
                                   disabled={isOcrLoading}
                                 >
                                   {isOcrLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
                                   {isOcrLoading ? t('analyzing_screenshot') : t('upload_screenshot')}
                                 </Button>
                               </div>
                             ) : (
                               <div className="p-4 bg-white rounded-2xl border border-blue-200 space-y-4 animate-in zoom-in-95 duration-300">
                                 <div className="text-center space-y-1">
                                    <p className="text-xs font-black text-blue-400 uppercase tracking-widest">{t('ocr_result_title')}</p>
                                    <p className="text-xl font-black text-slate-900">"{ocrResult.extractedName}"</p>
                                 </div>
                                 <p className="text-xs font-bold text-slate-500 text-center">
                                    {ocrResult.recommendation}
                                 </p>
                                 <div className="grid grid-cols-2 gap-2">
                                   <Button variant="ghost" onClick={() => setOcrResult(null)} className="rounded-xl h-12 font-bold text-slate-400">
                                      {t('다시 인증')}
                                   </Button>
                                   <Button onClick={applyOcrName} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 font-black shadow-lg shadow-blue-200">
                                      {t('use_this_name')}
                                   </Button>
                                 </div>
                               </div>
                             )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button onClick={handleFinalVerifyAndAnalyze} className="w-full h-20 bg-primary text-2xl font-black rounded-3xl shadow-xl shadow-primary/20" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin h-8 w-8" /> : t('인증 완료 및 데이터 분석')}
                  </Button>
                </CardContent>
              </Card>
            )}

            {step === 6 && !analysisError && (
              <Card className="premium-card rounded-[3rem] border-none shadow-2xl py-32 text-center bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-white/5">
                  <div className="h-full bg-primary animate-[loading_3s_ease-in-out_infinite]" style={{ width: '60%' }} />
                </div>
                <CardContent className="space-y-12">
                  <div className="relative mx-auto w-32 h-32">
                    <Database className="h-32 w-32 text-primary animate-pulse" />
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-ping" />
                  </div>
                  <div className="space-y-10">
                    <div className="space-y-4">
                      <h2 className="text-4xl font-black font-headline text-primary tracking-tight">{t('데이터를 분석 중입니다.')}</h2>
                      <p className="text-slate-400 font-bold">{t('잠시만 기다려 주세요.')}</p>
                    </div>
                    
                    <div className="max-w-[340px] mx-auto space-y-6 text-left border-l-2 border-primary/20 pl-8 py-2">
                      <div className="flex items-center gap-4 text-emerald-400 font-bold transition-all">
                        <CheckCircle2 className="h-6 w-6" />
                        <span className="text-lg">{t('PASS 인증 세션 연결 성공')}</span>
                      </div>
                      <div className="flex items-center gap-4 text-white font-black animate-pulse">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span className="text-lg">{t('최근 5년 소득 내역 수집 중')}</span>
                      </div>
                      <div className="flex items-center gap-4 text-slate-500 font-bold">
                        <div className="relative h-6 w-6 flex items-center justify-center">
                          <div className="absolute h-full w-full bg-white/5 rounded-full" />
                          <Database className="h-4 w-4" />
                        </div>
                        <span className="text-lg">{t('국세청 업종 실시간 시계열 검증 중')}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 6 && analysisError && (
              <Card className="premium-card rounded-[3rem] border-none shadow-2xl overflow-hidden bg-white">
                <CardHeader className="text-center py-12 bg-red-50/50 border-b border-red-100">
                  <div className="mx-auto h-20 w-20 bg-red-100 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
                    <SearchX className="h-10 w-10 text-red-500" />
                  </div>
                  <CardTitle className="text-3xl font-black text-slate-900">{t('AI 오류 진단 리포트')}</CardTitle>
                  <CardDescription className="font-bold text-red-500">{analysisError.title}</CardDescription>
                </CardHeader>
                <CardContent className="p-10 space-y-10">
                  <div className="space-y-8">
                    {analysisError.code === "NAME_MISMATCH" && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{t('신분증상 성함')}</p>
                          <p className="text-xl font-black text-slate-900">{formData.officialName}</p>
                        </div>
                        <div className="p-6 bg-red-50 rounded-3xl border border-red-100 relative overflow-hidden">
                          <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-2">{t('현재 시도한 성함')}</p>
                          <p className="text-xl font-black text-red-600">{formData.authName}</p>
                          <div className="absolute top-2 right-2 opacity-20 rotate-12">
                            <SearchX className="h-8 w-8 text-red-500" />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        <h4 className="font-black text-slate-900">{t('분석된 원인 (Cause)')}</h4>
                      </div>
                      <p className="text-slate-600 font-medium leading-relaxed">{analysisError.reason}</p>
                    </div>

                    <div className="p-8 bg-primary/5 rounded-3xl border border-primary/10 space-y-4">
                      <div className="flex items-center gap-2">
                        <RotateCcw className="h-5 w-5 text-primary" />
                        <h4 className="font-black text-primary">{t('해결책 (Solution)')}</h4>
                      </div>
                      <p className="text-slate-700 font-bold leading-relaxed">{analysisError.solution}</p>
                      
                      {analysisError.code === "NAME_MISMATCH" && nameSuggestions.length > 0 && (
                        <div className="mt-8 pt-8 border-t border-primary/10 space-y-4">
                          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{t('다른 이름 조합으로 바로 시도하기')}</p>
                          <div className="grid grid-cols-1 gap-3">
                            {nameSuggestions.filter(s => s.name !== formData.authName).map((s, i) => (
                              <Button 
                                key={i}
                                variant="outline"
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, authName: s.name }));
                                  setAnalysisError(null);
                                  setStep(4);
                                  navigator.clipboard.writeText(s.name);
                                  toast({
                                    title: t("이름 복사 완료"),
                                    description: t("'{name}'이(가) 클립보드에 복사되었습니다. 다른 조합으로 다시 인증을 요청하세요.", { name: s.name })
                                  });
                                }}
                                className="h-16 justify-between px-6 bg-white border-primary/20 hover:border-primary text-slate-700 font-black rounded-2xl group transition-all"
                              >
                                <span className="text-lg">{s.name}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-primary/60 group-hover:text-primary transition-colors">{t(s.label)}</span>
                                  <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                </div>
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    {analysisError.isHighValue && (
                      <Button 
                        asChild
                        className="w-full h-20 bg-primary text-xl font-black rounded-3xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-3"
                      >
                        <a href="https://pf.kakao.com/_xxxx" target="_blank">
                          <MessageCircle className="h-7 w-7" /> {t('전문 상담원에게 도움받기')}
                        </a>
                      </Button>
                    )}
                    
                    {!analysisError.isHighValue && (
                       <Button 
                        variant="outline"
                        onClick={() => setIsGuideOpen(true)}
                        className="w-full h-20 border-primary text-primary hover:bg-primary/5 text-xl font-black rounded-3xl shadow-sm transition-all hover:scale-[1.02] flex items-center justify-center gap-3"
                      >
                        <Sparkles className="h-7 w-7" /> {t('AI 자가 해결 가이드 보기')}
                      </Button>
                    )}

                    <Button 
                      onClick={() => setStep(3)} 
                      variant={analysisError.isHighValue ? "outline" : "default"}
                      className={cn(
                        "w-full h-20 text-xl font-black rounded-3xl shadow-xl transition-all hover:scale-[1.02]",
                        analysisError.isHighValue ? "border-slate-200 text-slate-600" : "bg-slate-900 text-white"
                      )}
                    >
                      {t('이름 조합 다시 선택하기 (Step 3)')}
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={() => setStep(4)} 
                      className="w-full h-14 font-bold text-slate-400 hover:text-slate-600"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" /> {t('인증 방식 다시 선택하기')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 7 && result && (
              <Card className="premium-card rounded-[3rem] border-none shadow-2xl overflow-hidden bg-white">
                <CardHeader className="text-center py-16 bg-slate-50/50 relative">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => { setStep(4); saveProgress(4); }}
                    className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 font-bold flex items-center"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    {t('이전')}
                  </Button>
                  <div className={`mx-auto h-24 w-24 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-xl ${result.caseType === 'A' ? 'bg-yellow-400' : 'bg-slate-400'}`}>
                    {result.caseType === 'A' ? <Trophy className="h-12 w-12 text-white" /> : <Info className="h-12 w-12 text-white" />}
                  </div>
                  <CardTitle className="text-4xl lg:text-[2.5rem] font-black font-headline text-slate-900 leading-tight">
                    {t(result.message, { amount: `₩${result.refundEstimate?.toLocaleString()}` })}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-16 py-16 px-10">
                  {result.caseType === 'A' && (
                    <div className="text-center space-y-10">
                      <div className="space-y-4">
                        <p className="text-slate-400 font-black uppercase tracking-widest text-sm">{t('최종 예상 환급액')}</p>
                        <h2 className="text-7xl font-black text-[#fbbf24] font-headline">₩ {result.refundEstimate?.toLocaleString()}</h2>
                      </div>
                      <div className="max-w-md mx-auto space-y-4 text-left p-8 bg-slate-50 rounded-3xl border border-slate-100 shadow-inner">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{t('연도별 상세 내역 (적격 여부 검증 완료)')}</p>
                        <div className="space-y-3">
                          {result.details?.map((detail: any, i: number) => (
                            <div key={i} className="flex justify-between items-center group">
                              <span className="text-lg font-black text-slate-800">{detail.year}: ₩{detail.amount.toLocaleString()}</span>
                              <span className="text-[11px] font-bold text-slate-400">{detail.company}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  <Button onClick={() => setStep(8)} className="w-full h-24 bg-slate-900 text-3xl font-black rounded-[2rem] shadow-2xl flex items-center justify-center gap-4">
                    {result.refundEstimate > 0 ? t('지금 환급 신청하기') : t('전문 상담 신청하기')} <ArrowRight className="h-10 w-10" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {step === 8 && (
              <Card className="premium-card rounded-[2.5rem] border-none shadow-2xl overflow-hidden">
                <CardHeader className="text-center py-12 bg-slate-900 text-white relative">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => { setStep(7); saveProgress(7); }}
                    className="absolute top-6 left-6 text-white/40 hover:text-white font-bold flex items-center"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    {t('이전')}
                  </Button>
                  <CardTitle className="text-3xl font-black font-headline">{t('Step 8: 수수료 결제')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-10 p-10">
                  <div className="p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-inner space-y-6">
                    <div className="flex justify-between items-center"><span className="font-bold text-slate-400">{t('총 환급 예정액')}</span><span className="text-2xl font-black text-slate-900">₩ {result?.refundEstimate?.toLocaleString() || 0}</span></div>
                    <Separator className="bg-slate-200" />
                    <div className="flex justify-between items-center"><span className="font-black text-slate-900 text-xl">{t('수수료 (선임료 20%)')}</span><span className="text-3xl font-black text-primary">₩ {(Math.floor((result?.refundEstimate || 0) * 0.2)).toLocaleString()}</span></div>
                  </div>

                  <div className="space-y-10">
                    <Alert className="bg-amber-50 border-amber-200 rounded-3xl p-8 shadow-sm">
                      <AlertCircle className="h-6 w-6 text-amber-600 shrink-0" />
                      <div className="ml-4">
                        <AlertTitle className="text-amber-800 font-black text-lg mb-2">{t('Legal Policy (결제 및 환불 안내)')}</AlertTitle>
                        <AlertDescription className="text-amber-700 font-bold text-base leading-relaxed">
                          {t("수수료 20%는 전문세무사의 수임료입니다. 대한민국 국세청(NTS)은 환급금을 사용자 본인의 계좌로 직접 입금합니다. 따라서 시스템상 환급액 중 수수료를 사전에 차감할 수 없습니다. 전문 세무사의 선임을 위해 수수료 선결제가 필요하며, 환급이 불가능한 경우 100% 즉시 환불됩니다.")}
                        </AlertDescription>
                      </div>
                    </Alert>

                    <div className="space-y-8">
                      <Label className="text-xl font-black text-slate-900">{t('결제 수단 선택')}</Label>
                      <Tabs defaultValue="card" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 h-16 bg-slate-100 p-1 rounded-2xl">
                          <TabsTrigger value="card" className="rounded-xl font-bold">{t('신용/체크카드')}</TabsTrigger>
                          <TabsTrigger value="bank" className="rounded-xl font-bold">{t('무통장 입금')}</TabsTrigger>
                        </TabsList>
                        <TabsContent value="card" className="pt-8 space-y-8">
                          <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-6">
                            <div className="flex items-center gap-3 text-primary mb-2">
                              <CreditCard className="h-6 w-6" />
                              <span className="font-black">{t('카드 결제 정보 입력')}</span>
                            </div>
                            <div className="grid gap-6">
                              <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-500 uppercase ml-1">{t('카드 번호')}</Label>
                                <input
                                  placeholder="0000 0000 0000 0000"
                                  value={formData.cardNumber}
                                  onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                                  className="h-14 rounded-xl bg-white border border-slate-200 font-bold text-lg px-6 w-full outline-none focus:ring-2 focus:ring-primary/20"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label className="text-xs font-bold text-slate-500 uppercase ml-1">{t('유효 기간 (MM/YY)')}</Label>
                                  <input
                                    placeholder="MM/YY"
                                    value={formData.expiryDate}
                                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                    className="h-14 rounded-xl bg-white border border-slate-200 font-bold text-lg px-6 w-full outline-none focus:ring-2 focus:ring-primary/20"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs font-bold text-slate-500 uppercase ml-1">{t('CVC 번호')}</Label>
                                  <input
                                    placeholder={t("3자리 숫자")}
                                    maxLength={3}
                                    value={formData.cvc}
                                    onChange={(e) => setFormData({ ...formData, cvc: e.target.value })}
                                    className="h-14 rounded-xl bg-white border border-slate-200 font-bold text-lg px-6 w-full outline-none focus:ring-2 focus:ring-primary/20"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                          <Button onClick={() => handlePayment('card')} className="w-full h-24 bg-primary text-3xl font-black rounded-[2rem] shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]">
                            {t('신용카드 결제하기')}
                          </Button>
                        </TabsContent>
                        <TabsContent value="bank" className="pt-8 space-y-8">
                          <div className="p-10 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl space-y-8">
                            <div className="grid gap-4">
                              <div className="flex justify-between items-center p-6 bg-slate-50 rounded-2xl">
                                <span className="font-bold text-slate-400">{t('은행명')}</span>
                                <div className="flex items-center gap-3">
                                  {BANK_LOGOS["KB국민은행"]}
                                  <span className="font-black text-slate-900 text-lg">KB국민은행( KB Bank)</span>
                                </div>
                              </div>
                              <div
                                onClick={() => copyToClipboard("283502-04-233375")}
                                className="flex justify-between items-center p-6 bg-slate-50 rounded-2xl cursor-pointer group hover:bg-slate-100"
                              >
                                <span className="font-bold text-slate-400">{t('계좌번호')}</span>
                                <div className="flex items-center gap-2">
                                  <span className="font-black text-primary text-xl tracking-wider">283502-04-233375</span>
                                  <Copy className="h-4 w-4 text-slate-300 group-hover:text-primary" />
                                </div>
                              </div>
                              <div className="space-y-3">
                                <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">{t('입금자명')}</Label>
                                <div className="relative">
                                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                                  <input
                                    placeholder={t('입금하실 분 성함을 입력하세요')}
                                    value={formData.depositorName}
                                    onChange={(e) => setFormData({ ...formData, depositorName: e.target.value })}
                                    className="h-16 rounded-2xl font-bold bg-slate-50 border-none pl-12 pr-6 text-lg w-full outline-none focus:ring-2 focus:ring-primary/20"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                          <Button onClick={() => handlePayment('bank')} className="w-full h-24 bg-slate-900 text-3xl font-black rounded-[2rem] shadow-xl transition-all hover:scale-[1.02]">
                            {t('입금 완료 후 최종 신청하기')}
                          </Button>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 9 && (
              <Card className="premium-card rounded-[2.5rem] border-none shadow-2xl overflow-hidden">
                <CardHeader className="text-center py-12 bg-slate-900 text-white relative">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => { setStep(8); saveProgress(8); }}
                    className="absolute top-6 left-6 text-white/40 hover:text-white font-bold flex items-center"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    {t('이전')}
                  </Button>
                  <CardTitle className="text-3xl font-black font-headline">{t('Step 9: 최종 신청')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-10 p-10">
                  <Alert className="bg-primary/5 border-primary/20 rounded-[2rem] p-8 shadow-sm">
                    <div className="flex gap-4">
                      <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                        <BadgeCheck className="h-6 w-6 text-primary" />
                      </div>
                      <div className="space-y-3">
                        <AlertTitle className="text-xl font-black text-slate-900">{t('세금 환급 받으실 계좌를 입력해주세요.')}</AlertTitle>
                        <AlertDescription className="text-slate-600 font-bold text-base leading-relaxed">
                          {t('환급 신청 후 대한민국 국세청에 환급되기 까지는 45일에서 60일 정도 소요 될 수 있습니다.')} <span className="text-primary font-black">{t('환급 과정은 나의 환급 진행사항에서 실시간으로 확인하실 수 있으며, 필요에 따라 추가 증빙 서류가 필요할 수 있습니다.')}</span>
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>

                  <form onSubmit={handleFinalSubmit} className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label className="text-xs font-black text-primary uppercase tracking-widest ml-1">{t('은행명(대한민국 에서 만든 계좌의 은행명을 꼭 입력해주세요)')}</Label>
                        <Select onValueChange={(v) => setFormData({ ...formData, bankName: v })} value={formData.bankName}>
                          <SelectTrigger className="h-16 rounded-2xl font-bold bg-slate-50 border-none px-6 text-lg w-full outline-none focus:ring-2 focus:ring-primary/20">
                            <SelectValue placeholder={t("은행 선택")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="하나은행">
                              <div className="flex items-center gap-3">
                                {BANK_LOGOS["하나은행"]}
                                <span className="font-bold">하나은행 (Hana Bank)</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="KB국민은행">
                              <div className="flex items-center gap-3">
                                {BANK_LOGOS["KB국민은행"]}
                                <span className="font-bold">국민은행 (KB Bank)</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="신한은행">
                              <div className="flex items-center gap-3">
                                {BANK_LOGOS["신한은행"]}
                                <span className="font-bold">신한은행 (Shinhan Bank)</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="우리은행">
                              <div className="flex items-center gap-3">
                                {BANK_LOGOS["우리은행"]}
                                <span className="font-bold">우리은행 (Woori Bank)</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="NH농협은행">
                              <div className="flex items-center gap-3">
                                {BANK_LOGOS["NH농협은행"]}
                                <span className="font-bold">농협은행 (NH Bank)</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="카카오뱅크">
                              <div className="flex items-center gap-3">
                                {BANK_LOGOS["카카오뱅크"]}
                                <span className="font-bold">카카오뱅크 (KakaoBank)</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="토스뱅크">
                              <div className="flex items-center gap-3">
                                {BANK_LOGOS["토스뱅크"]}
                                <span className="font-bold">토스뱅크 (Toss Bank)</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="IBK기업은행">
                              <div className="flex items-center gap-3">
                                {BANK_LOGOS["IBK기업은행"]}
                                <span className="font-bold">IBK기업은행 (IBK Bank)</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="케이뱅크">
                              <div className="flex items-center gap-3">
                                {BANK_LOGOS["케이뱅크"]}
                                <span className="font-bold">케이뱅크 (K-Bank)</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="우체국">
                              <div className="flex items-center gap-3">
                                {BANK_LOGOS["우체국"]}
                                <span className="font-bold">우체국 (Post Office)</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">{t('계좌번호')}</Label>
                        <input
                          placeholder={t('계좌번호를 입력하세요')}
                          value={formData.accountNumber}
                          onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                          className="h-16 rounded-2xl font-bold bg-slate-50 border-none px-6 text-lg w-full outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">{t('예금주명')}</Label>
                      <input
                        placeholder={t('계좌의 예금주 성함을 입력하세요')}
                        value={formData.accountHolder}
                        onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                        className="h-16 rounded-2xl font-bold bg-slate-50 border-none px-6 text-lg w-full outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="space-y-4">
                      <Label className="text-xl font-black text-slate-900">{t('전자서명 (세무 대리 수임 동의)')}</Label>
                      <div className="border-2 border-dashed border-slate-200 rounded-[2.5rem] p-6 bg-white shadow-inner">
                        <canvas
                          ref={signatureCanvasRef}
                          width={500}
                          height={200}
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onTouchStart={startDrawing}
                          onTouchMove={draw}
                          onTouchEnd={stopDrawing}
                          className="w-full bg-white cursor-crosshair touch-none"
                        />
                      </div>
                      {!isSigned && <p className="text-xs font-bold text-red-500 animate-pulse">{t('위 상자에 서명을 완료해야 신청이 가능합니다.')}</p>}
                    </div>

                    <Button type="submit" className="w-full h-24 bg-slate-900 text-3xl font-black rounded-[2rem] shadow-2xl transition-all hover:scale-[1.02]" disabled={loading}>
                      {loading ? <Loader2 className="animate-spin h-8 w-8" /> : t('최종 신청 완료')}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />

      {/* VIP 전용 플로팅 채팅 버튼 */}
      {preFilterEstimate >= 400000 && !isVipChatOpen && (
        <div className="fixed bottom-10 right-8 z-[60] animate-bounce-subtle">
           <Button 
             onClick={() => setIsVipChatOpen(true)}
             className="h-20 w-20 rounded-full bg-amber-400 text-amber-950 shadow-2xl flex items-center justify-center hover:bg-amber-500 hover:scale-110 transition-all border-4 border-white group relative"
           >
              <MessageSquare className="h-10 w-10 text-amber-950" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-7 w-7 bg-red-600 rounded-full flex items-center justify-center text-white text-sm font-black border-2 border-white animate-pulse">
                  {unreadCount}
                </span>
              )}
           </Button>
        </div>
      )}

      {/* VIP 실시간 1:1 채팅 다이얼로그 */}
      <Dialog open={isVipChatOpen} onOpenChange={setIsVipChatOpen}>
        <DialogContent className="sm:max-w-[450px] h-[650px] flex flex-col p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl bg-white z-[120]">
          <DialogHeader className="p-8 bg-slate-900 text-white shrink-0 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8">
               <Button variant="ghost" size="icon" onClick={() => setIsVipChatOpen(false)} className="text-white/50 hover:text-white rounded-full">
                  <X className="h-6 w-6" />
               </Button>
             </div>
             <div className="flex items-center gap-4">
               <div className="h-14 w-14 bg-amber-400 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-400/20">
                  <Trophy className="h-8 w-8 text-amber-950" />
               </div>
               <div>
                 <DialogTitle className="text-xl font-black">{t('실시간 VIP 전문 세무사 상담')}</DialogTitle>
                 <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">LIVE • EXPERT CONNECTED</p>
                 </div>
               </div>
             </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden p-6 bg-slate-50">
             <ScrollArea className="h-full pr-4">
               <div className="space-y-6">
                 <div className="flex justify-start">
                   <div className="bg-white p-5 rounded-2xl rounded-tl-none shadow-sm border border-slate-200 text-sm font-bold text-slate-700 max-w-[85%] leading-relaxed">
                     {t('안녕하세요! 예상 환급액이 매우 큰 고액 자산가님으로 감지되어 전문 상담원 채팅 세션이 열렸습니다. 인증이나 서류 접수에 어려움이 있다면 무엇이든 물어봐 주세요.')}
                   </div>
                 </div>
                 
                 {chatMessages.map((msg, i) => (
                   <div key={i} className={cn("flex", msg.sender === 'user' ? "justify-end" : "justify-start")}>
                      <div className={cn(
                        "p-5 rounded-2xl shadow-sm text-sm font-bold max-w-[85%] leading-relaxed",
                        msg.sender === 'user' 
                          ? "bg-slate-900 text-white rounded-tr-none" 
                          : "bg-white text-slate-800 border border-slate-200 rounded-tl-none"
                      )}>
                        {msg.text}
                      </div>
                   </div>
                 ))}
                 <div ref={chatScrollRef} />
               </div>
             </ScrollArea>
          </div>

          <form onSubmit={handleSendVipMessage} className="p-6 bg-white border-t border-slate-100 flex gap-3">
             <Input 
               value={chatInput}
               onChange={(e) => setChatInput(e.target.value)}
               placeholder={t('상담 내용을 입력하세요...')}
               className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold"
             />
             <Button type="submit" size="icon" className="h-14 w-14 rounded-2xl bg-amber-400 hover:bg-amber-500 shadow-lg shadow-amber-200" disabled={isChatLoading}>
                <Send className="h-6 w-6 text-amber-950" />
             </Button>
          </form>
        </DialogContent>
      </Dialog>
      <PassGuideModal 
        isOpen={isGuideOpen} 
        onClose={() => setIsGuideOpen(false)} 
        optimizedNames={nameSuggestions}
        currentAuthName={formData.authName}
        officialName={formData.officialName}
        mode="registration"
      />
      <PassGuideModal 
        isOpen={isAuthGuideOpen} 
        onClose={() => setIsAuthGuideOpen(false)} 
        optimizedNames={nameSuggestions}
        currentAuthName={formData.authName}
        officialName={formData.officialName}
        mode="auth"
      />
      <KakaoGuideModal isOpen={isKakaoGuideOpen} onClose={() => setIsKakaoGuideOpen(false)} mode="registration" />
      <KakaoGuideModal isOpen={isKakaoAuthGuideOpen} onClose={() => setIsKakaoAuthGuideOpen(false)} mode="auth" />

      {/* 성함 확인 가이드 모달 */}
      {isNameHelpOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
            <div className="p-8 sm:p-10 space-y-8 overflow-y-auto">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-slate-900 leading-tight">
                    {t('내 이름이 통신사에 어떻게 등록되어 있나요?')}
                  </h2>
                  <p className="text-sm font-bold text-amber-600">
                    {t('대부분의 외국인 이름 오류는 띄어쓰기 한 칸 차이로 발생합니다.')}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsNameHelpOpen(false)} className="rounded-full shrink-0">
                  <X className="h-6 w-6" />
                </Button>
              </div>

              <div className="space-y-8">
                {/* Visual Guide Screenshot Placeholder */}
                <div className="rounded-3xl border border-slate-100 overflow-hidden shadow-inner bg-slate-50 aspect-[4/3] relative group">
                  <img 
                    src="/images/guide/name_check_guide.png" 
                    alt="Carrier App Name Check Guide"
                    className="w-full h-full object-cover"
                  />
                  {/* Tooltip Overlay */}
                  <div className="absolute top-[30%] right-[12%] animate-in slide-in-from-right-10 fade-in duration-1000">
                    <div className="bg-emerald-500 text-white text-[10px] sm:text-xs font-black px-3 py-2 rounded-2xl shadow-2xl flex items-center gap-1.5 whitespace-nowrap">
                      <div className="bg-white/20 p-1 rounded-full">
                        <Smartphone className="h-3 w-3" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="opacity-70 text-[8px] uppercase tracking-tighter">{t('확인됨')}</span>
                        <span>{t('영어 이름 (English Name)')}</span>
                      </div>
                    </div>
                    <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] border-t-emerald-500 ml-4 shadow-xl" />
                  </div>

                  {/* Highlight Ring */}
                  <div className="absolute top-[40%] right-[35%] w-16 h-16 border-4 border-emerald-500/40 rounded-full animate-pulse blur-[1px]" />
                  <div className="absolute top-[40%] right-[35%] w-16 h-16 border border-emerald-500/60 rounded-full animate-ping" />

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/40 to-transparent p-4">
                    <p className="text-[10px] text-white font-bold opacity-80 uppercase tracking-widest">{t('통신사 앱(T world 등) 마이페이지 예시')}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 space-y-3">
                    <div className="flex items-center gap-2 text-blue-700">
                      <Building2 className="h-5 w-5" />
                      <h3 className="font-black italic">{t('은행 앱에서 확인하기')} (Pro Tip)</h3>
                    </div>
                    <p className="text-sm font-medium text-blue-600 leading-relaxed">
                      {t("카카오뱅크나 토스 등 은행 앱의 '내 정보'에 표시된 영문 성함이 통신사 등록 성함과 같을 확률이 매우 높습니다.")}
                    </p>
                  </div>

                  <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-700">
                      <Smartphone className="h-5 w-5" />
                      <h3 className="font-black">{t('통신사 앱에서 확인하기')}</h3>
                    </div>
                    <p className="text-sm font-medium text-emerald-600 leading-relaxed">
                      {t("통신사 고객센터 앱(T world, My KT, U+)의 마이페이지에서 정확한 성함(띄어쓰기 포함)을 확인하실 수 있습니다.")}
                    </p>
                  </div>
                </div>
              </div>

              <Button onClick={() => setIsNameHelpOpen(false)} className="w-full h-18 bg-slate-900 text-xl font-black rounded-[1.5rem] shadow-xl hover:scale-[1.02] transition-all">
                {t('확인했습니다')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
