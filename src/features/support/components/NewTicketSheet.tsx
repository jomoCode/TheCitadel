"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormField, inputClass } from "@/components/shared/form/FormField";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { ApiError } from "@/lib/api/ApiClient";
import { getTooltip } from "@/lib/tooltips/registry";
import { cn } from "@/lib/utils/cn";
import { useToast } from "@/providers/ToastProvider";
import { residentSupportApi } from "../api/SupportApi";
import { useResidentCategories } from "../hooks/useSupport";
import { FilePicker } from "./Attachments";

type Home = { house_id: string; house_identifier: string | null; estate_name: string | null };
type Props = { open: boolean; onOpenChange: (open: boolean) => void; homes: Home[] };

export function NewTicketSheet(props: Props) {
  return <NewTicketBody key={props.open ? "open" : "closed"} {...props} />;
}

/** Report a problem: pick what kind, describe it, optionally add photos. The house is filled in automatically. */
function NewTicketBody({ open, onOpenChange, homes }: Props) {
  const categories = useResidentCategories();
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [categoryId, setCategoryId] = useState("");
  const [houseId, setHouseId] = useState(homes.length === 1 ? homes[0].house_id : "");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const valid = categoryId && houseId && subject.trim().length >= 3 && description.trim().length >= 10;

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const ticket = await residentSupportApi.create({ category_id: categoryId, subject: subject.trim(), description: description.trim(), house_id: houseId });
      for (const file of files) await residentSupportApi.upload(ticket.id, file);
      await queryClient.invalidateQueries({ queryKey: ["tickets"] });
      toast.success("Request sent — we'll keep you updated", ticket.reference);
      onOpenChange(false);
      router.push(`/resident/support/${ticket.id}`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "We couldn't send your request. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Report a problem" tip={getTooltip("support.newTicket")}
      footer={<Button size="lg" className="w-full" disabled={!valid || busy} onClick={submit}>{busy ? "Sending…" : "Send request"}</Button>}>
      <div className="space-y-5">
        <fieldset>
          <legend className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">What kind of problem?</legend>
          <div className="grid grid-cols-2 gap-2">
            {categories.data?.map((c) => (
              <button key={c.id} type="button" aria-pressed={categoryId === c.id} onClick={() => setCategoryId(c.id)}
                className={cn("rounded-xl border px-3 py-3 text-left text-sm", categoryId === c.id ? "border-gold bg-gold-soft" : "border-border")}>
                {c.name}
              </button>
            ))}
          </div>
        </fieldset>
        {homes.length > 1 && (
          <FormField id="ticket-house" label="Which home?">
            <select id="ticket-house" value={houseId} onChange={(e) => setHouseId(e.target.value)} className={inputClass}>
              <option value="">Choose…</option>
              {homes.map((h) => <option key={h.house_id} value={h.house_id}>House {h.house_identifier} · {h.estate_name}</option>)}
            </select>
          </FormField>
        )}
        <FormField id="ticket-subject" label="Short title">
          <input id="ticket-subject" value={subject} onChange={(e) => setSubject(e.target.value)} className={inputClass} placeholder="e.g. Leaking kitchen tap" maxLength={120} />
        </FormField>
        <FormField id="ticket-description" label="What's happening?">
          <textarea id="ticket-description" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass}
            placeholder="Where is it, when did it start, and is it getting worse?" />
        </FormField>
        <div className="space-y-2">
          <FilePicker onPick={(f) => setFiles((x) => [...x, f].slice(0, 5))} label="Add a photo (optional)" />
          {files.length > 0 && (
            <ul className="space-y-1 text-xs text-muted-foreground">
              {files.map((f, i) => (
                <li key={`${f.name}-${i}`} className="flex justify-between gap-2">
                  <span className="truncate">{f.name}</span>
                  <button type="button" onClick={() => setFiles((x) => x.filter((_, j) => j !== i))} className="text-danger">Remove</button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {error && <p role="alert" className="rounded-brand bg-danger/10 p-3 text-sm text-danger">{error}</p>}
      </div>
    </Sheet>
  );
}
