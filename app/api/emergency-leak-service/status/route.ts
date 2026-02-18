import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = `${process.env.SERVICE_INTAKE_API_URL}/api/ServiceIntake/GetServiceOrderStatus`;
const API_KEY = process.env.SERVICE_INTAKE_API_KEY;

/**
 * GET /api/emergency-leak-service/status?referenceId=<guid>
 *
 * Proxies the backend's GetServiceOrderStatus endpoint so the frontend
 * never exposes the upstream URL or API key.
 */
export async function GET(request: NextRequest) {
  if (!API_BASE_URL || !API_KEY) {
    return NextResponse.json(
      {
        message:
          "Service intake API is not configured. Set SERVICE_INTAKE_API_URL and SERVICE_INTAKE_API_KEY.",
      },
      { status: 500 },
    );
  }

  const referenceId = request.nextUrl.searchParams.get("referenceId");

  if (!referenceId || !referenceId.trim()) {
    return NextResponse.json(
      { message: "Missing required query parameter: referenceId" },
      { status: 400 },
    );
  }
  
    const statusUrl = `${API_BASE_URL}?referenceId=${encodeURIComponent(referenceId.trim())}`;

  try {
    const response = await fetch(statusUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        apikey: API_KEY,
      },
    });

    let parsed: unknown;
    const text = await response.text();
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          message: "Status request to upstream API failed.",
          upstreamStatus: response.status,
          details: parsed,
        },
        { status: response.status >= 500 ? 502 : response.status },
      );
    }

    return NextResponse.json(parsed, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Unable to connect to status API.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 502 },
    );
  }
}
