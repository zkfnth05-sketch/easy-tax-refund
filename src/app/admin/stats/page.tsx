"use client";

import { useEffect, useState, useMemo } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  FileText, 
  Wallet, 
  ArrowLeft,
  PieChart,
  RefreshCw,
  Trophy,
  Globe2,
  Target,
  Zap
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useTranslation } from "@/components/LanguageContext";

const LANGUAGE_TO_COUNTRY: Record<string, string> = {
  'ko': '한국',
  'vi': '베트남',
  'zh': '중국',
  'km': '캄보디아',
  'ne': '네팔',
  'uz': '우즈베키스탄',
  'my': '미얀마',
  'id': '인도네시아',
  'th': '태국',
  'en': '필리핀',
  'si': '스리랑카',
  'mn': '몽골',
  'bn': '방글라데시',
  'kk': '카자흐스탄',
  'ur': '파키스탄'
};

const TARGET_COUNTRY_LIST = Object.values(LANGUAGE_TO_COUNTRY);

type TimeRange = 'today' | 'week' | 'month' | 'total';

export default function AdminStatsPage() {
  const { language, setLanguage } = useTranslation();
  const router = useRouter();
  const [apps, setApps] = useState<any[]>([]);
  const [dailyStats, setDailyStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('total');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [isMounted, setIsMounted] = useState(false);
  const [adminVerified, setAdminVerified] = useState(false);

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

  useEffect(() => {
    const qApps = query(collection(db, 'applications'), orderBy('createdAt', 'desc'));
    const unsubApps = onSnapshot(qApps, (snapshot) => {
      setApps(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => console.error("Apps listener error:", err));

    const qStats = query(collection(db, 'daily_stats'));
    const unsubStats = onSnapshot(qStats, (snapshot) => {
      setDailyStats(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      console.error("Stats listener error:", err);
      setLoading(false);
    });

    return () => {
      unsubApps();
      unsubStats();
    };
  }, []);

  const availableCountries = useMemo(() => {
    return TARGET_COUNTRY_LIST;
  }, []);

  const filteredData = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));
    const startOfWeek = new Date(new Date().setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const filterByDate = (dateVal: any, start: Date) => {
      let d: Date;
      if (dateVal?.toDate) d = dateVal.toDate();
      else if (dateVal instanceof Date) d = dateVal;
      else d = new Date(dateVal);
      return d >= start;
    };

    const targetStart = 
      timeRange === 'today' ? startOfToday :
      timeRange === 'week' ? startOfWeek :
      timeRange === 'month' ? startOfMonth :
      null;

    const dateFilteredApps = targetStart ? apps.filter(a => filterByDate(a.createdAt, targetStart)) : apps;
    const dateFilteredDaily = targetStart ? dailyStats.filter(s => new Date(s.id) >= targetStart) : dailyStats;

    // First, filter by country if selected
    const countryFilteredApps = selectedCountry === 'all' 
      ? dateFilteredApps 
      : dateFilteredApps.filter(a => (LANGUAGE_TO_COUNTRY[a.userLanguage] || a.userLanguage) === selectedCountry);

    // Basic Metrics
    const totalVisits = dateFilteredDaily.reduce((acc, s) => acc + (s.visitCount || 0), 0);
    const countryApps = countryFilteredApps.length;
    const countryPaid = countryFilteredApps.filter(a => a.paymentStatus === 'paid').length;
    const countryRevenue = countryFilteredApps.filter(a => a.paymentStatus === 'paid').reduce((acc, a) => acc + Math.floor((a.estimatedRefundAmount || 0) * 0.2), 0);

    // Channel Stats (UTM)
    const channelStats: Record<string, { applicants: number, paid: number, revenue: number }> = {};
    countryFilteredApps.forEach(app => {
      const src = app.utmSource || 'direct';
      if (!channelStats[src]) channelStats[src] = { applicants: 0, paid: 0, revenue: 0 };
      channelStats[src].applicants++;
      if (app.paymentStatus === 'paid') {
        channelStats[src].paid++;
        channelStats[src].revenue += Math.floor((app.estimatedRefundAmount || 0) * 0.2);
      }
    });

    const sortedChannels = Object.entries(channelStats).sort((a, b) => b[1].applicants - a[1].applicants);

    // Funnel
    const funnel: Record<number, number> = { 1: 0, 3: 0, 8: 0 };
    countryFilteredApps.forEach(app => {
      const max = app.lastStep || 1;
      if (max >= 1) funnel[1]++;
      if (max >= 3) funnel[3]++;
      if (max >= 8) funnel[8]++;
    });

    // Global Stats for Ranking
    const nationalityRankMap: Record<string, number> = {};
    dateFilteredApps.forEach(app => {
        const c = LANGUAGE_TO_COUNTRY[app.userLanguage] || app.userLanguage || 'Unknown';
        nationalityRankMap[c] = (nationalityRankMap[c] || 0) + 1;
    });
    const nationalityRanking = Object.entries(nationalityRankMap).sort((a,b) => b[1] - a[1]);

    return {
      totalVisits,
      totalAppsGlobal: dateFilteredApps.length,
      countryApps,
      countryPaid,
      countryRevenue,
      byUtm: sortedChannels,
      funnel,
      topVolumeChannel: sortedChannels[0]?.[0] || 'direct',
      topYieldChannel: Object.entries(channelStats).sort((a,b) => b[1].revenue - a[1].revenue)[0]?.[0] || 'direct',
      nationalityRanking
    };
  }, [apps, dailyStats, timeRange, selectedCountry]);

  if (!isMounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <RefreshCw className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!adminVerified) return null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 lg:py-24 max-w-7xl">
        <div className="space-y-10">
          {/* Header & Filter */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-2">
                <Button onClick={() => router.push('/admin')} variant="ghost" className="pl-0 hover:bg-transparent text-slate-500 font-bold gap-2">
                  <ArrowLeft className="h-4 w-4" /> 대시보드로 돌아가기
                </Button>
                <h1 className="text-3xl font-black text-slate-900">Advanced Marketing Intel</h1>
              </div>
              <div className="flex bg-slate-100 p-1 rounded-2xl">
                {['today', 'week', 'month', 'total'].map(range => (
                  <Button 
                    key={range}
                    onClick={() => setTimeRange(range as TimeRange)}
                    variant={timeRange === range ? 'default' : 'ghost'}
                    className={`rounded-xl px-5 font-bold ${timeRange === range ? 'bg-slate-900 text-white' : 'text-slate-500'}`}
                  >
                    {range === 'today' ? '오늘' : range === 'week' ? '주간' : range === 'month' ? '월간' : '전체'}
                  </Button>
                ))}
              </div>
            </div>

            <Separator className="bg-slate-100" />

            <div className="flex flex-col sm:flex-row items-center gap-6 text-sm">
               <div className="flex items-center gap-3 shrink-0">
                  <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                    <Globe2 className="h-5 w-5" />
                  </div>
                  <span className="font-black text-slate-900">분석 대상 명단 분리:</span>
               </div>
               <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger className="w-full sm:w-[300px] h-14 rounded-2xl bg-white border border-slate-200 font-black text-indigo-600 shadow-sm transition-all hover:border-indigo-300">
                    <SelectValue placeholder="모든 국가 (Global)" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-2xl">
                    <SelectItem value="all" className="font-bold py-3 cursor-pointer">모든 국가 (Global)</SelectItem>
                    {availableCountries.map(c => (
                      <SelectItem key={c} value={c} className="font-bold py-3 cursor-pointer">{c}</SelectItem>
                    ))}
                  </SelectContent>
               </Select>
               {selectedCountry !== 'all' && (
                 <Badge className="bg-indigo-600 text-white border-none py-2 px-4 rounded-xl font-black animate-in fade-in zoom-in">
                   {selectedCountry} 집중 분석 중
                 </Badge>
               )}
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="premium-card rounded-[2.5rem] border-none shadow-sm bg-white p-8 space-y-4">
              <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600"><Users /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{selectedCountry === 'all' ? '전체 방문자' : `${selectedCountry} 예상 유입`}</p>
                <p className="text-3xl font-black text-slate-900">{filteredData.totalVisits.toLocaleString()}명</p>
              </div>
            </Card>
            <Card className="premium-card rounded-[2.5rem] border-none shadow-sm bg-white p-8 space-y-4">
               <div className="h-12 w-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600"><FileText /></div>
               <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">총 신청 건수</p>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900">{filteredData.countryApps.toLocaleString()}건</span>
                </div>
                {selectedCountry !== 'all' && (
                  <p className="text-xs font-bold text-slate-400 mt-1">Global 점유율: {((filteredData.countryApps / (filteredData.totalAppsGlobal || 1)) * 100).toFixed(1)}%</p>
                )}
              </div>
            </Card>
            <Card className="premium-card rounded-[2.5rem] border-none shadow-sm bg-white p-8 border-l-4 border-l-emerald-500">
               <div className="h-12 w-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600"><Target /></div>
               <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">최종 전환율 (Paid)</p>
                <p className="text-3xl font-black text-emerald-600">
                  {filteredData.countryApps > 0 ? ((filteredData.countryPaid / filteredData.countryApps) * 100).toFixed(1) : 0}%
                </p>
              </div>
            </Card>
            <Card className="premium-card rounded-[2.5rem] border-none shadow-sm bg-white p-8 border-l-4 border-l-indigo-500">
               <div className="h-12 w-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600"><Wallet /></div>
               <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">기여 예상 수익</p>
                <p className="text-3xl font-black text-indigo-600">₩ {filteredData.countryRevenue.toLocaleString()}</p>
              </div>
            </Card>
          </div>

          {/* Ranking & Regional Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-1 premium-card rounded-[2.5rem] border-none shadow-sm bg-white p-8 space-y-6">
                <div className="flex items-center gap-3">
                    <Trophy className="text-amber-500 h-6 w-6" />
                    <h3 className="text-xl font-black">글로벌 국가 순위</h3>
                </div>
                <div className="space-y-4">
                    {filteredData.nationalityRanking.slice(0, 5).map(([name, count], i) => (
                        <div key={name} className={cn("flex justify-between items-center p-4 rounded-2xl border transition-all", selectedCountry === name ? "bg-indigo-600 text-white border-indigo-600" : "bg-slate-50 border-slate-100 hover:bg-slate-100")}>
                            <div className="flex items-center gap-3">
                                <span className={cn("font-black text-xs w-6 h-6 rounded-lg flex items-center justify-center", i === 0 ? "bg-amber-400 text-white" : i === 1 ? "bg-slate-300 text-slate-600" : "bg-slate-200 text-slate-500")}>{i + 1}</span>
                                <span className="font-bold">{name}</span>
                            </div>
                            <span className="font-black">{count}건</span>
                        </div>
                    ))}
                </div>
                {filteredData.nationalityRanking.length > 5 && (
                    <div className="pt-4 border-t border-slate-100 text-center">
                        <p className="text-xs font-bold text-slate-400">최저 신청 국가: <span className="text-red-500">{filteredData.nationalityRanking[filteredData.nationalityRanking.length-1][0]}</span></p>
                    </div>
                )}
            </Card>

            <Card className="lg:col-span-2 premium-card rounded-[2.5rem] border-none shadow-sm bg-white flex flex-col">
                <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-xl font-black flex items-center gap-2">
                        <Zap className="text-amber-500 h-5 w-5" /> {selectedCountry === 'all' ? 'Global Strategy Insight' : `${selectedCountry} 특화 마케팅 인사이트`}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0 flex-1 flex flex-col justify-between">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-3">
                            <p className="text-xs font-black text-slate-400 uppercase">최다 유입 채널 (Volume)</p>
                            <p className="text-2xl font-black text-slate-900">{filteredData.topVolumeChannel}</p>
                            <p className="text-[10px] text-slate-400">가장 많은 유입을 유도하고 있습니다.</p>
                        </div>
                        <div className="p-6 bg-indigo-50 rounded-[2rem] border border-indigo-100 space-y-3">
                            <p className="text-xs font-black text-indigo-400 uppercase">최고 효율 채널 (Yield)</p>
                            <p className="text-2xl font-black text-indigo-600">{filteredData.topYieldChannel}</p>
                            <p className="text-[10px] text-indigo-400">가장 높은 결제 전환 및 수익을 내고 있습니다.</p>
                        </div>
                    </div>
                    
                    <div className="mt-8 p-8 bg-slate-900 rounded-[2rem] text-white">
                        <h4 className="font-black text-lg mb-2">💡 마케팅 전략 제언</h4>
                        <p className="text-sm text-slate-400 leading-relaxed font-bold">
                            {selectedCountry === 'all' 
                                ? "현재 글로벌 시장에서 가장 효율적인 채널은 " + filteredData.topYieldChannel + "입니다. 전반적인 캠페인을 이 채널 위주로 재편하세요."
                                : selectedCountry + " 국가의 사용자들은 " + filteredData.topYieldChannel + " 채널에서 환불 신청에 대한 신뢰도가 가장 높습니다. " + selectedCountry + " 전용 광고 카피를 이 채널에 집중 배치하세요."
                            }
                        </p>
                    </div>
                </CardContent>
            </Card>
          </div>

          {/* Detailed Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <Card className="lg:col-span-2 premium-card rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden">
                <CardHeader className="bg-slate-50/50 p-8">
                    <CardTitle className="text-lg font-black">{selectedCountry === 'all' ? '글로벌' : selectedCountry} 채널별 세부 성과</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="pl-8">매체(UTM Source)</TableHead>
                                <TableHead className="text-center">신청(건)</TableHead>
                                <TableHead className="text-center">전환율(%)</TableHead>
                                <TableHead className="text-right pr-8">기여 수익</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.byUtm.map(([name, stat]) => (
                                <TableRow key={name}>
                                    <TableCell className="pl-8 font-bold">{name}</TableCell>
                                    <TableCell className="text-center font-black">{stat.applicants}</TableCell>
                                    <TableCell className="text-center font-bold text-emerald-600">
                                        {((stat.paid / (stat.applicants || 1)) * 100).toFixed(1)}%
                                    </TableCell>
                                    <TableCell className="text-right pr-8 font-black">₩ {stat.revenue.toLocaleString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
             </Card>

             <Card className="lg:col-span-1 premium-card rounded-[2.5rem] border-none shadow-sm bg-white p-10 space-y-8">
                <h3 className="text-xl font-black">사용자 퍼널 (Conversion)</h3>
                <div className="space-y-10">
                    {[
                        { step: 1, label: '인증 시작' },
                        { step: 3, label: '환급액 조회' },
                        { step: 8, label: '최종 신청' }
                    ].map((item) => {
                        const count = filteredData.funnel[item.step] || 0;
                        const total = filteredData.funnel[1] || 1;
                        const pct = Math.round((count / total) * 100);
                        return (
                            <div key={item.step} className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-slate-500">{item.label}</span>
                                    <span className="font-black text-indigo-600">{count}명 ({pct}%)</span>
                                </div>
                                <div className="h-3 bg-slate-50 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 transition-all duration-700" style={{ width: `${pct}%` }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
             </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
