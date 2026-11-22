import React from 'react';
import { Share2, Copy, Printer, Download, Sparkles, FileText, CheckCircle2 } from 'lucide-react';
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

  const handlePrint = () => {
    if (!reportText) {
      onShowToast('يرجى إدخال بيانات الأسرة أولاً', 'error');
      return;
    }
    try {
      window.print();
    } catch {
      onShowToast('الطباعة غير متاحة في هذا المتصفح، يمكنك نسخ التقرير', 'info');
    }
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
    <div className="space-y-4 pb-24">
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
    </div>
  );
};
