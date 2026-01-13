import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar } from "./AppBar";
import { SideNav } from "./SideNav";
import styles from "./AppShell.module.css";

interface AppShellProps {
  children: React.ReactNode;
  moduleName?: string;
}

export const AppShell: React.FC<AppShellProps> = ({ children, moduleName }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsSidebarOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsSidebarOpen(false);
    }, 150);
  };

  const handleLogoClick = () => {
    navigate("/identity/dashboard");
  };

  return (
    <div className={styles.appShell}>
      {/* Background Glows for Premium Aesthetic */}
      <div className={styles.backgroundGlow1} />
      <div className={styles.backgroundGlow2} />

      <AppBar
        title="BundlrOS"
        onMenuClick={handleToggleSidebar}
        onMenuMouseEnter={handleMouseEnter}
        onMenuMouseLeave={handleMouseLeave}
        onLogoClick={handleLogoClick}
      />

      <div className={styles.contentWrapper}>
        <SideNav
          isOpen={isSidebarOpen}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
        <main
          className={`${styles.mainContent} ${
            isSidebarOpen ? "" : styles.mainContentExpanded
          }`}
        >
          <div className="max-w-7xl mx-auto h-full animate-in fade-in duration-700">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
