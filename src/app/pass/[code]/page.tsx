"use client";

import { useQuery } from "@tanstack/react-query";
import { ShieldCheck } from "lucide-react";
import { use } from "react";
import { fetchPublicPass } from "@/features/visitors/api/VisitorsApi";
import { windowText } from "@/features/visitors/components/PassCard";
import { QrCode } from "@/features/visitors/components/QrCode";

/** What the guest opens from the shared link: a clean pass to show at the gate. No resident details are shown. */
export default function PublicPassPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const pass = useQuery({ queryKey: ["public-pass", code], queryFn: () => fetchPublicPass(code), retry: false });

  return (
    <main className="flex min-h-svh items-center justify-center bg-[#140e0c] px-5 py-10 text-[#f4ede3]">
      <div className="w-full max-w-sm rounded-3xl bg-[#1e1613] p-7 text-center shadow-2xl">
        <p className="font-display text-xl">Citadel</p>
        <p className="text-eyebrow mt-1 text-[#d4af5a]">Visitor pass</p>
        {pass.isLoading && <p className="mt-10 text-sm text-[#a8998a]">Loading your pass…</p>}
        {pass.error && <p className="mt-10 text-sm text-[#e07a7a]">This pass link isn&apos;t valid. Please ask your host to send it again.</p>}
        {pass.data && (
          <>
            <p className="mt-6 font-display text-3xl">{pass.data.visitor_name}</p>
            <p className="mt-1 text-sm text-[#a8998a]">{pass.data.estate_name} · House {pass.data.house_identifier}{pass.data.headcount > 1 ? ` · ${pass.data.headcount} people` : ""}</p>
            {pass.data.status === "active" ? (
              <>
                <div className="mt-6 flex justify-center"><QrCode value={pass.data.code} size={220} label={`QR code ${pass.data.code}`} /></div>
                <p className="mt-4 font-mono text-3xl tracking-[0.2em]">{pass.data.code}</p>
                <p className="mt-3 text-sm text-[#d9cfc2]">{windowText(pass.data.valid_from, pass.data.valid_until)}</p>
                <p className="mt-6 flex items-center justify-center gap-2 text-xs text-[#a8998a]"><ShieldCheck className="size-4 text-[#d4af5a]" /> Show this screen to security at the gate</p>
              </>
            ) : (
              <p className="mt-8 rounded-xl bg-[#261c18] p-4 text-sm">This pass is no longer active ({pass.data.status}). Please contact your host.</p>
            )}
          </>
        )}
      </div>
    </main>
  );
}
