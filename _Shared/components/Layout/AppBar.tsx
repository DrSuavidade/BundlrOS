import React from "react";
import {
  Bell,
  Command,
  Menu,
  Search,
  User,
  ChevronDown,
  Settings,
} from "lucide-react";
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
      {/* Left Section - Menu & Logo */}
      <div className={styles.appBarLeft}>
        <button
          onClick={onMenuClick}
          className={styles.menuButton}
          aria-label="Toggle menu"
        >
          <Menu size={18} />
        </button>

        <div className={styles.logoSection}>
          <div className={styles.logoIcon}>
            <span>B</span>
          </div>
          <span className={styles.logoText}>{title}</span>
        </div>
      </div>

      {/* Center Section - Search */}
      <button onClick={onCommandClick} className={styles.searchBar}>
        <Search size={14} className={styles.searchIcon} />
        <span className={styles.searchPlaceholder}>
          Search or type command...
        </span>
        <div className={styles.searchKbd}>
          <kbd>⌘K</kbd>
        </div>
      </button>

      {/* Right Section - Actions & User */}
      <div className={styles.appBarRight}>
        <button className={styles.iconButton} aria-label="Notifications">
          <Bell size={16} />
          <span className={styles.notificationDot}></span>
        </button>

        <div className={styles.userSection}>
          <div className={styles.userAvatar}>
            <User size={14} />
          </div>
        </div>
      </div>
    </header>
  );
};
