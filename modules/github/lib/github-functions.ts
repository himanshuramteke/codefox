import { Octokit } from "octokit";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";
import { ContributionCalendar, ContributionQueryResponse } from "../interfaces";
import { GithubRepository } from "@/modules/repository/types";

/*
get the access token of github
*/
export const getAccessToken = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const account = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      providerId: "github",
    },
  });
  if (!account?.accessToken) {
    throw new Error("No github accessToken found!");
  }

  return account.accessToken;
};

/*
fetch user contributions from github by using Octokit
*/

export const fetchUserContribution = async (
  token: string,
  username: string,
): Promise<ContributionCalendar | null> => {
  const octokit = new Octokit({ auth: token });

  const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
                color
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await octokit.graphql<ContributionQueryResponse>(query, {
      username,
    });

    const user = response.user;

    if (!user) {
      return null;
    }

    return user.contributionsCollection.contributionCalendar;
  } catch (error) {
    console.error("Error fetching User contribution data", error);
    return null;
  }
};

//get repository

export const getRepositories = async (
  page: number = 1,
  perPage: number = 10,
): Promise<GithubRepository[]> => {
  const token = await getAccessToken();
  const octokit = new Octokit({ auth: token });

  const { data } = await octokit.rest.repos.listForAuthenticatedUser({
    sort: "updated",
    direction: "desc",
    visibility: "all",
    per_page: perPage,
    page: page,
  });

  return data;
};
