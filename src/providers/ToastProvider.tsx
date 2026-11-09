"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, X } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { cn } from "@/lib/utils/cn";

type Toast = { id: number; tone: "success" | "error"; title: string; detail?: string };
type ToastContextValue = {
  success: (title: string, detail?: string) => void;
  error: (title: string, detail?: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

/** Small confirmation messages ("Estate created"). Top of screen on phones, bottom-right on desktop. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => setToasts((all) => all.filter((t) => t.id !== id)), []);
  const push = useCallback(
    (tone: Toast["tone"], title: string, detail?: string) => {
      const id = Date.now() + Math.random();
      setToasts((all) => [...all.slice(-2), { id, tone, title, detail }]);
      setTimeout(() => dismiss(id), tone === "error" ? 7000 : 3500);
    },
    [dismiss],
  );

  const value = useMemo<ToastContextValue>(
    () => ({ success: (t, d) => push("success", t, d), error: (t, d) => push("error", t, d) }),
    [push],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-3 top-3 z-[60] flex flex-col gap-2 lg:inset-x-auto lg:bottom-6 lg:right-6 lg:top-auto lg:w-96">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              role={toast.tone === "error" ? "alert" : "status"}
              className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-lg border bg-surface p-4 shadow-xl",
                toast.tone === "error" ? "border-danger/40" : "border-success/40",
              )}
            >
              {toast.tone === "error" ? <AlertTriangle className="mt-0.5 size-4 text-danger" /> : <CheckCircle2 className="mt-0.5 size-4 text-success" />}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{toast.title}</p>
                {toast.detail && <p className="mt-0.5 text-xs text-muted-foreground">{toast.detail}</p>}
              </div>
              <button type="button" aria-label="Dismiss" onClick={() => dismiss(toast.id)} className="text-muted-foreground">
                <X className="size-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside <ToastProvider>");
  return context;
}
