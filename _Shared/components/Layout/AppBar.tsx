import React from "react";
import { Bell, Command, Menu, Search, User } from "lucide-react";
import { Button } from "../Button";
import styles from "./AppShell.module.css";

export interface AppBarProps {
  title?: string;
  onMenuClick?: () => void;
  onCommandClick?: () => void;
}

export const AppBar: React.FC<AppBarProps> = ({
  title = "BundlrOS",
  onMenuClick,
  onCommandClick,
}) => {
  return (
    <header className={styles.appBar}>
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuClick}
          className="!px-2"
        >
          <Menu className="w-5 h-5" />
        </Button>

        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-[var(--color-accent-primary)] flex items-center justify-center text-xs font-bold text-white">
            B
          </div>
          <span className="font-semibold text-[var(--font-size-sm)] tracking-tight text-[var(--color-text-primary)]">
            {title}
          </span>
        </div>
      </div>

      <button
        onClick={onCommandClick}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-[var(--color-bg-subtle)] border border-[var(--color-border-subtle)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] hover:border-[var(--color-border-default)] transition-all w-64"
      >
        <Search className="w-3.5 h-3.5" />
        <span className="text-xs">Search or type command...</span>
        <div className="ml-auto flex items-center gap-1">
          <kbd className="hidden sm:inline-block border border-[var(--color-border-subtle)] rounded px-1.5 text-[10px] font-mono text-[var(--color-text-tertiary)]">
            ⌘ K
          </kbd>
        </div>
      </button>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="!px-2">
          <Bell className="w-4 h-4 text-[var(--color-text-secondary)]" />
        </Button>
        <div className="w-6 h-6 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] flex items-center justify-center overflow-hidden">
          <User className="w-3.5 h-3.5 text-[var(--color-text-secondary)]" />
        </div>
      </div>
    </header>
  );
};
