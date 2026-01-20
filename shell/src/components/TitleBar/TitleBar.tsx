import React, { useEffect, useState, useCallback, useRef } from "react";
import styles from "./TitleBar.module.css";

// Check if running in Electron
const isElectron = typeof window !== "undefined" && window.electronAPI;

interface UpdateStatus {
  status:
    | "checking"
    | "available"
    | "not-available"
    | "downloading"
    | "downloaded"
    | "error";
  progress?: { percent: number };
  info?: { version: string };
  error?: string;
}

export const TitleBar: React.FC = () => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [appVersion, setAppVersion] = useState("");
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Timers
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const showTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showTitleBar = useCallback(() => {
    setIsVisible(true);

    // Clear existing timer
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }

    // Set new timer to hide after 2 seconds
    hideTimerRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 2000);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      // Show if mouse is at the very top edge (6px) of the screen
      if (e.clientY < 6) {
        if (!showTimerRef.current && !isVisible) {
          showTimerRef.current = setTimeout(() => {
            showTitleBar();
            showTimerRef.current = null;
          }, 300); // 300ms delay to prevent accidental triggers
        }
      } else {
        // If mouse moves away from top edge before timer fires, cancel it
        if (showTimerRef.current) {
          clearTimeout(showTimerRef.current);
          showTimerRef.current = null;
        }
      }
    },
    [showTitleBar, isVisible],
  );

  const handleMouseEnter = useCallback(() => {
    // Keep visible when mouse enters the title bar itself
    setIsVisible(true);
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    // Start hide timer when mouse leaves the title bar
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }
    hideTimerRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 2000);
  }, []);

  useEffect(() => {
    if (!isElectron) return;

    // Initial state
    window.electronAPI.isMaximized().then(setIsMaximized);
    window.electronAPI.getVersion().then(setAppVersion);

    // Listeners
    const unsubscribeMaximize =
      window.electronAPI.onMaximizeChange(setIsMaximized);
    const unsubscribeUpdate =
      window.electronAPI.onUpdateStatus(setUpdateStatus);

    // Mouse move listener on window
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      unsubscribeMaximize();
      unsubscribeUpdate();
      window.removeEventListener("mousemove", handleMouseMove);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (showTimerRef.current) clearTimeout(showTimerRef.current);
    };
  }, [handleMouseMove]);

  // Don't render in browser
  if (!isElectron) return null;

  const handleMinimize = () => window.electronAPI.minimize();
  const handleMaximize = () => window.electronAPI.maximize();
  const handleClose = () => window.electronAPI.close();
  const handleInstallUpdate = () => window.electronAPI.installUpdate();

  return (
    <div
      className={`${styles.titleBar} ${isVisible ? styles.visible : styles.hidden}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* App branding */}
      <div className={styles.brand}>
        <div className={styles.logo}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2L2 7L12 12L22 7L12 2Z"
              stroke="url(#gradient1)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 17L12 22L22 17"
              stroke="url(#gradient2)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 12L12 17L22 12"
              stroke="url(#gradient3)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient id="gradient1" x1="2" y1="7" x2="22" y2="7">
                <stop stopColor="#6366f1" />
                <stop offset="1" stopColor="#8b5cf6" />
              </linearGradient>
              <linearGradient id="gradient2" x1="2" y1="19.5" x2="22" y2="19.5">
                <stop stopColor="#8b5cf6" />
                <stop offset="1" stopColor="#a855f7" />
              </linearGradient>
              <linearGradient id="gradient3" x1="2" y1="14.5" x2="22" y2="14.5">
                <stop stopColor="#6366f1" />
                <stop offset="1" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <span className={styles.title}>BundlrOS</span>
        {appVersion && <span className={styles.version}>v{appVersion}</span>}
      </div>

      {/* Draggable region */}
      <div className={styles.dragRegion} />

      {/* Update notification */}
      {updateStatus && (
        <div className={styles.updateStatus}>
          {updateStatus.status === "checking" && (
            <span className={styles.updateText}>Checking for updates...</span>
          )}
          {updateStatus.status === "downloading" && (
            <span className={styles.updateText}>
              Downloading update...{" "}
              {Math.round(updateStatus.progress?.percent || 0)}%
            </span>
          )}
          {updateStatus.status === "downloaded" && (
            <button
              className={styles.updateButton}
              onClick={handleInstallUpdate}
            >
              Install Update {updateStatus.info?.version}
            </button>
          )}
        </div>
      )}

      {/* Window controls */}
      <div className={styles.windowControls}>
        <button
          className={styles.controlButton}
          onClick={handleMinimize}
          aria-label="Minimize"
        >
          <svg width="12" height="12" viewBox="0 0 12 12">
            <rect fill="currentColor" width="10" height="1" x="1" y="6" />
          </svg>
        </button>

        <button
          className={styles.controlButton}
          onClick={handleMaximize}
          aria-label={isMaximized ? "Restore" : "Maximize"}
        >
          {isMaximized ? (
            <svg width="12" height="12" viewBox="0 0 12 12">
              <rect
                fill="none"
                stroke="currentColor"
                width="7"
                height="7"
                x="1.5"
                y="3.5"
              />
              <polyline
                fill="none"
                stroke="currentColor"
                points="3.5,3.5 3.5,1.5 10.5,1.5 10.5,8.5 8.5,8.5"
              />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12">
              <rect
                fill="none"
                stroke="currentColor"
                width="9"
                height="9"
                x="1.5"
                y="1.5"
              />
            </svg>
          )}
        </button>

        <button
          className={`${styles.controlButton} ${styles.closeButton}`}
          onClick={handleClose}
          aria-label="Close"
        >
          <svg width="12" height="12" viewBox="0 0 12 12">
            <line
              stroke="currentColor"
              strokeWidth="1"
              x1="2"
              y1="2"
              x2="10"
              y2="10"
            />
            <line
              stroke="currentColor"
              strokeWidth="1"
              x1="10"
              y1="2"
              x2="2"
              y2="10"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default TitleBar;
