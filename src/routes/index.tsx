import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useBizCraft } from "@/lib/bizcraft/store";
import { BizCraftLogo } from "@/components/bizcraft/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Login — BizCraft Entrepreneurship Learning" },
      {
        name: "description",
        content:
          "Sign in to BizCraft to read real entrepreneur stories, play basketball quiz challenges, and earn XP and badges.",
      },
      { property: "og:title", content: "Login — BizCraft" },
      {
        property: "og:description",
        content: "Gamified entrepreneurship learning for Grade 11 and 12 ABM students.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login, currentUser, ready } = useBizCraft();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ready && currentUser) {
      navigate({ to: currentUser.role === "admin" ? "/admin" : "/dashboard", replace: true });
    }
  }, [ready, currentUser, navigate]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = login(identifier, password);
    if (!res.ok) {
      setError(res.error ?? "Login failed.");
      return;
    }
    navigate({ to: res.role === "admin" ? "/admin" : "/dashboard" });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <BizCraftLogo />
          <h1 className="mt-4 font-display text-2xl font-bold">Welcome to BizCraft</h1>
        </div>

        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-card"
        >
          <div className="space-y-2">
            <Label htmlFor="identifier">Email or Username</Label>
            <Input
              id="identifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="you@example.com"
              autoComplete="username"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full">
            Login
          </Button>

          <div className="flex items-center justify-between text-sm">
            <Link to="/forgot-password" className="text-primary hover:underline">
              Forgot password?
            </Link>
            <Link to="/register" className="text-muted-foreground hover:underline">
              Create an account
            </Link>
          </div>
        </form>

        <div className="mt-4 rounded-xl border border-dashed border-border bg-muted/50 p-4 text-sm">
          <p className="font-semibold">Demo accounts</p>
          <p className="mt-1 text-muted-foreground">
            Student: <span className="font-mono">andrea</span> /{" "}
            <span className="font-mono">student123</span>
          </p>
          <p className="text-muted-foreground">
            Admin: <span className="font-mono">admin</span> /{" "}
            <span className="font-mono">admin123</span>
          </p>
        </div>

        <p className="mt-4 text-center text-sm">
          <Link to="/admin-login" className="text-muted-foreground hover:underline">
            Administrator login
          </Link>
        </p>
      </div>
    </div>
  );
}
