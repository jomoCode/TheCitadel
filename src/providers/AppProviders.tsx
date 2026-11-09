"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "framer-motion";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { TooltipProvider } from "@/components/ui/Tooltip";
import { createQueryClient } from "@/lib/query/createQueryClient";
import { AuthProvider } from "./AuthProvider";
import { ToastProvider } from "./ToastProvider";

/** Single place where every app-wide provider is mounted (theme, server cache, tooltips). */
export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <MotionConfig reducedMotion="user">
            <TooltipProvider delayDuration={200}>
              <ToastProvider>{children}</ToastProvider>
            </TooltipProvider>
          </MotionConfig>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
