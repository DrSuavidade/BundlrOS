import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar } from "./AppBar";
import { SideNav } from "./SideNav";
import styles from "./AppShell.module.css";

interface AppShellProps {
  children: React.ReactNode;
  moduleName?: string;
}

export const AppShell: React.FC<AppShellProps> = ({ children, moduleName }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
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
        title={moduleName ? `BundlrOS / ${moduleName}` : "BundlrOS"}
        onMenuClick={handleToggleSidebar}
        onLogoClick={handleLogoClick}
      />

      <div className={styles.contentWrapper}>
        <SideNav isOpen={isSidebarOpen} />
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
