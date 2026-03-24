import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Layers,
  Database,
  Play,
  Grid3X3,
  Plug,
  HelpCircle,
  Hammer,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { path: "/", label: "Overview", icon: LayoutDashboard },
  { path: "/architecture", label: "Architecture", icon: Layers },
  { path: "/data-model", label: "Data Model", icon: Database },
  { path: "/execution-flow", label: "Execution Flow", icon: Play },
  { path: "/features", label: "Features", icon: Grid3X3 },
  { path: "/connectors", label: "Connectors", icon: Plug },
  { path: "/open-questions", label: "Open Questions", icon: HelpCircle },
  { path: "/build-steps", label: "Build Steps", icon: Hammer },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Database className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-sm font-bold leading-tight">API Ingestion Control Plane</h1>
                <p className="text-[10px] text-muted-foreground">Design Specification</p>
              </div>
            </div>
            <button
              className="md:hidden p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          <nav className={cn(
            "w-56 shrink-0 py-6 space-y-1",
            "hidden md:block",
          )}>
            {navItems.map((item) => {
              const isActive = location === item.path;
              return (
                <Link key={item.path} href={item.path}>
                  <div
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer",
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </div>
                </Link>
              );
            })}
          </nav>

          {mobileOpen && (
            <div className="fixed inset-0 z-40 md:hidden">
              <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
              <nav className="fixed left-0 top-14 bottom-0 w-64 bg-background border-r p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  const isActive = location === item.path;
                  return (
                    <Link key={item.path} href={item.path}>
                      <div
                        className={cn(
                          "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer",
                          isActive
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                        onClick={() => setMobileOpen(false)}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {item.label}
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}

          <main className="flex-1 py-6 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
