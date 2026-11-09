import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

export const API = "http://localhost:8000/api/v1";

/** Default happy-path handlers; individual tests override with server.use(...). */
export const handlers = [
  http.post(`${API}/public/enquiries`, () => HttpResponse.json({ id: "enq_1", reference: "ENQ-2026-0001" }, { status: 201 })),
  http.post(`${API}/public/events`, () => new HttpResponse(null, { status: 204 })),
];

export const server = setupServer(...handlers);
