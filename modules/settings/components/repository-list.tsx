"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  disconnectAllRepositories,
  disconnectRepository,
  getConnectedRepositories,
} from "../actions";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ExternalLink, GitBranch, Trash2 } from "lucide-react";

// Shape returned by getConnectedRepositories(). Matches the actual return
// type — note there's no separate `owner` field; `fullName` already
// contains "owner/repo" combined.
interface ConnectedRepository {
  id: string;
  name: string;
  fullName: string;
  url: string;
  createdAt: string | Date;
}

function formatConnectedDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function RepositoryList() {
  const queryClient = useQueryClient();

  const [disconnectAllOpen, setDisconnectAllOpen] = useState(false);
  const [pendingDisconnectId, setPendingDisconnectId] = useState<string | null>(
    null,
  );

  const { data: repositories, isLoading } = useQuery({
    queryKey: ["connected-repositories"],
    queryFn: async () => await getConnectedRepositories(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const disconnectMutation = useMutation({
    mutationFn: async (repositoryId: string) => {
      return await disconnectRepository(repositoryId);
    },
    onSuccess: (result) => {
      if (result?.success) {
        queryClient.invalidateQueries({
          queryKey: ["connected-repositories"],
        });
        queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
        toast.success("Repository disconnected successfully!");
      } else {
        toast.error(result?.error || "Failed to disconnect repository!");
      }
      setPendingDisconnectId(null);
    },
    onError: () => {
      toast.error("Failed to disconnect repository!");
      setPendingDisconnectId(null);
    },
  });

  const disconnectAllMutation = useMutation({
    mutationFn: async () => {
      return await disconnectAllRepositories();
    },
    onSuccess: (result) => {
      if (result?.success) {
        queryClient.invalidateQueries({
          queryKey: ["connected-repositories"],
        });
        queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
        toast.success(`Disconnected ${result.count} repositories`);
        setDisconnectAllOpen(false);
      } else {
        toast.error(result?.error || "Failed to disconnect all repositories");
      }
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connected Repositories</CardTitle>
          <CardDescription>
            Manage your connected github repositories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-16 bg-muted rounded-lg" />
            <div className="h-16 bg-muted rounded-lg" />
            <div className="h-16 bg-muted rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Connected Repositories</CardTitle>
            <CardDescription>
              Manage your connected github repositories
            </CardDescription>
          </div>
          {repositories && repositories.length > 0 && (
            <AlertDialog
              open={disconnectAllOpen}
              onOpenChange={setDisconnectAllOpen}
            >
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Disconnect All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Disconnect All Repositories?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will disconnect all {repositories.length} repositories
                    and delete all the associated AI reviews. This action cannot
                    be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => disconnectAllMutation.mutate()}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={disconnectAllMutation.isPending}
                  >
                    {disconnectAllMutation.isPending
                      ? "Disconnecting..."
                      : "Disconnect All"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {!repositories || repositories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No repositories connected yet.</p>
            <p className="text-sm mt-2">
              Connect repositories from the Repository page.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {repositories.map((repo: ConnectedRepository) => (
              <div
                key={repo.id}
                className="group flex items-center justify-between gap-4 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:bg-accent/40"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0">
                    <GitBranch className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">
                        {repo.fullName}
                      </p>
                      <a
                        href={repo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                        aria-label={`Open ${repo.fullName} on GitHub`}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Connected {formatConnectedDate(repo.createdAt)}
                    </p>
                  </div>
                </div>

                <AlertDialog
                  open={pendingDisconnectId === repo.id}
                  onOpenChange={(open) =>
                    setPendingDisconnectId(open ? repo.id : null)
                  }
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity hover:text-destructive hover:bg-destructive/10 shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Disconnect {repo.name}?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This will stop AI reviews on this repository and delete
                        its associated review history. This action cannot be
                        undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => disconnectMutation.mutate(repo.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        disabled={disconnectMutation.isPending}
                      >
                        {disconnectMutation.isPending
                          ? "Disconnecting..."
                          : "Disconnect"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
