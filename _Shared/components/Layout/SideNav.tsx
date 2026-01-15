import React from "react";
import { NavLink } from "react-router-dom";
import {
  Inbox,
  LayoutGrid,
  Users,
  FileText,
  CheckSquare,
  BarChart2,
  CreditCard,
  Settings,
  ShieldCheck,
  Zap,
  Activity,
  Server,
  Key,
} from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import styles from "./AppShell.module.css";

interface SideNavProps {
  isOpen?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const SideNav: React.FC<SideNavProps> = ({
  isOpen = true,
  onMouseEnter,
  onMouseLeave,
}) => {
  const { t } = useLanguage();

  const navGroups = [
    {
      titleKey: "sidebar.salesClients",
      items: [
        { labelKey: "sidebar.inbox", icon: <Inbox size={18} />, to: "/inbox" },
        {
          labelKey: "sidebar.client360",
          icon: <Users size={18} />,
          to: "/clients",
        },
        {
          labelKey: "sidebar.budgets",
          icon: <CreditCard size={18} />,
          to: "/budgets",
        },
      ],
    },
    {
      titleKey: "sidebar.strategy",
      items: [
        {
          labelKey: "sidebar.coreData",
          icon: <LayoutGrid size={18} />,
          to: "/core",
        },
        {
          labelKey: "sidebar.capacity",
          icon: <Activity size={18} />,
          to: "/capacity",
        },
      ],
    },
    {
      titleKey: "sidebar.production",
      items: [
        {
          labelKey: "sidebar.factories",
          icon: <Server size={18} />,
          to: "/factories",
        },
        {
          labelKey: "sidebar.assets",
          icon: <FileText size={18} />,
          to: "/assets",
        },
        { labelKey: "sidebar.events", icon: <Zap size={18} />, to: "/events" },
      ],
    },
    {
      titleKey: "sidebar.delivery",
      items: [
        {
          labelKey: "sidebar.approvals",
          icon: <CheckSquare size={18} />,
          to: "/approvals",
        },
        {
          labelKey: "sidebar.qaGates",
          icon: <ShieldCheck size={18} />,
          to: "/qa",
        },
      ],
    },
    {
      titleKey: "sidebar.management",
      items: [
        {
          labelKey: "sidebar.reporting",
          icon: <BarChart2 size={18} />,
          to: "/reporting",
        },
        { labelKey: "sidebar.admin", icon: <Key size={18} />, to: "/admin" },
      ],
    },
  ];

  return (
    <aside
      className={`${styles.sideNav} ${
        isOpen ? styles.sideNavOpen : styles.sideNavClosed
      }`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <nav className="flex flex-col gap-4 px-2 overflow-y-auto py-2">
        {navGroups.map((group) => (
          <div key={group.titleKey} className="flex flex-col gap-1">
            <div className={styles.navGroupTitle}>{t(group.titleKey)}</div>
            {group.items.map((item) => (
              <NavLink
                key={item.labelKey}
                to={item.to}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
                }
              >
                {item.icon}
                {t(item.labelKey)}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="px-2 mt-auto pt-4 border-t border-[var(--color-border-subtle)]">
        <NavLink
          to="/identity"
          className={({ isActive }) =>
            `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
          }
        >
          <Settings size={18} />
          {t("sidebar.account")}
        </NavLink>
      </div>
    </aside>
  );
};
