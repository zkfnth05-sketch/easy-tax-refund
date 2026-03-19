"use client";

/** 
 * DESIGN_LOCK: DO NOT ALTER VISUAL LAYOUT, COLORS, OR ANIMATIONS.
 * 이 파일의 모든 디자인 요소 및 관리자 대시보드 로직은 고정되어 있습니다.
 */

import { useState, useMemo, useEffect, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Users as UsersIcon,
  FileText,
  Wallet,
  Trophy,
  ChevronRight,
  ChevronLeft,
  Loader2,
  FileSearch,
  Files,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Clock,
  AlertTriangle,
  LayoutDashboard,
  Download,
  BellRing
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { translateNotification } from "@/ai/flows/notification-translation-flow";
import { MessageSquare, Send, Trash2 } from "lucide-react";
import { translateChatMessage } from "@/ai/flows/chat-translation-flow";
import { useTranslation } from "@/components/LanguageContext";
import { cn } from "@/lib/utils";


import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, doc, updateDoc, addDoc, serverTimestamp, deleteDoc, increment } from "firebase/firestore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

/** 
 * [데이터 격리 컴포넌트]
 * 보안 규칙이 전면 개방되었으므로, 관리자 확인 즉시 데이터를 렌더링합니다.
 */
function AdminDashboardContent({ isAdmin }: { isAdmin: boolean }) {
  const { toast } = useToast();
  const router = useRouter();

  const [reportApp, setReportApp] = useState<any>(null);
  const [isTaxReportOpen, setIsTaxReportOpen] = useState(false);
  const [isDocsViewerOpen, setIsDocsViewerOpen] = useState(false);
  const [isNoteDrawerOpen, setIsNoteDrawerOpen] = useState(false);
  const [noteAppId, setNoteAppId] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [noteType, setNoteType] = useState<'Info' | 'ActionRequired'>('Info');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any>(null);

  // Chat States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatAppId, setChatAppId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isSendingChat, setIsSendingChat] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [isDocsLoading, setIsDocsLoading] = useState(false);
  const [internalMemo, setInternalMemo] = useState("");
  const [docRequestInput, setDocRequestInput] = useState("");
  const [isRequestingDoc, setIsRequestingDoc] = useState(false);
  const [isSavingMemo, setIsSavingMemo] = useState(false);
  const [searchId, setSearchId] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [apps, setApps] = useState<any[]>([]);
  const [appsLoading, setAppsLoading] = useState(true);
  const [todayVisits, setTodayVisits] = useState(0);

  // Firestore 실시간 리스너
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const visitUnsubscribe = onSnapshot(doc(db, 'daily_stats', todayStr), (doc) => {
      if (doc.exists()) setTodayVisits(doc.data().visitCount || 0);
    });

    console.log("Requesting Applications Snapshot...");
    const q = query(collection(db, 'applications'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log("Snapshot Received! Count:", snapshot.size);
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setApps(data);
      setAppsLoading(false);
    }, (error) => {
      console.error('Firestore 오류:', error);
      setAppsLoading(false);
    });
    return () => {
      unsubscribe();
      visitUnsubscribe();
    };
  }, []);

  const filteredApps = useMemo(() => {
    let result = apps;
    if (searchId.trim()) {
      const low = searchId.toLowerCase();
      result = result.filter(app => (app.id || "").toLowerCase().includes(low));
    }
    if (searchName.trim()) {
      const low = searchName.toLowerCase();
      result = result.filter(app => (app.fullName || "").toLowerCase().includes(low));
    }
    if (searchPhone.trim()) {
      const low = searchPhone.toLowerCase();
      result = result.filter(app => (app.phoneNo || "").includes(low));
    }
    return result;
  }, [apps, searchId, searchName, searchPhone]);

  // Pagination Logic
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchId, searchName, searchPhone]);

  const paginatedApps = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredApps.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredApps, currentPage]);

  const totalPages = Math.ceil(filteredApps.length / itemsPerPage);

  // Chat Real-time Listener
  useEffect(() => {
    if (!chatAppId || !isChatOpen) {
      setChatMessages([]);
      return;
    }
    
    // 유저 전환 시 이전 메시지 즉시 비우기
    setChatMessages([]);
    
    const chatQuery = query(
      collection(db, 'applications', chatAppId, 'chat_messages'),
      orderBy('timestamp', 'asc')
    );
    
    const unsubscribe = onSnapshot(chatQuery, (snapshot) => {
      const msgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setChatMessages(msgs);
    }, (error) => {
      console.error('채팅 Firestore 오류:', error);
    });
    
    return () => unsubscribe();
  }, [chatAppId, isChatOpen]);

  // 자동 스크롤
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const users: any[] = [];
  const usersError = null;
  const appsError = null;

  const stats = useMemo(() => {
    if (!users || !apps) return [];
    const today = new Date().toISOString().split('T')[0];
    
    // Safely extract string representation of dates
    const safeDateString = (dateVal: any) => {
      if (!dateVal) return "";
      if (typeof dateVal === 'string') return dateVal;
      if (dateVal.toDate && typeof dateVal.toDate === 'function') {
        const d = dateVal.toDate();
        // Return local YYYY-MM-DD instead of strict UTC ISO string
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      }
      if (dateVal instanceof Date) {
        return `${dateVal.getFullYear()}-${String(dateVal.getMonth() + 1).padStart(2, '0')}-${String(dateVal.getDate()).padStart(2, '0')}`;
      }
      return String(dateVal);
    };

    const todayUsers = users.filter(u => safeDateString(u.createdAt).startsWith(today)).length;
    const todayApps = apps.filter(a => safeDateString(a.createdAt).startsWith(today)).length;
    
    // Revenue calculations
    const totalEstimatedRefund = apps.reduce((acc, app) => acc + (app.estimatedRefundAmount || 0), 0);
    const expectedRevenue = Math.floor(totalEstimatedRefund * 0.2); // 20% fee
    
    // Revenue based on manual payment confirmation
    const completedAppsList = apps.filter(a => a.status === 'RefundCompleted');
    const completedApps = completedAppsList.length;
    
    const paidAppsList = apps.filter(a => a.paymentStatus === 'paid');
    const paidRevenue = paidAppsList.reduce((acc, app) => acc + Math.floor((app.estimatedRefundAmount || 0) * 0.2), 0);
    
    // Unpaid revenue is expected revenue minus already paid revenue
    const unpaidRevenue = expectedRevenue - paidRevenue;
    
    // Settlement: Partner gets flat 50,000 KRW per paid case
    const settlementTaxAccountant = paidAppsList.length * 50000;
    const settlementCompany = paidRevenue - settlementTaxAccountant;

    const successRate = apps.length > 0 ? ((completedApps / apps.length) * 100).toFixed(1) : "0.0";

    return [
      { label: "오늘 방문자", value: `${todayVisits}명`, icon: <RotateCcw className="h-5 w-5" /> },
      { label: "오늘 가입자", value: `${todayUsers}명`, icon: <UsersIcon className="h-5 w-5" /> },
      { label: "오늘 신청 수", value: `${todayApps}명`, icon: <FileText className="h-5 w-5" /> },
      { label: "누적 예상 수수료", value: `₩ ${expectedRevenue.toLocaleString()}`, icon: <Wallet className="h-5 w-5" /> },
      { label: "결제 완료 수익", value: `₩ ${paidRevenue.toLocaleString()}`, icon: <ShieldCheck className="h-5 w-5 text-green-500" /> },
      { label: "미결제 예정액", value: `₩ ${unpaidRevenue > 0 ? unpaidRevenue.toLocaleString() : 0}`, icon: <Clock className="h-5 w-5 text-amber-500" /> },
      { label: "당사 순수익 (정산)", value: `₩ ${settlementCompany.toLocaleString()}`, icon: <Wallet className="h-5 w-5 text-indigo-500" /> },
      { label: "파트너 정산 (건당 5만)", value: `₩ ${settlementTaxAccountant.toLocaleString()}`, icon: <Wallet className="h-5 w-5 text-slate-500" /> },
      { label: "환급 성공률", value: `${successRate}%`, icon: <Trophy className="h-5 w-5" /> },
    ];
  }, [users, apps, todayVisits]);

  const marketingStats = useMemo(() => {
    if (!users || !apps) return { byNationality: [], byVisaType: [], byUtm: [], funnel: {} };

    // Grouping variables
    const byNat: Record<string, { total: number, success: number, refundValue: number }> = {};
    const byVisa: Record<string, { total: number, success: number, refundValue: number }> = {};
    const byUtm: Record<string, { total: number, paid: number, revenue: number }> = {};
    
    // Funnel counts (assuming 8 steps in total for Estimate process)
    const funnel: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 };

    users.forEach(u => {
      const nat = u.nationality || '미입력(Unknown)';
      const visa = u.visaType || '미입력(Unknown)';
      
      const userApps = apps.filter(a => a.clientId === u.id);
      const isSuccess = userApps.some(a => a.status === 'RefundCompleted');
      const isPaid = userApps.some(a => a.paymentStatus === 'paid');
      const refundVal = userApps.reduce((acc, a) => acc + (a.estimatedRefundAmount || 0), 0);

      if (!byNat[nat]) byNat[nat] = { total: 0, success: 0, refundValue: 0 };
      byNat[nat].total++;
      if (isSuccess) byNat[nat].success++;
      byNat[nat].refundValue += refundVal;

      if (!byVisa[visa]) byVisa[visa] = { total: 0, success: 0, refundValue: 0 };
      byVisa[visa].total++;
      if (isSuccess) byVisa[visa].success++;
      byVisa[visa].refundValue += refundVal;
    });

    apps.forEach(app => {
      // UTM Tracking
      const source = app.utmSource || '기타/직접유입 (Direct)';
      if (!byUtm[source]) byUtm[source] = { total: 0, paid: 0, revenue: 0 };
      byUtm[source].total++;
      if (app.paymentStatus === 'paid') {
        byUtm[source].paid++;
        byUtm[source].revenue += Math.floor((app.estimatedRefundAmount || 0) * 0.2);
      }

      // Funnel Tracking
      const maxStep = app.lastStep || 1;
      for (let i = 1; i <= maxStep; i++) {
        funnel[i]++;
      }
    });

    return {
      byNationality: Object.entries(byNat)
        .sort((a, b) => b[1].total - a[1].total)
        .map(([name, data]) => ({ name, ...data })),
      byVisaType: Object.entries(byVisa)
        .sort((a, b) => b[1].total - a[1].total)
        .map(([name, data]) => ({ name, ...data })),
      byUtm: Object.entries(byUtm)
        .sort((a, b) => b[1].total - a[1].total)
        .map(([name, data]) => ({ name, ...data })),
      funnel
    };
  }, [users, apps]);

  const statusFlow = ['InquiryCompleted', 'Applying', 'AdditionalDocsNeeded', 'TaxAccountantReceiving', 'TaxOfficeReviewing', 'NTSDocumentReceipt', 'NTSReviewing', 'RefundCompleted'];

  const handleStatusChange = async (app: any, direction: 1 | -1 = 1) => {
    const currentIdx = statusFlow.indexOf(app.status);
    let nextIdx = currentIdx + direction;
    nextIdx = Math.max(0, Math.min(nextIdx, statusFlow.length - 1));
    const nextStatus = statusFlow[nextIdx];
    
    if (nextStatus === app.status) {
      toast({ title: direction === 1 ? "이미 최종 단계입니다." : "이미 첫 단계입니다." });
      return;
    }
    try {
      await updateDoc(doc(db, 'applications', app.id), { status: nextStatus });
      toast({ title: "상태 업데이트 완료", description: `→ ${nextStatus}` });
    } catch (error) {
      toast({ variant: "destructive", title: "업데이트 실패" });
    }
  };

  const handleSendNotification = async () => {
    if (!noteAppId || !adminNote.trim() || isTranslating) return;
    
    setIsTranslating(true);
    try {
      const appRef = doc(db, 'applications', noteAppId);
      const appDoc = apps.find(a => a.id === noteAppId);
      const userLanguage = appDoc?.userLanguage || 'ko';
      const existingNotifs = appDoc?.notifications || [];
      
      let translatedMessage = null;
      if (userLanguage !== 'ko') {
        try {
          const res = await translateNotification({ message: adminNote, targetLanguage: userLanguage });
          translatedMessage = res.translatedMessage;
        } catch (err) {
          console.error("번역 실패:", err);
        }
      }

      const newNotif = {
        id: Date.now().toString(),
        message: adminNote,
        translatedMessage,
        type: noteType,
        sentAt: new Date().toISOString()
      };
      
      await updateDoc(appRef, {
        notifications: [newNotif, ...existingNotifs],
        status: noteType === 'ActionRequired' ? 'AdditionalDocsNeeded' : appDoc.status,
        unreadNotificationCountUser: increment(1)
      });
      
      toast({ title: "알림 전송 성공", description: translatedMessage ? `${userLanguage} 번역과 함께 전송되었습니다.` : "사용자에게 즉시 전달되었습니다." });
      setAdminNote("");
      setIsNoteDrawerOpen(false);
    } catch (error) {
      toast({ variant: "destructive", title: "전송 실패" });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSendChatMessage = async () => {
    if (!chatAppId || !chatInput.trim() || isSendingChat) return;
    
    setIsSendingChat(true);
    const messageToSend = chatInput;
    setChatInput(""); // Clear immediately for UX

    try {
      const appDoc = apps.find(a => a.id === chatAppId);
      const userLanguage = appDoc?.userLanguage || 'ko';
      
      let translatedText = null;
      if (userLanguage !== 'ko') {
        try {
          const res = await translateChatMessage({ 
            message: messageToSend, 
            sourceLanguage: 'ko', 
            targetLanguage: userLanguage 
          });
          translatedText = res.translatedMessage;
        } catch (err) {
          console.error("채팅 번역 실패:", err);
        }
      }

      await addDoc(collection(db, 'applications', chatAppId, 'chat_messages'), {
        sender: 'Admin',
        text: messageToSend,
        translatedText,
        timestamp: serverTimestamp()
      });
      
      // 사용자용 읽지 않은 메시지 카운트 증가
      await updateDoc(doc(db, 'applications', chatAppId), {
        unreadChatCountUser: increment(1)
      });
    } catch (error) {
      toast({ variant: "destructive", title: "발송 실패", description: "메시지를 보내지 못했습니다." });
      setChatInput(messageToSend); // Restore if failed
    } finally {
      setIsSendingChat(false);
    }
  };

  const handlePaymentToggle = async (app: any) => {
    const isCurrentlyPaid = app.paymentStatus === 'paid';
    const newStatus = isCurrentlyPaid ? 'pending' : 'paid';
    
    try {
      await updateDoc(doc(db, 'applications', app.id), { paymentStatus: newStatus });
      toast({ 
        title: "입금 상태 변경", 
        description: newStatus === 'paid' ? "✅ 결제 완료 처리됨" : "⏳ 미확인(미납) 처리됨" 
      });
    } catch (error) {
      toast({ variant: "destructive", title: "입금 상태 업데이트 실패" });
    }
  };

  const handleDeleteApplicant = async (appId: string) => {
    if (!window.confirm("🚨 경고: 이 신청자를 정말로 삭제하시겠습니까?\n모든 신청 내역이 영구적으로 제거되며 되돌릴 수 없습니다.")) return;
    
    try {
      await deleteDoc(doc(db, 'applications', appId));
      toast({ title: "삭제 완료", description: "신청자 데이터가 시스템에서 영구적으로 제거되었습니다." });
      setIsDetailOpen(false);
      setSelectedApp(null);
    } catch (error) {
      console.error("삭제 오류:", error);
      toast({ variant: "destructive", title: "삭제 실패", description: "권한이 없거나 서버 오류가 발생했습니다." });
    }
  };

  const handleSaveMemo = async () => {
    if (!selectedApp) return;
    setIsSavingMemo(true);
    try {
      await updateDoc(doc(db, 'applications', selectedApp.id), {
        internalMemo: internalMemo
      });
      toast({ title: "메모 저장 완료", description: "내부 전용 메모가 성공적으로 업데이트되었습니다." });
    } catch (error) {
      console.error("메모 저장 실패:", error);
      toast({ variant: "destructive", title: "메모 저장 실패", description: "서버 통신 오류가 발생했습니다." });
    } finally {
      setIsSavingMemo(false);
    }
  };

  const handleRequestDoc = async () => {
    if (!selectedApp || !docRequestInput.trim()) return;
    setIsRequestingDoc(true);
    try {
      let translatedName = null;
      // 사용자가 선택한 언어가 한국어가 아니면 자동 번역
      if (selectedApp.userLanguage && selectedApp.userLanguage !== 'ko') {
        try {
          const res = await translateChatMessage({
            message: docRequestInput,
            sourceLanguage: 'ko',
            targetLanguage: selectedApp.userLanguage
          });
          translatedName = res.translatedMessage;
        } catch (err) {
          console.error("서류명 번역 실패:", err);
        }
      }

      const newRequest = {
        id: `REQ-${Date.now()}`,
        name: docRequestInput,
        translatedName,
        status: 'pending',
        requestedAt: new Date().toISOString()
      };
      
      const currentRequests = selectedApp.pendingDocRequests || [];
      await updateDoc(doc(db, 'applications', selectedApp.id), {
        pendingDocRequests: [...currentRequests, newRequest],
        status: 'AdditionalDocsNeeded'
      });
      
      setDocRequestInput("");
      const successMsg = translatedName ? `'${docRequestInput}' (${translatedName}) 보완 요청이 전달되었습니다.` : `'${docRequestInput}' 보완 요청이 전달되었습니다.`;
      toast({ title: "서류 요청 완료", description: successMsg });
    } catch (error) {
      console.error("서류 요청 실패:", error);
      toast({ variant: "destructive", title: "요청 실패", description: "서버 통신 오류가 발생했습니다." });
    } finally {
      setIsRequestingDoc(false);
    }
  };

  const handleRemoveDocRequest = async (requestId: string) => {
    if (!selectedApp || !window.confirm("이 서류 요청을 취소하시겠습니까?")) return;
    try {
      const updatedRequests = (selectedApp.pendingDocRequests || []).filter((r: any) => r.id !== requestId);
      await updateDoc(doc(db, 'applications', selectedApp.id), {
        pendingDocRequests: updatedRequests
      });
    } catch (error) {
      toast({ variant: "destructive", title: "취소 실패" });
    }
  };

  const openAppDetail = (app: any) => {
    setSelectedApp(app);
    setInternalMemo(app.internalMemo || "");
    setIsDetailOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RefundCompleted': return { label: '환급 완료', class: 'bg-green-100 text-green-700' };
      case 'NTSReviewing': return { label: '국세청 검토중', class: 'bg-indigo-100 text-indigo-700' };
      case 'NTSDocumentReceipt': return { label: '국세청 서류접수', class: 'bg-blue-100 text-blue-700' };
      case 'TaxOfficeReviewing': return { label: '세무서 검토 중', class: 'bg-amber-100 text-amber-700' };
      case 'Applying': return { label: '신청 중', class: 'bg-primary/10 text-primary' };
      case 'AdditionalDocsNeeded': return { label: '서류 보완 필요', class: 'bg-red-100 text-red-600 font-black' };
      default: return { label: '조회 완료', class: 'bg-slate-100 text-slate-500' };
    }
  };

  const handleExportCsv = () => {
    if (!apps.length) {
      toast({ variant: "destructive", title: "추출할 자료가 없습니다." });
      return;
    }
    
    const headers = ["신청ID", "성명", "사업자명", "사업자번호", "근무연도", "결정세액", "지급처", "지급계좌", "상태", "휴대폰번호", "신청일"];
    
    const rows = apps.map(app => [
      app.id,
      app.fullName || "N/A",
      app.companyName || "N/A",
      app.resCompanyIdentityNo1 || "N/A",
      app.resAttrYear || "N/A",
      app.estimatedRefundAmount || 0,
      app.bankName || "N/A",
      app.bankAccount || "N/A",
      app.status || "InquiryCompleted",
      app.phoneNo || "N/A",
      app.createdAt?.toDate ? app.createdAt.toDate().toLocaleString('ko-KR') : String(app.createdAt || "")
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.map(v => {
        const val = String(v).replace(/"/g, '""');
        return `"${val}"`;
      }).join(","))
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `이지텍스_추출자료_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({ title: "자료 추출 성공", description: "세무사 제출용 CSV 자료가 다운로드되었습니다." });
  };

  if (usersError || appsError) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive" className="rounded-[2.5rem] p-8 border-red-200 bg-red-50">
          <AlertTriangle className="h-8 w-8 text-red-500" />
          <div className="ml-4">
            <AlertTitle className="text-xl font-black text-red-900 mb-2">서버 보안 규칙 동기화 지연</AlertTitle>
            <AlertDescription className="text-red-700 font-bold leading-relaxed">
              보안 규칙을 "전면 개방"으로 수정했습니다. 하지만 Firebase 서버가 이 변경사항을 전 세계 노드에 뿌리는 데 1분 정도 소요될 수 있습니다.<br /><br />
              현재 서버가 아직 이전 규칙(거절)을 들고 있습니다. <span className="underline font-black">딱 1분만 기다리신 후 브라우저를 새로고침(F5) 해주세요.</span>
            </AlertDescription>
          </div>
        </Alert>
        <Button onClick={() => window.location.reload()} className="w-full h-16 bg-slate-900 rounded-2xl font-black text-lg">
          <RefreshCw className="mr-2 h-5 w-5 animate-spin" /> 시스템 강제 새로고침
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-primary/10 text-primary border-none font-black">ADMIN LIVE CONTROL</Badge>
          </div>
          <h1 className="text-3xl font-black font-headline text-slate-900">대표님 대시보드</h1>
        </div>
        <div className="flex flex-wrap lg:justify-end gap-2">
          <Button onClick={handleExportCsv} variant="default" className="h-12 rounded-xl font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-md">
            <Download className="h-4 w-4" /> CSV 추출
          </Button>
          <Button onClick={() => router.push('/admin/stats')} variant="outline" className="h-12 rounded-xl font-bold gap-2 text-indigo-600 border-indigo-100 hover:bg-indigo-50">
            📊 통계
          </Button>
          <Button onClick={() => {
            setSearchId("");
            setSearchName("");
            setSearchPhone("");
            window.location.reload();
          }} variant="outline" className="h-12 w-12 rounded-xl font-bold">
            <RefreshCw className={cn("h-4 w-4", appsLoading && "animate-spin")} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="premium-card rounded-2xl sm:rounded-3xl border-none shadow-sm bg-white overflow-hidden transition-all hover:-translate-y-1 hover:shadow-md">
            <CardContent className="p-6 sm:p-8 space-y-3 sm:space-y-4">
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-slate-50 rounded-xl sm:rounded-2xl flex items-center justify-center text-primary">{stat.icon}</div>
              <div className="space-y-1">
                <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">{stat.value}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Search & Filter Bar - Directly above the table */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 mb-[-1.5rem] relative z-10 transition-all hover:shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative group">
            <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="고객번호 (ID) 검색" 
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-4 h-14 font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
            />
          </div>
          <div className="relative group">
            <UsersIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="고객 이름 검색" 
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-4 h-14 font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
          </div>
          <div className="relative group">
            <BellRing className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="연락처 검색" 
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-4 h-14 font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all"
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Card className="premium-card rounded-[2.5rem] border-none overflow-hidden bg-white shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="font-bold pl-8 py-5">신청번호 / 고객</TableHead>
                <TableHead className="font-bold">예상 환급액</TableHead>
                <TableHead className="font-bold">진행 단계</TableHead>
                <TableHead className="font-bold text-center">입금 확인</TableHead>
                <TableHead className="font-bold text-indigo-600">리포트</TableHead>
                <TableHead className="font-bold text-emerald-600">문서</TableHead>
                <TableHead className="font-bold pr-8 text-right">상태 제어</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedApps?.map((app) => {
                const statusBadge = getStatusBadge(app.status);
                const user = users?.find(u => u.id === app.clientId);
                return (
                  <TableRow key={app.id} className="hover:bg-slate-50 border-b border-slate-50 transition-colors">
                    <TableCell 
                      className="pl-8 py-5 cursor-pointer hover:bg-slate-100/50 transition-all group"
                      onClick={() => openAppDetail(app)}
                    >
                      <div className="font-black text-slate-900 group-hover:text-primary flex items-center gap-2 transition-colors">
                        {app.id.substring(0, 8)}...
                        <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0" />
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="text-xs text-slate-400 font-bold">{app.fullName || "이름 없음"}</div>
                        {app.userLanguage && (
                          <Badge variant="outline" className="text-[9px] px-1 h-4 border-slate-200 text-slate-400 font-bold bg-slate-50 uppercase">
                            {app.userLanguage}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-black">₩ {app.estimatedRefundAmount?.toLocaleString()}</TableCell>
                    <TableCell><Badge className={`rounded-lg font-bold ${statusBadge.class}`}>{statusBadge.label}</Badge></TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant={app.paymentStatus === 'paid' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePaymentToggle(app)}
                        className={`rounded-xl font-bold ${app.paymentStatus === 'paid' ? 'bg-green-500 hover:bg-green-600 text-white border-none' : 'text-slate-500 border-slate-200'}`}
                      >
                        {app. paymentStatus === 'paid' ? '결제 완료' : '미확인'}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" className="rounded-xl font-black text-indigo-600 bg-indigo-50 border-indigo-100" onClick={() => { setReportApp(app); setIsTaxReportOpen(true); }}>
                        <FileSearch className="h-4 w-4 mr-2" /> 자료
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" className="rounded-xl font-black text-emerald-600 bg-emerald-50 border-emerald-100" onClick={async () => {
                        setIsDocsLoading(true);
                        try {
                          setIsDocsViewerOpen(true);
                        } finally { setIsDocsLoading(false); }
                      }}>
                        <Files className="h-4 w-4 mr-2" /> 확인
                      </Button>
                    </TableCell>
                    <TableCell className="pr-8 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-xl text-amber-500 hover:bg-amber-50"
                          onClick={() => {
                            setNoteAppId(app.id);
                            setIsNoteDrawerOpen(true);
                          }}
                        >
                          <BellRing className="h-4 w-4 mr-1" /> 알림
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-xl text-indigo-500 hover:bg-indigo-50 relative group"
                          onClick={async () => {
                            setChatAppId(app.id);
                            setIsChatOpen(true);
                            // 관리자 카운트 초기화
                            if (app.unreadChatCountAdmin > 0) {
                              await updateDoc(doc(db, 'applications', app.id), {
                                unreadChatCountAdmin: 0
                              });
                            }
                          }}
                        >
                          <MessageSquare className={cn("h-4 w-4 mr-1", app.unreadChatCountAdmin > 0 && "animate-bounce")} />
                          상담
                          {app.unreadChatCountAdmin > 0 && (
                            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black text-white animate-pulse">
                              {app.unreadChatCountAdmin > 9 ? '9+' : app.unreadChatCountAdmin}
                            </span>
                          )}
                        </Button>
                        <Button variant="ghost" size="sm" className="rounded-xl font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100" onClick={() => handleStatusChange(app, -1)}>
                          <ChevronLeft className="h-4 w-4 mr-1" /> 이전
                        </Button>
                        <Button variant="outline" size="sm" className="rounded-xl font-black" onClick={() => handleStatusChange(app, 1)}>
                          다음 단계 <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 py-8 border-t border-slate-50 bg-white/50">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl font-bold h-10 px-4"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> 이전
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Only show 5 pages around current page if there are many pages
                  const shouldShow = totalPages <= 7 || 
                                    Math.abs(page - currentPage) <= 2 || 
                                    page === 1 || 
                                    page === totalPages;
                  
                  if (!shouldShow) {
                    if (page === 2 || page === totalPages - 1) {
                      return <span key={page} className="text-slate-300 px-1">...</span>;
                    }
                    return null;
                  }

                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "rounded-xl font-bold w-10 h-10 transition-all",
                        currentPage === page 
                          ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110" 
                          : "text-slate-500 hover:text-primary hover:border-primary/30"
                      )}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="rounded-xl font-bold h-10 px-4"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                다음 <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Applicant Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          {selectedApp && (
            <div className="flex flex-col h-full max-h-[90vh]">
              <div className="bg-slate-900 p-8 text-white relative">
                <DialogHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className="bg-primary hover:bg-primary border-none text-white font-black text-[10px]">APPLICANT DOSSIER</Badge>
                    <span className="text-slate-400 font-bold text-[10px] tracking-widest uppercase">{selectedApp.id}</span>
                  </div>
                  <DialogTitle className="text-3xl font-black">{selectedApp.fullName || "성명 미입력"}</DialogTitle>
                </DialogHeader>

                <button 
                  onClick={() => handleDeleteApplicant(selectedApp.id)}
                  className="absolute top-8 right-8 p-3 rounded-2xl text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-all group/del"
                  title="신청자 삭제"
                >
                  <Trash2 className="h-6 w-6 group-active/del:scale-90 transition-transform" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto bg-white space-y-8">
                {/* Status Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">진행 단계</p>
                    <Badge className={cn("rounded-lg font-bold", getStatusBadge(selectedApp.status).class)}>
                      {getStatusBadge(selectedApp.status).label}
                    </Badge>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">입금 상태</p>
                    <Badge className={cn("rounded-lg font-bold", selectedApp.paymentStatus === 'paid' ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700")}>
                      {selectedApp.paymentStatus === 'paid' ? "결제 완료" : "미확인 (보류)"}
                    </Badge>
                  </div>
                </div>

                {/* Personal & Basic Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <UsersIcon className="h-4 w-4 text-primary" /> 기본 인적 사항
                  </h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4 p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                    {[
                      { label: "휴대폰 번호", value: selectedApp.phoneNo || "미입력" },
                      { label: "사용 언어", value: selectedApp.userLanguage?.toUpperCase() || "한국어" },
                      { label: "신청 일시", value: selectedApp.createdAt?.toDate ? selectedApp.createdAt.toDate().toLocaleString('ko-KR') : String(selectedApp.createdAt || "N/A") },
                      { label: "신청 채널 (UTM)", value: selectedApp.utmSource || "Direct / 기타" },
                    ].map((item, i) => (
                      <div key={i} className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{item.label}</p>
                        <p className="font-bold text-slate-900">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Business Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <FileSearch className="h-4 w-4 text-indigo-500" /> 세무/사업자 정보
                  </h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4 p-6 bg-indigo-50/30 rounded-3xl border border-indigo-100/50">
                    {[
                      { label: "사업자명 (회사)", value: selectedApp.companyName || "미입력" },
                      { label: "사업자 등록번호", value: selectedApp.resCompanyIdentityNo1 || "미입력" },
                      { label: "근무 연도 (귀속)", value: `${selectedApp.resAttrYear}년` || "미입력" },
                      { label: "결정 세액", value: `₩ ${(selectedApp.resIncomeTax ?? 0).toLocaleString()}` },
                    ].map((item, i) => (
                      <div key={i} className="space-y-1">
                        <p className="text-[10px] font-bold text-indigo-400 uppercase">{item.label}</p>
                        <p className="font-bold text-slate-900">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bank / Payment Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-emerald-500" /> 환급금 수령 계좌
                  </h3>
                  <div className="p-6 bg-emerald-50/30 rounded-3xl border border-emerald-100/50 flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-emerald-400 uppercase">지급 은행 / 계좌번호</p>
                      <p className="text-xl font-black text-slate-900">{selectedApp.bankName || "미정"} | {selectedApp.bankAccount || "계좌정보 없음"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-emerald-400 uppercase">예상 환급액 (90% 적용)</p>
                      <p className="text-2xl font-black text-emerald-600">₩ {(selectedApp.estimatedRefundAmount ?? 0).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Internal Admin Memo */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-indigo-500" /> 관리자 내부 메모
                  </h3>
                  <div className="space-y-3">
                    <textarea 
                      value={internalMemo}
                      onChange={(e) => setInternalMemo(e.target.value)}
                      placeholder="신청자에 대한 특이사항이나 진행 메모를 입력하세요 (사용자에게 보이지 않음)"
                      className="w-full h-32 p-4 rounded-2xl border border-slate-200 bg-white font-medium text-slate-700 placeholder:text-slate-300 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none resize-none text-sm"
                    />
                    <Button 
                      onClick={handleSaveMemo}
                      disabled={isSavingMemo}
                      className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-md gap-2"
                    >
                      {isSavingMemo ? <Loader2 className="animate-spin h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                      메모 저장하기
                    </Button>
                  </div>
                </div>

                {/* Specific Document Request Section */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Files className="h-4 w-4 text-amber-500" /> 서류 보완 요청 (사용자 노출)
                  </h3>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        value={docRequestInput}
                        onChange={(e) => setDocRequestInput(e.target.value)}
                        placeholder="예: 2023년 성적증명서, 주민등록초본 등"
                        className="flex-1 h-12 px-4 rounded-xl border border-slate-200 bg-white font-medium text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                      <Button 
                        onClick={handleRequestDoc}
                        disabled={isRequestingDoc || !docRequestInput.trim()}
                        className="h-12 px-6 bg-slate-900 text-white font-bold rounded-xl whitespace-nowrap"
                      >
                        {isRequestingDoc ? <Loader2 className="animate-spin h-4 w-4" /> : "요청"}
                      </Button>
                    </div>

                    {selectedApp.pendingDocRequests && selectedApp.pendingDocRequests.length > 0 && (
                      <div className="space-y-2">
                        {selectedApp.pendingDocRequests.map((req: any) => (
                          <div key={req.id} className="flex items-center justify-between p-3 bg-amber-50/50 border border-amber-100/50 rounded-xl">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={cn("text-[8px] h-5", req.status === 'completed' ? "bg-green-100 text-green-600 border-none" : "bg-amber-100 text-amber-600 border-none")}>
                                {req.status === 'completed' ? "완료" : "대기중"}
                              </Badge>
                              <span className="text-xs font-bold text-slate-700">{req.name}</span>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => handleRemoveDocRequest(req.id)} className="h-8 w-8 p-0 text-slate-400 hover:text-red-500">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <Button variant="outline" className="flex-1 h-14 rounded-2xl font-bold border-slate-200" onClick={() => setIsDetailOpen(false)}>닫기</Button>
                  <Button 
                    className="flex-1 h-14 rounded-2xl font-black bg-indigo-600 hover:bg-indigo-700 text-white"
                    onClick={() => {
                        setIsDetailOpen(false);
                        setReportApp(selectedApp);
                        setIsTaxReportOpen(true);
                    }}
                  >
                    정밀 리포트 보기
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isTaxReportOpen} onOpenChange={setIsTaxReportOpen}>
        <DialogContent className="max-w-3xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          {reportApp && (
            <>
              <div className="bg-indigo-600 p-8 text-white">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black">세무사 제출용 정밀 리포트</DialogTitle>
                </DialogHeader>
              </div>
              <div className="p-8 space-y-6 bg-white">
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">결정세액</p>
                    <p className="text-2xl font-black text-indigo-600">₩ {(reportApp.resIncomeTax ?? 0).toLocaleString()}</p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">사업자번호</p>
                    <p className="text-2xl font-black text-slate-900">{reportApp.resCompanyIdentityNo1 || "N/A"}</p>
                  </div>
                </div>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">근무 기간</p>
                  <p className="text-lg font-black text-slate-900">{reportApp.resAttrYear || "N/A"}</p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isDocsViewerOpen} onOpenChange={setIsDocsViewerOpen}>
        <DialogContent className="max-w-xl rounded-[2.5rem] p-8 border-none shadow-2xl">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-black">증빙 서류 확인</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 text-center py-10">
            <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Files className="h-10 w-10 text-slate-400" />
            </div>
            <p className="text-slate-500 font-bold">
              현재 해당 기능(서류 이미지 뷰어)은 세무 보안 서버와 동기화 중입니다.<br />
              급한 확인이 필요하실 경우 DB 관리자에게 문의하세요.
            </p>
            <Button onClick={() => setIsDocsViewerOpen(false)} className="rounded-xl px-10">닫기</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isNoteDrawerOpen} onOpenChange={setIsNoteDrawerOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-8 border-none shadow-2xl">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-black">사용자 알림 및 서류 보완 요청</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">메시지 내용</p>
              <textarea 
                className="w-full h-32 p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-primary outline-none text-slate-900 font-medium"
                placeholder="예: 신분증 사진이 흔들렸습니다. 다시 업로드해 주세요."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
              />
            </div>
            <div className="flex gap-4 p-2 bg-slate-100 rounded-2xl">
              <button 
                onClick={() => setNoteType('Info')}
                className={`flex-1 rounded-xl py-3 font-bold transition-all ${noteType === 'Info' ? 'bg-white text-slate-900 shadow-sm' : 'bg-transparent text-slate-400 hover:text-slate-600'}`}>
                일반 안내
              </button>
              <button 
                onClick={() => setNoteType('ActionRequired')}
                className={`flex-1 rounded-xl py-3 font-bold transition-all ${noteType === 'ActionRequired' ? 'bg-red-500 text-white shadow-lg shadow-red-200' : 'bg-transparent text-slate-400 hover:text-red-500'}`}>
                서류 보완 요청
              </button>
            </div>
            <div className="pt-4 flex gap-3">
              <Button variant="ghost" className="flex-1 rounded-xl font-bold" onClick={() => setIsNoteDrawerOpen(false)} disabled={isTranslating}>취소</Button>
              <Button className="flex-[2] rounded-xl font-black bg-slate-900 text-white" onClick={handleSendNotification} disabled={isTranslating}>
                {isTranslating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> 자동 번역 중...</> : "메시지 전송하기"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent className="max-w-xl h-[80vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem]">
          <div className="bg-slate-900 p-8 text-white flex flex-col gap-1">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black flex items-center gap-3">
                <MessageSquare className="h-7 w-7 text-primary" />
                관리자 1:1 상담
              </DialogTitle>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest opacity-60">ADMIN LIVE LINE</p>
            </DialogHeader>
          </div>
          
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/50 scroll-smooth"
          >
            {chatMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                <MessageSquare className="h-16 w-16" />
                <p className="font-bold">메시지를 보내 상담을 시작하세요.</p>
              </div>
            ) : (
              chatMessages.map((msg) => (
                <div key={msg.id} className={cn("flex flex-col max-w-[85%]", msg.sender === 'Admin' ? "ml-auto items-end" : "mr-auto items-start")}>
                  <div className={cn(
                    "relative p-5 rounded-3xl font-bold shadow-sm text-sm lg:text-base", 
                    msg.sender === 'Admin' ? "bg-primary text-white" : "bg-white text-slate-800 border border-slate-100"
                  )}>
                    {msg.sender === 'Admin' ? msg.text : (msg.translatedText || msg.text)}
                    {msg.sender === 'Admin' && msg.translatedText && (
                      <div className="mt-2 text-[10px] opacity-60 font-medium italic border-t border-white/20 pt-2">
                        Translation: {msg.translatedText}
                      </div>
                    )}
                    {msg.sender !== 'Admin' && msg.translatedText && (
                      <div className="mt-2 text-[10px] text-slate-400 font-medium italic border-t border-slate-50 pt-2">
                        Original: {msg.text}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-2 font-black px-2">
                    {msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "보내는 중..."}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="p-8 bg-white border-t border-slate-100 flex flex-col gap-3">
            {isSendingChat && (
              <div className="flex items-center gap-2 text-[10px] font-bold text-primary animate-pulse px-2">
                <Loader2 className="h-3 w-3 animate-spin" /> AI가 상대방의 언어로 전문 번역 중...
              </div>
            )}
            <div className="flex gap-4">
              <input 
                className="flex-1 bg-slate-50 border-none rounded-2xl px-6 h-16 font-bold outline-none focus:ring-2 focus:ring-primary/20 text-slate-900"
                placeholder="답변을 입력하세요... (한국어로 입력 시 자동 번역)"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                    handleSendChatMessage();
                  }
                }}
                disabled={isSendingChat}
              />
              <Button 
                  onClick={handleSendChatMessage} 
                  className="h-16 w-16 rounded-2xl p-0 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20" 
                  disabled={isSendingChat || !chatInput.trim()}
              >
                {isSendingChat ? <Loader2 className="h-6 w-6 text-white animate-spin" /> : <Send className="h-6 w-6 text-white" />}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AdminDashboardWrapper() {
  const { isReady, language, setLanguage } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);
  const [adminVerified, setAdminVerified] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    // 관리자 페이지는 항상 한국어로 표시하도록 강제 설정
    if (language !== 'ko') {
      setLanguage('ko', false);
    }
  }, [language, setLanguage]);

  useEffect(() => {
    if (!isMounted) return;

    const isLoggedIn = sessionStorage.getItem("admin_logged_in") === "true";

    if (!isLoggedIn) {
      router.replace("/admin/login");
    } else {
      setAdminVerified(true);
    }
  }, [isMounted, router]);

  if (!isMounted || !isReady) return null;

  return (
    <div className="min-h-screen flex flex-col font-body bg-slate-50/50">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 lg:py-16">
        <div className="max-w-7xl mx-auto">
          {!adminVerified ? (
             <div className="min-h-[400px] flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
             </div>
          ) : (
            <AdminDashboardContent isAdmin={adminVerified} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default AdminDashboardWrapper;
