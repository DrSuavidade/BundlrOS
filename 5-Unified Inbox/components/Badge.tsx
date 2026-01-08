import React from "react";
import { Priority, Status } from "../types";

interface BadgeProps {
  type: "priority" | "status" | "tag";
  value: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  type,
  value,
  className = "",
}) => {
  let colorClass = "bg-slate-700 text-slate-200 border-slate-600";

  if (type === "priority") {
    switch (value) {
      case Priority.CRITICAL:
        colorClass =
          "bg-red-900/50 text-red-200 border-red-700 border animate-pulse";
        break;
      case Priority.HIGH:
        colorClass =
          "bg-orange-900/50 text-orange-200 border-orange-700 border";
        break;
      case Priority.MEDIUM:
        colorClass =
          "bg-yellow-900/40 text-yellow-200 border-yellow-700 border";
        break;
      case Priority.LOW:
        colorClass = "bg-blue-900/40 text-blue-200 border-blue-700 border";
        break;
    }
  } else if (type === "status") {
    switch (value) {
      case Status.NEW:
        colorClass =
          "bg-emerald-900/40 text-emerald-300 border-emerald-700 border";
        break;
      case Status.TRIAGING:
        colorClass =
          "bg-purple-900/40 text-purple-300 border-purple-700 border";
        break;
      case Status.IN_PROGRESS:
        colorClass = "bg-blue-900/40 text-blue-300 border-blue-700 border";
        break;
      case Status.BLOCKED:
        colorClass = "bg-red-900/40 text-red-300 border-red-700 border";
        break;
      case Status.RESOLVED:
      case Status.CLOSED:
        colorClass =
          "bg-slate-800 text-slate-400 border-slate-700 border line-through opacity-70";
        break;
    }
  } else if (type === "tag") {
    colorClass =
      "bg-cyan-900/30 text-cyan-400 border border-cyan-800/50 text-xs px-1.5 py-0.5 rounded";
  }

  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider whitespace-nowrap ${colorClass} ${className}`}
    >
      {value}
    </span>
  );
};
