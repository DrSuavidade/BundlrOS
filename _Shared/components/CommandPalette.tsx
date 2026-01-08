import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Command,
  Navigation,
  Zap,
  FilePlus,
  Users,
  LayoutDashboard,
  Inbox,
  CreditCard,
} from "lucide-react";

export interface CommandItem {
  id: string;
  title: string;
  category: string;
  icon: React.ReactNode;
  shortcut?: string;
  onSelect: () => void;
}

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
}) => {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands: CommandItem[] = [
    {
      id: "nav-inbox",
      title: "Go to Unified Inbox",
      category: "Navigation",
      icon: <Inbox className="w-4 h-4" />,
      onSelect: () => {
        window.location.href = "/5-Unified Inbox/index.html";
      },
    },
    {
      id: "nav-clients",
      title: "Go to Client 360",
      category: "Navigation",
      icon: <Users className="w-4 h-4" />,
      onSelect: () => {
        window.location.href = "/6-Client 360/index.html";
      },
    },
    {
      id: "nav-budgets",
      title: "Go to Budgets",
      category: "Navigation",
      icon: <CreditCard className="w-4 h-4" />,
      onSelect: () => {
        window.location.href = "/13-Bundlr Budgets/index.html";
      },
    },
    {
      id: "act-new-intake",
      title: "New Client Intake",
      category: "Actions",
      icon: <Zap className="w-4 h-4" />,
      onSelect: () => {
        console.log("New intake");
        onClose();
      },
    },
    {
      id: "act-create-budget",
      title: "Create New Budget",
      category: "Actions",
      icon: <FilePlus className="w-4 h-4" />,
      onSelect: () => {
        window.location.href = "/13-Bundlr Budgets/index.html";
      },
    },
  ];

  const filteredCommands = commands.filter(
    (cmd) =>
      cmd.title.toLowerCase().includes(search.toLowerCase()) ||
      cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % filteredCommands.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(
          (i) => (i - 1 + filteredCommands.length) % filteredCommands.length
        );
      } else if (e.key === "Enter") {
        filteredCommands[selectedIndex]?.onSelect();
      }
    },
    [isOpen, onClose, filteredCommands, selectedIndex]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Palette */}
      <div className="relative w-full max-w-[640px] bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl shadow-2xl overflow-hidden focus-within:ring-1 focus-within:ring-[var(--color-accent-primary)] transition-all">
        {/* Search Input */}
        <div className="flex items-center px-4 py-4 border-b border-[var(--color-border-subtle)]">
          <Search className="w-5 h-5 text-[var(--color-text-tertiary)]" />
          <input
            autoFocus
            type="text"
            placeholder="Search or type a command..."
            className="flex-1 ml-3 bg-transparent border-none text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] outline-none text-base"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <kbd className="px-1.5 py-0.5 rounded border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] text-[10px] text-[var(--color-text-tertiary)] font-mono">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto py-2">
          {filteredCommands.length === 0 ? (
            <div className="px-4 py-8 text-center text-[var(--color-text-tertiary)] text-sm">
              No results found for "{search}"
            </div>
          ) : (
            <div className="px-2">
              {/* Grouping could be added here */}
              {filteredCommands.map((cmd, idx) => (
                <div
                  key={cmd.id}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-colors ${
                    idx === selectedIndex
                      ? "bg-[var(--color-accent-subtle)] text-[var(--color-text-primary)]"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
                  }`}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={cmd.onSelect}
                >
                  <div
                    className={`p-2 rounded-md ${
                      idx === selectedIndex
                        ? "bg-[var(--color-accent-primary)] text-white"
                        : "bg-[var(--color-bg-elevated)]"
                    }`}
                  >
                    {cmd.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{cmd.title}</p>
                    <p className="text-[10px] opacity-60 uppercase tracking-wider font-bold">
                      {cmd.category}
                    </p>
                  </div>
                  {cmd.shortcut && (
                    <kbd className="hidden sm:block px-1.5 py-0.5 rounded bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-[10px] text-[var(--color-text-tertiary)] font-mono">
                      {cmd.shortcut}
                    </kbd>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-[var(--color-bg-subtle)] border-t border-[var(--color-border-subtle)] flex items-center justify-between text-[10px] text-[var(--color-text-tertiary)]">
          <div className="flex gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1 rounded bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
                ↵
              </kbd>
              to select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 rounded bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
                ↓↑
              </kbd>
              to navigate
            </span>
          </div>
          <div className="font-medium">BundlrOS Command Center</div>
        </div>
      </div>
    </div>
  );
};
