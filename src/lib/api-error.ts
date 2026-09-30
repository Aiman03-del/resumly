import OpenAI from "openai";
import { NextResponse } from "next/server";

/** Error whose message is safe to show to the end user. */
export class HttpError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = "HttpError";
  }
}

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const DEFAULT_COOLDOWN_MS = 60_000;
const MAX_COOLDOWN_MS = 60 * 60_000;

type ChatParams = OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming;
type ChatResult = OpenAI.Chat.Completions.ChatCompletion;

/** When each key may be tried again after a rate limit (in-memory, per server instance). */
const cooldownUntil = new Map<string, number>();

/** GROQ_API_KEY is required; GROQ_API_KEY_2 and GROQ_API_KEY_3 are optional backups. */
function groqKeys(): string[] {
  return [process.env.GROQ_API_KEY, process.env.GROQ_API_KEY_2, process.env.GROQ_API_KEY_3]
    .map((key) => key?.trim())
    .filter((key): key is string => !!key);
}

function cooldownFor(error: InstanceType<typeof OpenAI.RateLimitError>): number {
  const seconds = Number(error.headers?.get("retry-after"));
  if (!Number.isFinite(seconds) || seconds <= 0) return DEFAULT_COOLDOWN_MS;
  return Math.min(seconds * 1000, MAX_COOLDOWN_MS);
}

const AUTH_COOLDOWN_MS = 10 * 60_000;

/** One immediate retry for temporary Groq/network hiccups (the SDK's own retries are off so 429s switch keys fast). */
async function createWithRetry(client: OpenAI, params: ChatParams, options?: OpenAI.RequestOptions): Promise<ChatResult> {
  try {
    return await client.chat.completions.create(params, options);
  } catch (error) {
    const temporary = error instanceof OpenAI.InternalServerError || error instanceof OpenAI.APIConnectionError;
    if (!temporary) throw error;
    return client.chat.completions.create(params, options);
  }
}

export function createGroqClient() {
  const keys = groqKeys();
  if (keys.length === 0) throw new HttpError(503, "AI service is temporarily unavailable");

  const now = Date.now();
  const ordered = [...keys].sort(
    (a, b) => Math.max(cooldownUntil.get(a) ?? 0, now) - Math.max(cooldownUntil.get(b) ?? 0, now),
  );

  return {
    chat: {
      completions: {
        async create(params: ChatParams, options?: OpenAI.RequestOptions): Promise<ChatResult> {
          let lastError: unknown;

          for (const key of ordered) {
            const client = new OpenAI({ apiKey: key, baseURL: GROQ_BASE_URL, timeout: 20_000, maxRetries: 0 });
            const label = `key #${keys.indexOf(key) + 1}`;

            try {
              return await createWithRetry(client, params, options);
            } catch (error) {
              if (error instanceof OpenAI.RateLimitError) {
                cooldownUntil.set(key, Date.now() + cooldownFor(error));
                console.warn(`[groq] ${label} is rate limited, trying the next key`);
              } else if (error instanceof OpenAI.AuthenticationError || error instanceof OpenAI.PermissionDeniedError) {
                cooldownUntil.set(key, Date.now() + AUTH_COOLDOWN_MS);
                console.error(`[groq] ${label} was rejected (invalid or revoked key), trying the next key`);
              } else {
                throw error;
              }
              lastError = error;
            }
          }

          throw lastError;
        },
      },
    },
  };
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