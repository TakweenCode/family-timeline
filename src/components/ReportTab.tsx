import React, { useState } from 'react';
import { Share2, Copy, Printer, Download, X, FileCode2, FileText } from 'lucide-react';
import { FamilyCalculations, FamilyState } from '../types';
import { generateTextReport, formatDateArabic, formatAge, formatYearsDecimal } from '../utils/calc';
import { downloadFile } from '../utils/storage';

interface ReportTabProps {
  state: FamilyState;
  calc: FamilyCalculations;
  onGoToEntry: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ReportTab: React.FC<ReportTabProps> = ({
  state,
  calc,
  onGoToEntry,
  onShowToast,
}) => {
  const [showPrintFallback, setShowPrintFallback] = useState(false);
  const reportText = generateTextReport(state, calc);

  const hasData = Boolean(
    state.fatherName ||
      state.fatherBirth ||
      state.motherName ||
      state.motherBirth ||
      state.weddingDate ||
      (state.children && state.children.length > 0)
  );

  const handleShare = async () => {
    if (!reportText) {
      onShowToast('يرجى إدخال بيانات الأسرة أولاً', 'error');
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'تقرير بيانات الأسرة',
          text: reportText,
        });
        onShowToast('تمت مشاركة التقرير بنجاح', 'success');
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }

