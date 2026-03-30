import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  BarChart2,
  Bell,
  Globe,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  Target,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/investments", label: "Investments", icon: TrendingUp },
  { path: "/analysis", label: "Analysis", icon: BarChart2 },
  { path: "/goals", label: "Goals", icon: Target },
  { path: "/markets", label: "Markets", icon: Globe },
];

export default function Layout() {
  const { login, clear, isLoginSuccess } = useInternetIdentity();
  const router = useRouterState();
  const currentPath = router.location.pathname;

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className="w-60 flex-shrink-0 flex flex-col h-full"
        style={{
          background: "linear-gradient(180deg, #0B1F33 0%, #153B5F 100%)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ background: "oklch(0.52 0.19 255)" }}
          >
            PH
          </div>
          <span className="text-white font-semibold text-base">
            Portfolio Hub
          </span>
        </div>

        {/* Nav */}
        <nav
          className="flex-1 px-3 py-4 space-y-0.5"
          aria-label="Main navigation"
        >
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              data-ocid={`nav.${label.toLowerCase()}.link`}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                isActive(path)
                  ? "bg-sidebar-accent text-white"
                  : "text-sidebar-muted hover:bg-sidebar-accent/60 hover:text-white",
              )}
            >
              <Icon className="w-4.5 h-4.5 flex-shrink-0" size={18} />
              {label}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 pb-4 border-t border-sidebar-border pt-4 space-y-0.5">
          <button
            type="button"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-sidebar-muted hover:bg-sidebar-accent/60 hover:text-white transition-colors"
            data-ocid="nav.settings.link"
          >
            <Settings size={18} />
            Settings
          </button>
          {isLoginSuccess ? (
            <button
              type="button"
              onClick={() => clear()}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-sidebar-muted hover:bg-sidebar-accent/60 hover:text-white transition-colors"
              data-ocid="nav.logout.button"
            >
              <LogOut size={18} />
              Logout
            </button>
          ) : (
            <button
              type="button"
              onClick={() => login()}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-sidebar-muted hover:bg-sidebar-accent/60 hover:text-white transition-colors"
              data-ocid="nav.login.button"
            >
              <LogOut size={18} className="rotate-180" />
              Login
            </button>
          )}
          <p
            className="text-xs px-3 pt-2"
            style={{ color: "oklch(0.50 0.03 240)" }}
          >
            © {new Date().getFullYear()} Portfolio Hub
          </p>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-card border-b border-border px-6 py-3 flex items-center gap-4 flex-shrink-0">
          <div className="flex-1 max-w-xs relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={15}
            />
            <Input
              placeholder="Search..."
              className="pl-9 h-8 bg-background text-sm rounded-full border-border"
              data-ocid="topbar.search_input"
            />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
              data-ocid="topbar.help.button"
            >
              <HelpCircle size={17} />
            </button>
            <button
              type="button"
              className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
              data-ocid="topbar.notifications.button"
            >
              <Bell size={17} />
            </button>
            <div className="flex items-center gap-2 ml-1">
              <span className="text-sm font-medium text-foreground">
                Sarah J.
              </span>
              <Avatar className="w-8 h-8">
                <AvatarFallback
                  className="text-xs font-semibold text-white"
                  style={{ background: "oklch(0.52 0.19 255)" }}
                >
                  SJ
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
