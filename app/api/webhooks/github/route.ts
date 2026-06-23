import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const event = req.headers.get("x-github-event");
    console.log(`Received github event: ${event}`);

    if (event === "ping") {
      return NextResponse.json({ message: "pong" }, { status: 200 });
    }

    //TOD0: PULL REQUEST HANDLE LATER

    return NextResponse.json({ message: "Event Processed" }, { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
