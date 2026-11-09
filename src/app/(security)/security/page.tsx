"use client";

import { useQuery } from "@tanstack/react-query";
import { Camera, Search } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/Button";
import { InfoTip } from "@/components/ui/InfoTip";
import { ApiError } from "@/lib/api/ApiClient";
import { getTooltip } from "@/lib/tooltips/registry";
import { gateApi } from "@/features/visitors/api/VisitorsApi";
import { CheckResultCard } from "@/features/visitors/components/CheckResultCard";
import { ScanSheet, scannerSupported } from "@/features/visitors/components/ScanSheet";
import { useGateActions } from "@/features/visitors/hooks/useVisitors";
import { formatPassCode, isCompletePassCode } from "@/features/visitors/passCode";
import type { GateCheck } from "@/features/visitors/types";


export default function GateCheckPage() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<GateCheck | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [admitted, setAdmitted] = useState(false);
  const actions = useGateActions();

  const run = useCallback(async (value: string) => {
    setChecking(true);
    setError(null);
    setAdmitted(false);
    try {
      setResult(await gateApi.check(value));
    } catch (e) {
      setResult(null);
      setError(e instanceof ApiError ? e.message : "Couldn't check the pass. Try again.");
    } finally {
      setChecking(false);
    }
  }, []);

  // While waiting for a resident to confirm an arrival, re-check every 4 seconds.
  useQuery({ queryKey: ["gate", "recheck", code], queryFn: async () => { await run(code); return true; },
    enabled: result?.result === "awaiting_approval", refetchInterval: 4_000, refetchOnMount: false });

  const onScanned = useCallback((raw: string) => {
    const value = formatPassCode(raw);
    setCode(value);
    run(value);
  }, [run]);

  const reset = () => { setCode(""); setResult(null); setAdmitted(false); setError(null); };

  return (
    <div className="space-y-5">
      <h1 className="flex items-center gap-1 font-display text-3xl">Check a pass <InfoTip text={getTooltip("gate.check")} /></h1>
      <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (isCompletePassCode(code)) run(code); }}>
        <label className="block">
          <span className="sr-only">Pass code</span>
          <input value={code} onChange={(e) => setCode(formatPassCode(e.target.value))} placeholder="ABCD-2345" autoCapitalize="characters" autoComplete="off"
            spellCheck={false} inputMode="text" className="h-20 w-full rounded-2xl border-2 border-border bg-surface text-center font-mono text-4xl tracking-[0.2em] placeholder:text-muted-foreground/40 focus:border-gold focus:outline-none" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <Button type="submit" size="lg" disabled={!isCompletePassCode(code) || checking}><Search className="size-5" /> {checking ? "Checking…" : "Check"}</Button>
          <Button type="button" size="lg" variant="outline" disabled={!scannerSupported()} onClick={() => setScanning(true)}>
            <Camera className="size-5" /> Scan QR
          </Button>
        </div>
      </form>
      {error && <p role="alert" className="rounded-2xl bg-danger/10 p-4 text-danger">{error}</p>}
      {result && (
        <CheckResultCard check={result}>
          {admitted ? (
            <div className="space-y-3">
              <p className="rounded-xl bg-success/15 p-3 text-center font-medium text-success">Checked in. Welcome them!</p>
              <Button size="lg" variant="outline" className="w-full" onClick={reset}>Next visitor</Button>
            </div>
          ) : result.can_admit && result.invitation_id ? (
            <Button size="lg" className="h-16 w-full text-base" disabled={actions.admit.isPending || actions.admitWalkin.isPending}
              onClick={() => (result.result === "approved" && result.approval_request_id
                ? actions.admitWalkin.mutate(result.approval_request_id, { onSuccess: () => setAdmitted(true) })
                : actions.admit.mutate(result.invitation_id!, { onSuccess: () => setAdmitted(true) }))}>
              Check them in
            </Button>
          ) : (
            <Button size="lg" variant="outline" className="w-full" onClick={reset}>Check another pass</Button>
          )}
        </CheckResultCard>
      )}
      <ScanSheet open={scanning} onOpenChange={setScanning} onCode={onScanned} />
    </div>
  );
}
