/** FINAL_TRANSLATION_LOCK: VI_ZH_DONE_DO_NOT_MODIFY **/

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Globe, Calculator, HelpCircle, Menu, CreditCard, User, RotateCcw } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/components/LanguageContext";

import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const user = null; // Mocked
  const isUserLoading = false; // Mocked
  const { t } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    // await signOut(auth);
    window.location.href = "/";
  };

  const navLinks = [
    { href: "/estimate", label: t('환급금 확인'), icon: <Calculator className="h-4 w-4" /> },
    { href: "/pricing", label: t('가격 정책'), icon: <CreditCard className="h-4 w-4" /> },
    { href: "/faq", label: t('FAQ'), icon: <HelpCircle className="h-4 w-4" /> },
  ];

  return (
    <nav className={cn(
      "fixed top-0 z-50 w-full transition-all duration-500 py-4 print:hidden",
      scrolled ? "glass-nav py-4" : "bg-transparent py-8"
    )}>
      <div className="container mx-auto flex items-center justify-between px-6 lg:px-12">
        <Link href="/" className="flex items-center gap-3 sm:gap-4 group">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-[1.25rem] bg-gradient-to-br from-primary via-primary/90 to-indigo-700 text-white shadow-[0_10px_25px_-5px_rgba(99,102,241,0.4)] transition-all duration-300 group-hover:scale-110 active:scale-95 shrink-0">
            <Globe className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
          <span className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tighter text-slate-900 font-headline truncate max-w-[150px] sm:max-w-none">Easy Tax Refund</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <NavLink key={link.href} href={link.href} icon={link.icon}>{link.label}</NavLink>
          ))}
          {user && <NavLink href="/portal" icon={<User className="h-4 w-4" />}>{t('나의 환급 진행사항')}</NavLink>}
        </div>

        <div className="flex items-center gap-6">
          <Button variant="ghost" asChild size="icon" className="rounded-xl hover:bg-slate-100">
            <Link href="/welcome" title="Change Language"><RotateCcw className="h-5 w-5 text-slate-400" /></Link>
          </Button>
          {!isUserLoading && (
            user ? (
              <Button variant="ghost" onClick={handleLogout} className="hidden md:inline-flex font-black text-slate-900 hover:bg-slate-100/50 rounded-2xl px-6">{t('로그아웃')}</Button>
            ) : (
              <Button variant="ghost" asChild className="hidden md:inline-flex font-black text-slate-900 hover:bg-slate-100/50 rounded-2xl px-6">
                <Link href="/login">{t('나의 실시간 환급 현황')}</Link>
              </Button>
            )
          )}
          <Button asChild className="hidden sm:inline-flex bg-primary hover:bg-primary/90 text-white font-black rounded-2xl px-8 h-12 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
            <Link href="/estimate">{t('무료 환급액 조회')}</Link>
          </Button>
          
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden h-12 w-12 rounded-2xl bg-white border border-slate-100">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="rounded-l-[2.5rem] p-10">
              <SheetHeader className="text-left mb-10">
                <SheetTitle className="text-2xl font-black font-headline">Easy Tax Refund</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-6">
                {navLinks.map((link) => (
                  <Link 
                    key={link.href} 
                    href={link.href} 
                    className="flex items-center gap-4 text-xl font-bold text-slate-600 hover:text-primary transition-colors"
                  >
                    <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center">
                      {link.icon}
                    </div>
                    {link.label}
                  </Link>
                ))}
                {user && (
                   <Link href="/portal" className="flex items-center gap-4 text-xl font-bold text-slate-600 hover:text-primary transition-colors">
                     <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center"><User className="h-4 w-4" /></div>
                     {t('나의 환급 진행사항')}
                   </Link>
                )}
                <div className="h-px bg-slate-100 my-4" />
                <Link href="/login" className="text-xl font-bold text-slate-900">{t('로그인 / 신청 현황')}</Link>
                <Button asChild className="w-full bg-primary h-16 rounded-2xl font-black text-xl mt-4">
                  <Link href="/estimate">{t('무료 조회 시작')}</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, children, icon }: { href: string, children: React.ReactNode, icon: React.ReactNode }) {
  return (
    <Link href={href} className="text-[15px] font-black text-slate-600 hover:text-slate-900 transition-all flex items-center gap-2 relative group">
      {icon}
      {children}
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
    </Link>
  );
}
