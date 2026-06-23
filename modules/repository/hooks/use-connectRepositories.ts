"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";
import { connectRepository } from "../actions";

export const useConnectRepositories = () => {
  const queryclient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      owner,
      repo,
      githubId,
    }: {
      owner: string;
      repo: string;
      githubId: number;
    }) => {
      return await connectRepository(owner, repo, githubId);
    },
    onSuccess: () => {
      toast.success("Repository connected successfully");
      queryclient.invalidateQueries({ queryKey: ["repositories"] });
    },
    onError: (error) => {
      toast.error("Failed to connect Repository");
      console.error(error);
    },
  });
};
