"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { CheckCircle2, AlertCircle, XCircle, Info, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider duration={7000}>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} variant={variant} {...props} className="gap-4">
            <div className="flex items-center gap-4 w-full">
              <div className={cn(
                "h-10 w-10 shrink-0 rounded-xl flex items-center justify-center shadow-sm",
                variant === "destructive" && "bg-red-100 text-red-600",
                variant === "success" && "bg-emerald-100 text-emerald-600",
                variant === "warning" && "bg-amber-100 text-amber-600",
                (!variant || variant === "default") && "bg-blue-100 text-blue-600"
              )}>
                {variant === "destructive" && <XCircle className="h-5 w-5" />}
                {variant === "success" && <CheckCircle2 className="h-5 w-5" />}
                {variant === "warning" && <AlertCircle className="h-5 w-5" />}
                {(!variant || variant === "default") && <Info className="h-5 w-5" />}
              </div>
              
              <div className="grid gap-1 flex-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose className="rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors" />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
