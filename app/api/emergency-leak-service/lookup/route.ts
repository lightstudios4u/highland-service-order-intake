import { NextResponse } from "next/server";
import https from "https";
import { ServiceIntakeRequestPayload } from "@/types/emergencyLeakService";

const lookupApiUrl = process.env.SERVICE_INTAKE_API_URL;
const lookupApiKey = process.env.SERVICE_INTAKE_API_KEY;

/**
 * The upstream C# API is a GET that reads `ServiceIntakeRequest` from the
 * request body (application/json).  Node.js `fetch` strips bodies from GET
 * requests, so we use `https.request` directly — just like Postman does.
 */
function getWithJsonBody(
  url: string,
  jsonBody: string,
  apiKey: string,
): Promise<{ status: number; data: string }> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = https.request(
      {
        hostname: parsed.hostname,
        port: parsed.port || 443,
        path: parsed.pathname + parsed.search,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(jsonBody).toString(),
          Accept: "*/*",
          apikey: apiKey,
        },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () =>
          resolve({ status: res.statusCode ?? 0, data: body }),
        );
      },
    );
    req.on("error", reject);
    req.write(jsonBody);
    req.end();
  });
}

export async function POST(request: Request) {
  if (!lookupApiUrl || !lookupApiKey) {
    return NextResponse.json(
      {
        message:
          "Lookup API is not configured. Set SERVICE_INTAKE_API_URL and SERVICE_INTAKE_API_KEY.",
      },
      { status: 500 },
    );
  }

  const body = (await request.json()) as Partial<ServiceIntakeRequestPayload>;

  const payload: ServiceIntakeRequestPayload = {
    JobNo: body.JobNo?.trim() ?? "",
    EmailAddress: body.EmailAddress?.trim() ?? "",
    City: body.City?.trim() ?? "",
    Zip: body.Zip?.trim() ?? "",
  };

  if (!payload.JobNo && !payload.EmailAddress) {
    return NextResponse.json(
      {
        message: "Provide at least a service order number or an email address.",
      },
      { status: 400 },
    );
  }

  try {
    const jsonBody = JSON.stringify(payload);
    const result = await getWithJsonBody(lookupApiUrl, jsonBody, lookupApiKey);

    let parsed: unknown;
    try {
      parsed = JSON.parse(result.data);
    } catch {
      parsed = result.data;
    }

    if (result.status >= 400) {
      return NextResponse.json(
        {
          message: "Lookup request to upstream API failed.",
          upstreamStatus: result.status,
          details: parsed,
        },
        { status: result.status },
      );
    }

    return NextResponse.json(parsed, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Unable to connect to lookup API.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 502 },
    );
  }
}
