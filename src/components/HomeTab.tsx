import React, { useState } from 'react';
import {
  Heart,
  ChevronDown,
  ChevronUp,
  Cake,
  Calendar,
  Clock,
  ArrowRightLeft,
  Sparkles,
  Users,
} from 'lucide-react';
import { FamilyCalculations, FamilyState } from '../types';
import { formatAge, formatDateArabic, formatWeekday } from '../utils/calc';

interface HomeTabProps {
  state: FamilyState;
  calc: FamilyCalculations;
  onGoToEntry: () => void;
  onOpenAddChild: () => void;
  onLoadSample: () => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  state,
  calc,
  onGoToEntry,
  onOpenAddChild,
  onLoadSample,
}) => {
  const [expandedChildId, setExpandedChildId] = useState<string | null>(null);

  const toggleChild = (id: string) => {
    setExpandedChildId((prev) => (prev === id ? null : id));
  };

  const hasAnyData =
    Boolean(state.fatherName || state.fatherBirth || state.motherName || state.motherBirth || state.weddingDate || (state.children && state.children.length > 0));

  const todayDate = calc.now;
  const todayWeekday = formatWeekday(todayDate);
  const todayGregorianText = formatDateArabic(todayDate);
  const todayGregorianNumeric = `${todayDate.getFullYear()}/${String(
    todayDate.getMonth() + 1
  ).padStart(2, '0')}/${String(todayDate.getDate()).padStart(2, '0')}`;

  const renderTodayBar = () => (
    <div className="bg-white dark:bg-stone-900 rounded-2xl px-3.5 py-2.5 border border-stone-200 dark:border-stone-800 shadow-sm flex items-center justify-between gap-2 transition-colors">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
          <Calendar className="w-4 h-4" />
        </div>
        <div className="min-w-0 text-right">
          <div className="text-[11px] text-stone-500 dark:text-stone-400 leading-tight">
            تاريخ اليوم الميلادي
          </div>
          <div className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
            {todayWeekday}، {todayGregorianText}
          </div>
        </div>
      </div>
      <span
        dir="ltr"
        className="text-[11px] font-bold text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded-lg tabular-nums shrink-0"
      >
        {todayGregorianNumeric}
      </span>
    </div>
  );

  if (!hasAnyData) {
    return (
      <div className="space-y-6 pb-10">
        {renderTodayBar()}
        <div className="py-6 px-4 text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 flex items-center justify-center text-3xl shadow-inner">
            👨‍👩‍👧‍👦
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
              مرحباً بك في تطبيق رحلة أسرتي
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              احسب أعمار أفراد أسرتك باليوم والشهر والسنة، ومدة الزواج، وأعمار الأبوين عند كل ولادة، وفوارق الأعمار وخط زمني ممتع.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 max-w-xs mx-auto pt-2">
            <button
              onClick={onGoToEntry}
              type="button"
              className="w-full min-h-[48px] rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-teal-700/20 transition-all flex items-center justify-center gap-2"
            >
              <span>بدء إدخال بيانات أسرتك</span>
            </button>
            <button
              onClick={onLoadSample}
              type="button"
              className="w-full min-h-[48px] rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 active:scale-[0.98] text-stone-800 dark:text-stone-200 font-semibold text-sm transition-all flex items-center justify-center gap-1.5 border border-stone-200 dark:border-stone-700"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>تجربة بيانات توضيحية</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Today Date & Weekday Bar */}
      {renderTodayBar()}

      {/* Wedding & Anniversary Hero Banner */}
      {calc.weddingDate && calc.marriageDuration && !calc.marriageDuration.neg ? (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-700 via-teal-800 to-emerald-900 text-white p-5 shadow-lg shadow-teal-900/20">
          {/* Subtle Background Pattern */}
          <div className="absolute -left-6 -bottom-6 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />

          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between text-teal-100 text-xs font-medium">
              <span className="flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 fill-teal-300 text-teal-300" />
                <span>رحلتنا معاً</span>
              </span>
              <span className="opacity-90">{formatDateArabic(calc.weddingDate)}</span>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-white tabular-nums">
                {formatAge(calc.marriageDuration, true)}
              </div>
            </div>

            <div className="pt-2 border-t border-teal-600/40 flex items-center justify-between text-xs text-teal-100">
              <span className="font-medium">
                {calc.daysUntilAnniversary === 0
                  ? '🎉 اليوم هو ذكرى الزواج السنوية!'
                  : `الذكرى السنوية بعد ${calc.daysUntilAnniversary} يوماً`}
              </span>
              {calc.nextAnniversary && (
                <span className="opacity-80">
                  {calc.nextAnniversary.getFullYear() - calc.weddingDate.getFullYear()} سنة زواج
                </span>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Parents Card */}
      {(calc.fatherDate || calc.motherDate || state.fatherName || state.motherName) && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-200 dark:border-stone-800 shadow-sm transition-colors space-y-3">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2">
            <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              <span>الأبوان</span>
            </h2>
            {calc.parentsAgeDiff && (
              <span className="text-xs text-stone-500 dark:text-stone-400">
                الفارق:{' '}
                <strong className="font-semibold text-stone-700 dark:text-stone-300">
                  {formatAge(calc.parentsAgeDiff.diff)}
                </strong>
                {calc.parentsAgeDiff.elder === 'father'
                  ? ' (الأب أكبر)'
                  : calc.parentsAgeDiff.elder === 'mother'
                  ? ' (الأم أكبر)'
                  : ''}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Father */}
            <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/70 dark:border-stone-800">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-base">👨</span>
                <div className="truncate">
                  <div className="text-xs text-stone-500 dark:text-stone-400">الأب</div>
                  <div className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                    {state.fatherName || 'لم يُحدد الاسم'}
                  </div>
                </div>
              </div>
              <div className="text-xs text-stone-600 dark:text-stone-300 font-medium">
                العمر الحالي:{' '}
                <span className="font-bold text-teal-700 dark:text-teal-400 tabular-nums">
                  {calc.fatherAge ? formatAge(calc.fatherAge, true) : '—'}
                </span>
              </div>
              {calc.fatherDate && (
                <div className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">
                  الميلاد: {formatDateArabic(calc.fatherDate)}
                </div>
              )}
            </div>

            {/* Mother */}
            <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/70 dark:border-stone-800">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-base">👩</span>
                <div className="truncate">
                  <div className="text-xs text-stone-500 dark:text-stone-400">الأم</div>
                  <div className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                    {state.motherName || 'لم يُحدد الاسم'}
                  </div>
                </div>
              </div>
              <div className="text-xs text-stone-600 dark:text-stone-300 font-medium">
                العمر الحالي:{' '}
                <span className="font-bold text-amber-700 dark:text-amber-400 tabular-nums">
                  {calc.motherAge ? formatAge(calc.motherAge, true) : '—'}
                </span>
              </div>
              {calc.motherDate && (
                <div className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">
                  الميلاد: {formatDateArabic(calc.motherDate)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Children Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">الأبناء</h2>
            {calc.children.length > 0 && (
              <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
                ({calc.children.length} أبناء · {calc.boysCount} ذكور · {calc.girlsCount} إناث)
              </span>
            )}
          </div>
          <button
            onClick={onOpenAddChild}
            type="button"
            className="text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline min-h-[36px] flex items-center gap-1"
          >
            + إضافة
          </button>
        </div>

        {calc.children.length === 0 ? (
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 text-center border border-dashed border-stone-300 dark:border-stone-800 space-y-3">
            <Users className="w-8 h-8 text-stone-400 mx-auto" />
            <p className="text-xs text-stone-500 dark:text-stone-400">
              لم تُضف أي ابن أو ابنة بعد. اضغط على زر الإضافة للبدء.
            </p>
            <button
              onClick={onOpenAddChild}
              type="button"
              className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold shadow-sm"
            >
              + إضافة أول ابن أو ابنة
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {calc.children.map((child, idx) => {
              const isExpanded = expandedChildId === child.id;
              const genderEmoji = child.gender === 'm' ? '👦' : '👧';

              return (
                <div
                  key={child.id}
                  className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm transition-all"
                >
                  {/* Card Header Tapable */}
                  <button
                    onClick={() => toggleChild(child.id)}
                    type="button"
                    className="w-full text-right p-3.5 flex items-center justify-between gap-3 min-h-[60px] active:bg-stone-50 dark:active:bg-stone-800/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-lg shrink-0">
                        {genderEmoji}
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-stone-900 dark:text-stone-100">
                            {child.name}
                          </span>
                          <span className="text-[11px] font-medium text-stone-400">
                            (الترتيب: {idx + 1})
                          </span>
                        </div>
                        <div className="text-xs font-bold text-teal-700 dark:text-teal-400 tabular-nums">
                          {formatAge(child.currentAge, true)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-stone-400">
                      <span className="text-[11px] text-stone-400 hidden sm:inline">
                        {child.formattedDate}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </button>

                  {/* Expandable Details */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30 space-y-2 text-xs">
                      {/* Birth Date */}
                      <div className="flex items-center justify-between py-1 border-b border-stone-200/50 dark:border-stone-700/50">
                        <span className="text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-stone-400" />
                          <span>تاريخ ويوم الميلاد</span>
                        </span>
                        <span className="font-semibold text-stone-800 dark:text-stone-200">
                          {child.weekdayName}، {child.formattedDate}
                        </span>
                      </div>

                      {/* Father's age at birth */}
                      {child.fatherAgeAtBirth && (
                        <div className="flex items-center justify-between py-1 border-b border-stone-200/50 dark:border-stone-700/50">
                          <span className="text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                            <span>👨</span>
                            <span>عمر الأب عند ولادته</span>
                          </span>
                          <span className="font-semibold text-stone-800 dark:text-stone-200 tabular-nums">
                            {formatAge(child.fatherAgeAtBirth)}
                          </span>
                        </div>
                      )}

                      {/* Mother's age at birth */}
                      {child.motherAgeAtBirth && (
                        <div className="flex items-center justify-between py-1 border-b border-stone-200/50 dark:border-stone-700/50">
                          <span className="text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                            <span>👩</span>
                            <span>عمر الأم عند ولادتها</span>
                          </span>
                          <span className="font-semibold text-stone-800 dark:text-stone-200 tabular-nums">
                            {formatAge(child.motherAgeAtBirth)}
                          </span>
                        </div>
                      )}

                      {/* After wedding */}
                      {child.timeSinceWedding && (
                        <div className="flex items-center justify-between py-1 border-b border-stone-200/50 dark:border-stone-700/50">
                          <span className="text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-stone-400" />
                            <span>بعد الزواج بـ</span>
                          </span>
                          <span className="font-semibold text-stone-800 dark:text-stone-200 tabular-nums">
                            {child.timeSinceWedding.neg
                              ? 'قبل الزواج'
                              : formatAge(child.timeSinceWedding)}
                          </span>
                        </div>
                      )}

                      {/* Sibling spacing */}
                      {child.gapFromElderSibling && child.elderSiblingName && (
                        <div className="flex items-center justify-between py-1">
                          <span className="text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                            <ArrowRightLeft className="w-3.5 h-3.5 text-stone-400" />
                            <span>الفارق عن {child.elderSiblingName}</span>
                          </span>
                          <span className="font-semibold text-teal-700 dark:text-teal-400 tabular-nums">
                            {formatAge(child.gapFromElderSibling)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
