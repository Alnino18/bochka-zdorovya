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
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 shadow-lg"
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
              onClick={() => onTabChange(tab.id)}
              data-testid={`bottom-nav-${tab.id}`}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-lg transition-all ${
                isActive
                  ? 'text-teal-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className={`p-1 rounded-md transition-colors ${
                  isActive ? 'bg-teal-500/20' : ''
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
