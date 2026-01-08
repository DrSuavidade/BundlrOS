import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, ListTodo, Settings, Bell } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

export const Layout: React.FC<Props> = ({ children }) => {
  const location = useLocation();
  const isClientView = location.pathname.startsWith("/verify");

  if (isClientView) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-app)] flex flex-col text-[var(--color-text-primary)]">
        <header className="bg-[var(--color-bg-card)] border-b border-[var(--color-border-subtle)] py-4 px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[var(--color-accent-primary)] rounded-lg flex items-center justify-center text-white font-bold">
              Z
            </div>
            <h1 className="text-xl font-semibold tracking-tight">ZenApprove</h1>
          </div>
        </header>
        <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-4xl">
          {children}
        </main>
        <footer className="py-6 text-center text-[var(--color-text-tertiary)] text-sm">
          &copy; 2024 ZenApprove Inc. Secure Approval System.
        </footer>
      </div>
    );
  }

  return <div className="min-w-0 overflow-hidden">{children}</div>;
};

const NavLink: React.FC<{
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}> = ({ to, icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
      active
        ? "bg-indigo-50 text-indigo-700 font-medium shadow-sm"
        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
    }`}
  >
    <span
      className={
        active ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
      }
    >
      {icon}
    </span>
    <span className="hidden lg:block">{label}</span>
  </Link>
);
