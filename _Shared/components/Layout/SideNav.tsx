import React from "react";
import { NavLink } from "react-router-dom";
import {
  Inbox,
  LayoutGrid,
  Users,
  FileText,
  CheckSquare,
  BarChart2,
  CreditCard,
  Settings,
  ShieldCheck,
  Zap,
  Activity,
  Server,
  Key,
} from "lucide-react";

export const SideNav: React.FC = () => {
  const navItems = [
    { label: "Inbox", icon: <Inbox size={18} />, to: "/inbox" },
    { label: "Core Data", icon: <LayoutGrid size={18} />, to: "/core" },
    { label: "Client 360", icon: <Users size={18} />, to: "/clients" },
    { label: "Factories", icon: <Server size={18} />, to: "/factories" },
    { label: "Approvals", icon: <CheckSquare size={18} />, to: "/approvals" },
    { label: "QA Gates", icon: <ShieldCheck size={18} />, to: "/qa" },
    { label: "Reporting", icon: <BarChart2 size={18} />, to: "/reporting" },
    { label: "Budgets", icon: <CreditCard size={18} />, to: "/budgets" },
    { label: "Events", icon: <Zap size={18} />, to: "/events" },
    { label: "Capacity", icon: <Activity size={18} />, to: "/capacity" },
    { label: "Admin", icon: <Key size={18} />, to: "/admin" },
  ];

  return (
    <aside className="w-60 border-r border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] h-full fixed top-12 left-0 pt-4 pb-4 flex flex-col justify-between hidden md:flex">
      <nav className="flex flex-col gap-1 px-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? "bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] font-medium shadow-sm"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)]"
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-2 mt-auto pt-4 border-t border-[var(--color-border-subtle)]">
        <NavLink
          to="/identity"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
              isActive
                ? "bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] font-medium"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)]"
            }`
          }
        >
          <Settings size={18} />
          Account
        </NavLink>
      </div>
    </aside>
  );
};
