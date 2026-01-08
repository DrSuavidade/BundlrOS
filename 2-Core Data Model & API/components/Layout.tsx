import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  FileText,
  Briefcase,
  Layers,
  Activity,
  Search,
  Bell,
  Settings,
  Command,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { MockAPI } from "../services/mockBackend";

interface LayoutProps {
  children: React.ReactNode;
}

const NavItem = ({ to, icon: Icon, label, active }: any) => (
  <Link
    to={to}
    className={`
      flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all
      ${
        active
          ? "bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] border border-[var(--color-border-subtle)] shadow-sm"
          : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle)]"
      }
    `}
  >
    <Icon
      size={14}
      className={
        active
          ? "text-[var(--color-accent-primary)]"
          : "text-[var(--color-text-tertiary)]"
      }
    />
    {label}
  </Link>
);

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="flex h-full bg-[var(--color-bg-app)] text-[var(--color-text-primary)]">
      {/* Module Sub-Sidebar */}
      <aside className="w-64 border-r border-[var(--color-border-subtle)] flex flex-col bg-[var(--color-bg-subtle)] hidden lg:flex">
        <div className="p-4 border-b border-[var(--color-border-subtle)]">
          <span className="text-[var(--color-text-tertiary)] text-[10px] font-bold uppercase tracking-widest">
            Entity Explorer
          </span>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          <div className="px-3 mb-2 text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider">
            Platform Models
          </div>
          <NavItem
            to="/"
            icon={LayoutDashboard}
            label="Global Dashboard"
            active={location.pathname === "/"}
          />
          <NavItem
            to="/clients"
            icon={Users}
            label="Client Registry"
            active={location.pathname === "/clients"}
          />
          <NavItem
            to="/contracts"
            icon={FileText}
            label="SLA Contracts"
            active={location.pathname === "/contracts"}
          />
          <NavItem
            to="/projects"
            icon={Briefcase}
            label="Project Hub"
            active={location.pathname === "/projects"}
          />

          <div className="px-3 mt-8 mb-2 text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider">
            Atomic Units
          </div>
          <NavItem
            to="/deliverables"
            icon={Layers}
            label="Deliverable Bank"
            active={location.pathname === "/deliverables"}
          />
        </div>

        <div className="p-4 border-t border-[var(--color-border-subtle)]">
          <div className="flex items-center gap-3 text-[var(--color-text-tertiary)] text-xs">
            <div className="w-8 h-8 rounded-full bg-[var(--color-bg-subtle)] border border-[var(--color-border-subtle)] flex items-center justify-center">
              <span className="font-bold text-[var(--color-text-primary)]">
                AD
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[var(--color-text-primary)] font-bold text-[10px]">
                Admin Operator
              </span>
              <span className="text-[10px] opacity-70">Core Access</span>
            </div>
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
