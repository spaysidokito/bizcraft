import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useBizCraft } from "@/lib/bizcraft/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin-login")({
  head: () => ({
    meta: [
      { title: "Administrator Login — BizCraft" },
      {
        name: "description",
        content:
          "BizCraft administrator sign-in for managing students, entrepreneur stories, quizzes, and badges.",
      },
      { property: "og:title", content: "Administrator Login — BizCraft" },
      { property: "og:description", content: "Manage BizCraft content and student progress." },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const { login } = useBizCraft();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = login(identifier, password);
    if (!res.ok) return setError(res.error ?? "Login failed.");
    if (res.role !== "admin") return setError("This account is not an administrator account.");
    navigate({ to: "/admin" });
  };

  return (
    <div className="student-app-bg flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-xl border border-white/30 bg-white/95 backdrop-blur-sm p-6 shadow-xl"
        >
          <div className="mb-2 flex flex-col items-center text-center">
            <span className="grid size-11 place-items-center rounded-lg bg-orange text-orange-foreground">
              <ShieldCheck className="size-6" />
            </span>
            <h1 className="mt-4 font-display text-2xl font-bold">BizCraft Administrator</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage students, stories, quizzes and badges
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-id">Email or Username</Label>
            <Input
              id="admin-id"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="admin"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-pass">Password</Label>
            <Input
              id="admin-pass"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full">
            Login as Administrator
          </Button>
          <p className="text-center text-sm">
            <Link to="/" className="text-muted-foreground hover:underline">
              Student login
            </Link>
          </p>
        </form>
      </div>
    </div>

  );
}
