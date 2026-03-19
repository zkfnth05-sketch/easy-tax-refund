"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "@/components/LanguageContext";
import { cn } from "@/lib/utils";
import { User, CheckCircle2, Globe, Sparkles } from "lucide-react";

const COUNTRIES = ["Vietnam", "China", "Nepal", "Cambodia", "Thailand", "Uzbekistan", "Philippines", "Mongolia", "Myanmar"];
const ACTIONS = ["Just checked refund amount", "Applied for refund", "Completed document upload", "Verified identity"];

interface Notification {
  id: number;
  country: string;
  action: string;
  timeAgo: string;
  iconType: "user" | "check" | "globe" | "sparkles";
}

export function SocialProof() {
  const { t } = useTranslation();
  const [notification, setNotification] = useState<Notification | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const generateNotification = useCallback(() => {
    const country = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
    const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
    const iconTypes: Notification["iconType"][] = ["user", "check", "globe", "sparkles"];
    const iconType = iconTypes[Math.floor(Math.random() * iconTypes.length)];
    
    return {
      id: Date.now(),
      country: t(country),
      action: t(action),
      timeAgo: t("Just now"),
      iconType
    };
  }, [t]);

  useEffect(() => {
    let hideTimeout: NodeJS.Timeout;
    let nextTimeout: NodeJS.Timeout;
    let initialTimeout: NodeJS.Timeout;

    const showNotification = () => {
      setNotification(generateNotification());
      setIsVisible(true);

      // Hide after 5 seconds
      hideTimeout = setTimeout(() => {
        setIsVisible(false);
      }, 5000);

      // Schedule next one after 10-20 seconds
      const nextDelay = 10000 + Math.random() * 10000;
      nextTimeout = setTimeout(showNotification, nextDelay);
    };

    // Initial delay
    initialTimeout = setTimeout(showNotification, 3000);

    return () => {
      clearTimeout(hideTimeout);
      clearTimeout(nextTimeout);
      clearTimeout(initialTimeout);
    };
  }, [generateNotification]);

  if (!notification) return null;

  return (
    <div
      className={cn(
        "fixed bottom-6 left-6 z-[100] transition-all duration-700 transform print:hidden",
        isVisible ? "translate-y-0 opacity-100 scale-100" : "translate-y-12 opacity-0 scale-95 pointer-events-none"
      )}
    >
      <div className="bg-white/90 backdrop-blur-md border border-slate-200 shadow-2xl rounded-[1.5rem] p-4 flex items-center gap-4 min-w-[300px] max-w-sm">
        <div className={cn(
          "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
          notification.iconType === "user" && "bg-blue-50 text-blue-500",
          notification.iconType === "check" && "bg-emerald-50 text-emerald-500",
          notification.iconType === "globe" && "bg-indigo-50 text-indigo-500",
          notification.iconType === "sparkles" && "bg-amber-50 text-amber-500"
        )}>
          {notification.iconType === "user" && <User className="h-6 w-6" />}
          {notification.iconType === "check" && <CheckCircle2 className="h-6 w-6" />}
          {notification.iconType === "globe" && <Globe className="h-6 w-6" />}
          {notification.iconType === "sparkles" && <Sparkles className="h-6 w-6" />}
        </div>
        
        <div className="flex-1 space-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">{notification.country}</span>
            <span className="text-[9px] font-bold text-slate-300">{notification.timeAgo}</span>
          </div>
          <p className="text-[13px] font-black text-slate-900 leading-tight">
            {notification.action}
          </p>
          <div className="flex items-center gap-1">
            <div className="h-1 w-1 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{t("Real-time Update")}</span>
          </div>
        </div>
        
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2">
           <div className="h-6 w-6 bg-primary rounded-full border-2 border-white flex items-center justify-center shadow-lg">
             <div className="h-2 w-2 bg-white rounded-full animate-ping" />
           </div>
        </div>
      </div>
    </div>
  );
}
