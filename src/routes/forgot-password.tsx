import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BizCraftLogo } from "@/components/bizcraft/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot Password — BizCraft" },
      {
        name: "description",
        content: "Request a BizCraft password reset link from your ABM subject teacher.",
      },
      { property: "og:title", content: "Forgot Password — BizCraft" },
      { property: "og:description", content: "Reset your BizCraft student account password." },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <BizCraftLogo />
          <h1 className="mt-4 font-display text-2xl font-bold">Forgot your password?</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter your school email and we will send reset instructions.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-card">
          {sent ? (
            <div className="space-y-4 text-center">
              <p className="rounded-md bg-success-soft px-3 py-3 text-sm text-success">
                If <span className="font-medium">{email}</span> is registered, reset instructions
                have been sent. Please contact your ABM teacher if you do not receive them.
              </p>
              <Button asChild className="w-full">
                <Link to="/">Back to login</Link>
              </Button>
            </div>
          ) : (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="email">School Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Send reset link
              </Button>
              <p className="text-center text-sm">
                <Link to="/" className="text-primary hover:underline">
                  Back to login
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
