import React, { useState, useEffect } from "react";
import { GlassCard } from "./ui/GlassCard";
import { UserService, AuditService } from "../services/store";
import { User } from "../types";
import { Layers } from "lucide-react";
import { useLanguage } from "@bundlros/ui";
import styles from "./Login.module.css";

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { t } = useLanguage();
  const [email, setEmail] = useState("admin@nexus.com"); // Pre-fill for demo
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Auto-set title for SEO and UX
  useEffect(() => {
    document.title = t("identity.login.pageTitle");
  }, [t]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const users = UserService.getAll();
    const user = users.find((u) => u.email === email);

    // MOCK LOGIN LOGIC
    if (user && user.status === "active") {
      // Allow any password for demo if user exists
      AuditService.log(
        "auth.login",
        `User ${user.email} logged in`,
        user.id,
        user.name
      );
      onLogin(user);
    } else {
      setError(t("identity.login.invalidCredentials"));
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
            />
          </div>

          {error && <p className={styles.errorText}>{error}</p>}

          <button type="submit" className={styles.submitButton}>
            {t("identity.login.signIn")}
          </button>
        </form>

        <div className={styles.demoInfo}>
          <p className={styles.demoText}>
            {t("identity.login.demoAccess")}{" "}
            <span className={styles.demoEmail}>admin@nexus.com</span>
          </p>
        </div>
      </GlassCard>
    </div>
  );
};
