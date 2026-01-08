import React from "react";
import { Factory, Status } from "../types";
import { Box, Play, AlertOctagon, CheckSquare } from "lucide-react";

interface FactoryListProps {
  factories: Factory[];
  selectedFactoryId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
}

const FactoryList: React.FC<FactoryListProps> = ({
  factories,
  selectedFactoryId,
  onSelect,
  onCreate,
}) => {
  return (
    <div className="w-64 bg-industrial-900 border-r border-industrial-800 flex flex-col h-full">
      <div className="p-4 border-b border-industrial-800 bg-industrial-950">
        <h2 className="text-industrial-100 font-bold uppercase tracking-widest text-sm flex items-center gap-2">
          <Box className="w-4 h-4 text-blue-500" />
          Factories
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {factories.length === 0 && (
          <div className="p-6 text-center text-industrial-600 text-sm">
            No active factories.
            <br />
            Bootstrap one to begin.
          </div>
        )}
        {factories.map((factory) => (
          <button
            key={factory.id}
            onClick={() => onSelect(factory.id)}
            className={`
              w-full text-left p-4 border-b border-industrial-800 hover:bg-industrial-800/50 transition-colors group
              ${
                selectedFactoryId === factory.id
                  ? "bg-industrial-800 border-l-2 border-l-blue-500"
                  : "border-l-2 border-l-transparent"
              }
            `}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="font-mono text-xs text-industrial-400">
                #{factory.contractId}
              </span>
              {factory.status === Status.BLOCKED && (
                <AlertOctagon size={14} className="text-amber-500" />
              )}
              {factory.status === Status.ACTIVE && (
                <Play size={14} className="text-emerald-500" />
              )}
              {factory.status === Status.COMPLETED && (
                <CheckSquare size={14} className="text-blue-500" />
              )}
            </div>
            <div
              className={`font-semibold text-sm truncate ${
                selectedFactoryId === factory.id
                  ? "text-white"
                  : "text-industrial-300"
              }`}
            >
              {factory.clientName}
            </div>
            <div className="text-[10px] text-industrial-500 mt-1 uppercase truncate">
              {factory.status}
            </div>
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-industrial-800 bg-industrial-950">
        <button
          onClick={onCreate}
          className="w-full py-2 bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold uppercase tracking-wider rounded transition-colors shadow-lg shadow-blue-900/20"
        >
          Bootstrap Factory
        </button>
      </div>
    </div>
  );
};

export default FactoryList;
