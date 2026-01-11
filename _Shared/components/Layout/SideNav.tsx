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
import styles from "./AppShell.module.css";

interface SideNavProps {
  isOpen?: boolean;
}

export const SideNav: React.FC<SideNavProps> = ({ isOpen = true }) => {
  const navGroups = [
    {
      title: "Sales & Clients",
      items: [
        { label: "Inbox", icon: <Inbox size={18} />, to: "/inbox" },
        { label: "Client 360", icon: <Users size={18} />, to: "/clients" },
        { label: "Budgets", icon: <CreditCard size={18} />, to: "/budgets" },
      ],
    },
    {
      title: "Strategy",
      items: [
        { label: "Core Data", icon: <LayoutGrid size={18} />, to: "/core" },
        { label: "Capacity", icon: <Activity size={18} />, to: "/capacity" },
      ],
    },
    {
      title: "Production",
      items: [
        { label: "Factories", icon: <Server size={18} />, to: "/factories" },
        { label: "Assets", icon: <FileText size={18} />, to: "/assets" },
        { label: "Events", icon: <Zap size={18} />, to: "/events" },
      ],
    },
    {
      title: "Delivery",
      items: [
        {
          label: "Approvals",
          icon: <CheckSquare size={18} />,
          to: "/approvals",
        },
        { label: "QA Gates", icon: <ShieldCheck size={18} />, to: "/qa" },
      ],
    },
    {
      title: "Management",
      items: [
        { label: "Reporting", icon: <BarChart2 size={18} />, to: "/reporting" },
        { label: "Admin", icon: <Key size={18} />, to: "/admin" },
      ],
    },
  ];

  return (
    <aside
      className={`${styles.sideNav} ${
        isOpen ? styles.sideNavOpen : styles.sideNavClosed
      }`}
    >
      <nav className="flex flex-col gap-4 px-2 overflow-y-auto py-2">
        {navGroups.map((group) => (
          <div key={group.title} className="flex flex-col gap-1">
            <div className="px-3 mb-1 text-[10px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider opacity-80">
              {group.title}
            </div>
            {group.items.map((item) => (
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
          </div>
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
