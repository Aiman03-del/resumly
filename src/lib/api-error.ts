import OpenAI from "openai";
import { NextResponse } from "next/server";

/** Error whose message is safe to show to the end user. */
export class HttpError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = "HttpError";
  }
}

/** Groq client (OpenAI-compatible) with a hard timeout so requests can't hang. */
export function createGroqClient() {
  return new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
    timeout: 20_000,
    maxRetries: 1,
  });
}

/** Parse the JSON body, or throw a clean 400. */
export async function readJson(req: Request, maxBytes?: number): Promise<unknown> {
  try {
    const contentType = req.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
    if (contentType !== "application/json") {
      throw new HttpError(415, "Content-Type must be application/json.");
    }

    if (maxBytes !== undefined) {
      const contentLength = Number(req.headers.get("content-length"));
      if (Number.isFinite(contentLength) && contentLength > maxBytes) {
        throw new HttpError(413, "Request body is too large.");
      }

      const reader = req.body?.getReader();
      if (reader) {
        const chunks: Uint8Array[] = [];
        let totalBytes = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          totalBytes += value.byteLength;
          if (totalBytes > maxBytes) {
            await reader.cancel().catch(() => undefined);
            throw new HttpError(413, "Request body is too large.");
          }
          chunks.push(value);
        }

        const body = new Uint8Array(totalBytes);
        let offset = 0;
        for (const chunk of chunks) {
          body.set(chunk, offset);
          offset += chunk.byteLength;
        }
        return JSON.parse(new TextDecoder().decode(body));
      }
    }

    return await req.json();
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(400, "Invalid JSON request body.");
  }
}

/**
 * Convert any thrown error into a safe JSON response.
 * - The client only gets a friendly message + a short requestId.
 * - The full error is logged on the server under the same requestId.
 */
export function apiErrorResponse(error: unknown, context: string, fallbackMessage: string) {
  const requestId = crypto.randomUUID().slice(0, 8);
  let status = 500;
  let message = fallbackMessage;

  if (error instanceof HttpError) {
    status = error.status;
    message = error.message;
  } else if (error instanceof OpenAI.APIConnectionTimeoutError) {
    status = 504;
    message = "The AI service took too long to respond. Please try again.";
  } else if (error instanceof OpenAI.APIConnectionError) {
    status = 502;
    message = "Could not reach the AI service. Please try again shortly.";
  } else if (error instanceof OpenAI.RateLimitError) {
    status = 429;
    message = "The AI service is busy right now. Please wait a moment and try again.";
  } else if (error instanceof OpenAI.APIError) {
    status = 502;
    message = "The AI service is temporarily unavailable. Please try again later.";
  }

  const log = status >= 500 ? console.error : console.warn;
  log(`[${context}] requestId=${requestId} status=${status}`, error);

  return NextResponse.json({ error: message, requestId }, { status });
}