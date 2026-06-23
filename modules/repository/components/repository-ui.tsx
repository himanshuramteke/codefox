"use client";

import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ExternalLink, Search, Star } from "lucide-react";
import { useRepositories } from "@/modules/repository/hooks/use-repositories";
import { RepositoryListSkeleton } from "@/modules/repository/components/repository-skeleton";
import { RepositoryWithConnection } from "../types";

export default function RepositoryUI() {
  const [searchQuery, setSearchQuery] = useState("");
  const [localConnectingId, setLocalConnectingId] = useState<number | null>(
    null,
  );

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useRepositories();

  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        threshold: 0.1,
      },
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, fetchNextPage, isFetchingNextPage]);

  const allRepositories = data?.pages.flatMap((page) => page) || [];

  const filteredRepositories = allRepositories.filter(
    (repo) =>
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.full_name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleConnect = async (repo: RepositoryWithConnection) => {};

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Repositories</h1>
          <p className="text-muted-foreground">
            Manage and view all your Github Repoitories
          </p>
        </div>
        <RepositoryListSkeleton />
      </div>
    );
  }

  if (isError) {
    return <div>Failed to load repositories</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Repositories</h1>
        <p className="text-muted-foreground">
          Manage and view all of your Github repositories
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search repositories..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid gap-4">
        {filteredRepositories.map((repo) => (
          <Card key={repo.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{repo.name}</CardTitle>
                    <Badge variant="outline">
                      {repo.language || "Unknown"}
                    </Badge>
                    {repo.isConnected && (
                      <Badge variant="secondary">Connected</Badge>
                    )}
                  </div>
                  <CardDescription>{repo.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" asChild>
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button
                    onClick={() => handleConnect(repo)}
                    disabled={localConnectingId === repo.id || repo.isConnected}
                    variant={repo.isConnected ? "outline" : "default"}
                  >
                    {localConnectingId === repo.id
                      ? "Connecting..."
                      : repo.isConnected
                        ? "Connected"
                        : "Connect"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5" />
                  <span>{repo.stargazers_count.toLocaleString()}</span>
                </div>

                {repo.topics && repo.topics.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {repo.topics.slice(0, 5).map((topic) => (
                      <Badge
                        key={topic}
                        variant="outline"
                        className="text-xs font-normal"
                      >
                        {topic}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div ref={observerTarget} className="py-4">
        {isFetchingNextPage && <RepositoryListSkeleton />}
        {!hasNextPage && allRepositories.length > 0 && (
          <p className="text-center text-muted-foreground">
            No more Repositories
          </p>
        )}
      </div>
    </div>
  );
}
