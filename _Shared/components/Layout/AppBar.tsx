import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Menu,
  Search,
  User,
  LogOut,
  Settings,
  HelpCircle,
  Inbox,
  Database,
  Users,
  Factory,
  CheckSquare,
  Shield,
  BarChart3,
  CreditCard,
  Zap,
  Gauge,
  Settings2,
} from "lucide-react";
import styles from "./AppShell.module.css";

export interface AppBarProps {
  title?: string;
  onMenuClick?: () => void;
  onLogoClick?: () => void;
}

// Navigation items
const navItems = [
  { id: "inbox", title: "Unified Inbox", icon: Inbox, path: "/inbox" },
  { id: "core", title: "Core Data", icon: Database, path: "/core" },
  { id: "clients", title: "Client 360", icon: Users, path: "/clients" },
  {
    id: "factories",
    title: "Service Factories",
    icon: Factory,
    path: "/factories",
  },
  {
    id: "approvals",
    title: "Approvals",
    icon: CheckSquare,
    path: "/approvals",
  },
  { id: "qa", title: "QA Gates", icon: Shield, path: "/qa" },
  {
    id: "reporting",
    title: "Reporting & KPIs",
    icon: BarChart3,
    path: "/reporting",
  },
  {
    id: "budgets",
    title: "Bundlr Budgets",
    icon: CreditCard,
    path: "/budgets",
  },
  { id: "events", title: "Event Bus", icon: Zap, path: "/events" },
  { id: "capacity", title: "Capacity Radar", icon: Gauge, path: "/capacity" },
  { id: "admin", title: "Admin Hub", icon: Settings2, path: "/admin" },
];

// Mock notifications
const mockNotifications = [
  {
    id: 1,
    title: "New client intake received",
    time: "2 min ago",
    unread: true,
  },
  {
    id: 2,
    title: "Budget approved: Acme Corp",
    time: "15 min ago",
    unread: true,
  },
  {
    id: 3,
    title: "QA check passed for Project X",
    time: "1 hour ago",
    unread: false,
  },
  {
    id: 4,
    title: "Factory stage completed",
    time: "3 hours ago",
    unread: false,
  },
];

