import React, { useState } from 'react';
import { FamilyCalculations, FamilyState } from '../types';
import { formatAge, formatYearsDecimal, ageInYears } from '../utils/calc';
import { FamilyTimeline } from './FamilyTimeline';

interface AnalyticsTabProps {
  state: FamilyState;
  calc: FamilyCalculations;
  onUpdateTimelineYear: (year: number) => void;
  onGoToEntry: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  state,
  calc,
  onUpdateTimelineYear,
  onGoToEntry,
  onShowToast,
}) => {
  const currentYear = calc.now.getFullYear();
  const selectedYear = state.selectedYear || currentYear;
  const [selectedChildIndex, setSelectedChildIndex] = useState<number | null>(0);

  const hasData = Boolean(
    calc.fatherDate || calc.motherDate || calc.weddingDate || calc.children.length > 0
  );

  if (!hasData) {
    return (
      <div className="py-12 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-400 mx-auto flex items-center justify-center text-2xl">
          📊
        </div>
        <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
          لا توجد بيانات كافية لعرض الإحصائيات
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xs mx-auto">
          يرجى إدخال بيانات الأبوين وتواريخ الميلاد والزواج لتوليد الإحصائيات والخط الزمني.
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

  // Calculate highest age for parents chart
  let maxParentAge = 1;
  calc.children.forEach((k) => {
    const fa = k.fatherAgeAtBirth && !k.fatherAgeAtBirth.neg ? ageInYears(k.fatherAgeAtBirth) || 0 : 0;
    const ma = k.motherAgeAtBirth && !k.motherAgeAtBirth.neg ? ageInYears(k.motherAgeAtBirth) || 0 : 0;
    maxParentAge = Math.max(maxParentAge, fa, ma);
  });

  // Selected child detail for chart
  const activeChild =
    selectedChildIndex !== null && calc.children[selectedChildIndex]
      ? calc.children[selectedChildIndex]
      : null;

  return (
    <div className="space-y-5 pb-20">
      {/* 6 Key Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {/* Metric 1 */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-3.5 border border-stone-200 dark:border-stone-800 shadow-sm transition-colors">
          <span className="block text-[11px] font-medium text-stone-500 dark:text-stone-400 mb-1">
            عدد الأبناء
          </span>
          <div className="text-xl sm:text-2xl font-black text-teal-700 dark:text-teal-400 tabular-nums">
            {calc.children.length}
          </div>
          <div className="text-[10px] text-stone-400 mt-0.5">
            {calc.boysCount} ذكور · {calc.girlsCount} إناث
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-3.5 border border-stone-200 dark:border-stone-800 shadow-sm transition-colors">
          <span className="block text-[11px] font-medium text-stone-500 dark:text-stone-400 mb-1">
            مدة الزواج
          </span>
          <div className="text-xl sm:text-2xl font-black text-teal-700 dark:text-teal-400 tabular-nums">
            {calc.marriageDuration && !calc.marriageDuration.neg
              ? `${calc.marriageDuration.y} سنة`
              : '—'}
          </div>
          <div className="text-[10px] text-stone-400 mt-0.5">
            {calc.daysUntilAnniversary !== null
              ? `الذكرى بعد ${calc.daysUntilAnniversary} يوم`
              : 'لم يُحدد الزواج'}
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-3.5 border border-stone-200 dark:border-stone-800 shadow-sm transition-colors">
          <span className="block text-[11px] font-medium text-stone-500 dark:text-stone-400 mb-1 truncate">
            متوسط عمر الأب عند الإنجاب
          </span>
          <div className="text-xl sm:text-2xl font-black text-teal-700 dark:text-teal-400 tabular-nums">
            {formatYearsDecimal(calc.avgFatherAgeAtChild)}
          </div>
          <div className="text-[10px] text-stone-400 mt-0.5">
            {calc.children.length > 0 && calc.children[0].fatherAgeAtBirth
              ? `أول ولادة: ${calc.children[0].fatherAgeAtBirth.y} سنة`
              : '—'}
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-3.5 border border-stone-200 dark:border-stone-800 shadow-sm transition-colors">
          <span className="block text-[11px] font-medium text-stone-500 dark:text-stone-400 mb-1 truncate">
            متوسط عمر الأم عند الإنجاب
          </span>
          <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 tabular-nums">
            {formatYearsDecimal(calc.avgMotherAgeAtChild)}
          </div>
          <div className="text-[10px] text-stone-400 mt-0.5">
            {calc.children.length > 0 && calc.children[0].motherAgeAtBirth
              ? `أول ولادة: ${calc.children[0].motherAgeAtBirth.y} سنة`
              : '—'}
          </div>
        </div>

        {/* Metric 5 */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-3.5 border border-stone-200 dark:border-stone-800 shadow-sm transition-colors">
          <span className="block text-[11px] font-medium text-stone-500 dark:text-stone-400 mb-1 truncate">
            متوسط المباعدة
          </span>
          <div className="text-xl sm:text-2xl font-black text-teal-700 dark:text-teal-400 tabular-nums">
            {formatYearsDecimal(calc.avgChildSpacing)}
          </div>
          <div className="text-[10px] text-stone-400 mt-0.5">
            {calc.maxChildSpacing
              ? `أكبر فارق: ${formatYearsDecimal(calc.maxChildSpacing)}`
              : 'بين الولادات المتتالية'}
          </div>
        </div>

        {/* Metric 6 */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-3.5 border border-stone-200 dark:border-stone-800 shadow-sm transition-colors">
          <span className="block text-[11px] font-medium text-stone-500 dark:text-stone-400 mb-1 truncate">
            فارق الأكبر والأصغر
          </span>
          <div className="text-xl sm:text-2xl font-black text-teal-700 dark:text-teal-400 tabular-nums">
            {calc.oldestToYoungestGap && !calc.oldestToYoungestGap.neg
              ? `${calc.oldestToYoungestGap.y} سنة`
              : '—'}
          </div>
          <div className="text-[10px] text-stone-400 mt-0.5">
            {calc.oldestToYoungestGap && !calc.oldestToYoungestGap.neg
              ? `و ${calc.oldestToYoungestGap.m} شهر`
              : 'يتطلب أكثر من ابن'}
          </div>
        </div>
      </div>

      {/* Interactive Family Timeline Scrubber */}
      <FamilyTimeline
        state={state}
        calc={calc}
        selectedYear={selectedYear}
        onUpdateTimelineYear={onUpdateTimelineYear}
        onShowToast={onShowToast}
      />

      {/* Parents' Age at Each Childbirth (Bar Chart) */}
      {calc.children.length > 0 && (calc.fatherDate || calc.motherDate) && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-200 dark:border-stone-800 shadow-sm transition-colors space-y-3">
          <div>
            <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              عمر الأبوين عند كل ولادة
            </h2>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              انقر على أي عمود لمعاينة تفاصيل عمر الأب والأم بدقة
            </p>
          </div>

          {/* Interactive Chart Bars */}
          <div className="pt-1">
            <div className="flex items-end gap-2.5 overflow-x-auto py-2 px-1.5 border-b border-stone-200 dark:border-stone-800">
              {calc.children.map((child, idx) => {
                const faYears =
                  child.fatherAgeAtBirth && !child.fatherAgeAtBirth.neg
                    ? ageInYears(child.fatherAgeAtBirth) || 0
                    : 0;
                const maYears =
                  child.motherAgeAtBirth && !child.motherAgeAtBirth.neg
                    ? ageInYears(child.motherAgeAtBirth) || 0
                    : 0;

                const isSelected = selectedChildIndex === idx;
                const fatherBarPx = faYears > 0 ? Math.max(10, Math.round((faYears / maxParentAge) * 92)) : 4;
                const motherBarPx = maYears > 0 ? Math.max(10, Math.round((maYears / maxParentAge) * 92)) : 4;

                return (
                  <button
                    key={child.id}
                    type="button"
                    onClick={() => setSelectedChildIndex(idx)}
                    className={`flex flex-col items-center justify-end min-w-[68px] px-2 py-2 rounded-xl transition-all shrink-0 ${
                      isSelected
                        ? 'bg-stone-100 dark:bg-stone-800 ring-2 ring-teal-500'
                        : 'hover:bg-stone-50 dark:hover:bg-stone-800/40'
                    }`}
                  >
                    <div className="flex items-end gap-2 w-full justify-center h-[118px]">
                      {/* Father bar */}
                      {calc.fatherDate && (
                        <div className="flex flex-col items-center justify-end h-full">
                          <span className="text-[11px] font-bold text-teal-700 dark:text-teal-300 tabular-nums leading-none mb-1.5">
                            {faYears > 0 ? Math.floor(faYears) : '—'}
                          </span>
                          <div
                            style={{ height: `${fatherBarPx}px` }}
                            className="w-4 rounded-t-md bg-teal-600 dark:bg-teal-500 transition-all"
                            title={`عمر الأب: ${faYears > 0 ? `${Math.floor(faYears)} سنة` : '—'}`}
                          />
                        </div>
                      )}

                      {/* Mother bar */}
                      {calc.motherDate && (
                        <div className="flex flex-col items-center justify-end h-full">
                          <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 tabular-nums leading-none mb-1.5">
                            {maYears > 0 ? Math.floor(maYears) : '—'}
                          </span>
                          <div
                            style={{ height: `${motherBarPx}px` }}
                            className="w-4 rounded-t-md bg-amber-500 dark:bg-amber-400 transition-all"
                            title={`عمر الأم: ${maYears > 0 ? `${Math.floor(maYears)} سنة` : '—'}`}
                          />
                        </div>
                      )}
                    </div>

                    <span className="text-[11px] font-semibold text-stone-700 dark:text-stone-300 mt-2 truncate max-w-[60px]">
                      {child.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Legend & Selected info */}
            <div className="pt-2 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-teal-600 inline-block" />
                  <span className="text-stone-600 dark:text-stone-400">عمر الأب</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-amber-500 inline-block" />
                  <span className="text-stone-600 dark:text-stone-400">عمر الأم</span>
                </span>
              </div>
            </div>

            {/* Detail banner for active child */}
            {activeChild && (
              <div className="mt-3 p-3 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200/70 dark:border-teal-800/60 text-xs space-y-1">
                <div className="font-bold text-teal-900 dark:text-teal-200 flex items-center gap-1">
                  <span>{activeChild.gender === 'm' ? '👦' : '👧'}</span>
                  <span>عند ولادة {activeChild.name}:</span>
                </div>
                <div className="text-stone-700 dark:text-stone-300">
                  {activeChild.fatherAgeAtBirth && (
                    <div>
                      • عمر الأب كان:{' '}
                      <strong className="font-bold">{formatAge(activeChild.fatherAgeAtBirth)}</strong>
                    </div>
                  )}
                  {activeChild.motherAgeAtBirth && (
                    <div>
                      • عمر الأم كان:{' '}
                      <strong className="font-bold">{formatAge(activeChild.motherAgeAtBirth)}</strong>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Spacing Between Births */}
      {calc.children.length > 1 && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-200 dark:border-stone-800 shadow-sm transition-colors space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              المباعدة بين الولادات
            </h2>
            <span className="text-xs text-stone-500 dark:text-stone-400">
              القيم بالسنوات
            </span>
          </div>

          <div className="space-y-2.5">
            {calc.children.slice(1).map((child, idx) => {
              const elder = calc.children[idx];
              const gapObj = child.gapFromElderSibling;
              const gapYears = gapObj ? ageInYears(gapObj) || 0 : 0;
              const maxGap = calc.maxChildSpacing || 1;
              const percent = Math.min(100, Math.max(8, (gapYears / maxGap) * 100));

              return (
                <div key={child.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-800 dark:text-stone-200">
                      {elder.name} ← {child.name}
                    </span>
                    <span className="font-bold text-teal-700 dark:text-teal-400 tabular-nums">
                      {gapObj ? formatAge(gapObj) : '—'}
                    </span>
                  </div>
                  <div className="h-2.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden border border-stone-200/60 dark:border-stone-700/60">
                    <div
                      style={{ width: `${percent}%` }}
                      className="h-full bg-teal-600 dark:bg-teal-500 rounded-full transition-all"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
