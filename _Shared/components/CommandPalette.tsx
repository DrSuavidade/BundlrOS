import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Inbox,
  Users,
  CreditCard,
  Database,
  CheckSquare,
  Factory,
  BarChart3,
  Zap,
  Gauge,
  Settings2,
  Shield,
} from "lucide-react";

export interface CommandItem {
  id: string;
  title: string;
  category: string;
  icon: React.ReactNode;
  shortcut?: string;
  path: string;
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
  const navigate = useNavigate();

  const commands: CommandItem[] = [
    {
      id: "nav-inbox",
      title: "Unified Inbox",
      category: "Navigation",
      icon: <Inbox size={16} />,
      path: "/inbox",
    },
    {
      id: "nav-core",
      title: "Core Data",
      category: "Navigation",
      icon: <Database size={16} />,
      path: "/core",
    },
    {
      id: "nav-clients",
      title: "Client 360",
      category: "Navigation",
      icon: <Users size={16} />,
      path: "/clients",
    },
    {
      id: "nav-factories",
      title: "Service Factories",
      category: "Navigation",
      icon: <Factory size={16} />,
      path: "/factories",
    },
    {
      id: "nav-approvals",
      title: "Approvals",
      category: "Navigation",
      icon: <CheckSquare size={16} />,
      path: "/approvals",
    },
    {
      id: "nav-qa",
      title: "QA Gates",
      category: "Navigation",
      icon: <Shield size={16} />,
      path: "/qa",
    },
    {
      id: "nav-reporting",
      title: "Reporting & KPIs",
      category: "Navigation",
      icon: <BarChart3 size={16} />,
      path: "/reporting",
    },
    {
      id: "nav-budgets",
      title: "Bundlr Budgets",
      category: "Navigation",
      icon: <CreditCard size={16} />,
      path: "/budgets",
    },
    {
      id: "nav-events",
      title: "Event Bus",
      category: "Navigation",
      icon: <Zap size={16} />,
      path: "/events",
    },
    {
      id: "nav-capacity",
      title: "Capacity Radar",
      category: "Navigation",
      icon: <Gauge size={16} />,
      path: "/capacity",
    },
    {
      id: "nav-admin",
      title: "Admin Hub",
      category: "Navigation",
      icon: <Settings2 size={16} />,
      path: "/admin",
    },
  ];

  const filteredCommands = commands.filter(
    (cmd) =>
      cmd.title.toLowerCase().includes(search.toLowerCase()) ||
      cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (cmd: CommandItem) => {
    navigate(cmd.path);
    onClose();
    setSearch("");
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
        setSearch("");
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % filteredCommands.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(
          (i) => (i - 1 + filteredCommands.length) % filteredCommands.length
        );
      } else if (e.key === "Enter") {
        const cmd = filteredCommands[selectedIndex];
        if (cmd) handleSelect(cmd);
      }
    },
    [isOpen, onClose, filteredCommands, selectedIndex]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "15vh",
        padding: "15vh 1rem 0",
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0, 0, 0, 0.7)",
          backdropFilter: "blur(8px)",
        }}
        onClick={() => {
          onClose();
          setSearch("");
        }}
      />

      {/* Palette */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "560px",
          background: "var(--color-bg-card)",
          border: "1px solid var(--color-border-subtle)",
          borderRadius: "0.75rem",
          overflow: "hidden",
          boxShadow: "0 24px 48px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Search Input */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "1rem",
            borderBottom: "1px solid var(--color-border-subtle)",
            gap: "0.75rem",
          }}
        >
          <Search size={18} style={{ color: "var(--color-text-tertiary)" }} />
          <input
            autoFocus
            type="text"
            placeholder="Search modules..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              color: "var(--color-text-primary)",
              fontSize: "0.875rem",
              outline: "none",
            }}
          />
          <kbd
            style={{
              padding: "0.125rem 0.375rem",
              borderRadius: "0.25rem",
              background: "var(--color-bg-subtle)",
              border: "1px solid var(--color-border-subtle)",
              fontSize: "0.5rem",
              color: "var(--color-text-tertiary)",
              fontFamily: "monospace",
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div
          style={{ maxHeight: "360px", overflow: "auto", padding: "0.5rem" }}
        >
          {filteredCommands.length === 0 ? (
            <div
              style={{
                padding: "2rem",
                textAlign: "center",
                color: "var(--color-text-tertiary)",
                fontSize: "0.75rem",
              }}
            >
              No results found for "{search}"
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => (
              <div
                key={cmd.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.625rem 0.75rem",
                  borderRadius: "0.5rem",
                  cursor: "pointer",
                  background:
                    idx === selectedIndex
                      ? "var(--color-bg-subtle)"
                      : "transparent",
                  transition: "background 0.1s",
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
                onClick={() => handleSelect(cmd)}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "0.375rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                      idx === selectedIndex
                        ? "var(--color-accent-primary)"
                        : "var(--color-bg-elevated)",
                    color:
                      idx === selectedIndex
                        ? "white"
                        : "var(--color-text-secondary)",
                    transition: "all 0.1s",
                  }}
                >
                  {cmd.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontSize: "0.8125rem",
                      fontWeight: 500,
                      color: "var(--color-text-primary)",
                      margin: 0,
                    }}
                  >
                    {cmd.title}
                  </p>
                  <p
                    style={{
                      fontSize: "0.5rem",
                      fontWeight: 700,
                      color: "var(--color-text-tertiary)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      margin: 0,
                    }}
                  >
                    {cmd.category}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.5rem 1rem",
            borderTop: "1px solid var(--color-border-subtle)",
            background: "var(--color-bg-subtle)",
            fontSize: "0.5rem",
            color: "var(--color-text-tertiary)",
          }}
        >
          <div style={{ display: "flex", gap: "1rem" }}>
            <span
              style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}
            >
              <kbd
                style={{
                  padding: "0 0.25rem",
                  borderRadius: "0.125rem",
                  background: "var(--color-bg-elevated)",
                  border: "1px solid var(--color-border-subtle)",
                }}
              >
                ↵
              </kbd>
              to select
            </span>
            <span
              style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}
            >
              <kbd
                style={{
                  padding: "0 0.25rem",
                  borderRadius: "0.125rem",
                  background: "var(--color-bg-elevated)",
                  border: "1px solid var(--color-border-subtle)",
                }}
              >
                ↑↓
              </kbd>
              to navigate
            </span>
          </div>
          <span style={{ fontWeight: 600 }}>Quick Navigation</span>
        </div>
      </div>
    </div>
  );
};