export const AppBar: React.FC<AppBarProps> = ({
  title = "BundlrOS",
  onMenuClick,
  onLogoClick,
}) => {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Filter nav items based on search
  const filteredItems = navItems.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false);
        setSearchQuery("");
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowSearch(true);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle keyboard navigation in search
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setShowSearch(false);
      setSearchQuery("");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => (i + 1) % filteredItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(
        (i) => (i - 1 + filteredItems.length) % filteredItems.length
      );
    } else if (e.key === "Enter" && filteredItems[selectedIndex]) {
      navigate(filteredItems[selectedIndex].path);
      setShowSearch(false);
      setSearchQuery("");
    }
  };

  const handleNavSelect = (path: string) => {
    navigate(path);
    setShowSearch(false);
    setSearchQuery("");
  };

  const unreadCount = mockNotifications.filter((n) => n.unread).length;

  return (
    <header className={styles.appBar}>
      {/* Left Section - Menu & Logo */}
      <div className={styles.appBarLeft}>
        <button
          onClick={onMenuClick}
          className={styles.menuButton}
          aria-label="Toggle menu"
        >
          <Menu size={18} />
        </button>

        <button
          onClick={onLogoClick}
          className={styles.logoSection}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
          aria-label="Go to dashboard"
        >
          <div className={styles.logoIcon}>
            <span>B</span>
          </div>
          <span className={styles.logoText}>{title}</span>
        </button>
      </div>

      {/* Center Section - Search Dropdown */}
      <div ref={searchRef} style={{ position: "relative" }}>
        <button
          onClick={() => {
            setShowSearch(true);
            setShowNotifications(false);
            setShowProfile(false);
            setTimeout(() => searchInputRef.current?.focus(), 50);
          }}
          className={styles.searchBar}
        >
          <Search size={14} className={styles.searchIcon} />
          <span className={styles.searchPlaceholder}>Search modules...</span>
          <div className={styles.searchKbd}>
            <kbd>⌘K</kbd>
          </div>
        </button>

        {showSearch && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              left: "50%",
              transform: "translateX(-50%)",
              width: "340px",
              background: "var(--color-bg-card)",
              border: "1px solid var(--color-border-subtle)",
              borderRadius: "0.625rem",
              boxShadow: "0 12px 32px rgba(0, 0, 0, 0.4)",
              overflow: "hidden",
              zIndex: 1000,
            }}
          >
            {/* Search Input */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "0.625rem 0.875rem",
                borderBottom: "1px solid var(--color-border-subtle)",
                gap: "0.5rem",
              }}
            >
              <Search
                size={14}
                style={{ color: "var(--color-text-tertiary)" }}
              />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search modules..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleSearchKeyDown}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  color: "var(--color-text-primary)",
                  fontSize: "0.75rem",
                  outline: "none",
                }}
              />
            </div>

            {/* Results */}
            <div
              style={{
                maxHeight: "280px",
                overflow: "auto",
                padding: "0.375rem",
              }}
            >
              {filteredItems.length === 0 ? (
                <div
                  style={{
                    padding: "1rem",
                    textAlign: "center",
                    color: "var(--color-text-tertiary)",
                    fontSize: "0.6875rem",
                  }}
                >
                  No modules found
                </div>
              ) : (
                filteredItems.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavSelect(item.path)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.625rem",
                        padding: "0.5rem 0.625rem",
                        background:
                          idx === selectedIndex
                            ? "var(--color-bg-subtle)"
                            : "transparent",
                        border: "none",
                        borderRadius: "0.375rem",
                        color: "var(--color-text-secondary)",
                        fontSize: "0.6875rem",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "background 0.1s",
                      }}
                    >
                      <div
                        style={{
                          width: "26px",
                          height: "26px",
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
                              : "var(--color-text-tertiary)",
                        }}
                      >
                        <Icon size={14} />
                      </div>
                      <span
                        style={{
                          color:
                            idx === selectedIndex
                              ? "var(--color-text-primary)"
                              : "var(--color-text-secondary)",
                        }}
                      >
                        {item.title}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer hint */}
            <div
              style={{
                padding: "0.5rem 0.875rem",
                borderTop: "1px solid var(--color-border-subtle)",
                background: "var(--color-bg-subtle)",
                display: "flex",
                gap: "0.75rem",
                fontSize: "0.5rem",
                color: "var(--color-text-tertiary)",
              }}
            >
              <span>↑↓ navigate</span>
              <span>↵ select</span>
              <span>esc close</span>
            </div>
          </div>
        )}
      </div>

      {/* Right Section - Notifications & Profile */}
      <div className={styles.appBarRight}>
        {/* Notifications */}
        <div ref={notifRef} style={{ position: "relative" }}>
          <button
            className={styles.iconButton}
            aria-label="Notifications"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfile(false);
              setShowSearch(false);
            }}
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className={styles.notificationDot}></span>
            )}
          </button>

          {showNotifications && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                width: "300px",
                background: "var(--color-bg-card)",
                border: "1px solid var(--color-border-subtle)",
                borderRadius: "0.625rem",
                boxShadow: "0 12px 32px rgba(0, 0, 0, 0.4)",
                overflow: "hidden",
                zIndex: 1000,
              }}
            >
              <div
                style={{
                  padding: "0.625rem 0.875rem",
                  borderBottom: "1px solid var(--color-border-subtle)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "var(--color-text-primary)",
                  }}
                >
                  Notifications
                </span>
                <span
                  style={{
                    fontSize: "0.5rem",
                    fontWeight: 600,
                    color: "var(--color-accent-primary)",
                    background: "rgba(99, 102, 241, 0.1)",
                    padding: "0.125rem 0.375rem",
                    borderRadius: "999px",
                  }}
                >
                  {unreadCount} new
                </span>
              </div>
              <div style={{ maxHeight: "240px", overflow: "auto" }}>
                {mockNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    style={{
                      padding: "0.625rem 0.875rem",
                      borderBottom: "1px solid var(--color-border-subtle)",
                      display: "flex",
                      gap: "0.5rem",
                      cursor: "pointer",
                      background: notif.unread
                        ? "rgba(99, 102, 241, 0.03)"
                        : "transparent",
                    }}
                  >
                    <div
                      style={{
                        width: "5px",
                        height: "5px",
                        borderRadius: "50%",
                        background: notif.unread
                          ? "var(--color-accent-primary)"
                          : "transparent",
                        marginTop: "0.375rem",
                        flexShrink: 0,
                      }}
                    />
                    <div>
                      <p
                        style={{
                          fontSize: "0.625rem",
                          color: "var(--color-text-primary)",
                          margin: 0,
                          lineHeight: 1.4,
                        }}
                      >
                        {notif.title}
                      </p>
                      <p
                        style={{
                          fontSize: "0.5rem",
                          color: "var(--color-text-tertiary)",
                          margin: "0.125rem 0 0 0",
                        }}
                      >
                        {notif.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div
                style={{
                  padding: "0.5rem 0.875rem",
                  background: "var(--color-bg-subtle)",
                  textAlign: "center",
                }}
              >
                <button
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--color-accent-primary)",
                    fontSize: "0.5625rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div ref={profileRef} style={{ position: "relative" }}>
          <button
            className={styles.userSection}
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
              setShowSearch(false);
            }}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <div className={styles.userAvatar}>
              <User size={14} />
            </div>
          </button>

          {showProfile && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                width: "180px",
                background: "var(--color-bg-card)",
                border: "1px solid var(--color-border-subtle)",
                borderRadius: "0.625rem",
                boxShadow: "0 12px 32px rgba(0, 0, 0, 0.4)",
                overflow: "hidden",
                zIndex: 1000,
              }}
            >
              <div
                style={{
                  padding: "0.75rem 0.875rem",
                  borderBottom: "1px solid var(--color-border-subtle)",
                }}
              >
                <p
                  style={{
                    fontSize: "0.6875rem",
                    fontWeight: 600,
                    color: "var(--color-text-primary)",
                    margin: 0,
                  }}
                >
                  John Doe
                </p>
                <p
                  style={{
                    fontSize: "0.5rem",
                    color: "var(--color-text-tertiary)",
                    margin: "0.125rem 0 0 0",
                  }}
                >
                  admin@bundlr.io
                </p>
              </div>
              <div style={{ padding: "0.25rem" }}>
                <button
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.375rem 0.625rem",
                    background: "transparent",
                    border: "none",
                    borderRadius: "0.25rem",
                    color: "var(--color-text-secondary)",
                    fontSize: "0.625rem",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <Settings size={12} /> Settings
                </button>
                <button
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.375rem 0.625rem",
                    background: "transparent",
                    border: "none",
                    borderRadius: "0.25rem",
                    color: "var(--color-text-secondary)",
                    fontSize: "0.625rem",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <HelpCircle size={12} /> Help & Support
                </button>
              </div>
              <div
                style={{
                  padding: "0.25rem",
                  borderTop: "1px solid var(--color-border-subtle)",
                }}
              >
                <button
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.375rem 0.625rem",
                    background: "transparent",
                    border: "none",
                    borderRadius: "0.25rem",
                    color: "rgb(244, 63, 94)",
                    fontSize: "0.625rem",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <LogOut size={12} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
