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
  Settings2,
} from "lucide-react";
import { Notification, NotificationsApi } from "@bundlros/supabase";
import { useLanguage } from "../../contexts/LanguageContext";
import { useAuth } from "../../contexts/AuthContext";
import styles from "./AppShell.module.css";

export interface AppBarProps {
  title?: string;
  onMenuClick?: () => void;
  onMenuMouseEnter?: () => void;
  onMenuMouseLeave?: () => void;
  onLogoClick?: () => void;
}

export const AppBar: React.FC<AppBarProps> = ({
  title = "BundlrOS",
  onMenuClick,
  onMenuMouseEnter,
  onMenuMouseLeave,
  onLogoClick,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const { user, logout, setUser } = useAuth();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    name: "",
    password: "",
    avatarUrl: "",
  });
  const [settingsSaving, setSettingsSaving] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Navigation items with translations
  const navItems = [
    { id: "inbox", titleKey: "nav.inbox", icon: Inbox, path: "/inbox" },
    { id: "core", titleKey: "nav.coreData", icon: Database, path: "/core" },
    { id: "clients", titleKey: "nav.client360", icon: Users, path: "/clients" },
    {
      id: "factories",
      titleKey: "nav.factories",
      icon: Factory,
      path: "/factories",
    },
    {
      id: "approvals",
      titleKey: "nav.approvals",
      icon: CheckSquare,
      path: "/approvals",
    },
    { id: "qa", titleKey: "nav.qaGates", icon: Shield, path: "/qa" },
    {
      id: "reporting",
      titleKey: "nav.reporting",
      icon: BarChart3,
      path: "/reporting",
    },
    {
      id: "budgets",
      titleKey: "nav.budgets",
      icon: CreditCard,
      path: "/budgets",
    },

    { id: "admin", titleKey: "nav.admin", icon: Settings2, path: "/admin" },
  ];

  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Time ago helper
  const timeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return language === "pt" ? "agora" : "now";
    if (diffMins < 60) return `${diffMins} ${language === "pt" ? "min" : "m"}`;
    if (diffHours < 24) return `${diffHours} ${language === "pt" ? "h" : "h"}`;
    return `${diffDays} ${language === "pt" ? "d" : "d"}`;
  };

  // Load notifications
  useEffect(() => {
    if (!user) return;

    const loadNotifs = async () => {
      const data = await NotificationsApi.getByUserId(user.id);
      setNotifications(data);
    };

    loadNotifs();
    const interval = setInterval(loadNotifs, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkRead = async (id: string, link: string | null) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );

    await NotificationsApi.markAsRead(id);

    if (link) {
      navigate(link);
      setShowNotifications(false);
    }
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await NotificationsApi.markAllAsRead(user.id);
  };

  // Filter nav items based on search
  const filteredItems = navItems.filter((item) =>
    t(item.titleKey).toLowerCase().includes(searchQuery.toLowerCase())
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

  const toggleLanguage = () => {
    setLanguage(language === "pt" ? "en" : "pt");
  };

  const openHelp = () => {
    window.open("https://bundlr.pt/", "_blank");
    setShowProfile(false);
  };

  const openSettings = () => {
    setSettingsForm({
      name: user?.name || "",
      password: "",
      avatarUrl: user?.avatarUrl || "",
    });
    setShowSettings(true);
    setShowProfile(false);
  };

  const saveSettings = async () => {
    if (!user) return;
    setSettingsSaving(true);

    try {
      const { ProfilesApi } = await import("@bundlros/supabase");
      const updates: Record<string, unknown> = {};

      if (settingsForm.name && settingsForm.name !== user.name) {
        updates.name = settingsForm.name;
      }
      if (settingsForm.password) {
        updates.password_hash = settingsForm.password;
      }
      if (settingsForm.avatarUrl !== user.avatarUrl) {
        updates.avatar_url = settingsForm.avatarUrl || null;
      }

      if (Object.keys(updates).length > 0) {
        await ProfilesApi.update(user.id, updates);

        // Update local user context
        setUser({
          ...user,
          name: settingsForm.name || user.name,
          avatarUrl: settingsForm.avatarUrl || user.avatarUrl,
        });

        // Update localStorage
        const stored = localStorage.getItem("nexus_session");
        if (stored) {
          const parsed = JSON.parse(stored);
          localStorage.setItem(
            "nexus_session",
            JSON.stringify({
              ...parsed,
              name: settingsForm.name || parsed.name,
              avatarUrl: settingsForm.avatarUrl || parsed.avatarUrl,
            })
          );
        }
      }

      setShowSettings(false);
    } catch (err) {
      console.error("[Settings] Failed to save:", err);
    } finally {
      setSettingsSaving(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <>
      <header className={styles.appBar}>
        {/* Left Section - Menu & Logo */}
        <div className={styles.appBarLeft}>
          <button
            onClick={onMenuClick}
            onMouseEnter={onMenuMouseEnter}
            onMouseLeave={onMenuMouseLeave}
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
            <span className={styles.searchPlaceholder}>
              {t("common.search")}
            </span>
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
                  placeholder={t("common.search")}
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
                    {t("common.noResults")}
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
                          {t(item.titleKey)}
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
                <span>↑↓ {t("common.navigate")}</span>
                <span>↵ {t("common.select")}</span>
                <span>esc {t("common.close")}</span>
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
                    {t("common.notifications")}
                  </span>
                  {unreadCount > 0 && (
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
                      {unreadCount} {t("common.new")}
                    </span>
                  )}
                </div>
                <div style={{ maxHeight: "240px", overflow: "visible" }}>
                  {notifications.length === 0 && (
                    <div
                      style={{
                        padding: "32px 16px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        color: "var(--color-text-tertiary)",
                      }}
                    >
                      <Inbox size={24} style={{ opacity: 0.5 }} />
                      <div style={{ textAlign: "center" }}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "13px",
                            fontWeight: 500,
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          {t("No Notifications") || "All caught up!"}
                        </p>
                        <p
                          style={{ margin: 0, fontSize: "11px", opacity: 0.7 }}
                        >
                          Check back later for new updates.
                        </p>
                      </div>
                    </div>
                  )}
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleMarkRead(notif.id, notif.link)}
                      style={{
                        padding: "0.625rem 0.875rem",
                        borderBottom: "1px solid var(--color-border-subtle)",
                        display: "flex",
                        gap: "0.5rem",
                        cursor: "pointer",
                        background: !notif.is_read
                          ? "rgba(99, 102, 241, 0.03)"
                          : "transparent",
                      }}
                    >
                      <div
                        style={{
                          width: "5px",
                          height: "5px",
                          borderRadius: "50%",
                          background: !notif.is_read
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
                        {notif.message && (
                          <p
                            style={{
                              fontSize: "10px",
                              color: "var(--color-text-secondary)",
                              marginTop: "2px",
                            }}
                          >
                            {notif.message}
                          </p>
                        )}
                        <p
                          style={{
                            fontSize: "0.5rem",
                            color: "var(--color-text-tertiary)",
                            margin: "0.125rem 0 0 0",
                          }}
                        >
                          {timeAgo(notif.created_at)}
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
                    onClick={handleMarkAllRead}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--color-accent-primary)",
                      fontSize: "0.5625rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Mark all read
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
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "50%",
                    }}
                  />
                ) : (
                  <User size={14} />
                )}
              </div>
            </button>

            {showProfile && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  width: "200px",
                  background: "var(--color-bg-card)",
                  border: "1px solid var(--color-border-subtle)",
                  borderRadius: "0.625rem",
                  boxShadow: "0 12px 32px rgba(0, 0, 0, 0.4)",
                  overflow: "hidden",
                  zIndex: 1000,
                }}
              >
                {/* Header with user info and language flag */}
                <div
                  style={{
                    padding: "0.75rem 0.875rem",
                    borderBottom: "1px solid var(--color-border-subtle)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: "0.6875rem",
                        fontWeight: 600,
                        color: "var(--color-text-primary)",
                        margin: 0,
                      }}
                    >
                      {user?.name || "Guest"}
                    </p>
                    <p
                      style={{
                        fontSize: "0.5rem",
                        color: "var(--color-accent-primary)",
                        margin: "0.125rem 0 0 0",
                        fontWeight: 500,
                      }}
                    >
                      {user?.title || user?.role || "Not logged in"}
                    </p>
                  </div>
                  {/* Language Toggle Flag */}
                  <button
                    onClick={toggleLanguage}
                    title={
                      language === "pt"
                        ? "Mudar para Inglês"
                        : "Switch to Portuguese"
                    }
                    style={{
                      background: "var(--color-bg-subtle)",
                      border: "1px solid var(--color-border-subtle)",
                      borderRadius: "0.375rem",
                      padding: "0.25rem 0.375rem",
                      cursor: "pointer",
                      fontSize: "0.875rem",
                      lineHeight: 1,
                      transition: "all 0.15s",
                    }}
                  >
                    {language === "pt" ? (
                      <img
                        src="https://flagcdn.com/w40/pt.png"
                        width="20"
                        height="15"
                        alt="PT"
                        style={{
                          display: "block",
                          borderRadius: "2px",
                          width: "20px",
                          height: "15px",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <img
                        src="https://flagcdn.com/w40/gb.png"
                        width="20"
                        height="15"
                        alt="GB"
                        style={{
                          display: "block",
                          borderRadius: "2px",
                          width: "20px",
                          height: "15px",
                          objectFit: "cover",
                        }}
                      />
                    )}
                  </button>
                </div>

                {/* Menu Items */}
                <div style={{ padding: "0.25rem" }}>
                  <button
                    onClick={openSettings}
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
                    <Settings size={12} /> {t("common.settings")}
                  </button>
                  <button
                    onClick={openHelp}
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
                    <HelpCircle size={12} /> {t("common.help")}
                  </button>
                </div>

                {/* Logout */}
                <div
                  style={{
                    padding: "0.25rem",
                    borderTop: "1px solid var(--color-border-subtle)",
                  }}
                >
                  <button
                    onClick={logout}
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
                    <LogOut size={12} /> {t("common.signOut")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Settings Modal */}
      {showSettings && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
            backdropFilter: "blur(4px)",
          }}
          onClick={() => setShowSettings(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--color-bg-card)",
              border: "1px solid var(--color-border-subtle)",
              borderRadius: "0.75rem",
              boxShadow: "0 24px 64px rgba(0, 0, 0, 0.5)",
              width: "100%",
              maxWidth: "380px",
              overflow: "hidden",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "1rem 1.25rem",
                borderBottom: "1px solid var(--color-border-subtle)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                }}
              >
                {t("common.settings")}
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--color-text-tertiary)",
                  cursor: "pointer",
                  fontSize: "1.25rem",
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "1.25rem" }}>
              {/* Avatar Preview - Large at top */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  marginBottom: "1.5rem",
                  paddingBottom: "1rem",
                  borderBottom: "1px solid var(--color-border-subtle)",
                }}
              >
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background: "var(--color-bg-subtle)",
                    border: "2px solid var(--color-border-subtle)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    marginBottom: "0.5rem",
                  }}
                >
                  {settingsForm.avatarUrl ? (
                    <img
                      src={settingsForm.avatarUrl}
                      alt="Avatar preview"
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.parentElement!.innerHTML =
                          '<span style="color: var(--color-text-tertiary); font-size: 2rem;">?</span>';
                      }}
                    />
                  ) : (
                    <User
                      size={32}
                      style={{ color: "var(--color-text-tertiary)" }}
                    />
                  )}
                </div>
                <span
                  style={{
                    fontSize: "0.625rem",
                    color: "var(--color-text-tertiary)",
                  }}
                >
                  {settingsForm.avatarUrl ? "Avatar Preview" : "No avatar set"}
                </span>
              </div>

              {/* Name Field */}
              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.6875rem",
                    fontWeight: 500,
                    color: "var(--color-text-secondary)",
                    marginBottom: "0.375rem",
                  }}
                >
                  {t("Nome") || "Name"}
                </label>
                <input
                  type="text"
                  value={settingsForm.name}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, name: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "0.5rem 0.75rem",
                    background: "var(--color-bg-subtle)",
                    border: "1px solid var(--color-border-subtle)",
                    borderRadius: "0.375rem",
                    color: "var(--color-text-primary)",
                    fontSize: "0.75rem",
                    outline: "none",
                  }}
                  placeholder="Your name"
                />
              </div>

              {/* Password Field */}
              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.6875rem",
                    fontWeight: 500,
                    color: "var(--color-text-secondary)",
                    marginBottom: "0.375rem",
                  }}
                >
                  {t("Password") || "Password"}
                </label>
                <input
                  type="password"
                  value={settingsForm.password}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      password: e.target.value,
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "0.5rem 0.75rem",
                    background: "var(--color-bg-subtle)",
                    border: "1px solid var(--color-border-subtle)",
                    borderRadius: "0.375rem",
                    color: "var(--color-text-primary)",
                    fontSize: "0.75rem",
                    outline: "none",
                  }}
                  placeholder="Leave blank to keep current"
                />
              </div>

              {/* Avatar URL Field */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.6875rem",
                    fontWeight: 500,
                    color: "var(--color-text-secondary)",
                    marginBottom: "0.375rem",
                  }}
                >
                  Avatar URL
                </label>
                <input
                  type="url"
                  value={settingsForm.avatarUrl}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      avatarUrl: e.target.value,
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "0.5rem 0.75rem",
                    background: "var(--color-bg-subtle)",
                    border: "1px solid var(--color-border-subtle)",
                    borderRadius: "0.375rem",
                    color: "var(--color-text-primary)",
                    fontSize: "0.75rem",
                    outline: "none",
                  }}
                  placeholder="https://example.com/avatar.png"
                />
              </div>

              {/* Save Button */}
              <button
                onClick={saveSettings}
                disabled={settingsSaving}
                style={{
                  width: "100%",
                  padding: "0.625rem 1rem",
                  background: settingsSaving
                    ? "var(--color-bg-subtle)"
                    : "var(--color-accent-primary)",
                  border: "none",
                  borderRadius: "0.375rem",
                  color: "white",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: settingsSaving ? "not-allowed" : "pointer",
                  transition: "background 0.15s",
                }}
              >
                {settingsSaving
                  ? "Saving..."
                  : t("common.save") || "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
