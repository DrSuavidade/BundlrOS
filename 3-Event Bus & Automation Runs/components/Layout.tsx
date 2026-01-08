import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Activity,
  Workflow,
  Settings,
  Zap,
} from "lucide-react";

export const Layout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Overview", icon: LayoutDashboard },
    { path: "/events", label: "Event Streams", icon: Zap },
    { path: "/runs", label: "Execution Logs", icon: Activity },
    { path: "/settings", label: "Bus Config", icon: Settings },
  ];

  return (
    <div className="flex h-full bg-[var(--color-bg-app)] text-[var(--color-text-primary)]">
      {/* Module Sub-Sidebar */}
      <aside className="w-64 border-r border-[var(--color-border-subtle)] flex flex-col bg-[var(--color-bg-subtle)] hidden lg:flex">
        <div className="p-4 border-b border-[var(--color-border-subtle)]">
          <span className="text-[var(--color-text-tertiary)] text-[10px] font-bold uppercase tracking-widest">
            Event Infrastructure
          </span>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== "/" && location.pathname.startsWith(item.path));
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? "bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] border border-[var(--color-border-subtle)] shadow-sm"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text-primary)] border border-transparent"
                }`}
              >
                <item.icon
                  size={14}
                  className={
                    isActive
                      ? "text-[var(--color-accent-primary)]"
                      : "text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-secondary)]"
                  }
                />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[var(--color-border-subtle)]">
          <div className="text-[10px] text-[var(--color-text-tertiary)] font-bold uppercase tracking-tight">
            <p>
              Env: <span className="text-emerald-500">Production</span>
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto bg-[var(--color-bg-app)]">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
};
