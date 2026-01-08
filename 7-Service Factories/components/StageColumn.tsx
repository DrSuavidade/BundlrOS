import React from "react";
import { StageTemplate, Factory, Status, Deliverable } from "../types";
import {
  CheckCircle,
  AlertTriangle,
  Box,
  FileText,
  Anchor,
} from "lucide-react";

interface StageColumnProps {
  stage: StageTemplate;
  factory: Factory;
  isActive: boolean;
  isPast: boolean;
  onUpdateDeliverable: (id: string) => void;
}

const StageColumn: React.FC<StageColumnProps> = ({
  stage,
  factory,
  isActive,
  isPast,
  onUpdateDeliverable,
}) => {
  const isBlocked = isActive && factory.status === Status.BLOCKED;

  // Filter deliverables relevant to this stage (simple logic: all required ones + generic pool if needed)
  // For this viz, we only show required deliverables in the stage they block
  const relevantDeliverables = factory.deliverables.filter((d) =>
    stage.requiredDeliverables.includes(d.id)
  );

  return (
    <div
      className={`
      flex-shrink-0 w-80 flex flex-col border-r border-industrial-800 h-full
      ${isActive ? "bg-industrial-800/30" : "bg-transparent"}
      ${isPast ? "opacity-50 grayscale" : ""}
      transition-all duration-300
    `}
    >
      {/* Header */}
      <div
        className={`
        p-4 border-b border-industrial-700 flex justify-between items-center
        ${isActive ? "bg-industrial-800" : ""}
        ${isBlocked ? "border-b-amber-600" : ""}
      `}
      >
        <div className="flex items-center gap-2">
          <div
            className={`
            w-6 h-6 rounded flex items-center justify-center font-mono text-xs font-bold
            ${isActive && !isBlocked ? "bg-blue-600 text-white" : ""}
            ${isActive && isBlocked ? "bg-amber-600 text-black" : ""}
            ${!isActive && isPast ? "bg-emerald-800 text-emerald-200" : ""}
            ${
              !isActive && !isPast
                ? "bg-industrial-700 text-industrial-400"
                : ""
            }
          `}
          >
            {stage.order + 1}
          </div>
          <span
            className={`font-mono text-sm uppercase tracking-wider ${
              isActive ? "text-white" : "text-industrial-400"
            }`}
          >
            {stage.name}
          </span>
        </div>
        {isBlocked && (
          <AlertTriangle className="w-5 h-5 text-amber-500 animate-pulse" />
        )}
        {isPast && <CheckCircle className="w-5 h-5 text-emerald-500" />}
      </div>

      {/* Body */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {relevantDeliverables.length === 0 && (
          <div className="text-xs text-industrial-500 italic font-mono p-2 border border-dashed border-industrial-700 rounded">
            No specific deliverables required.
          </div>
        )}

        {relevantDeliverables.map((d) => (
          <div
            key={d.id}
            className={`
              p-3 rounded border text-sm transition-colors group relative
              ${
                d.status === "APPROVED"
                  ? "bg-emerald-900/10 border-emerald-800 text-emerald-400"
                  : ""
              }
              ${
                d.status === "READY"
                  ? "bg-blue-900/10 border-blue-800 text-blue-300"
                  : ""
              }
              ${
                d.status === "PENDING"
                  ? "bg-industrial-900 border-industrial-700 text-industrial-300"
                  : ""
              }
            `}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="font-medium flex items-center gap-2">
                {d.type === "DOCUMENT" && <FileText size={14} />}
                {d.type === "COMPONENT" && <Box size={14} />}
                {d.type === "ASSET" && <Anchor size={14} />}
                {d.name}
              </span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded border 
                 ${
                   d.status === "APPROVED"
                     ? "border-emerald-700 text-emerald-500"
                     : "border-industrial-600 text-industrial-500"
                 }
              `}
              >
                {d.status}
              </span>
            </div>

            {/* Quick Action Mockup */}
            {d.status !== "APPROVED" && (
              <button
                onClick={() => onUpdateDeliverable(d.id)}
                className="w-full mt-2 py-1 text-xs border border-industrial-600 hover:bg-industrial-700 rounded text-industrial-400 hover:text-white transition-colors uppercase tracking-wide"
              >
                {d.status === "PENDING" ? "Mark Ready" : "Approve"}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Footer / Status Bar for Stage */}
      <div className="p-2 bg-industrial-900/50 border-t border-industrial-800 text-[10px] font-mono text-industrial-500 text-center uppercase">
        Stage ID: {stage.id}
      </div>
    </div>
  );
};

export default StageColumn;
