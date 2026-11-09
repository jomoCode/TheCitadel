import { apiBaseUrl } from "@/lib/config/apiBaseUrl";

/** Error carrying the backend's code, friendly message and debug location (e.g. "bills.py/create_bill():42"). */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
    readonly correlationId?: string,
    readonly details?: Record<string, unknown>,
    readonly location?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = { body?: unknown; signal?: AbortSignal; headers?: Record<string, string> };
type Query = Record<string, string | number | boolean | null | undefined>;

/** Thin typed wrapper around fetch for the FastAPI backend. One instance shared app-wide. */
export class ApiClient {
  private tokenProvider: () => string | null = () => null;

  /** `base` may be a function so the address is read from the environment when first used, not at import. */
  constructor(private readonly base: string | (() => string)) {}

  private get baseUrl(): string {
    return typeof this.base === "function" ? this.base() : this.base;
  }

  /** Set by AuthProvider so every request carries the current access token. */
  setTokenProvider(provider: () => string | null): void {
    this.tokenProvider = provider;
  }

  get<T>(path: string, query?: Query, options?: RequestOptions) {
    return this.request<T>("GET", withQuery(path, query), options);
  }

  post<T>(path: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>("POST", path, { ...options, body });
  }

  patch<T>(path: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>("PATCH", path, { ...options, body });
  }

  put<T>(path: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>("PUT", path, { ...options, body });
  }

  delete<T>(path: string, options?: RequestOptions) {
    return this.request<T>("DELETE", path, options);
  }

  /** Multipart file upload (photos, PDFs). The browser sets the multipart boundary itself. */
  async upload<T>(path: string, file: File, fields: Record<string, string> = {}): Promise<T> {
    const form = new FormData();
    form.append("file", file);
    Object.entries(fields).forEach(([k, v]) => form.append(k, v));
    const token = this.tokenProvider();
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${path}`, { method: "POST", body: form, headers: token ? { Authorization: `Bearer ${token}` } : {} });
    } catch {
      throw new ApiError("We couldn't reach the server. Check your connection and try again.", 0, "network_error");
    }
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const error = payload?.error ?? {};
      throw new ApiError(error.message ?? `Upload failed (${response.status})`, response.status, error.code, error.correlation_id, error.details, error.location);
    }
    return payload as T;
  }

  /** Authenticated file download (e.g. CSV exports): fetches with the bearer token, then saves via a temporary link. */
  async download(path: string, query: Query | undefined, filename: string): Promise<void> {
    const token = this.tokenProvider();
    const response = await fetch(`${this.baseUrl}${withQuery(path, query)}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new ApiError(payload?.error?.message ?? `Download failed (${response.status})`, response.status, payload?.error?.code);
    }
    const url = URL.createObjectURL(await response.blob());
    const link = Object.assign(document.createElement("a"), { href: url, download: filename });
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  private async request<T>(method: string, path: string, options: RequestOptions = {}): Promise<T> {
    const token = this.tokenProvider();
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        method,
        signal: options.signal,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options.headers,
        },
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
      });
    } catch {
      throw new ApiError("We couldn't reach the server. Check your connection and try again.", 0, "network_error");
    }

    if (response.status === 204) return undefined as T;
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      const error = payload?.error ?? {};
      throw new ApiError(
        error.message ?? `Request failed (${response.status})`,
        response.status,
        error.code,
        response.headers.get("x-correlation-id") ?? error.correlation_id ?? undefined,
        error.details,
        error.location,
      );
    }
    return payload as T;
  }
}

function withQuery(path: string, query?: Query): string {
  if (!query) return path;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

export const apiClient = new ApiClient(apiBaseUrl);
