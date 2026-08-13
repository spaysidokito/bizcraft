import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="student-bg flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-xl border border-white/30 bg-white/95 backdrop-blur-sm p-6 shadow-xl"
        >
          <div className="flex flex-col items-center text-center pb-2">
            <BizCraftLogo className="h-28" />
            <h1 className="mt-2 font-display text-xl font-bold text-foreground">Welcome to BizCraft</h1>
          </div>

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
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="pr-10"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </div>
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
            <div />
            <Link to="/register" className="text-muted-foreground hover:underline">
              Create an account
            </Link>
          </div>
        </form>


        

        <p className="mt-4 text-center text-sm">
          <Link to="/admin-login" className="text-white/40 hover:text-white/60 text-xs">
            Administrator login
          </Link>
        </p>
      </div>
    </div>
  );
}
