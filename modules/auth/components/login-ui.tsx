"use client";

import { signIn } from "@/lib/auth-client";
import { ArrowRight, Code2, Sparkles } from "lucide-react";
import { useState } from "react";

function LoginUI() {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleGithubLogin = async () => {
    setIsLoading(true);
    try {
      await signIn.social({
        provider: "github",
      });
    } catch (error) {
      console.error("Login error", error);
    }
    setIsLoading(false);
  };
  return (
    <main className="min-h-screen bg-background">
      <div className="grid min-h-screen lg:grid-cols-[1.2fr_0.8fr]">
        {/* LEFT SECTION */}
        <section className="relative hidden overflow-hidden border-r border-border lg:flex">
          {/* Glow Effects */}
          <div className="absolute left-20 top-20 h-72 w-72 rounded-full bg-primary/20 blur-[120px]" />
          <div className="absolute bottom-10 right-10 h-60 w-60 rounded-full bg-primary/10 blur-[120px]" />

          <div className="relative z-10 flex flex-col justify-between p-12">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card">
                <Code2 className="h-7 w-7 text-primary" />
              </div>

              <div>
                <h2 className="text-2xl font-bold tracking-tight">CodeFox</h2>
                <p className="text-sm text-muted-foreground">
                  AI Code Review Assistant
                </p>
              </div>
            </div>

            {/* Hero */}
            <div className="max-w-xl">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                AI-powered pull request reviews
              </div>

              <h1 className="mb-6 text-6xl font-bold tracking-tight">
                Review Code
                <span className="block text-primary">Before It Ships.</span>
              </h1>

              <p className="mb-10 text-lg leading-relaxed text-muted-foreground">
                CodeFox automatically reviews pull requests, catches bugs,
                improves readability, and helps your team merge with confidence.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <FeatureCard title="Instant Reviews" />
                <FeatureCard title="Bug Detection" />
                <FeatureCard title="Security Checks" />
                <FeatureCard title="AI Suggestions" />
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Built for developers who care about code quality.
            </p>
          </div>
        </section>

        {/* RIGHT SECTION */}
        <section className="relative flex items-center justify-center p-6">
          <div className="absolute h-72 w-72 rounded-full bg-primary/10 blur-[120px]" />

          <div className="relative z-10 w-full max-w-md">
            {/* Mobile Logo */}
            <div className="mb-8 flex justify-center lg:hidden">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-card">
                  <Code2 className="h-6 w-6 text-primary" />
                </div>

                <span className="text-2xl font-bold">CodeFox</span>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card/80 p-8 backdrop-blur-xl">
              <div className="mb-8">
                <h2 className="mb-2 text-3xl font-bold">Welcome back</h2>

                <p className="text-muted-foreground">
                  Sign in with GitHub to continue to CodeFox.
                </p>
              </div>

              <button
                onClick={handleGithubLogin}
                disabled={isLoading}
                className="group flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-primary px-4 font-medium text-primary-foreground transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg className="size-5" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                </svg>

                {isLoading ? "Signing in..." : "Continue with GitHub"}

                <ArrowRight className="ml-auto h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>

              <div className="mt-8 text-center text-sm text-muted-foreground">
                By continuing, you agree to our Terms and Privacy Policy.
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function FeatureCard({ title }: { title: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card/50 p-4 backdrop-blur">
      <p className="font-medium">{title}</p>
    </div>
  );
}

export default LoginUI;
