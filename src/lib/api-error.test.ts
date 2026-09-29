import { describe, expect, it, vi } from "vitest";
import OpenAI from "openai";
import { apiErrorResponse, HttpError, readJson } from "./api-error";

function jsonRequest(body: unknown, overrides: Partial<{ contentType: string; contentLength: string }> = {}) {
  const raw = JSON.stringify(body);
  return new Request("http://localhost/api/test", {
    method: "POST",
    headers: {
      "content-type": overrides.contentType ?? "application/json",
      ...(overrides.contentLength ? { "content-length": overrides.contentLength } : {}),
    },
    body: raw,
  });
}

describe("readJson", () => {
  it("parses a well-formed JSON body", async () => {
    const result = await readJson(jsonRequest({ hello: "world" }));
    expect(result).toEqual({ hello: "world" });
  });

  it("rejects a non-JSON content type", async () => {
    const req = jsonRequest({ a: 1 }, { contentType: "text/plain" });
    await expect(readJson(req)).rejects.toMatchObject({ status: 415 });
  });

  it("rejects malformed JSON", async () => {
    const req = new Request("http://localhost/api/test", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{not valid json",
    });
    await expect(readJson(req)).rejects.toMatchObject({ status: 400 });
  });

  it("rejects a body larger than the declared Content-Length limit", async () => {
    const big = { text: "a".repeat(1000) };
    const req = jsonRequest(big);
    await expect(readJson(req, 10)).rejects.toMatchObject({ status: 413 });
  });

  it("rejects a body that exceeds the limit while streaming, even with no/lying Content-Length", async () => {
    const big = { text: "a".repeat(10_000) };
    const req = new Request("http://localhost/api/test", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(big),
    });
    await expect(readJson(req, 100)).rejects.toMatchObject({ status: 413 });
  });
});

describe("apiErrorResponse", () => {
  it("uses an HttpError's own status and message verbatim", async () => {
    const response = apiErrorResponse(new HttpError(400, "Bad input"), "test", "fallback");
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("Bad input");
    expect(body.requestId).toBeTruthy();
  });

  it("never leaks a raw internal error message to the client", async () => {
    const response = apiErrorResponse(new Error("Database password is hunter2"), "test", "Something went wrong.");
    const body = await response.json();
    expect(body.error).toBe("Something went wrong.");
    expect(body.error).not.toContain("hunter2");
    expect(response.status).toBe(500);
  });

  it("maps an OpenAI timeout error to 504", async () => {
    const response = apiErrorResponse(new OpenAI.APIConnectionTimeoutError(), "test", "fallback");
    expect(response.status).toBe(504);
  });

  it("maps an OpenAI connection error to 502", async () => {
    const response = apiErrorResponse(new OpenAI.APIConnectionError({ message: "boom" }), "test", "fallback");
    expect(response.status).toBe(502);
  });

  it("maps an OpenAI rate limit error to 429", async () => {
    const response = apiErrorResponse(
      new OpenAI.RateLimitError(429, {}, "Too many requests", new Headers()),
      "test",
      "fallback",
    );
    expect(response.status).toBe(429);
  });

  it("maps a generic OpenAI API error to 502, not its own status", async () => {
    const response = apiErrorResponse(
      new OpenAI.APIError(500, {}, "provider is down", new Headers()),
      "test",
      "fallback",
    );
    expect(response.status).toBe(502);
  });

  it("logs the real error server-side even though the client sees a friendly message", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    apiErrorResponse(new Error("secret internal detail"), "my-route", "fallback");
    expect(spy).toHaveBeenCalled();
    expect(spy.mock.calls[0].join(" ")).toContain("my-route");
    spy.mockRestore();
  });
});