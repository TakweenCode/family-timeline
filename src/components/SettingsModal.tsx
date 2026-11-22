import React, { useEffect } from 'react';
import { X, Sun, Moon, ShieldAlert, ExternalLink, Info, Smartphone } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  theme,
  onToggleTheme,
}) => {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl border-t sm:border border-stone-200 dark:border-stone-800 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] transition-colors max-h-[88vh] overflow-y-auto">
        {/* Mobile drag handle affordance */}
        <div className="w-10 h-1.5 bg-stone-300 dark:bg-stone-700 rounded-full mx-auto mb-4 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200/80 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 flex items-center justify-center border border-teal-200/70 dark:border-teal-800/60 shrink-0">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="settings-modal-title"
                className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 leading-tight"
              >
                الإعدادات والمعلومات
              </h2>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                تخصيص المظهر والتواصل وإخلاء المسؤولية
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            aria-label="إغلاق نافذة الإعدادات"
            className="min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors focus-visible:outline-2 focus-visible:outline-teal-600 active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {/* Theme Switch Section */}
          <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                مظهر التطبيق
              </span>
              <span className="text-[11px] text-stone-500 dark:text-stone-400">
                {theme === 'dark' ? 'الوضع الداكن مفعل' : 'الوضع الفاتح مفعل'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  if (theme !== 'light') onToggleTheme();
                }}
                className={`min-h-[44px] px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all border ${
                  theme === 'light'
                    ? 'bg-white text-teal-700 border-teal-300 shadow-sm ring-2 ring-teal-500/15'
                    : 'bg-transparent text-stone-400 border-stone-700 hover:text-stone-200'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span>الوضع الفاتح</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (theme !== 'dark') onToggleTheme();
                }}
                className={`min-h-[44px] px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all border ${
                  theme === 'dark'
                    ? 'bg-stone-900 text-teal-300 border-teal-700 shadow-sm ring-2 ring-teal-500/20'
                    : 'bg-transparent text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <Moon className="w-4 h-4 text-teal-500 dark:text-teal-300" />
                <span>الوضع الداكن</span>
              </button>
            </div>
          </div>

          {/* Developer Contact Section (Telegram) */}
          <div className="p-4 rounded-2xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200/80 dark:border-sky-800/60 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                التواصل مع المطوّر
              </h3>
              <span className="text-[11px] font-medium text-sky-700 dark:text-sky-300">
                تيليجرام
              </span>
            </div>

            <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
              للملاحظات والاقتراحات والاستفسارات أو طلب تطبيقك الخاص.
            </p>

            <a
              href="https://t.me/salehapp"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-[#229ED9] hover:bg-[#1c8ec4] active:scale-[0.98] text-white font-bold text-sm flex items-center justify-between gap-3 shadow-sm shadow-sky-600/20 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
            >
              <span className="flex items-center gap-2.5">
                {/* Official Telegram Paper Plane SVG */}
                <svg
                  className="w-5 h-5 fill-current shrink-0"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
                <span>مراسلة @salehapp</span>
              </span>
              <ExternalLink className="w-4 h-4 opacity-90 shrink-0" />
            </a>
          </div>

          {/* Disclaimer Section */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-800 dark:text-stone-200">
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>إخلاء المسؤولية</span>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              تم تصميم تطبيق «بيانات الأسرة» لأغراض التنظيم العائلي والاستخدام الشخصي فقط. جميع الحسابات (الأعمار، مدة الزواج، الفوارق الزمنية، والخط الزمني) تتم محلياً على جهازك وفق التقويم الميلادي وبناءً على التواريخ التي تقوم بإدخالها، ولا تُعد هذه النتائج وثيقة رسمية أو طبية أو قانونية. كما أن جميع بياناتك تبقى محفوظة داخل متصفح هذا الجهاز فقط ولا يتم إرسالها أو تخزينها على أي خادم خارجي، لذا يُنصح بالاحتفاظ بنسخة احتياطية بشكل دوري.
            </p>
          </div>

          {/* App Footer Note */}
          <div className="flex items-center justify-between pt-1 text-[11px] text-stone-500 dark:text-stone-400">
            <span className="flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5" />
              <span>مُصمم ومُحسّن لشاشات الجوال</span>
            </span>
            <button
              type="button"
              onClick={onClose}
              className="min-h-[40px] px-4 rounded-xl bg-stone-200/80 dark:bg-stone-800 hover:bg-stone-300/80 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs transition-colors active:scale-95"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
