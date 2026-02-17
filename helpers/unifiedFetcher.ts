type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractMessage(value: unknown): string | undefined {
  if (!isObjectRecord(value)) return undefined;
  const candidate =
    typeof value.message === "string"
      ? value.message
      : typeof value.Message === "string"
        ? value.Message
        : undefined;
  return typeof candidate === "string" ? candidate : undefined;
}

async function parseResponseBody(response: Response): Promise<unknown> {
  // 204 / 205 should be treated as no body
  if (response.status === 204 || response.status === 205) return null;

  const rawText = await response.text();
  if (!rawText) return null;

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(rawText) as JsonValue;
    } catch {
      // fall through to text if JSON parsing fails
    }
  }

  // If server lies about content-type, try parsing anyway
  try {
    return JSON.parse(rawText) as JsonValue;
  } catch {
    return rawText;
  }
}

export class UnifiedFetchError extends Error {
  status?: number;
  details?: unknown;
  cause?: unknown;

  constructor(
    message: string,
    opts?: { status?: number; details?: unknown; cause?: unknown },
  ) {
    super(message);
    this.name = "UnifiedFetchError";
    this.status = opts?.status;
    this.details = opts?.details;
    this.cause = opts?.cause;
  }
}

export type FetchJsonOptions = Omit<RequestInit, "body"> & {
  body?: JsonValue;
};

export async function fetchJson<T>(
  url: string,
  options: FetchJsonOptions = {},
  fallbackErrorMessage = "Request failed.",
): Promise<T> {
  const { body, headers, ...rest } = options;

  const mergedHeaders: HeadersInit = {
    ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
    ...(headers ?? {}),
  };

  try {
    const response = await fetch(url, {
      ...rest,
      headers: mergedHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const parsed = await parseResponseBody(response);

    if (!response.ok) {
      throw new UnifiedFetchError(
        extractMessage(parsed) ?? fallbackErrorMessage,
        {
          status: response.status,
          details: parsed,
        },
      );
    }

    return parsed as T;
  } catch (error) {
    if (error instanceof UnifiedFetchError) throw error;

    throw new UnifiedFetchError(fallbackErrorMessage, { cause: error });
  }
}
