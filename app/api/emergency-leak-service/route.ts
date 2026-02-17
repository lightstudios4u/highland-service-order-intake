import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const now = new Date();
  const year = String(now.getFullYear()).slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const sequence = String(Math.floor(Math.random() * 9000) + 1000);
  const requestId = `ELS-${year}-${month}-${sequence}`;

  return NextResponse.json(
    {
      message: "Emergency leak service request submitted successfully.",
      requestId,
      received: body,
    },
    { status: 200 },
  );
}
