import React, { useEffect, useState } from 'react';
import {
  X,
  Sun,
  Moon,
  ShieldAlert,
  ExternalLink,
  Info,
  Smartphone,
  Download,
  CheckCircle2,
  Share,
  MoreVertical,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  onInstallApp: () => Promise<boolean>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  theme,
  onToggleTheme,
  isInstallable,
  isInstalled,
  isIOS,
  isAndroid,
  onInstallApp,
}) => {
  const [isInstalling, setIsInstalling] = useState(false);

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

  const handleInstallClick = async () => {
    setIsInstalling(true);
    try {
      await onInstallApp();
    } finally {
      setIsInstalling(false);
    }
  };

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
                تخصيص المظهر، التثبيت، التواصل وإخلاء المسؤولية
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

          {/* Install App (PWA) Section */}
          <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/25 border border-teal-200/80 dark:border-teal-800/60 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Download className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                <span>تثبيت التطبيق</span>
              </h3>
              {isInstalled ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>مثبّت</span>
                </span>
              ) : isInstallable ? (
                <span className="text-[11px] font-bold text-teal-700 dark:text-teal-300">
                  التثبيت المباشر متاح
                </span>
              ) : (
                <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
                  الشاشة الرئيسية (PWA)
                </span>
              )}
            </div>

            {isInstalled ? (
              <div className="p-3 rounded-xl bg-white/80 dark:bg-stone-900/70 border border-emerald-200/70 dark:border-emerald-900/50 text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                التطبيق مثبّت حالياً على جهازك ويعمل كتطبيق مستقل من الشاشة الرئيسية، مع دعم العمل
                حتى دون اتصال بالإنترنت.
              </div>
            ) : (
              <>
                <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                  أضف «رحلة أسرتي» إلى الشاشة الرئيسية لهاتفك للوصول السريع كتطبيق مستقل والعمل بدون
                  إنترنت.
                </p>

                {isInstallable && (
                  <button
                    type="button"
                    disabled={isInstalling}
                    onClick={handleInstallClick}
                    className="w-full min-h-[46px] px-4 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-[0.98] disabled:opacity-60 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-teal-700/20 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isInstalling ? 'جارٍ التثبيت...' : 'تثبيت التطبيق الآن'}</span>
                  </button>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* iPhone (Safari) Instructions */}
                  <div
                    className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                      isIOS
                        ? 'bg-white dark:bg-stone-900 border-teal-300 dark:border-teal-700 ring-1 ring-teal-500/20'
                        : 'bg-white/75 dark:bg-stone-900/60 border-stone-200/80 dark:border-stone-800'
                    }`}
                  >
                    <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center justify-between gap-1.5">
                      <span>آيفون (سفاري)</span>
                      <Share className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                    </div>
                    <ol className="space-y-1 text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed list-decimal list-inside">
                      <li>افتح الرابط في متصفح Safari.</li>
                      <li>اضغط أيقونة المشاركة في الشريط السفلي.</li>
                      <li>اختر «إضافة إلى الصفحة الرئيسية» ثم «إضافة».</li>
                    </ol>
                  </div>

                  {/* Android (Chrome) Instructions */}
                  <div
                    className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                      isAndroid
                        ? 'bg-white dark:bg-stone-900 border-teal-300 dark:border-teal-700 ring-1 ring-teal-500/20'
                        : 'bg-white/75 dark:bg-stone-900/60 border-stone-200/80 dark:border-stone-800'
                    }`}
                  >
                    <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center justify-between gap-1.5">
                      <span>أندرويد (كروم)</span>
                      <MoreVertical className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                    </div>
                    <ol className="space-y-1 text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed list-decimal list-inside">
                      <li>اضغط زر «تثبيت التطبيق» أعلاه عند ظهوره.</li>
                      <li>أو افتح قائمة المتصفح (⋮) بالأعلى.</li>
                      <li>اختر «تثبيت التطبيق» أو «الإضافة للشاشة الرئيسية».</li>
                    </ol>
                  </div>
                </div>
              </>
            )}
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
              تم تصميم تطبيق «بيانات الأسرة» لأغراض التنظيم العائلي والاستخدام الشخصي فقط. جميع الحسابات (الأعمار، مدة الزواج، الفوارق الزمنية، والخط الزمني) تتم محلياً على جهازك وفق التقويم الميلادي وبناءً على التواريخ التي تدخلها، ولا تُعد هذه النتائج وثيقة رسمية أو طبية أو قانونية. تبقى بياناتك محفوظة داخل متصفح جهاز المستخدم فقط ولا تُرسل إلى أي خادم، وقد تُفقد عند مسح بيانات المتصفح أو تغيير الجهاز، لذا يُنصح بالاحتفاظ بنسخة احتياطية بشكل دوري. يُستخدم التطبيق على مسؤولية المستخدم.
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
