import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { ApiClient, ApiError } from "@/lib/api/ApiClient";
import { API, server } from "../mocks/server";

describe("ApiClient", () => {
  const client = new ApiClient(API);

  it("adds the bearer token and drops empty query values", async () => {
    let seen = { auth: "", url: "" };
    server.use(http.get(`${API}/admin/houses`, ({ request }) => {
      seen = { auth: request.headers.get("authorization") ?? "", url: request.url };
      return HttpResponse.json({ items: [] });
    }));
    client.setTokenProvider(() => "tok123");
    await client.get("/admin/houses", { q: "", status: "occupied", page: 2, estate_id: undefined });
    expect(seen.auth).toBe("Bearer tok123");
    expect(new URL(seen.url).search).toBe("?status=occupied&page=2");
  });

  it("turns error bodies into ApiError with code, details, location and correlation id", async () => {
    server.use(http.delete(`${API}/admin/houses/h1`, () =>
      HttpResponse.json(
        { error: { code: "house_has_history", message: "Deactivate it instead.", location: "house_service.py/delete():80", details: { x: 1 } } },
        { status: 409, headers: { "X-Correlation-ID": "abc123" } },
      )));
    const error = await client.delete("/admin/houses/h1").catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 409, code: "house_has_history", message: "Deactivate it instead.", correlationId: "abc123", location: "house_service.py/delete():80" });
  });

  it("reports network failures in plain language", async () => {
    server.use(http.get(`${API}/health`, () => HttpResponse.error()));
    const error = (await client.get("/health").catch((e) => e)) as ApiError;
    expect(error.code).toBe("network_error");
    expect(error.message).toMatch(/couldn't reach the server/i);
  });

  it("returns undefined for 204 responses", async () => {
    server.use(http.delete(`${API}/admin/roles/r1`, () => new HttpResponse(null, { status: 204 })));
    await expect(client.delete("/admin/roles/r1")).resolves.toBeUndefined();
  });
});
