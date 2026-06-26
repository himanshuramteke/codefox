import { inngest } from "@/inngest/client";
import prisma from "@/lib/db";
import { indexCodebase } from "@/modules/ai/lib/rag";
import { getRepoFilesContent } from "@/modules/github/lib/github-functions";

export const indexRepo = inngest.createFunction(
  {
    id: "index.repo",
    triggers: { event: "repository.connected" },
  },
  async ({ event, step }) => {
    const { owner, repo, userId } = event.data;

    const files = await step.run("fetch-files", async () => {
      const account = await prisma.account.findFirst({
        where: {
          userId: userId,
          providerId: "github",
        },
      });

      if (!account?.accessToken) {
        throw new Error("No Github access token found");
      }

      return await getRepoFilesContent(account.accessToken, owner, repo);
    });

    await step.run("index-codebase", async () => {
      await indexCodebase(`${owner}/${repo}`, files);
    });

    return { success: true, indexedFiles: files.length };
  },
);
