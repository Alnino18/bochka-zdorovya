import React from 'react';
import { BookOpen, Tag, BarChart3 } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';

export type NavTab = 'journal' | 'pricelist' | 'prices' | 'summary';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const { t } = useTranslation();

  const tabs: Array<{ id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    {
      id: 'journal',
      label: t('nav.journal'),
      icon: BookOpen,
    },
    {
      id: 'pricelist',
      label: t('nav.priceList'),
      icon: Tag,
    },
    {
      id: 'summary',
      label: t('nav.analytics'),
      icon: BarChart3,
    },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/90 dark:bg-black/80 backdrop-blur-2xl border-t border-slate-200 dark:border-white/10 shadow-2xl transition-colors"
      aria-label="Bottom Navigation"
      data-testid="bottom-nav"
    >
      <div className="grid grid-cols-3 max-w-md mx-auto px-2 py-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              data-testid={`bottom-nav-${tab.id}`}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-[14px] transition-all cursor-pointer ${
                isActive
                  ? 'text-emerald-600 dark:text-[#30d158] font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-white/50 dark:hover:text-white'
              }`}
            >
              <div
                className={`p-1 rounded-[10px] transition-colors ${
                  isActive ? 'bg-emerald-50 text-emerald-600 dark:bg-[#30d158]/15 dark:text-[#30d158]' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] sm:text-xs mt-0.5 tracking-tight truncate max-w-full">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
