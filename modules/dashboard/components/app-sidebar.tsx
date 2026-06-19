"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { signOut, useSession } from "@/lib/auth-client";
import { GithubIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  BookOpen,
  ChevronUp,
  CreditCard,
  GitPullRequest,
  Loader2,
  LogOut,
  Moon,
  Settings,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    exact: true,
    renderIcon: (className: string) => <BookOpen className={className} />,
  },
  {
    title: "Repository",
    url: "/dashboard/repository",
    renderIcon: (className: string) => (
      <HugeiconsIcon icon={GithubIcon} className={className} />
    ),
  },
  {
    title: "Reviews",
    url: "/dashboard/reviews",
    renderIcon: (className: string) => <GitPullRequest className={className} />,
  },
  {
    title: "Subscription",
    url: "/dashboard/subscription",
    renderIcon: (className: string) => <CreditCard className={className} />,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    renderIcon: (className: string) => <Settings className={className} />,
  },
];

const AppSidebar = () => {
  const { theme, setTheme } = useTheme();
  const [signingOut, setSigningOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const { data: session, isPending } = useSession();

  if (isPending || !session) return null;

  const user = session.user;
  const userName = user.name || "Guest";
  const userEmail = user.email || "";
  const userAvatar = user.image || "";

  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const isActive = (url: string, exact?: boolean) => {
    if (exact) return pathname === url;
    return pathname === url || pathname.startsWith(url + "/");
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      router.push("/login");
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <Sidebar className="border-r border-sidebar-border">
      {/* HEADER */}
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="p-4">
          <div className="flex items-center gap-4 rounded-xl bg-sidebar-accent/60 p-3 transition-colors hover:bg-sidebar-accent">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <HugeiconsIcon icon={GithubIcon} className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Connected Account</p>
              <p className="wrap-break-word text-sm font-medium leading-snug">
                @{userName}
              </p>
            </div>
          </div>
        </div>
      </SidebarHeader>

      {/* NAVIGATION */}
      <SidebarContent className="p-3">
        <SidebarMenu>
          {navigationItems.map((item) => {
            const active = isActive(item.url, item.exact);

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={active}
                  className="h-11 rounded-xl"
                >
                  <Link href={item.url}>
                    {item.renderIcon("h-4 w-4")}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* FOOTER */}
      <SidebarFooter className="border-t border-sidebar-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-xl border border-border bg-sidebar-accent/40 p-2 transition-colors hover:bg-sidebar-accent">
              {userAvatar ? (
                <Image
                  src={userAvatar}
                  alt={userName}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  {userInitials}
                </div>
              )}

              <div className="flex-1 text-left min-w-0">
                <p className="truncate text-sm font-medium">{userName}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {userEmail}
                </p>
              </div>

              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>

          {/* align="start" — keeps the menu inside the sidebar's width
              instead of overflowing past the right edge */}
          <DropdownMenuContent side="top" align="start" className="w-64">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{userName}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {userEmail}
                </span>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <>
                  <Sun className="mr-2 h-4 w-4" />
                  Light Mode
                </>
              ) : (
                <>
                  <Moon className="mr-2 h-4 w-4" />
                  Dark Mode
                </>
              )}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleSignOut}
              disabled={signingOut}
              className="text-destructive focus:text-destructive"
            >
              {signingOut ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="mr-2 h-4 w-4" />
              )}
              {signingOut ? "Signing out…" : "Sign Out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
