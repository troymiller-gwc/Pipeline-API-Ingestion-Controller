import { Link, useRoute } from "wouter";
import { Database, Settings, Play, Activity, Server, FileCode } from "lucide-react";

const navItems = [
  { path: "/", label: "Source Systems", icon: Server },
  { path: "/endpoints", label: "Endpoints", icon: Database },
  { path: "/runs", label: "Runs", icon: Play },
  { path: "/scripts", label: "Scripts", icon: FileCode },
];

function NavItem({ path, label, icon: Icon }: { path: string; label: string; icon: any }) {
  const [isActive] = useRoute(path === "/" ? "/" : `${path}/:rest*`);
  const [isExact] = useRoute(path);
  const active = path === "/" ? isExact : isActive;

  return (
    <Link
      href={path}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background">
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <div>
              <h1 className="text-sm font-bold">API Ingestion</h1>
              <p className="text-xs text-muted-foreground">Control Plane</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <NavItem key={item.path} {...item} />
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
