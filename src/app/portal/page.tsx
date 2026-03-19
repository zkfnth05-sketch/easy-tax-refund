/** FINAL_TRANSLATION_LOCK: VI_ZH_DONE_DO_NOT_MODIFY **/

"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Clock,
  FileText,
  Bell,
  Download,
  TrendingUp,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  Loader2,
  Banknote,
  Search,
  Building2,
  Briefcase,
  Printer,
  Stamp,
  CheckCircle,
  Plus,
  Upload,
  Files,
  X,
  Send,
  MessageSquare
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { translateChatMessage } from "@/ai/flows/chat-translation-flow";


import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/components/LanguageContext";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, collection, query, orderBy, addDoc, serverTimestamp, updateDoc, increment } from "firebase/firestore";

export default function ClientPortal() {
  const { t, language } = useTranslation();
  const user: any = { uid: "mock-uid", displayName: "사용자" };
  const router = useRouter();
  const { toast } = useToast();

  const [isDocumentOpen, setIsDocumentOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Chat States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isSendingChat, setIsSendingChat] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const [currentApp, setCurrentApp] = useState<any>(null);
  const [appsLoading, setAppsLoading] = useState(true);

  // sessionStorage에서 신청 ID를 읽어 Firestore에서 실시간으로 내 신청 조회
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const appId = sessionStorage.getItem('myApplicationId');
      if (!appId) {
        setAppsLoading(false);
        return;
      }
      const unsubscribe = onSnapshot(doc(db, 'applications', appId), (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = { id: docSnapshot.id, ...docSnapshot.data() };
          setCurrentApp(data);
          
          // 알림 센터가 보이면 카운트 초기화 (여기서는 단순하게 데이터 로드 시 초기화 시도)
          if ((data as any).unreadNotificationCountUser > 0) {
              updateDoc(docSnapshot.ref, { unreadNotificationCountUser: 0 });
          }
        }
        setAppsLoading(false);
      }, (error) => {
        console.error('Firestore 오류:', error);
        setAppsLoading(false);
      });
      return () => unsubscribe();
    } else {
        setAppsLoading(false);
    }
  }, []);

  // Chat Real-time Listener
  useEffect(() => {
    if (!currentApp?.id || !isChatOpen) {
      setChatMessages([]);
      return;
    }
    
    const chatQuery = query(
      collection(db, 'applications', currentApp.id, 'chat_messages'),
      orderBy('timestamp', 'asc')
    );
    
    const unsubscribe = onSnapshot(chatQuery, (snapshot) => {
      const msgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setChatMessages(msgs);
    }, (error) => {
      console.error('채팅 Firestore 오류:', error);
    });
    
    return () => unsubscribe();
  }, [currentApp?.id, isChatOpen]);

  // 자동 스크롤
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSendChatMessage = async () => {
    if (!currentApp?.id || !chatInput.trim() || isSendingChat) return;
    
    setIsSendingChat(true);
    const messageToSend = chatInput;
    setChatInput("");

    try {
      let translatedText = null;
      // 사용자 메시지는 항상 관리자를 위해 한국어로 번역 요청
      if (language !== 'ko') {
        try {
          const res = await translateChatMessage({ 
            message: messageToSend, 
            sourceLanguage: language, 
            targetLanguage: 'ko' 
          });
          translatedText = res.translatedMessage;
        } catch (err) {
          console.error("Chat translation failed:", err);
        }
      }

      await addDoc(collection(db, 'applications', currentApp.id, 'chat_messages'), {
        sender: 'User',
        text: messageToSend,
        translatedText,
        timestamp: serverTimestamp()
      });

      // 관리자용 읽지 않은 메시지 카운트 증가
      await updateDoc(doc(db, 'applications', currentApp.id), {
        unreadChatCountAdmin: increment(1)
      });
    } catch (error) {
      toast({ variant: "destructive", title: t("발송 실패"), description: t("메시지를 보내지 못했습니다.") });
      setChatInput(messageToSend);
    } finally {
      setIsSendingChat(false);
    }
  };

  const [userProfile, setUserProfile] = useState<any>({
    fullName: "사용자",
    foreignerRegistrationNumber: "",
    phoneNumber: "",
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUserProfile({
        fullName: currentApp?.fullName || sessionStorage.getItem('myFullName') || "사용자",
        foreignerRegistrationNumber: currentApp?.registrationNumber || "",
        phoneNumber: currentApp?.phone || "",
      });
    } else {
        setUserProfile({
           fullName: currentApp?.fullName || "사용자",
           foreignerRegistrationNumber: currentApp?.registrationNumber || "",
           phoneNumber: currentApp?.phone || "",
        });
    }
  }, [currentApp]);

  const applications = currentApp ? [currentApp] : [];
  const notifications = currentApp?.notifications || [];
  const profileLoading = false;
  const notifsLoading = false;

  const uploadedDocs: any[] = [];

  const steps = [
    { label: t("조회 완료"), status: "InquiryCompleted", icon: <CheckCircle2 className="h-5 w-5" /> },
    { label: t("신청 중"), status: "Applying", icon: <FileText className="h-5 w-5" /> },
    { label: t("서류 보완 필요"), status: "AdditionalDocsNeeded", icon: <AlertCircle className="h-5 w-5" /> },
    { label: t("세무사 자료 접수중"), status: "TaxAccountantReceiving", icon: <Briefcase className="h-5 w-5" /> },
    { label: t("세무서 검토 중"), status: "TaxOfficeReviewing", icon: <Clock className="h-5 w-5" /> },
    { label: t("대한민국 국세청 서류접수"), status: "NTSDocumentReceipt", icon: <Building2 className="h-5 w-5" /> },
    { label: t("대한민국 국세청 검토중"), status: "NTSReviewing", icon: <Search className="h-5 w-5" /> },
    { label: t("환급 완료"), status: "RefundCompleted", icon: <TrendingUp className="h-5 w-5" /> },
  ];

  const currentStepIndex = currentApp ? steps.findIndex(s => s.status === currentApp.status) : 0;

  const formatDocumentDate = (dateString: string) => {
    const date = new Date(dateString);
    return t("{year}년 {month}월 {day}일", {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate()
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentApp || !user) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUri = e.target?.result as string;
        await new Promise(r => setTimeout(r, 1000));
        toast({ title: t("문서 업로드 성공"), description: t("{fileName}이(가) 안전하게 제출되었습니다.", { fileName: file.name }) });
        setIsUploadOpen(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({ variant: "destructive", title: t("업로드 실패"), description: t("다시 시도해 주세요.") });
    } finally {
      setIsUploading(false);
    }
  };

  const handlePrint = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!printRef.current) return;

    const printWindow = window.open('', '_blank', 'width=1000,height=900');
    if (printWindow) {
      const headStyles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
        .map(s => s.outerHTML)
        .join('\n');

      const content = printRef.current.innerHTML;

      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="ko">
          <head>
            <meta charset="utf-8">
            <title>${t('세무대리 수임 동의서')} - Easy Tax Refund</title>
            ${headStyles}
            <style>
              body { 
                background: white !important; 
                margin: 0 !important; 
                padding: 40px !important; 
                font-family: 'Inter', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif !important; 
                color: #0f172a !important;
                overflow: visible !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .print-wrapper { 
                display: block !important; 
                visibility: visible !important; 
                opacity: 1 !important; 
                width: 100% !important;
                max-width: 800px !important;
                margin: 0 auto !important;
              }
              .flex { display: flex !important; }
              .grid { display: grid !important; }
              .hidden { display: none !important; }
              img { display: inline-block !important; max-height: 120px; object-fit: contain; }
              .print-hidden, .no-print, button { display: none !important; }
              @page { margin: 1cm; size: A4; }
              [role="dialog"], [data-state] { 
                position: static !important; 
                transform: none !important; 
                box-shadow: none !important;
                border: none !important;
              }
            </style>
          </head>
          <body>
            <div class="print-wrapper">
              ${content}
            </div>
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 1000);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      toast({
        variant: "destructive",
        title: t("팝업 차단됨"),
        description: t("인쇄창을 띄우기 위해 브라우저 설정에서 팝업을 허용해주세요.")
      });
    }
  };

  if (appsLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-body bg-slate-50">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-32 lg:py-40">
        <div className="max-w-6xl mx-auto space-y-10">

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl lg:text-4xl font-black font-headline text-slate-900">
                {t('안녕하세요, {fullName}님', { fullName: userProfile?.fullName || user?.displayName || "사용자" })}
              </h1>
              <p className="text-slate-500 font-medium">{t('환급 진행 상황을 실시간으로 확인하는 곳입니다.')}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="rounded-xl font-bold bg-white"><ShieldCheck className="mr-2 h-4 w-4 text-green-500" /> {t('본인 인증 완료')}</Button>
            </div>
          </div>

          {/* 추가 서류 요청 알림 카드 */}
          {currentApp?.pendingDocRequests?.some((r: any) => r.status !== 'completed') && (
            <Card className="premium-card rounded-[2.5rem] border-none shadow-2xl bg-amber-50/50 overflow-hidden">
              <div className="p-8 lg:p-10 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                    <AlertCircle className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">{t('보완 서류 제출이 필요합니다')}</h2>
                    <p className="text-slate-500 font-bold">{t('정확한 환급액 산출을 위해 아래 서류를 추가로 제출해 주세요.')}</p>
                  </div>
                </div>
                
                <div className="grid gap-3">
                  {currentApp.pendingDocRequests.filter((r: any) => r.status !== 'completed').map((req: any) => (
                    <div key={req.id} className="p-6 bg-white rounded-3xl border border-amber-200 flex flex-col sm:flex-row justify-between items-center gap-4 transition-all hover:border-amber-400">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-amber-50 rounded-xl flex items-center justify-center">
                          <FileText className="h-5 w-5 text-amber-500" />
                        </div>
                        <span className="text-lg font-black text-slate-800">{req.translatedName || req.name}</span>
                      </div>
                      <Button 
                        onClick={() => setIsUploadOpen(true)}
                        className="w-full sm:w-auto px-8 h-12 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl shadow-lg shadow-amber-500/20"
                      >
                        {t('지금 업로드')}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          <Card className="premium-card rounded-[2.5rem] border-none shadow-sm overflow-hidden p-8 lg:p-12">
            <div className="space-y-12">
              <div className="flex flex-col lg:flex-row justify-between gap-10">
                <div className="space-y-4 flex-1">
                  <Badge className="bg-primary/10 text-primary border-none font-black px-4 py-1">{t('현재 진행 단계')}</Badge>
                  <h2 className="text-3xl font-black font-headline text-slate-900">
                    {currentApp ? (steps[currentStepIndex]?.label || t("단계 확인 중")) : t("신청 내역 없음")}
                  </h2>
                  <div className="p-8 bg-primary/5 rounded-[2.5rem] border border-primary/10">
                    <p className="text-slate-700 font-bold leading-relaxed text-lg">
                      {t('대한민국 국세청(NTS) 환급은 보통')} <span className="text-primary font-black">{t('45~60일 정도 소요')}</span>{t('되며, 검토 과정에서')} <span className="underline">{t('추가 증빙 서류 제출이 필요')}</span>{t('할 수 있습니다.')}
                      <br /><br />
                      {t('사용자가 "내 서류가 잘 접수됐나?", "돈은 언제 들어오지?"라는 불안감을 느끼지 않도록 실시간으로 정보를 업데이트합니다.')}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900 text-white p-8 rounded-3xl min-w-[320px] flex flex-col justify-center gap-4 shadow-2xl">
                  <div className="flex items-center gap-3 opacity-60">
                    <Banknote className="h-5 w-5" />
                    <span className="text-xs font-bold uppercase tracking-widest">{t('예상 환급액 (Actual)')}</span>
                  </div>
                  <div className="text-4xl font-black text-[#fbbf24] font-headline">
                    ₩ {currentApp ? (currentApp.estimatedRefundAmount || 0).toLocaleString() : "0"}
                  </div>
                  <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                    <span className="text-xs font-bold opacity-40">
                      {t('신청일')}: {currentApp ? new Date(currentApp.applicationDate || currentApp.createdAt).toLocaleDateString() : "-"}
                    </span>
                    <Badge className="bg-white/10 text-white text-[10px] border-none">
                      {t('실시간 연동 중')}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="relative pt-10">
                <div className="absolute top-[50%] left-0 w-full h-1 bg-slate-100 -translate-y-1/2 rounded-full hidden lg:block" />
                <div
                  className="absolute top-[50%] left-0 h-1 bg-primary -translate-y-1/2 rounded-full transition-all duration-1000 hidden lg:block"
                  style={{ width: currentApp ? `${(currentStepIndex / (steps.length - 1)) * 100}%` : "0%" }}
                />
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 relative z-10">
                  {steps.map((step, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-4 group">
                      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${currentApp && idx <= currentStepIndex ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white text-slate-300 border-2 border-slate-100'
                        }`}>
                        {step.icon}
                      </div>
                      <div className="text-center">
                        <p className={`font-black text-[11px] leading-tight ${currentApp && idx <= currentStepIndex ? 'text-slate-900' : 'text-slate-400'}`}>{step.label}</p>
                        {currentApp && idx === currentStepIndex && <Badge variant="outline" className="mt-1 text-[9px] border-primary/20 text-primary bg-primary/5 px-1">{t('현재')}</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 premium-card rounded-[2.5rem] border-none shadow-sm overflow-hidden">
              <CardHeader className="p-8 border-b border-slate-50">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-amber-50 rounded-xl flex items-center justify-center relative">
                      <Bell className="h-5 w-5 text-amber-500" />
                      {currentApp?.unreadNotificationCountUser > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black text-white animate-pulse">
                          {currentApp.unreadNotificationCountUser > 9 ? '9+' : currentApp.unreadNotificationCountUser}
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-xl font-black">{t('알림 센터')}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-50">
                  {(notifications && notifications.length > 0) ? notifications.map((notif: any) => (
                    <div key={notif.id} className="p-8 flex gap-6 hover:bg-slate-50/50 transition-colors">
                      <div className={`h-12 w-12 rounded-2xl shrink-0 flex items-center justify-center ${notif.type === 'ActionRequired' ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-400'
                        }`}>
                        {notif.type === 'ActionRequired' ? <AlertCircle className="h-6 w-6" /> : <Bell className="h-6 w-6" />}
                      </div>
                      <div className="space-y-2 flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-black text-slate-900 text-lg">
                            {(language !== 'ko' && notif.translatedMessage) ? notif.translatedMessage : notif.message}
                          </h4>
                          <span className="text-[10px] font-bold text-slate-300">{new Date(notif.sentAt).toLocaleDateString()}</span>
                        </div>
                        <Badge className="bg-slate-100 text-slate-500 border-none font-bold">{t('실시간 알림')}</Badge>
                      </div>
                    </div>
                  )) : (
                    <div className="p-20 text-center space-y-4">
                      <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                        <Bell className="h-8 w-8 text-slate-200" />
                      </div>
                      <p className="text-slate-400 font-bold text-lg">{t('진행 상황에 따른 실시간 알림을 여기서 확인하실 수 있습니다.')}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="premium-card rounded-[2.5rem] border-none shadow-sm overflow-hidden flex flex-col">
              <CardHeader className="p-8 border-b border-slate-50">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-500" />
                    </div>
                    <CardTitle className="text-xl font-black">{t('문서 보관함')}</CardTitle>
                  </div>
                  {currentApp && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-xl text-primary font-black hover:bg-primary/10"
                      onClick={() => setIsUploadOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-1" /> {t('추가 업로드')}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-8 flex-1">
                <div className="space-y-4">
                  {currentApp && (
                    <div
                      onClick={() => setIsDocumentOpen(true)}
                      className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center border border-slate-200 group-hover:bg-primary/10 transition-colors">
                          <FileText className="h-5 w-5 text-slate-400 group-hover:text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">{t('환급 신청서 (서명본)')}</p>
                          <p className="text-[10px] text-slate-400 font-bold">{t('공식 수임 동의서 • PDF 출력 가능')}</p>
                        </div>
                      </div>
                      <Download className="h-4 w-4 text-slate-300 group-hover:text-primary" />
                    </div>
                  )}

                  {uploadedDocs?.map((doc) => (
                    <div key={doc.id} className="p-6 bg-white rounded-2xl border border-slate-100 flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100">
                          <Files className="h-5 w-5 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 truncate max-w-[150px]">{doc.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-none">{t('제출 완료')}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* 문서 업로드 다이얼로그 */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-primary p-8 text-white">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Upload className="h-6 w-6 text-white" />
                </div>
                <DialogTitle className="text-2xl font-black">{t('증빙 서류 제출')}</DialogTitle>
              </div>
              <DialogDescription className="text-white/80 font-medium">
                {t('급여명세서 등 추가 증빙이 필요한 서류를 제출하세요.')}
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-8 space-y-6">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-[2rem] p-10 text-center bg-slate-50 hover:bg-primary/5 transition-all cursor-pointer group"
            >
              <Upload className="h-10 w-10 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <p className="font-black text-slate-900">{t('클릭하여 파일 선택')}</p>
              <p className="text-xs text-slate-400 font-bold mt-2">{t('PDF, JPG, PNG 파일만 가능')}</p>
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept=".pdf,.jpg,.jpeg,.png" />
            </div>
            {isUploading && (
              <div className="flex items-center justify-center gap-3 text-primary font-black">
                <Loader2 className="animate-spin h-5 w-5" />
                {t('문서를 안전하게 전송 중입니다...')}
              </div>
            )}
            <Button variant="ghost" className="w-full font-bold text-slate-400" onClick={() => setIsUploadOpen(false)}>{t('취소')}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 수임 동의서 공식 문서 뷰어 */}
      <Dialog open={isDocumentOpen} onOpenChange={setIsDocumentOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden border-none rounded-[2.5rem] shadow-2xl">
          <div className="bg-slate-900 p-8 text-white flex justify-between items-center shrink-0 print-hidden">
            <div>
              <DialogTitle className="text-2xl font-black">{t('세무대리 수임 동의서')}</DialogTitle>
              <DialogDescription className="text-slate-400 font-medium">{t('관리자 및 세무서 제출용 공식 문서입니다.')}</DialogDescription>
            </div>
            <div className="flex gap-4">
              <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90 rounded-xl h-12 px-6 font-bold shadow-lg shadow-primary/20 transition-transform active:scale-95">
                <Printer className="mr-2 h-5 w-5" /> {t('PDF로 저장 / 인쇄')}
              </Button>
            </div>
          </div>

          <div className="bg-white p-12 lg:p-20 overflow-y-auto max-h-[75vh] font-serif text-slate-900">
            {/* 공식 문서 레이아웃 */}
            <div ref={printRef} className="space-y-12 border-2 border-slate-100 p-10 lg:p-16 rounded-xl relative">
              <div className="absolute top-10 right-10 opacity-10">
                <Stamp className="h-32 w-32 text-slate-900" />
              </div>

              <div className="text-center space-y-4">
                <h1 className="text-4xl font-black underline underline-offset-8">{t('세무대리 수임 동의서')}</h1>
                <p className="text-sm text-slate-500 font-bold">{t('(중소기업 취업자 소득세 감면 및 경정청구용)')}</p>
              </div>

              <div className="space-y-8 pt-8">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold border-b-2 border-slate-900 pb-2">{t('1. 위임인 (고객) 정보')}</h3>
                  <div className="grid grid-cols-2 gap-y-4 text-lg">
                    <div className="flex border-b border-slate-100 py-2">
                      <span className="w-40 font-black text-slate-500">{t('성 명')}</span>
                      <span className="font-bold">{userProfile?.fullName || user?.displayName || t("정보 없음")}</span>
                    </div>
                    <div className="flex border-b border-slate-100 py-2">
                      <span className="w-40 font-black text-slate-500">{t('외국인등록번호')}</span>
                      <span className="font-bold">{userProfile?.foreignerRegistrationNumber || t("정보 확인 중")}</span>
                    </div>
                    <div className="flex border-b border-slate-100 py-2">
                      <span className="w-40 font-black text-slate-500">{t('연락처')}</span>
                      <span className="font-bold">{userProfile?.phoneNumber || user?.phoneNumber || t("정보 없음")}</span>
                    </div>
                    <div className="flex border-b border-slate-100 py-2">
                      <span className="w-40 font-black text-slate-500">{t('환급 은행')}</span>
                      <span className="font-bold">{t(currentApp?.bankName) || t("미지정")}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold border-b-2 border-slate-900 pb-2">{t('2. 수임인 (세무대리인) 정보')}</h3>
                  <div className="grid grid-cols-2 gap-y-4 text-lg">
                    <div className="flex border-b border-slate-100 py-2">
                      <span className="w-40 font-black text-slate-500">{t('상 호')}</span>
                      <span className="font-bold">{t('(주)이지택스 세무회계')}</span>
                    </div>
                    <div className="flex border-b border-slate-100 py-2">
                      <span className="w-40 font-black text-slate-500">{t('대표 세무사')}</span>
                      <span className="font-bold">{t('김홍일')}</span>
                    </div>
                    <div className="flex border-b border-slate-100 py-2">
                      <span className="w-40 font-black text-slate-500">{t('등록번호')}</span>
                      <span className="font-bold">283-50-22337</span>
                    </div>
                    <div className="flex border-b border-slate-100 py-2">
                      <span className="w-40 font-black text-slate-500">{t('소재지')}</span>
                      <span className="font-bold">{t('서울특별시 강남구 테헤란로 123')}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 pt-6">
                  <h3 className="text-xl font-bold">{t('3. 위임의 내용')}</h3>
                  <p className="text-lg leading-relaxed text-justify text-slate-700">
                    {t("본인(위임인)은 대한민국 「조세특례제한법」 제30조에 따른 '중소기업 취업자에 대한 소득세 감면' 적용 및 이에 따른 과거 납부 세액의 환급(경정청구) 절차를 진행함에 있어, 상기 수임인을 법정 대리인으로 선임합니다. 이에 따라 국세청(Hometax) 데이터 조회, 서류 작성 및 제출, 환급금 수령 계좌 등록 등 일체의 권한을 위임합니다.")}
                  </p>
                </div>

                <div className="pt-20 text-center space-y-10">
                  <p className="text-2xl font-bold">{formatDocumentDate(currentApp?.applicationDate || new Date().toISOString())}</p>

                  <div className="flex flex-col items-center gap-4">
                    <p className="text-xl font-bold">{t('위임인')} : {userProfile?.fullName || user?.displayName} {t('(인/서명)')}</p>
                    {currentApp?.signatureDataUri ? (
                      <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-inner inline-block">
                        <img src={currentApp.signatureDataUri} alt="User Signature" className="h-24 object-contain" />
                      </div>
                    ) : (
                      <div className="h-24 w-60 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-300 font-bold italic">
                        {t('서명 데이터 없음')}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-20 text-center">
                  <h2 className="text-3xl font-black tracking-widest">{t('(주)이지택스 세무회계 귀하')}</h2>
                </div>
              </div>
            </div>
          </div>
          <div className="p-8 border-t border-slate-100 flex justify-end print-hidden">
            <Button variant="outline" className="rounded-xl h-12 px-8 font-black text-slate-900 border-slate-200" onClick={() => setIsDocumentOpen(false)}>{t('닫기')}</Button>
          </div>
        </DialogContent>
      </Dialog>
      <Footer />

      {/* 실시간 관리자 1:1 상담 채팅창 */}
      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent className="max-w-md h-[70vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem]">
          <div className="bg-slate-900 p-8 text-white flex flex-col gap-1">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black flex items-center gap-3">
                <MessageSquare className="h-7 w-7 text-primary" />
                {t('관리자 1:1 상담')}
              </DialogTitle>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest opacity-60">{t('Real-time Support')}</p>
            </DialogHeader>
          </div>
          
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/50 scroll-smooth"
          >
            {chatMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                <MessageSquare className="h-16 w-16" />
                <p className="font-bold">{t('필요한 내용을 남겨주시면 관리자가 확인 후 답변드립니다.')}</p>
              </div>
            ) : (
              chatMessages.map((msg) => (
                <div key={msg.id} className={cn("flex flex-col max-w-[85%]", msg.sender === 'User' ? "ml-auto items-end" : "mr-auto items-start")}>
                  <div className={cn(
                    "relative p-5 rounded-3xl font-bold shadow-sm text-sm", 
                    msg.sender === 'User' ? "bg-primary text-white" : "bg-white text-slate-800 border border-slate-100"
                  )}>
                    {/* 내가 보낸 거라면 내가 쓴 언어대로, 상대방(어드민)이 보낸 거라면 번역본(있으면) 또는 원문 표시 */}
                    {msg.sender === 'User' ? msg.text : (msg.translatedText || msg.text)}
                    
                    {/* 번역 정보 안내 (작게 표시) */}
                    {msg.sender === 'User' && msg.translatedText && (
                        <div className="mt-2 text-[10px] opacity-60 font-medium italic border-t border-white/20 pt-2">
                        Admin see: {msg.translatedText}
                        </div>
                    )}
                    {msg.sender !== 'User' && msg.translatedText && (
                        <div className="mt-2 text-[10px] text-slate-400 font-medium italic border-t border-slate-50 pt-2">
                        {t('원문')}: {msg.text}
                        </div>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-2 font-black px-2">
                    {msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : t("보내는 중...")}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="p-8 bg-white border-t border-slate-100 flex gap-4">
            <input 
              className="flex-1 bg-slate-50 border-none rounded-2xl px-6 h-16 font-bold outline-none focus:ring-2 focus:ring-primary/20 text-slate-900"
              placeholder={t("메시지를 입력하세요...")}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                  handleSendChatMessage();
                }
              }}
            />
            <Button 
                onClick={handleSendChatMessage} 
                className="h-16 w-16 rounded-2xl p-0 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20" 
                disabled={isSendingChat || !chatInput.trim()}
            >
              <Send className="h-6 w-6 text-white" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Floating Chat Button (신청 내역이 있을 때만 노출) */}
      {currentApp && (
        <Button 
          onClick={async () => {
              setIsChatOpen(true);
              // 카드 오픈 시 읽지 않은 카운트 초기화
              if (currentApp.unreadChatCountUser > 0) {
                  await updateDoc(doc(db, 'applications', currentApp.id), {
                      unreadChatCountUser: 0
                  });
              }
          }}
          className="fixed bottom-8 right-8 h-20 w-20 rounded-full bg-slate-900 text-white shadow-2xl hover:scale-110 transition-all z-50 p-0 border-4 border-white group"
        >
          <div className="relative">
            <MessageSquare className={cn("h-10 w-10 text-primary", currentApp.unreadChatCountUser > 0 && "animate-bounce")} />
            {currentApp.unreadChatCountUser > 0 && (
              <span className="absolute -top-4 -right-4 h-7 w-7 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black animate-pulse">
                {currentApp.unreadChatCountUser > 9 ? '9+' : currentApp.unreadChatCountUser}
              </span>
            )}
          </div>
        </Button>
      )}
    </div>
  );
}
