import React from 'react';
import { Category, Tier, BudgetSelectionState, AtomicService, TierDefinition } from '../types';
import { Check, Info } from 'lucide-react';

interface CategoryBuilderProps {
  selections: BudgetSelectionState;
  onUpdate: (category: Category, tier: Tier | undefined, serviceId: string | undefined) => void;
  data: {
    CATEGORIES: { id: Category; label: string; color: string }[];
    TIERS: { id: Tier; label: string }[];
    TIER_DEFINITIONS: TierDefinition[];
    ATOMIC_SERVICES: AtomicService[];
  };
  labels: any;
}

export const CategoryBuilder: React.FC<CategoryBuilderProps> = ({ selections, onUpdate, data, labels }) => {
  const { CATEGORIES, TIERS, TIER_DEFINITIONS, ATOMIC_SERVICES } = data;
  
  const getCategoryColor = (color: string) => {
    switch (color) {
      case 'blue': return 'border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300';
      case 'pink': return 'border-pink-200 bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:border-pink-800 dark:text-pink-300';
      case 'indigo': return 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-300';
      case 'purple': return 'border-purple-200 bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:border-purple-800 dark:text-purple-300';
      case 'emerald': return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-300';
      default: return 'border-slate-200 bg-slate-50 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300';
    }
  };

  const getTierDescription = (cat: Category, tier: Tier) => {
    return TIER_DEFINITIONS.find(td => td.category === cat && td.tier === tier)?.description || '';
  };

  return (
    <div className="space-y-8">
      {CATEGORIES.map((category) => {
        const categoryServices = ATOMIC_SERVICES.filter(s => s.category === category.id);
        const currentSelection = selections[category.id];
        const isActive = currentSelection && currentSelection.serviceIds.length > 0;
        const currentTier = currentSelection?.tier || 'standard';

        return (
          <div key={category.id} className={`rounded-xl border-2 transition-all ${isActive ? 'border-slate-400 dark:border-slate-500 shadow-md' : 'border-slate-100 dark:border-slate-800 opacity-90'}`}>
            
            {/* Header */}
            <div className={`p-4 rounded-t-xl border-b dark:border-b-white/10 flex justify-between items-center ${getCategoryColor(category.color)} bg-opacity-30`}>
              <h3 className="font-bold text-lg flex items-center gap-2">
                {category.label}
                {isActive && <span className="text-xs bg-white dark:bg-slate-800 bg-opacity-50 px-2 py-1 rounded-full text-slate-700 dark:text-slate-300 font-mono">{currentSelection.serviceIds.length}</span>}
              </h3>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 rounded-b-xl">
              
              {/* Tier Selection */}
              <div className="mb-6">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 block">{labels.selectTierScope}</label>
                <div className="grid grid-cols-3 gap-3">
                  {TIERS.map((tier) => (
                    <button
                      key={tier.id}
                      onClick={() => onUpdate(category.id, tier.id, undefined)}
                      className={`
                        py-2 px-3 rounded-lg text-sm font-medium border text-center transition-all
                        ${currentTier === tier.id 
                          ? 'bg-slate-800 text-white border-slate-800 shadow-md dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100' 
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 dark:hover:border-slate-600'}
                      `}
                    >
                      {tier.label}
                    </button>
                  ))}
                </div>
                {/* Dynamic Tier Description */}
                <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed flex gap-2">
                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-slate-400" />
                    <span>{getTierDescription(category.id, currentTier)}</span>
                </div>
              </div>

              {/* Service Selection */}
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 block">{labels.selectServices}</label>
                <div className="grid grid-cols-1 gap-2">
                  {categoryServices.map((service) => {
                    const isSelected = currentSelection?.serviceIds.includes(service.id);
                    return (
                      <div 
                        key={service.id}
                        onClick={() => onUpdate(category.id, undefined, service.id)}
                        className={`
                          group flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm
                          ${isSelected 
                            ? 'border-green-500 bg-green-50/30 dark:bg-green-900/20 dark:border-green-600' 
                            : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700'}
                        `}
                      >
                        <div className={`
                          w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors
                          ${isSelected 
                            ? 'bg-green-500 border-green-500' 
                            : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 group-hover:border-blue-400'}
                        `}>
                          {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <div>
                          <div className={`font-medium text-sm ${isSelected ? 'text-green-900 dark:text-green-300' : 'text-slate-800 dark:text-slate-200'}`}>
                            {service.label}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {service.description}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
};
