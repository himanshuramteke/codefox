import { Octokit } from "octokit";

export type GithubRepository = Awaited<
  ReturnType<Octokit["rest"]["repos"]["listForAuthenticatedUser"]>
>["data"][number];

export interface RepositoryWithConnection extends GithubRepository {
  isConnected: boolean;
}
