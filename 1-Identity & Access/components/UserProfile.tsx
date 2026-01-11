import React from "react";
import { User } from "../types";
import { GlassCard } from "./ui/GlassCard";
import { RoleBadge } from "./ui/RoleBadge";
import { User as UserIcon, Lock, Building, Clock } from "lucide-react";
import { useLanguage } from "@bundlros/ui";

interface UserProfileProps {
  user: User;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  const { t } = useLanguage();

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-fade-in">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">
          {t("identity.profile.title")}
        </h1>
        <p className="text-zinc-400">{t("identity.profile.subtitle")}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info Card */}
        <div className="lg:col-span-2 space-y-8">
          <GlassCard>
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-zinc-800 border-2 border-white/10 flex items-center justify-center overflow-hidden">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon size={32} className="text-zinc-500" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{user.name}</h2>
                  <p className="text-zinc-400">{user.email}</p>
                  <div className="mt-2">
                    <RoleBadge role={user.role} />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase">
                  {t("identity.profile.userId")}
                </label>
                <div className="flex items-center gap-2 text-zinc-300 bg-surface/50 p-2 rounded-lg border border-white/5">
                  <span className="font-mono text-sm">{user.id}</span>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase">
                  {t("identity.profile.organization")}
                </label>
                <div className="flex items-center gap-2 text-zinc-300 bg-surface/50 p-2 rounded-lg border border-white/5">
                  <Building size={14} />
                  <span className="text-sm">{user.organizationId}</span>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase">
                  {t("identity.profile.joinedOn")}
                </label>
                <div className="flex items-center gap-2 text-zinc-300 bg-surface/50 p-2 rounded-lg border border-white/5">
                  <Clock size={14} />
                  <span className="text-sm">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Lock size={18} className="text-blue-400" />
              {t("identity.profile.security")}
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5">
                <div>
                  <p className="text-white font-medium">
                    {t("identity.profile.password")}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {t("identity.profile.passwordChanged")}
                  </p>
                </div>
                <button className="text-sm px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-md transition-colors">
                  {t("identity.profile.changePassword")}
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5">
                <div>
                  <p className="text-white font-medium">
                    {t("identity.profile.twoFactor")}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {t("identity.profile.twoFactorDesc")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">
                    {t("identity.profile.disabled")}
                  </span>
                  <button className="text-sm px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-md transition-colors">
                    {t("identity.profile.enable")}
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <GlassCard className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/10">
            <h3 className="text-sm font-bold text-blue-200 mb-2 uppercase tracking-wide">
              {t("identity.profile.accessLevel")}
            </h3>
            <p className="text-sm text-blue-200/70 mb-4">
              {t("identity.profile.accessLevelDesc")}{" "}
              <strong>{user.role}</strong>. {t("identity.profile.permissions")}
            </p>
            <ul className="space-y-2 text-sm text-zinc-300">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                {t("identity.profile.viewDashboard")}
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                {t("identity.profile.accessFiles")}
              </li>
              {user.role === "admin" && (
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                  {t("identity.profile.manageUsers")}
                </li>
              )}
            </ul>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
