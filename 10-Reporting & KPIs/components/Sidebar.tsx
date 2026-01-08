import React from "react";
import { LayoutDashboard, FileText, Settings, BarChart3 } from "lucide-react";
import { ViewState } from "../types";

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView }) => {
  const navItemClass = (isActive: boolean) =>
    `flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
      isActive
        ? "bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] shadow-sm border border-[var(--color-border-subtle)]"
        : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle)]"
    }`;

  return (
    <div className="w-64 h-full flex flex-col border-r border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] hidden lg:flex">
      <div className="p-4 border-b border-[var(--color-border-subtle)]">
        <span className="text-[var(--color-text-tertiary)] text-[10px] font-bold uppercase tracking-widest">
          Reporting Scope
        </span>
      </div>

      <nav className="flex-1 px-2 space-y-1 mt-4">
        <div
          onClick={() => onChangeView("DASHBOARD")}
          className={navItemClass(currentView === "DASHBOARD")}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>KPI Overview</span>
        </div>
        <div
          onClick={() => onChangeView("REPORTS")}
          className={navItemClass(
            currentView === "REPORTS" || currentView === "REPORT_DETAIL"
          )}
        >
          <FileText className="w-4 h-4" />
          <span>Analytic Reports</span>
        </div>
      </nav>

      <div className="p-4 border-t border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-3 px-4 py-2 text-[var(--color-text-tertiary)] text-xs hover:text-[var(--color-text-primary)] cursor-pointer">
          <Settings className="w-4 h-4" />
          <span>Report Settings</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
