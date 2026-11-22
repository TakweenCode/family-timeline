import React from 'react';
import { Moon, Sun, Sparkles, Share2, Settings } from 'lucide-react';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onLoadSample: () => void;
  hasData: boolean;
  onShareReport?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  onOpenSettings,
  onLoadSample,
  hasData,
  onShareReport,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 transition-colors no-print">
      <div className="max-w-2xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between gap-2">
        {/* Brand Zone */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm shadow-teal-700/20 shrink-0">
            <span className="text-lg font-bold leading-none">👨‍👩‍👧‍👦</span>
          </div>
          <div className="flex flex-col min-w-0">
            <h1 className="text-base font-bold text-stone-900 dark:text-stone-100 tracking-tight leading-tight truncate">
              بيانات الأسرة
            </h1>
            <span className="text-[11px] text-stone-500 dark:text-stone-400 leading-none truncate">
              حاسبة الأعمار والتواريخ
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 shrink-0">
          {!hasData && (
            <button
              onClick={onLoadSample}
              type="button"
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 rounded-xl transition-colors border border-teal-200 dark:border-teal-800/60 min-h-[44px] whitespace-nowrap shrink-0 active:scale-95"
              title="تجربة بيانات توضيحية لأسرة افتراضية"
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>تجربة سريعة</span>
            </button>
          )}

          {hasData && onShareReport && (
            <button
              onClick={onShareReport}
              type="button"
              className="min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors active:scale-95 focus-visible:outline-2 focus-visible:outline-teal-600"
              title="مشاركة التقرير"
              aria-label="مشاركة التقرير"
            >
              <Share2 className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={onToggleTheme}
            type="button"
            className="min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors active:scale-95 focus-visible:outline-2 focus-visible:outline-teal-600"
            title={theme === 'dark' ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الليلي'}
            aria-label={theme === 'dark' ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الليلي'}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-stone-600" />
            )}
          </button>

          <button
            onClick={onOpenSettings}
            type="button"
            className="min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors active:scale-95 focus-visible:outline-2 focus-visible:outline-teal-600"
            title="الإعدادات والمعلومات"
            aria-label="الإعدادات والمعلومات"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
