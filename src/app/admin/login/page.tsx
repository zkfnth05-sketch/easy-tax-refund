"use client";

/** 
 * DESIGN_LOCK: DO NOT ALTER VISUAL LAYOUT, COLORS, OR ANIMATIONS.
 * 관리자 전용 로그인 페이지 - /admin/page.tsx에서 분리됨.
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Lock } from "lucide-react";


import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function AdminLoginPage() {
  const user: any = null; // Mocked
  const isUserLoading = false; // Mocked
  const router = useRouter();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // 사용자 지정 로그인 세션 확인
  useEffect(() => {
    if (sessionStorage.getItem("admin_logged_in") === "true") {
      router.replace("/admin");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      await new Promise(r => setTimeout(r, 800));
      
      // 사용자 지정 자격 증명 확인 (환경 변수 또는 기본값)
      const targetId = process.env.NEXT_PUBLIC_ADMIN_ID || "rlaghddlf01";
      const targetPw = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "rlaghddlf0411*";
      
      if (email === targetId && password === targetPw) {
        sessionStorage.setItem("admin_logged_in", "true");
        toast({ title: "관리자 로그인 성공", description: "대시보드로 이동합니다." });
        router.push("/admin");
      } else {
        toast({ variant: "destructive", title: "로그인 실패", description: "아이디 또는 비밀번호가 올바르지 않습니다." });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "시스템 오류", description: "관리자 로그인 중 문제가 발생했습니다." });
    } finally {
      setLoginLoading(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-body bg-slate-900 items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white rounded-[2.5rem] overflow-hidden shadow-2xl">
        <CardHeader className="bg-slate-50 py-10 text-center border-b border-slate-100">
          <div className="mx-auto h-16 w-16 bg-primary rounded-2xl flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-black">Admin Access</CardTitle>
          <CardDescription className="font-bold">관리자 계정으로 로그인하세요.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 lg:p-10 space-y-6">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Admin Email</label>
                <Input
                  placeholder="admin or email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 rounded-xl bg-slate-50 border-none font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-14 rounded-xl bg-slate-50 border-none font-bold"
                />
              </div>
            </div>
            <Button type="submit" className="w-full h-16 bg-slate-900 text-lg font-black rounded-2xl" disabled={loginLoading}>
              {loginLoading ? <Loader2 className="animate-spin" /> : "관리자 로그인"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
