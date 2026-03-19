
"use client";

import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Sparkles, User, Loader2, X } from "lucide-react";
import { askFaqQuestion } from "@/ai/flows/ai-powered-faq-flow";
import { useTranslation } from "@/components/LanguageContext";

/**
 * @fileOverview 실시간 AI 세무 상담을 위한 채팅 다이얼로그 컴포넌트입니다.
 */

export function AiChatDialog({ children }: { children: React.ReactNode }) {
  const { t, language } = useTranslation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([
    { role: 'ai', content: t('안녕하세요! Easy Tax Refund AI 상담사입니다. 중소기업 취업자 소득세 감면과 핸드폰 본인 인증 방법에 대해 궁금한 점이 있으신가요?') }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 메시지 추가 시 자동 스크롤
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const result = await askFaqQuestion({ 
        question: userMsg,
        language
      });
      setMessages(prev => [...prev, { role: 'ai', content: result.answer }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: t('죄송합니다. 현재 상담원이 부재 중이거나 연결이 원활하지 않습니다. 잠시 후 다시 시도해 주세요.') }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl">
        <button 
          onClick={() => setOpen(false)}
          className="absolute top-8 right-8 h-10 w-10 flex items-center justify-center rounded-full bg-white/10 text-white/50 hover:bg-white/20 hover:text-white transition-all z-[70] shadow-sm backdrop-blur-sm"
          title={t('닫기')}
        >
          <X className="h-5 w-5" />
        </button>
        <DialogHeader className="p-8 bg-slate-900 text-white space-y-1 shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black">{t('실시간 AI 세무 비서')}</DialogTitle>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{t('Online • Active Now')}</p>
              </div>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden p-6 bg-slate-50/50">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-6">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                  <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                      msg.role === 'user' ? 'bg-slate-200' : 'bg-primary text-white'
                    }`}>
                      {msg.role === 'user' ? <User className="h-4 w-4 text-slate-600" /> : <Sparkles className="h-4 w-4" />}
                    </div>
                    <div className={`p-4 rounded-2xl text-sm font-medium leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-slate-900 text-white rounded-tr-none' 
                        : 'bg-white text-slate-800 shadow-sm border border-slate-100 rounded-tl-none'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start animate-pulse">
                  <div className="flex gap-3 max-w-[80%]">
                    <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center shrink-0">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div className="p-4 bg-white rounded-2xl rounded-tl-none shadow-sm border border-slate-100">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
        </div>

        <form onSubmit={handleSend} className="p-6 bg-white border-t border-slate-100 flex gap-3 items-center shrink-0">
          <Input 
            placeholder={t("상담 내용을 입력하세요...")} 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 h-14 rounded-xl bg-slate-50 border-none focus-visible:ring-primary font-medium px-6"
            disabled={loading}
          />
          <Button type="submit" size="icon" className="h-14 w-14 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20" disabled={loading}>
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
