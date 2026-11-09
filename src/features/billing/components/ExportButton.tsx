"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ApiError, apiClient } from "@/lib/api/ApiClient";
import { useToast } from "@/providers/ToastProvider";

type Props = { kind: "bills" | "payments"; query?: Record<string, string | undefined>; label?: string };

/** Downloads a CSV (opens in Excel or Google Sheets). Every export is recorded in the activity log. */
export function ExportButton({ kind, query, label = "Export CSV" }: Props) {
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const run = async () => {
    setBusy(true);
    try {
      await apiClient.download(`/admin/finance/export/${kind}.csv`, query, `${kind}-${new Date().toISOString().slice(0, 10)}.csv`);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Export failed");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Button variant="outline" size="sm" onClick={run} disabled={busy}>
      <Download className="size-3.5" /> {busy ? "Preparing…" : label}
    </Button>
  );
}
