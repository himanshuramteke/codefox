import { reviewPullRequest } from "@/modules/ai/actions";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const event = req.headers.get("x-github-event");
    console.log(`Received github event: ${event}`);

    if (event === "ping") {
      return NextResponse.json({ message: "pong" }, { status: 200 });
    }

    if (event === "pull_request") {
      const action = body.action;
      const fullName = body.repository.full_name;
      const prNumber = body.number;

      const [owner, repo] = fullName.split("/");

      if (action === "opened" || action === "synchronize") {
        reviewPullRequest(owner, repo, prNumber)
          .then(() => console.log(`Review completed for ${repo} #${prNumber}`))
          .catch((error: unknown) =>
            console.log(`Review failed for ${fullName} #${prNumber}`, error),
          );
      }
    }

    return NextResponse.json({ message: "Event Processed" }, { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
