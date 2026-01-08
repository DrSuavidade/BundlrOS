import React, { useState, useEffect } from "react";
import { AppBar } from "./AppBar";
import { SideNav } from "./SideNav";
import { CommandPalette } from "../CommandPalette";
import styles from "./AppShell.module.css";

interface AppShellProps {
  children: React.ReactNode;
  moduleName?: string;
}

export const AppShell: React.FC<AppShellProps> = ({ children, moduleName }) => {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className={styles.appShell}>
      {/* Background Glows for Premium Aesthetic */}
      <div className={styles.backgroundGlow1} />
      <div className={styles.backgroundGlow2} />

      <AppBar
        title={moduleName ? `BundlrOS / ${moduleName}` : "BundlrOS"}
        onCommandClick={() => setIsCommandPaletteOpen(true)}
      />

      <div className={styles.contentWrapper}>
        <SideNav />
        <main className={styles.mainContent}>
          <div className="max-w-7xl mx-auto h-full animate-in fade-in duration-700">
            {children}
          </div>
        </main>
      </div>

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </div>
  );
};
