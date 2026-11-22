import React from 'react';
import { Home, BarChart2, UserPlus, FileText, Plus } from 'lucide-react';
import { TabType } from '../types';

interface BottomNavProps {
  currentTab: TabType;
  onChangeTab: (tab: TabType) => void;
  onOpenAddChild: () => void;
  showFab?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onChangeTab,
  onOpenAddChild,
  showFab = true,
}) => {
  const tabs: { id: TabType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'home', label: 'الرئيسية', icon: Home },
    { id: 'analytics', label: 'الإحصائيات', icon: BarChart2 },
    { id: 'entry', label: 'الإدخال', icon: UserPlus },
    { id: 'report', label: 'التقرير', icon: FileText },
  ];

  return (
    <>
      {/* Floating Action Button (FAB) for adding child on mobile */}
      {showFab && (
        <button
          onClick={onOpenAddChild}
          type="button"
          aria-label="إضافة ابن أو ابنة"
          className="fixed left-4 bottom-[calc(72px+env(safe-area-inset-bottom,0px))] z-40 w-14 h-14 rounded-full bg-teal-600 hover:bg-teal-700 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-teal-700/35 transition-transform duration-150 border border-teal-500/30 no-print"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      )}

      {/* Fixed Bottom Navigation Bar */}
      <nav
        aria-label="التنقل الرئيسي"
        className="fixed bottom-0 inset-x-0 z-30 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-200/80 dark:border-stone-800 pb-[env(safe-area-inset-bottom,0px)] no-print transition-colors"
      >
        <div className="max-w-2xl mx-auto px-2 h-[60px] grid grid-cols-4 items-center">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onChangeTab(tab.id)}
                type="button"
                className={`flex flex-col items-center justify-center min-h-[50px] py-1 rounded-xl transition-all duration-150 active:scale-95 ${
                  isActive
                    ? 'text-teal-700 dark:text-teal-300 font-bold'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 font-medium'
                }`}
              >
                <div
                  className={`flex items-center justify-center w-10 h-7 rounded-lg transition-colors ${
                    isActive ? 'bg-teal-100 dark:bg-teal-950/80' : 'bg-transparent'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
                </div>
                <span className="text-[11px] mt-0.5 tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
