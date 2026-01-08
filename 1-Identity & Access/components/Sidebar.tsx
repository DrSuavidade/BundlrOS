import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCircle,
  LogOut,
  Layers,
  ShieldCheck,
} from "lucide-react";
import { Role } from "../types";

interface SidebarProps {
  currentUserRole: Role;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUserRole,
  onLogout,
}) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  const linkClass = ({ isActive }: { isActive: boolean }) => `
    flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-medium transition-all
    ${
      isActive
        ? "bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] border border-[var(--color-border-subtle)] shadow-sm"
        : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle)]"
    }
  `;

  return (
    <aside className="w-64 h-full bg-[var(--color-bg-subtle)] border-r border-[var(--color-border-subtle)] flex flex-col hidden lg:flex">
      <div className="p-4 border-b border-[var(--color-border-subtle)]">
        <span className="text-[var(--color-text-tertiary)] text-[10px] font-bold uppercase tracking-widest">
          IAM Context
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        <NavLink to="/dashboard" className={linkClass}>
          <LayoutDashboard size={14} />
          <span>IAM Dashboard</span>
        </NavLink>

        {currentUserRole === Role.ADMIN && (
          <NavLink to="/users" className={linkClass}>
            <Users size={14} />
            <span>User Directory</span>
          </NavLink>
        )}

        {currentUserRole === Role.ADMIN && (
          <NavLink to="/audit" className={linkClass}>
            <ShieldCheck size={14} />
            <span>Security Logs</span>
          </NavLink>
        )}

        <NavLink to="/me" className={linkClass}>
          <UserCircle size={14} />
          <span>My Identity</span>
        </NavLink>
      </nav>

      <div className="p-4 border-t border-[var(--color-border-subtle)]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 w-full rounded-lg text-[var(--color-text-tertiary)] hover:text-[var(--color-status-danger)] hover:bg-[var(--color-status-danger)]/10 transition-colors text-left text-xs font-medium"
        >
          <LogOut size={14} />
          <span>Terminate Session</span>
        </button>
      </div>
    </aside>
  );
};