    // Fallback to clipboard
    handleCopy('تم نسخ التقرير لمشاركته في واتساب أو الرسائل');
  };

  const handleCopy = async (customMsg?: string) => {
    if (!reportText) {
      onShowToast('يرجى إدخال بيانات الأسرة أولاً', 'error');
      return;
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(reportText);
        onShowToast(customMsg || 'تم نسخ نص التقرير للحافظة', 'success');
      } else {
        onShowToast('تعذّر النسخ التلقائي، يمكنك نسخ النص من المربع بالأسفل', 'info');
      }
    } catch {
      onShowToast('تعذّر النسخ التلقائي، يرجى التحديد والنسخ يدوياً', 'error');
    }
  };

  const handleDownloadTxt = () => {
    if (!reportText) {
      onShowToast('يرجى إدخال بيانات الأسرة أولاً', 'error');
      return;
    }
    const dateStr = new Date().toISOString().split('T')[0];
    downloadFile(`family-report-${dateStr}.txt`, reportText, 'text/plain;charset=utf-8');
    onShowToast('تم تنزيل ملف التقرير النصي', 'success');
  };

  const buildPrintableHtml = () => {
    const escapedText = reportText
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>تقرير بيانات الأسرة</title>
  <style>
    @page { margin: 14mm; }
    body {
      font-family: Tahoma, Arial, system-ui, sans-serif;
      background: #ffffff;
      color: #1c1917;
      max-width: 720px;
      margin: 24px auto;
      padding: 0 16px;
      line-height: 1.85;
    }
    .actions {
      display: flex;
      gap: 10px;
      margin-bottom: 18px;
    }
    .btn {
      background: #0d9488;
      color: #fff;
      border: none;
      padding: 10px 18px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: bold;
      cursor: pointer;
    }
    .card {
      border: 1px solid #e7e5e4;
      border-radius: 16px;
      padding: 20px;
      background: #fafaf9;
    }
    h1 {
      margin: 0 0 8px;
      font-size: 20px;
      color: #0f766e;
    }
    pre {
      white-space: pre-wrap;
      font-family: inherit;
      font-size: 14px;
      margin: 0;
    }
    @media print {
      .actions { display: none; }
      body { margin: 0; padding: 0; }
      .card { border: none; background: #fff; padding: 0; }
    }
  </style>
</head>
<body>
  <div class="actions">
    <button class="btn" onclick="window.print()">طباعة / حفظ PDF</button>
  </div>
  <div class="card">
    <h1>تقرير بيانات الأسرة</h1>
    <pre>${escapedText}</pre>
  </div>
</body>
</html>`;
  };

  const handleDownloadPrintableHtml = () => {
    if (!reportText) return;
    const dateStr = new Date().toISOString().split('T')[0];
    downloadFile(`family-report-${dateStr}.html`, buildPrintableHtml(), 'text/html;charset=utf-8');
    setShowPrintFallback(false);
    onShowToast('تم تنزيل صفحة الطباعة، افتحها في المتصفح للطباعة أو الحفظ كـ PDF', 'success');
  };

  const handlePrint = () => {
    if (!reportText) {
      onShowToast('يرجى إدخال بيانات الأسرة أولاً', 'error');
      return;
    }

    const htmlEl = document.documentElement;
    const wasDark = htmlEl.classList.contains('dark');
    if (wasDark) {
      htmlEl.classList.remove('dark');
    }

    let printTriggered = false;
    const restoreTheme = () => {
      if (wasDark) {
        htmlEl.classList.add('dark');
      }
    };
    const onBeforePrint = () => {
      printTriggered = true;
    };
    const onAfterPrint = () => {
      restoreTheme();
    };

    window.addEventListener('beforeprint', onBeforePrint, { once: true });
    window.addEventListener('afterprint', onAfterPrint, { once: true });

    try {
      window.print();
    } catch {
      restoreTheme();
      window.removeEventListener('beforeprint', onBeforePrint);
      window.removeEventListener('afterprint', onAfterPrint);
      setShowPrintFallback(true);
      return;
    }

    window.setTimeout(() => {
      window.removeEventListener('beforeprint', onBeforePrint);
      if (!printTriggered) {
        restoreTheme();
        window.removeEventListener('afterprint', onAfterPrint);
        setShowPrintFallback(true);
      }
    }, 350);
  };

  if (!hasData) {
    return (
      <div className="py-12 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-400 mx-auto flex items-center justify-center text-2xl">
          📄
        </div>
        <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
          لا يوجد تقرير متاح حالياً
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xs mx-auto">
          أدخل بيانات أسرتك في تبويب «الإدخال» لتوليد تقرير شامل قابل للمشاركة والطباعة.
        </p>
        <button
          onClick={onGoToEntry}
          type="button"
          className="px-5 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs"
        >
          الانتقال لتبويب الإدخال
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24 print:pb-0">
      {/* Mobile Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 no-print">
        <button
          onClick={handleShare}
          type="button"
          className="min-h-[44px] px-3 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-teal-700/20 transition-all"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>مشاركة التقرير</span>
        </button>
        <button
          onClick={() => handleCopy()}
          type="button"
          className="min-h-[44px] px-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 active:scale-95 text-stone-800 dark:text-stone-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-stone-200 dark:border-stone-700"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>نسخ التقرير</span>
        </button>
        <button
          onClick={handleDownloadTxt}
          type="button"
          className="min-h-[44px] px-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 active:scale-95 text-stone-800 dark:text-stone-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-stone-200 dark:border-stone-700"
        >
          <Download className="w-3.5 h-3.5" />
          <span>حفظ كملف نصي</span>
        </button>
        <button
          onClick={handlePrint}
          type="button"
          className="min-h-[44px] px-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 active:scale-95 text-stone-800 dark:text-stone-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-stone-200 dark:border-stone-700"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>طباعة / PDF</span>
        </button>
      </div>

      {/* Styled Printable Report Card */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-6 border border-stone-200 dark:border-stone-800 shadow-sm transition-colors space-y-5 print:border-none print:shadow-none print:p-0">
        {/* Report Header */}
        <div className="border-b border-stone-200 dark:border-stone-800 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 flex items-center justify-center text-xl shrink-0">
              📋
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100">
                تقرير بيانات الأسرة
              </h2>
              <div className="text-[11px] text-stone-500 dark:text-stone-400">
                التاريخ: {formatDateArabic(calc.now)}
              </div>
            </div>
          </div>
          <div className="text-left text-[11px] text-stone-400">
            {calc.children.length} أبناء
          </div>
        </div>

        {/* Marriage Summary */}
        {calc.weddingDate && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider">
              عقد الزواج والذكرى السنوية
            </h3>
            <div className="divide-y divide-stone-100 dark:divide-stone-800 text-xs">
              <div className="flex justify-between py-1.5">
                <span className="text-stone-500 dark:text-stone-400">تاريخ الزواج</span>
                <span className="font-bold text-stone-800 dark:text-stone-200">
                  {formatDateArabic(calc.weddingDate)} ({calc.weddingDate.toLocaleDateString('ar-u-ca-gregory-nu-latn', { weekday: 'long' })})
                </span>
              </div>
              {calc.marriageDuration && !calc.marriageDuration.neg && (
                <div className="flex justify-between py-1.5">
                  <span className="text-stone-500 dark:text-stone-400">مدة الزواج الحالية</span>
                  <span className="font-bold text-teal-700 dark:text-teal-400 tabular-nums">
                    {formatAge(calc.marriageDuration, true)}
                  </span>
                </div>
              )}
              {calc.daysUntilAnniversary !== null && (
                <div className="flex justify-between py-1.5">
                  <span className="text-stone-500 dark:text-stone-400">الذكرى السنوية القادمة</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200">
                    {calc.daysUntilAnniversary === 0
                      ? 'اليوم ذكرى الزواج!'
                      : `بعد ${calc.daysUntilAnniversary} يوماً (${formatDateArabic(calc.nextAnniversary!)})`}
                  </span>
                </div>
              )}
              {calc.fatherAgeAtMarriage && (
                <div className="flex justify-between py-1.5">
                  <span className="text-stone-500 dark:text-stone-400">
                    عمر الأب {state.fatherName ? `(${state.fatherName})` : ''} عند الزواج
                  </span>
                  <span className="font-semibold text-stone-700 dark:text-stone-300 tabular-nums">
                    {formatAge(calc.fatherAgeAtMarriage)}
                  </span>
                </div>
              )}
              {calc.motherAgeAtMarriage && (
                <div className="flex justify-between py-1.5">
                  <span className="text-stone-500 dark:text-stone-400">
                    عمر الأم {state.motherName ? `(${state.motherName})` : ''} عند الزواج
                  </span>
                  <span className="font-semibold text-stone-700 dark:text-stone-300 tabular-nums">
                    {formatAge(calc.motherAgeAtMarriage)}
                  </span>
                </div>
              )}
              {calc.parentsAgeDiff && (
                <div className="flex justify-between py-1.5">
                  <span className="text-stone-500 dark:text-stone-400">فارق العمر بين الأبوين</span>
                  <span className="font-semibold text-stone-700 dark:text-stone-300 tabular-nums">
                    {formatAge(calc.parentsAgeDiff.diff)}
                    {calc.parentsAgeDiff.elder === 'father'
                      ? ' (الأب أكبر)'
                      : calc.parentsAgeDiff.elder === 'mother'
                      ? ' (الأم أكبر)'
                      : ''}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Children Summary */}
        {calc.children.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-stone-200 dark:border-stone-800">
            <h3 className="text-xs font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider">
              بيانات وإحصائيات الأبناء ({calc.children.length})
            </h3>

            <div className="divide-y divide-stone-100 dark:divide-stone-800 text-xs">
              <div className="flex justify-between py-1.5">
                <span className="text-stone-500 dark:text-stone-400">العدد وتوزيع الجنس</span>
                <span className="font-bold text-stone-800 dark:text-stone-200">
                  {calc.children.length} ({calc.boysCount} ذكور · {calc.girlsCount} إناث)
                </span>
              </div>
              {calc.oldestToYoungestGap && !calc.oldestToYoungestGap.neg && (
                <div className="flex justify-between py-1.5">
                  <span className="text-stone-500 dark:text-stone-400">
                    الفارق بين الابن الأكبر والأصغر
                  </span>
                  <span className="font-bold text-stone-800 dark:text-stone-200 tabular-nums">
                    {formatAge(calc.oldestToYoungestGap)}
                  </span>
                </div>
              )}
              {calc.avgChildSpacing && (
                <div className="flex justify-between py-1.5">
                  <span className="text-stone-500 dark:text-stone-400">
                    متوسط المباعدة بين الولادات
                  </span>
                  <span className="font-bold text-teal-700 dark:text-teal-400 tabular-nums">
                    {formatYearsDecimal(calc.avgChildSpacing)}
                  </span>
                </div>
              )}
              {calc.maxChildSpacing && (
                <div className="flex justify-between py-1.5">
                  <span className="text-stone-500 dark:text-stone-400">
                    أكبر فارق بين ولادتين متتاليتين
                  </span>
                  <span className="font-semibold text-stone-700 dark:text-stone-300 tabular-nums">
                    {formatYearsDecimal(calc.maxChildSpacing)}
                  </span>
                </div>
              )}
              {calc.avgFatherAgeAtChild && (
                <div className="flex justify-between py-1.5">
                  <span className="text-stone-500 dark:text-stone-400">
                    متوسط عمر الأب عند الإنجاب
                  </span>
                  <span className="font-semibold text-stone-700 dark:text-stone-300 tabular-nums">
                    {formatYearsDecimal(calc.avgFatherAgeAtChild)}
                  </span>
                </div>
              )}
              {calc.avgMotherAgeAtChild && (
                <div className="flex justify-between py-1.5">
                  <span className="text-stone-500 dark:text-stone-400">
                    متوسط عمر الأم عند الإنجاب
                  </span>
                  <span className="font-semibold text-stone-700 dark:text-stone-300 tabular-nums">
                    {formatYearsDecimal(calc.avgMotherAgeAtChild)}
                  </span>
                </div>
              )}
            </div>

            {/* Detailed per-child rows */}
            <div className="space-y-2 pt-2">
              <div className="text-[11px] font-bold text-stone-700 dark:text-stone-300">
                تفاصيل الأبناء حسب ترتيب الميلاد:
              </div>
              <div className="space-y-2">
                {calc.children.map((child, idx) => (
                  <div
                    key={child.id}
                    className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-800 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-bold text-stone-900 dark:text-stone-100">
                      <span>
                        {idx + 1}. {child.gender === 'f' ? '👧' : '👦'} {child.name}
                      </span>
                      <span className="text-teal-700 dark:text-teal-400 tabular-nums">
                        {formatAge(child.currentAge, true)}
                      </span>
                    </div>
                    <div className="text-stone-500 dark:text-stone-400 text-[11px]">
                      وُلد يوم {child.weekdayName} الموافق {child.formattedDate}
                    </div>
                    <div className="pt-1 text-[11px] text-stone-600 dark:text-stone-300 space-y-0.5">
                      {child.fatherAgeAtBirth && (
                        <div>• عمر الأب عند ولادته: {formatAge(child.fatherAgeAtBirth)}</div>
                      )}
                      {child.motherAgeAtBirth && (
                        <div>• عمر الأم عند ولادتها: {formatAge(child.motherAgeAtBirth)}</div>
                      )}
                      {child.timeSinceWedding && (
                        <div>
                          • بعد الزواج بـ:{' '}
                          {child.timeSinceWedding.neg
                            ? 'قبل الزواج'
                            : formatAge(child.timeSinceWedding)}
                        </div>
                      )}
                      {child.gapFromElderSibling && child.elderSiblingName && (
                        <div>
                          • الفارق عن {child.elderSiblingName}:{' '}
                          {formatAge(child.gapFromElderSibling)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Raw Text Report Box */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-200 dark:border-stone-800 shadow-sm transition-colors space-y-2 no-print">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-stone-900 dark:text-stone-100">
            نص التقرير الجاهز للنسخ
          </label>
          <button
            onClick={() => handleCopy()}
            type="button"
            className="text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>نسخ الكل</span>
          </button>
        </div>
        <textarea
          readOnly
          value={reportText}
          rows={8}
          aria-label="نص تقرير الأسرة"
          className="w-full p-3 text-xs text-stone-900 dark:text-stone-100 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-sans leading-relaxed select-all"
        />
      </div>

      {/* Fallback Print Modal when browser/iframe/in-app webview blocks window.print() */}
      {showPrintFallback && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="بدائل الطباعة وحفظ PDF"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150 no-print"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowPrintFallback(false);
          }}
        >
          <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl border-t sm:border border-stone-200 dark:border-stone-800 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] space-y-4">
            <div className="w-10 h-1.5 bg-stone-300 dark:bg-stone-700 rounded-full mx-auto sm:hidden" />

            <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  طباعة التقرير / حفظ PDF
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPrintFallback(false)}
                aria-label="إغلاق"
                className="min-w-[40px] min-h-[40px] rounded-xl flex items-center justify-center text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              المتصفح الحالي أو نافذة المعاينة تمنع فتح نافذة الطباعة المباشرة. يمكنك استخدام أي من
              البدائل التالية فوراً، أو فتح الرابط في متصفح Chrome أو Safari للطباعة المباشرة:
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleDownloadPrintableHtml}
                className="w-full min-h-[46px] px-4 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-[0.99] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
              >
                <FileCode2 className="w-4 h-4" />
                <span>تنزيل صفحة جاهزة للطباعة (HTML / PDF)</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleDownloadTxt();
                    setShowPrintFallback(false);
                  }}
                  className="min-h-[44px] px-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-stone-200 dark:border-stone-700"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>حفظ كملف نصي</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleCopy();
                    setShowPrintFallback(false);
                  }}
                  className="min-h-[44px] px-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-stone-200 dark:border-stone-700"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ التقرير</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
