import { NextResponse } from "next/server";
import { ServiceOrderIntakeResponse } from "@/types/emergencyLeakService";

const SERVICE_ORDER_INTAKE_URL = process.env.SERVICE_ORDER_INTAKE_URL;
const SERVICE_ORDER_INTAKE_KEY = process.env.SERVICE_ORDER_INTAKE_KEY;

const TRIGGER_PROCESSING_URL = `${process.env.SERVICE_INTAKE_API_URL}/api/ServiceIntake/TriggerQueueProcessing`;
const TRIGGER_PROCESSING_KEY = process.env.SERVICE_INTAKE_API_KEY;

const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 500;

/**
 * POST to the Azure Function with exponential-backoff retry on 503.
 */
async function postWithRetry(
  url: string,
  body: string,
  retries = MAX_RETRIES,
): Promise<Response> {
  let lastResponse: Response | undefined;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(SERVICE_ORDER_INTAKE_KEY
          ? { "x-functions-key": SERVICE_ORDER_INTAKE_KEY }
          : {}),
      },
      body,
    });

    if (response.status !== 503 || attempt === retries) {
      return response;
    }

    lastResponse = response;
    const backoff = INITIAL_BACKOFF_MS * Math.pow(2, attempt);
    await new Promise((resolve) => setTimeout(resolve, backoff));
  }

  return lastResponse!;
}

export async function POST(request: Request) {
  if (!SERVICE_ORDER_INTAKE_URL) {
    return NextResponse.json(
      {
        message:
          "Service order intake API is not configured. Set SERVICE_ORDER_POST_URL.",
      },
      { status: 500 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON in request body." },
      { status: 400 },
    );
  }

  const url = SERVICE_ORDER_INTAKE_KEY
    ? `${SERVICE_ORDER_INTAKE_URL}?code=${encodeURIComponent(SERVICE_ORDER_INTAKE_KEY)}`
    : `${SERVICE_ORDER_INTAKE_URL}`;

  try {
    const response = await postWithRetry(url, JSON.stringify(body));

    let parsed: unknown;
    const text = await response.text();
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }

    if (!response.ok) {
      const detail = parsed as Record<string, unknown> | undefined;
      return NextResponse.json(
        {
          message:
            typeof detail?.message === "string"
              ? detail.message
              : "Service order submission failed.",
          upstreamStatus: response.status,
          details: parsed,
        },
        { status: response.status >= 500 ? 502 : response.status },
      );
    }

    // Map the Azure response to what the frontend expects
    const intakeResponse = parsed as ServiceOrderIntakeResponse;

    // Best-effort: trigger queue processing so the request goes live immediately
    if (TRIGGER_PROCESSING_URL && TRIGGER_PROCESSING_KEY) {
      try {
        await fetch(TRIGGER_PROCESSING_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: TRIGGER_PROCESSING_KEY,
          },
        });
      } catch {
        // Non-fatal — the submission itself succeeded
        console.warn(
          "TriggerQueueProcessing call failed; message will be processed on next scheduled run.",
        );
      }
    }

    return NextResponse.json(
      {
        message:
          intakeResponse.message ??
          "Service order request received and queued for processing.",
        requestId: intakeResponse.referenceId ?? "Pending",
        referenceId: intakeResponse.referenceId,
        success: intakeResponse.success,
        queueName: intakeResponse.queueName,
        createdAt: intakeResponse.createdAt,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Unable to connect to service order intake API.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 502 },
    );
  }
}
