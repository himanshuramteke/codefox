"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getUserProfile, updateUserProfile } from "../actions";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, User } from "lucide-react";

export default function ProfileForm() {
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const { data: profile, isLoading } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => await getUserProfile(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setEmail(profile.email || "");
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: async (data: { name: string; email: string }) => {
      return await updateUserProfile(data);
    },
    onSuccess: (result) => {
      if (result?.success) {
        queryClient.invalidateQueries({ queryKey: ["user-profile"] });
        toast.success("Profile updated");
      } else {
        toast.error(result?.error || "Failed to update profile");
      }
    },
    onError: () => {
      toast.error("Failed to update profile");
    },
  });

  const isDirty =
    !!profile &&
    (name !== (profile.name || "") || email !== (profile.email || ""));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({ name, email });
  };

  const initials =
    name
      .trim()
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile settings</CardTitle>
          <CardDescription>Update your profile information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-muted" />
              <div className="space-y-2">
                <div className="h-3 w-32 bg-muted rounded" />
                <div className="h-3 w-44 bg-muted rounded" />
              </div>
            </div>
            <div className="h-10 bg-muted rounded" />
            <div className="h-10 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile settings</CardTitle>
        <CardDescription>Update your name and email address</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identity header — avatar reflects the name field live */}
          <div className="flex items-center gap-4 rounded-lg border border-border bg-muted/30 px-4 py-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {initials === "?" ? <User className="h-5 w-5" /> : initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {name || "Your name"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {email || "you@example.com"}
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                placeholder="Alex Morrow"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={updateMutation.isPending}
                autoComplete="name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={updateMutation.isPending}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 border-t border-border pt-5">
            <Button
              type="submit"
              disabled={updateMutation.isPending || !isDirty}
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : updateMutation.isSuccess && !isDirty ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Saved
                </>
              ) : (
                "Save changes"
              )}
            </Button>

            {isDirty && !updateMutation.isPending && (
              <span className="text-xs text-muted-foreground">
                You have unsaved changes
              </span>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
