import { local, readJSON, uuid, writeJSON } from "./storage";
import type { Attribution } from "./types";

const VISITOR_KEY = "qa_visitor";
const SESSION_KEY = "qa_session";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 min of inactivity ends a session (GA4 default)

export interface Session {
  id: string;
  lastActivity: number;
  seq: number;
  attribution: Attribution;
  /** Dedupe keys for `once` events in this session. */
  seen: string[];
}

/** Anonymous, persistent per-browser id. Contains no personal data. */
export function getVisitorId(): string {
  const existing = readJSON<string>(local(), VISITOR_KEY);
  if (existing) return existing;
  const id = uuid();
  writeJSON(local(), VISITOR_KEY, id);
  return id;
}

/**
 * Returns the current session, starting a new one after inactivity.
 * Stored in localStorage so all tabs share one session (avoids inflating session counts).
 */
export function getSession(): Session {
  const now = Date.now();
  const current = readJSON<Session>(local(), SESSION_KEY);
  // Sessions saved before `attribution` existed are treated as expired.
  if (current?.attribution && now - current.lastActivity < SESSION_TIMEOUT_MS) return current;
  const fresh: Session = { id: uuid(), lastActivity: now, seq: 0, attribution: captureAttribution(), seen: [] };
  saveSession(fresh);
  return fresh;
}

export function saveSession(session: Session) {
  writeJSON(local(), SESSION_KEY, session);
}

const MAX_PARAM_LENGTH = 200;

/** Reads campaign parameters and the external referrer from the current page. */
function captureAttribution(): Attribution {
  const params = new URLSearchParams(window.location.search);
  const param = (key: string) => params.get(key)?.trim().slice(0, MAX_PARAM_LENGTH) || null;
  return {
    referrer: externalReferrer(),
    utm_source: param("utm_source"),
    utm_medium: param("utm_medium"),
    utm_campaign: param("utm_campaign"),
    utm_term: param("utm_term"),
    utm_content: param("utm_content"),
    gclid: param("gclid"),
    fbclid: param("fbclid"),
  };
}

/** Hostname only: full referrer URLs can carry search terms or other personal data. */
function externalReferrer(): string | null {
  try {
    if (!document.referrer) return null;
    const url = new URL(document.referrer);
    return url.hostname !== window.location.hostname ? url.hostname : null;
  } catch {
    return null;
  }
}
