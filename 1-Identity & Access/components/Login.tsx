import React, { useState, useEffect } from "react";
import { GlassCard } from "./ui/GlassCard";
import { AuthService } from "../services/authService";
import { UserService, AuditService } from "../services/store";
import { User } from "../types";
import { Layers, Loader2 } from "lucide-react";
import { useLanguage } from "@bundlros/ui";
import styles from "./Login.module.css";

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Auto-set title for SEO and UX
  useEffect(() => {
    document.title = t("identity.login.pageTitle");
  }, [t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Try Supabase authentication first
      const result = await AuthService.loginByEmail(email, password);

      if (result.success && result.user) {
        // Log to local audit as well for backwards compatibility
        AuditService.log(
          "auth.login",
          `User ${result.user.email} logged in`,
          result.user.id,
          result.user.name
        );
        onLogin(result.user);
      } else {
        // Fallback to local mock data check
        const users = UserService.getAll();
        const localUser = users.find((u) => u.email === email);

        if (localUser && localUser.status === "active") {
          AuditService.log(
            "auth.login",
            `User ${localUser.email} logged in (local)`,
            localUser.id,
            localUser.name
          );
          onLogin(localUser);
        } else {
          setError(result.error || t("identity.login.invalidCredentials"));
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(t("identity.login.invalidCredentials"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      {/* Dynamic Background Effects */}
      <div className={styles.backgroundGlow1} />
      <div className={styles.backgroundGlow2} />

      <GlassCard className={styles.loginCard}>
        <div className={styles.header}>
          <div className={styles.logoWrapper}>
            <Layers className="w-6 h-6 text-white" />
          </div>
          <h1 className={styles.title}>{t("identity.login.title")}</h1>
          <p className={styles.subtitle}>{t("identity.login.subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>
              {t("identity.login.emailLabel")}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              placeholder={t("identity.login.emailPlaceholder")}
              autoComplete="email"
              required
              disabled={isLoading}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              {t("identity.login.passwordLabel")}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder={t("identity.login.passwordPlaceholder")}
              autoComplete="current-password"
              required
              disabled={isLoading}
            />
          </div>

          {error && <p className={styles.errorText}>{error}</p>}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("identity.login.signingIn") || "Signing in..."}
              </span>
            ) : (
              t("identity.login.signIn")
            )}
          </button>
        </form>

        <div className={styles.demoInfo}>
          <a
            href="https://bundlr.pt/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.demoText}
            style={{
              textDecoration: "none",
              color: "var(--color-accent-primary)",
            }}
          >
            Bundlr Website
          </a>
        </div>
      </GlassCard>
    </div>
  );
};
