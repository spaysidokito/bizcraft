import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  Award,
  BookOpen,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Medal,
  Menu,
  Target,
  User as UserIcon,
  Users,
  X,
} from "lucide-react";
import logoAsset from "@/assets/bizcraft-logo.png.asset.json";
import { cn } from "@/lib/utils";
import { useBizCraft } from "@/lib/bizcraft/store";
import { levelForXp } from "@/lib/bizcraft/data";
import { Button } from "@/components/ui/button";

export function BizCraftLogo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center">
      <img
        src={logoAsset.url}
        alt="BizCraft — Learn, Play, Grow"
        width={512}
        height={341}
        className={cn("w-auto object-contain", compact ? "h-8" : "h-10")}
      />
    </span>
  );
}

const studentNav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/stories", label: "Entrepreneur Stories", icon: BookOpen },
  { to: "/challenges", label: "Challenges", icon: Target },
  { to: "/achievements", label: "Achievements", icon: Medal },
  { to: "/profile", label: "Profile", icon: UserIcon },
] as const;

const adminNav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/students", label: "Students", icon: Users },
  { to: "/admin/stories", label: "Entrepreneur Stories", icon: BookOpen },
  { to: "/admin/questions", label: "Quiz Questions", icon: ClipboardList },
  { to: "/admin/badges", label: "Badges", icon: Award },
  { to: "/admin/reports", label: "Reports", icon: Medal },
] as const;

interface AppShellProps {
  role: "student" | "admin";
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function AppShell({ role, title, subtitle, actions, children }: AppShellProps) {
  const { currentUser, profile, logout, ready } = useBizCraft();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!currentUser) {
      navigate({ to: role === "admin" ? "/admin-login" : "/", replace: true });
    } else if (currentUser.role !== role) {
      navigate({ to: currentUser.role === "admin" ? "/admin" : "/dashboard", replace: true });
    }
  }, [ready, currentUser, role, navigate]);

  useEffect(() => setOpen(false), [pathname]);

  if (!ready || !currentUser || currentUser.role !== role) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">
        Loading BizCraft…
      </div>
    );
  }

  const nav = role === "admin" ? adminNav : studentNav;
  const level = levelForXp(profile?.xp ?? 0);

  const handleLogout = () => {
    logout();
    navigate({ to: "/", replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-surface transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <BizCraftLogo />
          <button
            className="text-muted-foreground lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="border-b border-border px-4 py-4">
          <p className="text-sm font-semibold">{currentUser.full_name}</p>
          <p className="text-xs text-muted-foreground">
            {role === "admin" ? "Administrator" : `${level.title} · Level ${level.level}`}
          </p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {nav.map((item) => {
            const active =
              item.to === "/admin"
                ? pathname === "/admin"
                : pathname === item.to || pathname.startsWith(`${item.to}/`);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary-soft text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
          >
            <LogOut className="size-4" />
            Logout
          </button>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-foreground/30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Main */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex min-h-16 flex-wrap items-center gap-3 border-b border-border bg-surface px-4 py-3 sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-lg font-semibold">{title}</h1>
            {subtitle && <p className="truncate text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {actions}
        </header>
        <main className="mx-auto max-w-6xl p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
