"use server";

import {
  fetchUserContribution,
  getAccessToken,
} from "@/modules/github/lib/github-functions";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Octokit } from "octokit";
import prisma from "@/lib/db";
import {
  ContributionCalendar,
  ContributionDay,
  ContributionWeek,
} from "@/modules/github/interfaces";

type PullRequestSearchItem = Awaited<
  ReturnType<Octokit["rest"]["search"]["issuesAndPullRequests"]>
>["data"]["items"][number];

export async function getDashboardStats() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const token = await getAccessToken();
    const octokit = new Octokit({ auth: token });

    //get users github username
    const { data: user } = await octokit.rest.users.getAuthenticated();

    //TODO: Fetch total connected repos from DB;
    const totalRepos = 30; //hardcoded

    const calendar: ContributionCalendar | null = await fetchUserContribution(
      token,
      user.login,
    );
    const totalCommits = calendar?.totalContributions || 0;

    //count PRs from the DB or github
    const { data: prs } = await octokit.rest.search.issuesAndPullRequests({
      q: `author:${user.login} type:pr`,
      per_page: 1,
    });

    const totalPRs = prs.total_count;

    //TODO: count AI reviews from DB
    const totalReviews = 45;

    return {
      totalCommits,
      totalPRs,
      totalRepos,
      totalReviews,
    };
  } catch (error) {
    console.error("Error fetching Dashboard stats", error);
    return {
      totalCommits: 0,
      totalPRs: 0,
      totalRepos: 0,
      totalReviews: 0,
    };
  }
}

export async function getMonthlyActivity() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const token = await getAccessToken();
    const octokit = new Octokit({ auth: token });

    //get users github username
    const { data: user } = await octokit.rest.users.getAuthenticated();

    const calendar: ContributionCalendar | null = await fetchUserContribution(
      token,
      user.login,
    );
    if (!calendar) {
      return [];
    }

    const monthlyData: {
      [key: string]: { commits: number; prs: number; reviews: number };
    } = {};

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = monthNames[date.getMonth()];
      monthlyData[monthKey] = { commits: 0, prs: 0, reviews: 0 };
    }

    calendar.weeks.forEach((week: ContributionWeek) => {
      week.contributionDays.forEach((day: ContributionDay) => {
        const date = new Date(day.date);
        const monthKey = monthNames[date.getMonth()];
        if (monthlyData[monthKey]) {
          monthlyData[monthKey].commits += day.contributionCount;
        }
      });
    });

    //fetch review from DB for last 6months;
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    //TODO: REVIEWS REAL DATA;
    const generateSampleReviews = () => {
      const sampleReviews = [];
      const now = new Date();

      // Generate random reviews over the past 6 months
      for (let i = 0; i < 45; i++) {
        const randomDaysAgo = Math.floor(Math.random() * 180); // Random day in last 6 months
        const reviewDate = new Date(now);
        reviewDate.setDate(reviewDate.getDate() - randomDaysAgo);

        sampleReviews.push({
          createdAt: reviewDate,
        });
      }

      return sampleReviews;
    };

    const reviews = generateSampleReviews();

    reviews.forEach((review) => {
      const monthKey = monthNames[review.createdAt.getMonth()];
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].reviews += 1;
      }
    });

    const { data: prs } = await octokit.rest.search.issuesAndPullRequests({
      q: `author:${user.login} type:pr created:>${
        sixMonthsAgo.toISOString().split("T")[0]
      }`,
      per_page: 100,
    });

    prs.items.forEach((pr: PullRequestSearchItem) => {
      const date = new Date(pr.created_at);
      const monthKey = monthNames[date.getMonth()];
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].prs += 1;
      }
    });

    return Object.keys(monthlyData).map((name) => ({
      name,
      ...monthlyData[name],
    }));
  } catch (error) {
    console.error("Error fetching monthly activity:", error);
    return [];
  }
}
