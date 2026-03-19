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
  Phone,
  MessageSquare,
  SearchX,
  RotateCcw,
  ArrowLeft,
  Banknote,
  FileText,
  BadgeCheck,
  Copy,
  User
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";


import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/components/LanguageContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { getStoredTrackingData } from "@/lib/tracking";

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

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [isSignUpAgreed, setIsSignUpAgreed] = useState(true);

  const [analysisError, setAnalysisError] = useState<{
    code: string;
    title: string;
    reason: string;
    solution: string;
  } | null>(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSigned, setIsSigned] = useState(false);

  const [authSession, setAuthSession] = useState<{ id: string, twoWayInfo: any } | null>(null);
  const [authMethod, setAuthMethod] = useState<'app' | 'sms'>('app');

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

  const progressValue = (step / 8) * 100;

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
    setStep(2);
    saveProgress(2);

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
    setStep(3);
    saveProgress(3);
  };

  const handleInitiateAuth = async () => {
    // Step 4로 즉시 전환하여 '요청 중' 상태를 보여줌
    setStep(4);
    setLoading(true);
    try {
      const telecomCode = formData.carrier.includes("SKT") ? "0" : formData.carrier.includes("KT") ? "1" : "2";

      const authRes = await initiateRefundAuth({
        userName: formData.authName,
        registrationNumber: formData.registrationNumber,
        phoneNo: formData.phone,
        telecom: telecomCode,
        method: authMethod
      });

      if (authRes.success) {
        setAuthSession({ id: authRes.id, twoWayInfo: authRes.twoWayInfo });
        toast({ title: t("인증 요청 성공"), description: t(authRes.message) });
      } else {
        toast({ variant: "destructive", title: t("인증 요청 실패"), description: t(authRes.message) });
        setStep(3); // 실패 시 다시 선택 단계로
      }
    } catch (error) {
      toast({ variant: "destructive", title: t("시스템 오류"), description: t("인증 요청 중 오류가 발생했습니다.") });
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalVerifyAndAnalyze = async () => {
    if (!authSession) return;
    if (authMethod === 'sms' && !formData.otpCode) {
      toast({ variant: "destructive", title: t("인증번호 미입력"), description: t("문자로 받은 6자리 번호를 입력해 주세요.") });
      return;
    }
    setStep(5);
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
      setStep(6);
      saveProgress(6);
      setLoading(false);
    } catch (error: any) {
      let diag = {
        code: error.message,
        title: t("데이터 수집에 실패했습니다"),
        reason: t("알 수 없는 통신 오류가 발생했습니다."),
        solution: t("잠시 후 다시 시도해 주세요.")
      };

      if (error.message === "NAME_MISMATCH") {
        diag = {
          code: "NAME_MISMATCH",
          title: t("성명 정보가 일치하지 않습니다"),
          reason: t("외국인 등록증 성명({name})과 통신사(PASS) 등록 성명이 다릅니다.", { name: formData.officialName }),
          solution: t("Step 2로 돌아가 AI가 추천하는 다른 이름 조합을 선택해 보세요.")
        };
      } else if (error.message === "AUTH_TIMEOUT") {
        diag = {
          code: "AUTH_TIMEOUT",
          title: t("인증 시간이 초과되었습니다"),
          reason: t("휴대폰에서 2분 이내에 '확인' 버튼을 누르지 않았습니다."),
          solution: t("Step 3로 돌아가 다시 인증을 요청해 주세요.")
        };
      } else if (error.message === "NTS_SERVER_ERROR") {
        diag = {
          code: "NTS_SERVER_ERROR",
          title: t("국세청 시스템 점검 중입니다"),
          reason: t("대한민국 국세청(NTS)의 일일 데이터 점검 시간일 수 있습니다."),
          solution: t("30분 뒤에 다시 시도해 주세요.")
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
      setStep(8);
      saveProgress(8);
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
        resIncomeTax: result?.resIncomeTax || 0,
        resCompanyIdentityNo1: result?.resCompanyIdentityNo1 || 'N/A',
        resAttrYear: result?.resAttrYear || 'N/A',
        resIncomeSpecList: result?.resIncomeSpecList || '',
        caseType: result?.caseType || 'D',
        details: result?.details || [],
        status: 'InquiryCompleted',
        lastStep: 8,
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
              <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">{t('Process 1 / 8')}</Badge>
              <span className="text-2xl font-black">{Math.round(progressValue)}%</span>
            </div>
            <Progress value={progressValue} className="h-3" />
          </div>

          <div className="relative">
            {step === 1 && (
              <Card className="premium-card rounded-[2.5rem] border-none shadow-sm overflow-hidden">
                <CardHeader className="text-center bg-slate-50/50 py-6 sm:py-10 border-b border-slate-100">
                  <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 bg-primary/10 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-4"><Scan className="h-6 w-6 sm:h-8 sm:w-8 text-primary" /></div>
                  <CardTitle className="text-2xl sm:text-3xl font-black break-keep">{t('Step 1: 외국인등록증 인증')}</CardTitle>
                  <CardDescription className="font-bold text-slate-400 text-xs sm:text-sm">{t('신분증 정보를 확인하여 감면 대상을 판별합니다.')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 sm:space-y-8 p-6 sm:p-10">
                  <Alert className="bg-primary/5 border-primary/20 rounded-2xl p-6">
                    <AlertCircle className="h-5 w-5 text-primary" />
                    <AlertTitle className="font-black text-primary text-lg">{t('대상 연령 안내 (실시간 업데이트)')}</AlertTitle>
                    <AlertDescription>
                      <div className="mt-4 p-4 bg-white rounded-2xl border border-primary/10 text-center shadow-sm">
                        <span className="text-xs text-slate-400 block mb-1 font-bold uppercase tracking-widest">{t('현재 기준 대상 생년월일')}</span>
                        <span className="font-black text-primary text-xl">{eligibilityRange.start} ~ {eligibilityRange.end}</span>
                      </div>
                    </AlertDescription>
                  </Alert>
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
                        <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">{t('영문 성명 (NAME)')}</Label>
                        <input 
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

            {step === 2 && (
              <Card className="premium-card rounded-[2.5rem] border-none shadow-sm overflow-hidden">
                <CardHeader className="text-center bg-slate-50/50 py-6 sm:py-10 border-b border-slate-100">
                  <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 bg-primary/10 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-4"><Smartphone className="h-6 w-6 sm:h-8 sm:w-8 text-primary" /></div>
                  <CardTitle className="text-2xl sm:text-3xl font-black break-keep">{t('Step 2: 본인 인증 정보 입력')}</CardTitle>
                </CardHeader>
                <CardContent className="p-6 sm:p-10 space-y-6 sm:space-y-8">
                  <form onSubmit={handleContactSubmit} className="space-y-8">
                    <div className="grid gap-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">{t('휴대폰 번호')}</Label>
                          <input placeholder="01012345678" className="h-14 px-6 rounded-2xl bg-slate-50 border-none font-bold text-lg w-full outline-none focus:ring-2 focus:ring-primary/20" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
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
                      <div className="space-y-4 p-6 bg-primary/5 rounded-[2rem] border border-primary/10">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className={cn("h-4 w-4 text-primary", isOptimizing && "animate-pulse")} />
                          <h4 className="text-sm font-black text-slate-900">
                            {isOptimizing ? t('AI가 최적의 성명 조합을 분석 중입니다...') : t('통신사 등록 성명 확인 (AI 추천)')}
                          </h4>
                        </div>
                        
                        {!isOptimizing && (
                          <div className="mb-4 p-4 bg-white rounded-xl border border-primary/10">
                            <p className="text-xs font-bold text-slate-500 leading-relaxed">
                              {t('신분증의 이름은 {name}입니다.', { name: '__AI_NAME_TOKEN__' }).split('__AI_NAME_TOKEN__').map((part, i) => (
                                <Fragment key={i}>
                                  {part}
                                  {i === 0 && <span className="text-primary font-black underline">{formData.officialName}</span>}
                                </Fragment>
                              ))}
                              <br />
                              {t('혹시 통신사(폰 개통)에 등록된 이름과 다른가요?')}
                            </p>
                          </div>
                        )}

                        <div className="grid grid-cols-1 gap-3">
                          {isOptimizing && nameSuggestions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-4 text-slate-400 bg-white/50 rounded-2xl border border-dashed border-slate-200">
                              <Loader2 className="h-10 w-10 animate-spin text-primary" />
                              <div className="text-center space-y-1">
                                <p className="text-sm font-black text-slate-600">{t('최적의 성명 조합을 찾는 중...')}</p>
                                <p className="text-[10px] font-bold text-slate-400">{t('본인인증 성공률을 높이기 위해 AI가 분석 중입니다.')}</p>
                              </div>
                            </div>
                          ) : (
                            <>
                              {!isOptimizing && (
                                <Alert className="bg-white border-primary/20 rounded-2xl mb-2 shadow-sm">
                                  <Info className="h-4 w-4 text-primary" />
                                  <AlertDescription className="text-[11px] font-bold text-slate-500 leading-relaxed">
                                    {t('외국 국적자는 통신사 등록 형식이 신분증과 다를 수 있습니다. 인증 실패를 방지하기 위해 AI가 제안하는 아래 옵션 중 본인의 휴대폰 가입 형식을 선택해 주세요.')}
                                  </AlertDescription>
                                </Alert>
                              )}
                                {nameSuggestions.map((item, i) => (
                                  <div key={i} onClick={() => setFormData({ ...formData, authName: item.name })} className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col gap-1 ${formData.authName === item.name ? 'bg-primary border-primary text-white shadow-lg' : 'bg-white border-slate-100 text-slate-600 hover:border-primary/30'}`}>
                                    <div className="flex justify-between items-center">
                                      <span className="font-black text-lg">{item.name}</span>
                                      {formData.authName === item.name && <CheckCircle2 className="h-5 w-5" />}
                                    </div>
                                    <span className={cn("text-[10px] font-bold", formData.authName === item.name ? "text-white/70" : "text-primary/70")}>
                                      {t(item.label)}
                                    </span>
                                  </div>
                                ))}

                                <div className="pt-4 border-t border-slate-100 mt-4 space-y-3">
                                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block">{t('결과가 없나요? 직접 입력하기')}</Label>
                                  <div className="relative">
                                    <input 
                                      placeholder={t('통신사에 등록된 이름을 직접 입력하세요')}
                                      value={formData.authName}
                                      onChange={(e) => setFormData({ ...formData, authName: e.target.value.toUpperCase() })}
                                      className="h-14 px-6 rounded-2xl bg-white border border-slate-200 font-bold text-lg w-full outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                    <User className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                                  </div>
                                </div>
                              </>
                            )}
                        </div>
                      </div>
                    </div>
                    <div className="p-8 bg-slate-900 text-white rounded-[2.5rem] flex items-start gap-5 shadow-2xl transition-all hover:scale-[1.01]">
                      <Checkbox id="signup" checked={isSignUpAgreed} onCheckedChange={(c) => setIsSignUpAgreed(c as boolean)} className="mt-1.5 h-6 w-6 border-white/20" />
                      <div className="space-y-2"><div className="flex items-center gap-3"><Label htmlFor="signup" className="text-lg lg:text-xl font-black cursor-pointer break-keep">{t('회원가입 및 실시간 알림 받기')}</Label></div></div>
                    </div>
                    <Button type="submit" className="w-full h-16 sm:h-20 bg-slate-900 text-lg sm:text-xl font-black rounded-2xl sm:rounded-3xl shadow-2xl" disabled={loading}>{t('인증 단계로 이동')}</Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {step === 3 && (
              <Card className="premium-card rounded-[2.5rem] border-none shadow-2xl overflow-hidden">
                <CardHeader className="text-center py-8 sm:py-12 bg-slate-50/50">
                  <div className="mx-auto h-16 w-16 sm:h-20 sm:w-20 bg-primary rounded-2xl sm:rounded-3xl flex items-center justify-center mb-6 shadow-lg"><UserCheck className="h-8 w-8 sm:h-10 sm:w-10 text-white" /></div>
                  <CardTitle className="text-2xl sm:text-3xl font-black text-slate-900 break-keep">{t('Step 3: 인증 방식 선택')}</CardTitle>
                  <CardDescription className="font-bold text-slate-500 text-xs sm:text-sm">{t('가장 편리한 방법으로 본인을 인증해 주세요.')}</CardDescription>
                </CardHeader>
                <CardContent className="p-6 sm:p-10 space-y-6 sm:space-y-8">
                  <div className="grid grid-cols-1 gap-4">
                    <div
                      onClick={() => setAuthMethod('app')}
                      className={cn(
                        "p-6 rounded-[2rem] border-2 cursor-pointer transition-all flex items-center gap-5",
                        authMethod === 'app' ? "bg-primary/5 border-primary shadow-lg" : "bg-white border-slate-100 hover:border-slate-200"
                      )}
                    >
                      <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center", authMethod === 'app' ? "bg-primary text-white" : "bg-slate-100 text-slate-400")}>
                        <Smartphone className="h-7 w-7" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="font-black text-lg">{t('PASS 앱으로 간편하게')}</h4>
                          {authMethod === 'app' && <CheckCircle2 className="h-5 w-5 text-primary" />}
                        </div>
                        <p className="text-sm text-slate-500 font-medium">{t("앱에서 '확인' 버튼만 누르면 끝")}</p>
                      </div>
                    </div>

                    <div
                      onClick={() => setAuthMethod('sms')}
                      className={cn(
                        "p-6 rounded-[2rem] border-2 cursor-pointer transition-all flex items-center gap-5",
                        authMethod === 'sms' ? "bg-primary/5 border-primary shadow-lg" : "bg-white border-slate-100 hover:border-slate-200"
                      )}
                    >
                      <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center", authMethod === 'sms' ? "bg-primary text-white" : "bg-slate-100 text-slate-400")}>
                        <MessageSquare className="h-7 w-7" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="font-black text-lg">{t('문자로 인증번호 받기')}</h4>
                          {authMethod === 'sms' && <CheckCircle2 className="h-5 w-5 text-primary" />}
                        </div>
                        <p className="text-sm text-slate-500 font-medium">{t('문자로 온 6자리 번호를 직접 입력')}</p>
                      </div>
                    </div>
                  </div>

                  <Button onClick={handleInitiateAuth} className="w-full h-20 bg-primary text-2xl font-black rounded-3xl shadow-xl shadow-primary/20" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin h-8 w-8" /> : t('인증 요청하기')}
                  </Button>
                </CardContent>
              </Card>
            )}

            {step === 4 && (
              <Card className="premium-card rounded-[2.5rem] border-none shadow-2xl overflow-hidden">
                <CardHeader className="text-center py-12 bg-slate-50/50">
                  <div className="mx-auto h-20 w-20 bg-primary rounded-3xl flex items-center justify-center mb-6 shadow-lg">
                    {authMethod === 'app' ? <Smartphone className="h-10 w-10 text-white" /> : <MessageSquare className="h-10 w-10 text-white" />}
                  </div>
                  <CardTitle className="text-3xl font-black text-slate-900">{t('Step 4: 인증 확인')}</CardTitle>
                </CardHeader>
                <CardContent className="p-10 space-y-10">
                  {authMethod === 'app' ? (
                    <div className="text-center space-y-8 py-4">
                      {!authSession ? (
                        <div className="space-y-6">
                          <div className="flex flex-col items-center justify-center py-12 gap-6 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                            <Loader2 className="h-16 w-16 animate-spin text-primary" />
                            <div className="space-y-2">
                              <h2 className="text-2xl font-black text-slate-900">{t("PASS 앱 인증 요청 중...")}</h2>
                              <p className="text-slate-500 font-bold">{t("잠시만 기다려 주세요.")}</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <h2 className="text-2xl font-black text-slate-900">{t("휴대폰에서 '확인'을 눌러주세요")}</h2>
                          <p className="text-lg font-bold text-slate-500 whitespace-pre-line">{t("PASS 앱 알림 또는 문자를 확인한 뒤\n아래 버튼을 눌러주세요.")}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {!authSession ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-6 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                          <Loader2 className="h-16 w-16 animate-spin text-primary" />
                          <div className="space-y-2 text-center">
                            <h2 className="text-2xl font-black text-slate-900">{t("인증 문자를 발송 중입니다...")}</h2>
                            <p className="text-slate-500 font-bold">{t("잠시만 기다려 주세요.")}</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-4 text-center">
                            <h2 className="text-2xl font-black text-slate-900">{t('인증번호 6자리를 입력하세요')}</h2>
                            <p className="text-lg font-bold text-slate-500">{formData.phone} {t('번호로 문자가 발송되었습니다.')}</p>
                          </div>
                          <div className="relative">
                            <input
                              placeholder="000000"
                              maxLength={6}
                              className="h-20 text-4xl font-black text-center tracking-[1rem] rounded-3xl bg-slate-50 border-2 border-slate-100 focus:border-primary transition-all w-full outline-none"
                              value={formData.otpCode}
                              onChange={(e) => setFormData({ ...formData, otpCode: e.target.value.replace(/[^0-9]/g, '') })}
                            />
                          </div>
                        </>
                      )}
                      
                      <Alert className="bg-primary/5 border-primary/20 rounded-3xl p-6">
                        <Info className="h-5 w-5 text-primary" />
                        <div className="ml-2">
                          <AlertTitle className="font-black text-primary text-sm mb-2">{t('문자가 오지 않나요?')}</AlertTitle>
                          <AlertDescription className="text-[13px] font-bold text-slate-600 leading-relaxed space-y-3">
                            <p>{t('외국 국적자는 통신사에 등록된 이름이 신분증과 다른 경우가 많습니다. 인증 실패를 방지하려면 AI가 제안한 추천 성명을 하나씩 시도해 보는 것이 좋습니다.')}</p>
                            <div className="p-4 bg-white/60 rounded-2xl border border-primary/10 space-y-2">
                              <p className="text-[11px] text-slate-400 uppercase tracking-wider">{t('정확한 등록 성함 확인 방법')}</p>
                              <ul className="list-disc list-inside text-xs space-y-1 text-slate-500">
                                <li>{t('통신사 고객센터 앱 (T world, My KT, U+ 고객센터) 마이페이지')}</li>
                                <li>{t('매월 수령하는 요금 고지서(이메일/문자)의 수신인 성함')}</li>
                              </ul>
                            </div>
                          </AlertDescription>
                        </div>
                      </Alert>
                    </div>
                  )}

                  <Button onClick={handleFinalVerifyAndAnalyze} className="w-full h-20 bg-primary text-2xl font-black rounded-3xl shadow-xl shadow-primary/20" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin h-8 w-8" /> : t('인증 완료 및 데이터 분석')}
                  </Button>
                </CardContent>
              </Card>
            )}

            {step === 5 && !analysisError && (
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

            {step === 5 && analysisError && (
              <Card className="premium-card rounded-[3rem] border-none shadow-2xl overflow-hidden bg-white">
                <CardHeader className="text-center py-12 bg-red-50/50 border-b border-red-100">
                  <div className="mx-auto h-20 w-20 bg-red-100 rounded-3xl flex items-center justify-center mb-6 shadow-sm"><SearchX className="h-10 w-10 text-red-500" /></div>
                  <CardTitle className="text-3xl font-black text-slate-900">{t('AI 오류 진단 리포트')}</CardTitle>
                  <CardDescription className="font-bold text-red-500">{analysisError.title}</CardDescription>
                </CardHeader>
                <CardContent className="p-10 space-y-10">
                  <div className="space-y-8">
                    <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                      <div className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-500" /><h4 className="font-black text-slate-900">{t('분석된 원인 (Cause)')}</h4></div>
                      <p className="text-slate-600 font-medium leading-relaxed">{analysisError.reason}</p>
                    </div>
                    <div className="p-8 bg-primary/5 rounded-3xl border border-primary/10 space-y-4">
                      <div className="flex items-center gap-2"><RotateCcw className="h-5 w-5 text-primary" /><h4 className="font-black text-primary">{t('해결책 (Solution)')}</h4></div>
                      <p className="text-slate-700 font-bold leading-relaxed">{analysisError.solution}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4">
                    <Button onClick={() => setStep(2)} className="w-full h-20 bg-slate-900 text-xl font-black rounded-3xl shadow-xl">{t('이름 조합 다시 선택하기 (Step 2)')}</Button>
                    <Button variant="ghost" onClick={() => setStep(3)} className="w-full h-14 font-bold text-slate-400 hover:text-slate-600"><ArrowLeft className="mr-2 h-4 w-4" /> {t('인증 방식 다시 선택하기')}</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 6 && result && (
              <Card className="premium-card rounded-[3rem] border-none shadow-2xl overflow-hidden bg-white">
                <CardHeader className="text-center py-16 bg-slate-50/50">
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
                  <Button onClick={() => setStep(7)} className="w-full h-24 bg-slate-900 text-3xl font-black rounded-[2rem] shadow-2xl flex items-center justify-center gap-4">
                    {result.refundEstimate > 0 ? t('지금 환급 신청하기') : t('전문 상담 신청하기')} <ArrowRight className="h-10 w-10" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {step === 7 && (
              <Card className="premium-card rounded-[2.5rem] border-none shadow-2xl overflow-hidden">
                <CardHeader className="text-center py-12 bg-slate-900 text-white">
                  <CardTitle className="text-3xl font-black font-headline">{t('Step 7: 수수료 결제')}</CardTitle>
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

            {step === 8 && (
              <Card className="premium-card rounded-[2.5rem] border-none shadow-2xl overflow-hidden">
                <CardHeader className="text-center py-12 bg-slate-900 text-white">
                  <CardTitle className="text-3xl font-black font-headline">{t('Step 8: 최종 신청')}</CardTitle>
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
    </div>
  );
}
