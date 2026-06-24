"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { deleteWebhook } from "@/modules/github/lib/github-functions";

export const getUserProfile = async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized!");
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
    });

    return user;
  } catch (error) {
    console.error("Error fetching userProfile", error);
    return null;
  }
};

export const updateUserProfile = async (data: {
  name?: string;
  email?: string;
}) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized!");
    }

    const updateUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        name: data.name,
        email: data.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    revalidatePath("/dashboard/settings", "page");

    return {
      success: true,
      user: updateUser,
    };
  } catch (error) {
    console.error("Error updating userProfile", error);
    return { success: false, error: "Failed to update profile" };
  }
};

export const getConnectedRepositories = async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized!");
    }

    const repositories = await prisma.repository.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        name: true,
        fullName: true,
        url: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return repositories;
  } catch (error) {
    console.error("Error fetching connected repositories", error);
    return [];
  }
};

export const disconnectRepository = async (repositoryId: string) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized!");
    }

    const repository = await prisma.repository.findUnique({
      where: {
        id: repositoryId,
        userId: session.user.id,
      },
    });

    if (!repository) {
      throw new Error("Repository not found!");
    }
    await deleteWebhook(repository.owner, repository.name);

    await prisma.repository.delete({
      where: {
        id: repository.id,
        userId: session.user.id,
      },
    });

    revalidatePath("/dashboard/settings", "page");
    revalidatePath("/dashboard/repository", "page");

    return { success: true };
  } catch (error) {
    console.error("Error disconnecting repository:", error);
    return { success: false, error: "Failed to disconnect repository" };
  }
};

export const disconnectAllRepositories = async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized!");
    }

    const repositories = await prisma.repository.findMany({
      where: {
        userId: session.user.id,
      },
    });

    await Promise.all(
      repositories.map(async (repo) => {
        await deleteWebhook(repo.owner, repo.name);
      }),
    );

    //delete all repos
    const result = await prisma.repository.deleteMany({
      where: {
        userId: session.user.id,
      },
    });

    revalidatePath("/dashboard/settings", "page");
    revalidatePath("/dashboard/repository", "page");
    return { success: true, count: result.count };
  } catch (error) {
    console.error("Error in disconnecting all repositories:", error);
    return { success: false, error: "Failed to disconnect all repositories" };
  }
};
