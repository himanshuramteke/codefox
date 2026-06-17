import { Button } from "@/components/ui/button";
import { Logout } from "@/modules/auth/components/logout";
import { requireAuth } from "@/modules/auth/utils/auth-utils";

export default async function Home() {
  await requireAuth();
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Button>CodeFox - AI Reviews your PRs</Button>
      <Logout>
        <Button>Logout</Button>
      </Logout>
    </div>
  );
}
